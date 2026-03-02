package com.alpay.cobranza.model;

import java.time.LocalDate;

public record PromesaPagoEstadoRequest(
        String estado,
        LocalDate fechaCumplimiento
) {}
