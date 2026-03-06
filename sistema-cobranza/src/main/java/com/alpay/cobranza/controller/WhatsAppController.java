package com.alpay.cobranza.controller;

import com.alpay.cobranza.service.WhatsAppService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/whatsapp")
public class WhatsAppController {

    private final WhatsAppService whatsAppService;

    public WhatsAppController(WhatsAppService whatsAppService) {
        this.whatsAppService = whatsAppService;
    }

    @GetMapping("/status")
    public ResponseEntity<?> status() {
        return ResponseEntity.ok(whatsAppService.getStatus());
    }

    @PostMapping("/test")
    public ResponseEntity<?> sendTest(@RequestBody WhatsAppTestRequest request) {
        if (request == null || isBlank(request.telefono()) || isBlank(request.mensaje())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "telefono y mensaje son obligatorios"
            ));
        }

        boolean success = whatsAppService.enviarMensajeTexto(request.telefono(), request.mensaje());
        return ResponseEntity.ok(Map.of(
                "success", success,
                "message", success
                        ? "Mensaje enviado por WhatsApp API"
                        : "No se envio. Revisa configuracion WHATSAPP_* en variables de entorno"
        ));
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    public record WhatsAppTestRequest(String telefono, String mensaje) {}
}
