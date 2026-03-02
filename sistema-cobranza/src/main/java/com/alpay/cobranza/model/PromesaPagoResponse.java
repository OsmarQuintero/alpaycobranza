package com.alpay.cobranza.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record PromesaPagoResponse(
        Integer id,
        Integer idCuenta,
        String cliente,
        BigDecimal montoCompromiso,
        LocalDate fechaCompromiso,
        String estado,
        String comentario,
        LocalDateTime creadaEn
) {}
