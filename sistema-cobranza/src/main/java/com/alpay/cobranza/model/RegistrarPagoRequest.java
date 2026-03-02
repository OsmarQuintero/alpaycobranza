package com.alpay.cobranza.model;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class RegistrarPagoRequest {
    private Integer id_cuenta;
    private BigDecimal monto;
    private String metodo_pago;
    private String referencia;
}
