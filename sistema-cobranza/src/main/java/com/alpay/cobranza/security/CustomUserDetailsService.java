package com.alpay.cobranza.security;

import com.alpay.cobranza.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public CustomUserDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var usuario = usuarioRepository.findByEmailAndEstado(username, "A")
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        String rol = usuario.getRol() == null ? "COBRADOR" : usuario.getRol().trim().toUpperCase();
        if (rol.startsWith("ROLE_")) {
            rol = rol.substring(5);
        }

        return User.withUsername(usuario.getEmail())
                .password(usuario.getPassword())
                .roles(rol)
                .build();
    }
}
