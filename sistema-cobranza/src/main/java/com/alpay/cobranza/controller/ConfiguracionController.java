package com.alpay.cobranza.controller;

import com.alpay.cobranza.model.ConfiguracionRequest;
import com.alpay.cobranza.model.ConfiguracionResponse;
import com.alpay.cobranza.service.ConfiguracionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/configuracion")
public class ConfiguracionController {

    private final ConfiguracionService configuracionService;

    public ConfiguracionController(ConfiguracionService configuracionService) {
        this.configuracionService = configuracionService;
    }

    @GetMapping("/{usuarioId}")
    public ResponseEntity<ConfiguracionResponse> obtener(@PathVariable Integer usuarioId) {
        return ResponseEntity.ok(configuracionService.obtenerConfiguracion(usuarioId));
    }

    @PutMapping("/{usuarioId}")
    public ResponseEntity<ConfiguracionResponse> actualizar(
            @PathVariable Integer usuarioId,
            @RequestBody ConfiguracionRequest request
    ) {
        return ResponseEntity.ok(configuracionService.actualizarConfiguracion(usuarioId, request));
    }
}

