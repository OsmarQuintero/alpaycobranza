package com.alpay.cobranza.model;

import java.time.LocalDate;

public record ClienteAdminExpediente(
        Integer id,
        String nombre,
        String rfc,
        String telefono,
        String direccion,
        Double lat,
        Double lng,
        LocalDate fechaRegistro,
        String verificacionEstado,
        String ineUrl,
        String selfieUrl
) {}
