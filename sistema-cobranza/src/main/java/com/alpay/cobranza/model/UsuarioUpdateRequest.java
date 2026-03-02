package com.alpay.cobranza.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UsuarioUpdateRequest {

    @Size(max = 100)
    private String nombre;

    @Email(message = "Email invalido")
    @Size(max = 120)
    private String email;

    @Size(min = 8, max = 200, message = "La contraseña debe tener entre 8 y 200 caracteres")
    private String password;

    @Pattern(regexp = "ADMIN|COBRADOR|OFICINA", message = "Rol no valido")
    private String rol;

    @Pattern(regexp = "A|I", message = "Estado no valido")
    private String estado;

    public UsuarioUpdateRequest() {}

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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}



