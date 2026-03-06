package com.alpay.cobranza.controller;

import com.alpay.cobranza.model.ForgotPasswordRequest;
import com.alpay.cobranza.model.LoginRequest;
import com.alpay.cobranza.model.ResetPasswordRequest;
import com.alpay.cobranza.repository.UsuarioRepository;
import com.alpay.cobranza.security.JwtService;
import com.alpay.cobranza.service.AuthThrottleService;
import com.alpay.cobranza.service.PasswordResetService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetService passwordResetService;
    private final JwtService jwtService;
    private final AuthThrottleService authThrottleService;

    public AuthController(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            PasswordResetService passwordResetService,
            JwtService jwtService,
            AuthThrottleService authThrottleService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordResetService = passwordResetService;
        this.jwtService = jwtService;
        this.authThrottleService = authThrottleService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequest request, HttpServletRequest httpRequest) {
        String email = request.getEmail().trim().toLowerCase();
        String ip = resolveClientIp(httpRequest);

        AuthThrottleService.ThrottleDecision decision = authThrottleService.canAttemptLogin(email, ip);
        if (!decision.allowed()) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header("Retry-After", String.valueOf(decision.retryAfterSeconds()))
                    .body(Map.of(
                            "code", "AUTH_THROTTLED",
                            "message", "Demasiados intentos de inicio de sesion. Intenta nuevamente mas tarde.",
                            "retryAfterSeconds", decision.retryAfterSeconds()
                    ));
        }

        return usuarioRepository.findByEmailAndEstado(email, "A")
                .map(user -> {
                    boolean matches;
                    try {
                        matches = passwordEncoder.matches(request.getPassword(), user.getPassword());
                    } catch (Exception ex) {
                        matches = false;
                    }

                    if (!matches) {
                        authThrottleService.onLoginFailure(email, ip);
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of("message", "Credenciales incorrectas"));
                    }

                    authThrottleService.onLoginSuccess(email, ip);

                    Map<String, Object> userData = new HashMap<>();
                    userData.put("id_usuario", user.getId());
                    userData.put("nombre", user.getNombre());
                    userData.put("email", user.getEmail());
                    userData.put("rol", user.getRol());
                    userData.put("foto_url", user.getFotoUrl());

                    Map<String, Object> response = new HashMap<>();
                    response.put("token", jwtService.generateToken(user));
                    response.put("user", userData);

                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    authThrottleService.onLoginFailure(email, ip);
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("message", "Credenciales incorrectas"));
                });
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestBody @Valid ForgotPasswordRequest request) {
        passwordResetService.solicitarReset(request.getEmail().trim().toLowerCase());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.getToken(), request.getPassword());
        return ResponseEntity.ok().build();
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            String[] ips = forwarded.split(",");
            if (ips.length > 0 && !ips[0].isBlank()) {
                return ips[0].trim();
            }
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }
}
