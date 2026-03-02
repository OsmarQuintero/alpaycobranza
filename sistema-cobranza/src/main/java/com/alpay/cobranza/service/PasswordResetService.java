package com.alpay.cobranza.service;

import com.alpay.cobranza.model.PasswordResetToken;
import com.alpay.cobranza.model.Usuario;
import com.alpay.cobranza.repository.PasswordResetTokenRepository;
import com.alpay.cobranza.repository.UsuarioRepository;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;
    private final String frontendBaseUrl;

    public PasswordResetService(
            UsuarioRepository usuarioRepository,
            PasswordResetTokenRepository tokenRepository,
            JavaMailSender mailSender,
            PasswordEncoder passwordEncoder,
            @Value("${app.frontend.url:http://localhost:4200}") String frontendBaseUrl
    ) {
        this.usuarioRepository = usuarioRepository;
        this.tokenRepository = tokenRepository;
        this.mailSender = mailSender;
        this.passwordEncoder = passwordEncoder;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    @Transactional
    public void solicitarReset(String email) {
        Optional<Usuario> userOpt = usuarioRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return; // No revelar si existe
        }

        PasswordResetToken token = new PasswordResetToken();
        token.setEmail(email);
        token.setToken(UUID.randomUUID().toString());
        token.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        token.setUsed(false);
        tokenRepository.save(token);

        enviarCorreo(email, token.getToken());
    }

    @Transactional
    public void resetPassword(String tokenValue, String newPassword) {
        PasswordResetToken token = tokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new RuntimeException("Token invalido"));

        if (Boolean.TRUE.equals(token.getUsed()) || token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expirado");
        }

        Usuario usuario = usuarioRepository.findByEmail(token.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setPassword(passwordEncoder.encode(newPassword));
        usuarioRepository.save(usuario);

        token.setUsed(true);
        tokenRepository.save(token);
    }

    private void enviarCorreo(String email, String token) {
        try {
            String link = frontendBaseUrl + "/reset-password?token=" + token;
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setTo(email);
            helper.setSubject("Restablecer contrasena - ALPAY");
            helper.setText(
                    "Recibimos tu solicitud para restablecer contrasena.\n\n" +
                    "Abre este enlace para continuar:\n" + link + "\n\n" +
                    "Este enlace expira en 15 minutos.",
                    false
            );

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error enviando correo", e);
        }
    }
}
