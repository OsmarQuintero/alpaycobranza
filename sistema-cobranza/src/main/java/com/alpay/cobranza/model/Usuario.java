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
    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    private String nombre;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Email invalido")
    @Size(max = 120, message = "El email no puede exceder 120 caracteres")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "La contrasena es obligatoria")
    @Size(min = 8, max = 200, message = "La contrasena debe tener entre 8 y 200 caracteres")
    @Column(name = "password_hash")
    private String password;

    @Pattern(regexp = "ADMIN|COBRADOR|OFICINA", message = "Rol no valido")
    private String rol;

    @Pattern(regexp = "A|I", message = "Estado no valido")
    private String estado = "A";

    @Column(name = "creado_en", insertable = false, updatable = false)
    private LocalDateTime creadoEn;

    @Column(name = "foto_url")
    private String fotoUrl;
}
