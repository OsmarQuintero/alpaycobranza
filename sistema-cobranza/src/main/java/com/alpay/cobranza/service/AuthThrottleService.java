package com.alpay.cobranza.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthThrottleService {

    private final int maxAttemptsPerIdentity;
    private final int maxAttemptsPerIp;
    private final Duration attemptWindow;
    private final Duration lockDuration;

    private final Map<String, AttemptState> identityAttempts = new ConcurrentHashMap<>();
    private final Map<String, AttemptState> ipAttempts = new ConcurrentHashMap<>();

    public AuthThrottleService(
            @Value("${app.auth.max-attempts-per-identity:5}") int maxAttemptsPerIdentity,
            @Value("${app.auth.max-attempts-per-ip:20}") int maxAttemptsPerIp,
            @Value("${app.auth.attempt-window-minutes:10}") int attemptWindowMinutes,
            @Value("${app.auth.lock-minutes:15}") int lockMinutes
    ) {
        this.maxAttemptsPerIdentity = maxAttemptsPerIdentity;
        this.maxAttemptsPerIp = maxAttemptsPerIp;
        this.attemptWindow = Duration.ofMinutes(Math.max(1, attemptWindowMinutes));
        this.lockDuration = Duration.ofMinutes(Math.max(1, lockMinutes));
    }

    public ThrottleDecision canAttemptLogin(String email, String ip) {
        String identityKey = buildIdentityKey(email, ip);
        String ipKey = buildIpKey(ip);

        ThrottleDecision identity = getDecision(identityAttempts, identityKey, maxAttemptsPerIdentity);
        if (!identity.allowed()) {
            return identity;
        }

        return getDecision(ipAttempts, ipKey, maxAttemptsPerIp);
    }

    public void onLoginFailure(String email, String ip) {
        registerFailure(identityAttempts, buildIdentityKey(email, ip), maxAttemptsPerIdentity);
        registerFailure(ipAttempts, buildIpKey(ip), maxAttemptsPerIp);
    }

    public void onLoginSuccess(String email, String ip) {
        identityAttempts.remove(buildIdentityKey(email, ip));
    }

    private ThrottleDecision getDecision(Map<String, AttemptState> store, String key, int maxAttempts) {
        AttemptState state = store.computeIfAbsent(key, unused -> new AttemptState());
        synchronized (state) {
            Instant now = Instant.now();
            state.purgeExpiredAttempts(now, attemptWindow);

            if (state.lockUntil != null && now.isBefore(state.lockUntil)) {
                long seconds = Duration.between(now, state.lockUntil).toSeconds();
                return ThrottleDecision.blocked(Math.max(1, seconds));
            }

            if (state.lockUntil != null && !now.isBefore(state.lockUntil)) {
                state.lockUntil = null;
            }

            if (state.attempts.size() >= maxAttempts) {
                state.lockUntil = now.plus(lockDuration);
                state.attempts.clear();
                long seconds = Duration.between(now, state.lockUntil).toSeconds();
                return ThrottleDecision.blocked(Math.max(1, seconds));
            }

            return ThrottleDecision.permit();
        }
    }

    private void registerFailure(Map<String, AttemptState> store, String key, int maxAttempts) {
        AttemptState state = store.computeIfAbsent(key, unused -> new AttemptState());
        synchronized (state) {
            Instant now = Instant.now();
            state.purgeExpiredAttempts(now, attemptWindow);

            if (state.lockUntil != null && now.isBefore(state.lockUntil)) {
                return;
            }

            state.attempts.addLast(now);
            if (state.attempts.size() >= maxAttempts) {
                state.lockUntil = now.plus(lockDuration);
                state.attempts.clear();
            }
        }
    }

    private String buildIdentityKey(String email, String ip) {
        return (email == null ? "" : email.trim().toLowerCase()) + "|" + buildSafeIp(ip);
    }

    private String buildIpKey(String ip) {
        return "ip|" + buildSafeIp(ip);
    }

    private String buildSafeIp(String ip) {
        return ip == null || ip.isBlank() ? "unknown" : ip.trim();
    }

    public record ThrottleDecision(boolean allowed, long retryAfterSeconds) {
        public static ThrottleDecision permit() {
            return new ThrottleDecision(true, 0);
        }

        public static ThrottleDecision blocked(long retryAfterSeconds) {
            return new ThrottleDecision(false, retryAfterSeconds);
        }
    }

    private static class AttemptState {
        private final Deque<Instant> attempts = new ArrayDeque<>();
        private Instant lockUntil;

        private void purgeExpiredAttempts(Instant now, Duration window) {
            while (!attempts.isEmpty()) {
                Instant first = attempts.peekFirst();
                if (first == null || Duration.between(first, now).compareTo(window) > 0) {
                    attempts.pollFirst();
                } else {
                    break;
                }
            }
        }
    }
}
