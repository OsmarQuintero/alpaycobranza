package com.alpay.cobranza.model;

import java.math.BigDecimal;

public record CuentaCreateRequest(
        Integer idCliente,
        BigDecimal limiteCredito,
        Float tasaInteres,
        Integer diaCorte
) {}
