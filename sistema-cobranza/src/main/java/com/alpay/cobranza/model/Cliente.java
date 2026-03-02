package com.alpay.cobranza.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "clientes")
@Data
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Integer id;

    private String nombre;

    @Column(length = 13, unique = true)
    private String rfc;

    private String telefono;
    private String direccion;

    @Column(columnDefinition = "DECIMAL(9,6)")
    private Double lat;

    @Column(columnDefinition = "DECIMAL(9,6)")
    private Double lng;

    @Column(name = "fecha_registro", insertable = false, updatable = false)
    private LocalDate fechaRegistro;

    @Column(name = "ine_frente")
    private String ineFrente;

    @Column(name = "selfie")
    private String selfie;

    @Column(name = "verificacion_estado")
    private String verificacionEstado;
}
