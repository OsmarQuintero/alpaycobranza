package com.alpay.cobranza.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "historial_cobranza")
@Data
public class HistorialCobranza {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idHistorial; // Cambiar de Long a Integer para coincidir con el SQL

    @ManyToOne
    @JoinColumn(name = "id_cuenta")
    private Cuenta cuenta;

    private String tipo;
    private String descripcion;

    @Column(insertable = false, updatable = false)
    private LocalDateTime fecha;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
}