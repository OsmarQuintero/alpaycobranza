package com.alpay.cobranza.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "pagos")
@Data
public class Pago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idPago;

    @ManyToOne
    @JoinColumn(name = "id_cuenta")
    private Cuenta cuenta;

    @Column(precision = 12, scale = 2)
    private BigDecimal monto;
    private LocalDate fechaPago;
    private String metodo; // Validado por CHK_PAGO_METODO en tu SQL
    private String referencia;
}