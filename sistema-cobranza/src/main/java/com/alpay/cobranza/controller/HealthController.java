package com.alpay.cobranza.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/")
    public ResponseEntity<?> rootHealth() {
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @GetMapping("/healthz")
    public ResponseEntity<?> healthz() {
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
