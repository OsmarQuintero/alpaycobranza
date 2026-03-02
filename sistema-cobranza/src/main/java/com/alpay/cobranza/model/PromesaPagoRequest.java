package com.alpay.cobranza.model;

import java.time.LocalDate;

public record PromesaPagoRequest(
        Integer idCuenta,
        java.math.BigDecimal montoCompromiso,
        LocalDate fechaCompromiso,
        String comentario
) {}
