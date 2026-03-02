package com.alpay.cobranza.controller;

import com.alpay.cobranza.model.HistorialCobranza;
import com.alpay.cobranza.service.HistorialService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/historial")
public class HistorialController {

    private final HistorialService historialService;

    public HistorialController(HistorialService historialService) {
        this.historialService = historialService;
    }

    // 🔹 NUEVO: Listar TODO el historial (para la vista de Historial)
    @GetMapping
    public List<HistorialCobranza> listarTodo() {
        return historialService.listarTodo();
    }

    // 🔹 Ya existía: Historial de una cuenta específica
    @GetMapping("/{cuentaId}")
    public List<HistorialCobranza> verAuditoria(@PathVariable Integer cuentaId) {
        return historialService.obtenerHistorialPorCuenta(cuentaId);
    }
}
