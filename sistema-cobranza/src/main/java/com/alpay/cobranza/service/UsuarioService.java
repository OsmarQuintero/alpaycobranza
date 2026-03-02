package com.alpay.cobranza.service;

import com.alpay.cobranza.model.Usuario;
import com.alpay.cobranza.model.UsuarioUpdateRequest;
import com.alpay.cobranza.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    private final Path uploadDir = Paths.get("uploads", "usuarios");

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Usuario registrar(Usuario usuario) {
        if (usuarioRepository.findByEmail(usuario.getEmail()).isPresent()) {
            throw new RuntimeException("El email ya esta registrado");
        }

        String rol = usuario.getRol();
        if (rol == null || rol.isBlank()) {
            usuario.setRol("COBRADOR");
        } else if (!"COBRADOR".equalsIgnoreCase(rol)) {
            throw new RuntimeException("Solo se permite registrar COBRADOR desde el formulario publico");
        }

        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario registrarAdmin(Usuario usuario) {
        if (usuarioRepository.findByEmail(usuario.getEmail()).isPresent()) {
            throw new RuntimeException("El email ya esta registrado");
        }

        String rol = usuario.getRol();
        if (rol == null || rol.isBlank()) {
            throw new RuntimeException("El rol es obligatorio");
        }

        String rolUpper = rol.toUpperCase();
        if (!rolUpper.equals("ADMIN") && !rolUpper.equals("OFICINA") && !rolUpper.equals("COBRADOR")) {
            throw new RuntimeException("Rol no permitido");
        }

        usuario.setRol(rolUpper);
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioRepository.save(usuario);
    }

    public List<Usuario> listar() {
        return usuarioRepository.findByEstado("A");
    }

    @Transactional
    public void eliminar(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        eliminarFotoSiExiste(usuario.getFotoUrl());

        usuario.setEstado("I");
        usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario actualizar(Integer id, UsuarioUpdateRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (request.getEmail() != null && !request.getEmail().equals(usuario.getEmail())) {
            if (usuarioRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("El email ya esta registrado");
            }
            usuario.setEmail(request.getEmail());
        }

        if (request.getNombre() != null) {
            usuario.setNombre(request.getNombre());
        }

        if (request.getRol() != null) {
            usuario.setRol(request.getRol());
        }

        if (request.getEstado() != null) {
            usuario.setEstado(request.getEstado());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario actualizarFoto(Integer id, MultipartFile foto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!"COBRADOR".equalsIgnoreCase(usuario.getRol())) {
            throw new RuntimeException("Solo cobradores pueden subir foto");
        }

        eliminarFotoSiExiste(usuario.getFotoUrl());

        String fotoUrl = guardarArchivo(foto);
        usuario.setFotoUrl(fotoUrl);
        return usuarioRepository.save(usuario);
    }

    private void eliminarFotoSiExiste(String fotoUrl) {
        if (fotoUrl == null || fotoUrl.isBlank()) return;
        if (!fotoUrl.startsWith("/uploads/usuarios/")) return;

        String relative = fotoUrl.replaceFirst("^/uploads/usuarios/", "");
        Path target = uploadDir.resolve(relative).normalize();

        if (!target.startsWith(uploadDir)) return;

        try {
            Files.deleteIfExists(target);
        } catch (IOException e) {
            throw new RuntimeException("Error eliminando foto", e);
        }
    }

    private String guardarArchivo(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Archivo requerido");
        }

        try {
            Files.createDirectories(uploadDir);
            String ext = getExtension(file.getOriginalFilename());
            String filename = "cobrador_" + UUID.randomUUID() + (ext.isEmpty() ? "" : "." + ext);
            Path target = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), target);
            return "/uploads/usuarios/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Error guardando archivo", e);
        }
    }

    private String getExtension(String name) {
        if (name == null) return "";
        int idx = name.lastIndexOf('.');
        if (idx == -1) return "";
        return name.substring(idx + 1);
    }
}
