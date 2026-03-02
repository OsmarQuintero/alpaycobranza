package com.alpay.cobranza.controller;

import com.alpay.cobranza.service.GeocodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/geocode")
public class GeocodeController {

    private final GeocodeService geocodeService;

    public GeocodeController(GeocodeService geocodeService) {
        this.geocodeService = geocodeService;
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam("q") String q) {
        if (q == null || q.trim().length() < 3) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Consulta invalida"));
        }
        return ResponseEntity.ok(geocodeService.buscarDirecciones(q.trim()));
    }
}
