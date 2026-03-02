package com.alpay.cobranza.controller;

import com.alpay.cobranza.service.ReportesService;
import com.lowagie.text.DocumentException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
public class ReportesController {

    private final ReportesService reportesService;

    public ReportesController(
            ReportesService reportesService
    ) {
        this.reportesService = reportesService;
    }
    @GetMapping("/resumen")
    public Map<String, Object> obtenerResumen() {
        return reportesService.obtenerResumen();
    }

    @GetMapping("/pdf")
    public ResponseEntity<byte[]> exportarPDF() throws DocumentException {
        byte[] pdf = reportesService.exportarResumenPDF();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Reporte_Alpay.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/excel")
    public ResponseEntity<byte[]> exportarExcel() {
        byte[] excel = reportesService.exportarResumenExcel();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Reporte_Alpay.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excel);
    }

    @PostMapping(value = "/email", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> enviarEmail(@RequestBody Map<String, Object> body) {

        String email = body.get("email").toString();
        reportesService.enviarReportePorEmail(email);

        return ResponseEntity.ok().build();
    }



}

