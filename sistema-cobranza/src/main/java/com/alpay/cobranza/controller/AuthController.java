package com.alpay.cobranza.controller;

import com.alpay.cobranza.model.ForgotPasswordRequest;
import com.alpay.cobranza.model.LoginRequest;
import com.alpay.cobranza.model.ResetPasswordRequest;
import com.alpay.cobranza.repository.UsuarioRepository;
import com.alpay.cobranza.security.JwtService;
import com.alpay.cobranza.service.PasswordResetService;
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

    public AuthController(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, PasswordResetService passwordResetService, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordResetService = passwordResetService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody(required = false) LoginRequest request) {
        if (request == null || request.getEmail() == null || request.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email y contrase�a son obligatorios"));
        }

        return usuarioRepository.findByEmailAndEstado(request.getEmail(), "A")
                .map(user -> {
                    boolean matches;
                    try {
                        matches = passwordEncoder.matches(request.getPassword(), user.getPassword());
                    } catch (Exception ex) {
                        matches = false;
                    }

                    if (!matches) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of("message", "Credenciales incorrectas"));
                    }

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
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Credenciales incorrectas")));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        passwordResetService.solicitarReset(request.getEmail());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.getToken(), request.getPassword());
        return ResponseEntity.ok().build();
    }
}


