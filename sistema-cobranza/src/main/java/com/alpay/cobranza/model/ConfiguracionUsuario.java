package com.alpay.cobranza.model;

import jakarta.persistence.*;

@Entity
@Table(name = "configuracion_usuario")
public class ConfiguracionUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "usuario_id", nullable = false)
    private Integer usuarioId;

    private String telefono;

    @Column(nullable = false)
    private Boolean notificaciones = true;

    @Column(name = "email_alerts", nullable = false)
    private Boolean emailAlerts = true;

    @Column(name = "whatsapp_alerts", nullable = false)
    private Boolean whatsappAlerts = true;

    public Integer getId() {
        return id;
    }

    public Integer getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Integer usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public Boolean getNotificaciones() {
        return notificaciones;
    }

    public void setNotificaciones(Boolean notificaciones) {
        this.notificaciones = notificaciones;
    }

    public Boolean getEmailAlerts() {
        return emailAlerts;
    }

    public void setEmailAlerts(Boolean emailAlerts) {
        this.emailAlerts = emailAlerts;
    }

    public Boolean getWhatsappAlerts() {
        return whatsappAlerts;
    }

    public void setWhatsappAlerts(Boolean whatsappAlerts) {
        this.whatsappAlerts = whatsappAlerts;
    }
}
