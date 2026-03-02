package com.alpay.cobranza.controller;

import com.alpay.cobranza.model.PromesaPagoEstadoRequest;
import com.alpay.cobranza.model.PromesaPagoRequest;
import com.alpay.cobranza.model.PromesaPagoResponse;
import com.alpay.cobranza.service.PromesaPagoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/promesas")
public class PromesaPagoController {

    private final PromesaPagoService promesaPagoService;

    public PromesaPagoController(PromesaPagoService promesaPagoService) {
        this.promesaPagoService = promesaPagoService;
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody PromesaPagoRequest request) {
        PromesaPagoResponse promesa = promesaPagoService.crear(request);
        return ResponseEntity.ok(Map.of(
                "message", "Promesa registrada correctamente",
                "success", true,
                "promesa", promesa
        ));
    }

    @GetMapping
    public List<PromesaPagoResponse> listarTodas() {
        return promesaPagoService.listarTodas();
    }

    @GetMapping("/cuenta/{cuentaId}")
    public List<PromesaPagoResponse> listarPorCuenta(@PathVariable Integer cuentaId) {
        return promesaPagoService.listarPorCuenta(cuentaId);
    }

    @PatchMapping("/{promesaId}/estado")
    public PromesaPagoResponse actualizarEstado(@PathVariable Integer promesaId, @RequestBody PromesaPagoEstadoRequest request) {
        return promesaPagoService.actualizarEstado(promesaId, request);
    }
}
