package com.alpay.cobranza.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ContactoRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 120)
    private String nombre;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Email invalido")
    @Size(max = 160)
    private String email;

    @Size(max = 160)
    private String empresa;

    @NotBlank(message = "El mensaje es obligatorio")
    @Size(max = 2000)
    private String mensaje;

    public ContactoRequest() {}

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
}
