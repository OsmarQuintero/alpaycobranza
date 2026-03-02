package com.alpay.cobranza.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@Data
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer id;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @Email(message = "Email invalido")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, max = 200, message = "La contraseña debe tener entre 8 y 200 caracteres")
    @Column(name = "password_hash")
    private String password;

    @Pattern(regexp = "ADMIN|COBRADOR|OFICINA", message = "Rol no valido")
    private String rol;

    private String estado = "A";

    @Column(name = "creado_en", insertable = false, updatable = false)
    private LocalDateTime creadoEn;

    @Column(name = "foto_url")
    private String fotoUrl;
}

