package com.alpay.cobranza.controller;

import com.alpay.cobranza.model.Pago;
import com.alpay.cobranza.model.RegistrarPagoRequest;
import com.alpay.cobranza.service.CobranzaService;
import com.alpay.cobranza.service.WhatsAppService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    private final CobranzaService cobranzaService;
    private final WhatsAppService whatsAppService;

    public PagoController(CobranzaService cobranzaService, WhatsAppService whatsAppService) {
        this.cobranzaService = cobranzaService;
        this.whatsAppService = whatsAppService;
    }

    @PostMapping("/registrar")
    public ResponseEntity<?> registrarPago(@RequestBody RegistrarPagoRequest request) {
        Pago pago = cobranzaService.registrarNuevoPago(
                request.getId_cuenta(),
                request.getMonto(),
                request.getMetodo_pago(),
                request.getReferencia()
        );

        String waUrl = whatsAppService.generarLinkRecibo(pago);

        return ResponseEntity.ok(Map.of(
                "message", "Pago registrado exitosamente",
                "success", true,
                "pago", pago,
                "whatsappUrl", waUrl
        ));
    }

    @GetMapping("/cuenta/{cuentaId}")
    public List<Pago> obtenerPagosPorCuenta(@PathVariable Integer cuentaId) {
        return cobranzaService.obtenerPagosPorCuenta(cuentaId);
    }

    @GetMapping("/ultimos")
    public List<Pago> obtenerUltimosPagos() {
        return cobranzaService.obtenerUltimosPagos();
    }
}
