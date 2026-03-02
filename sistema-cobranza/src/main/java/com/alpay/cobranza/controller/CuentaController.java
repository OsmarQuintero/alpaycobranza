package com.alpay.cobranza.controller;

import com.alpay.cobranza.model.Cuenta;
import com.alpay.cobranza.model.CuentaCreateRequest;
import com.alpay.cobranza.service.CuentaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cuentas")
public class CuentaController {

    private final CuentaService cuentaService;

    public CuentaController(CuentaService cuentaService) {
        this.cuentaService = cuentaService;
    }

    @GetMapping
    public List<Cuenta> listarTodas() {
        return cuentaService.listarTodas();
    }

    @GetMapping("/cliente/{clienteId}")
    public List<Cuenta> listarPorCliente(@PathVariable Integer clienteId) {
        return cuentaService.findByClienteId(clienteId);
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody CuentaCreateRequest request) {
        Cuenta cuenta = cuentaService.crearCuenta(request);
        return ResponseEntity.ok(Map.of(
                "message", "Credito creado correctamente",
                "success", true,
                "cuenta", cuenta
        ));
    }
}
