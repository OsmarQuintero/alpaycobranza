package com.alpay.cobranza.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "contacto_mensajes")
public class ContactoMensaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(nullable = false, length = 160)
    private String email;

    @Column(length = 160)
    private String empresa;

    @Column(nullable = false, length = 2000)
    private String mensaje;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;

    public ContactoMensaje() {}

    public ContactoMensaje(String nombre, String email, String empresa, String mensaje) {
        this.nombre = nombre;
        this.email = email;
        this.empresa = empresa;
        this.mensaje = mensaje;
        this.creadoEn = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getEmpresa() {
        return empresa;
    }

    public void setEmpresa(String empresa) {
        this.empresa = empresa;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public LocalDateTime getCreadoEn() {
        return creadoEn;
    }

    public void setCreadoEn(LocalDateTime creadoEn) {
        this.creadoEn = creadoEn;
    }
}
