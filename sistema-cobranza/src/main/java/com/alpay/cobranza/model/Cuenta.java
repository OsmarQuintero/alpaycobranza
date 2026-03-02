package com.alpay.cobranza.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "cuentas")
@Data
public class Cuenta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cuenta")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_cliente")
    private Cliente cliente;

    @Column(precision = 12, scale = 2)
    private BigDecimal limiteCredito;

    @Column(precision = 12, scale = 2)
    private BigDecimal saldo;

    private Float tasaInteres;

    private LocalDate fechaApertura;

    private String estatus;

    @Column(name = "dia_corte", columnDefinition = "TINYINT")
    private Integer diaCorte;

    // 🔹 NUEVO: Campo calculado para el frontend
    @Transient
    public String getClienteNombre() {
        return cliente != null ? cliente.getNombre() : null;
    }
}