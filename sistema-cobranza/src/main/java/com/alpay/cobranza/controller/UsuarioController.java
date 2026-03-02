package com.alpay.cobranza.controller;

import com.alpay.cobranza.model.Usuario;
import com.alpay.cobranza.model.UsuarioUpdateRequest;
import com.alpay.cobranza.security.JwtService;
import com.alpay.cobranza.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final JwtService jwtService;

    public UsuarioController(UsuarioService usuarioService, JwtService jwtService) {
        this.usuarioService = usuarioService;
        this.jwtService = jwtService;
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody @Valid Usuario usuario) {
        Usuario guardado = usuarioService.registrar(usuario);

        Map<String, Object> response = new HashMap<>();
        response.put("token", jwtService.generateToken(guardado));
        response.put("user", toUserMap(guardado));

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/admin")
    public ResponseEntity<?> registrarAdmin(@RequestBody @Valid Usuario usuario) {
        Usuario guardado = usuarioService.registrarAdmin(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(toUserMap(guardado));
    }

    @GetMapping
    public List<Map<String, Object>> listar() {
        return usuarioService.listar().stream().map(this::toUserMap).toList();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody @Valid UsuarioUpdateRequest request) {
        Usuario actualizado = usuarioService.actualizar(id, request);
        return ResponseEntity.ok(toUserMap(actualizado));
    }

    @PostMapping(value = "/{id}/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> subirFoto(@PathVariable Integer id, @RequestPart("foto") MultipartFile foto) {
        Usuario actualizado = usuarioService.actualizarFoto(id, foto);
        return ResponseEntity.ok(toUserMap(actualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        usuarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> toUserMap(Usuario usuario) {
        Map<String, Object> map = new HashMap<>();
        map.put("id_usuario", usuario.getId());
        map.put("nombre", usuario.getNombre());
        map.put("email", usuario.getEmail());
        map.put("rol", usuario.getRol());
        map.put("estado", usuario.getEstado());
        map.put("creado_en", usuario.getCreadoEn());
        map.put("foto_url", usuario.getFotoUrl());
        return map;
    }
}


