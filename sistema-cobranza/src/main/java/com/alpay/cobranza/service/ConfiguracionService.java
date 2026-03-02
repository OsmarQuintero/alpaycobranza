package com.alpay.cobranza.service;

import com.alpay.cobranza.model.*;
import com.alpay.cobranza.repository.ConfiguracionSistemaRepository;
import com.alpay.cobranza.repository.ConfiguracionUsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConfiguracionService {

    private final ConfiguracionSistemaRepository sistemaRepository;
    private final ConfiguracionUsuarioRepository usuarioRepository;

    public ConfiguracionService(
            ConfiguracionSistemaRepository sistemaRepository,
            ConfiguracionUsuarioRepository usuarioRepository
    ) {
        this.sistemaRepository = sistemaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public ConfiguracionResponse obtenerConfiguracion(Integer usuarioId) {
        ConfiguracionSistema sistema = sistemaRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> sistemaRepository.save(new ConfiguracionSistema()));

        ConfiguracionUsuario usuario = usuarioRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> {
                    ConfiguracionUsuario nuevo = new ConfiguracionUsuario();
                    nuevo.setUsuarioId(usuarioId);
                    return usuarioRepository.save(nuevo);
                });

        return new ConfiguracionResponse(usuario, sistema);
    }

    @Transactional
    public ConfiguracionResponse actualizarConfiguracion(Integer usuarioId, ConfiguracionRequest request) {
        ConfiguracionSistema sistema = sistemaRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> sistemaRepository.save(new ConfiguracionSistema()));

        ConfiguracionUsuario usuario = usuarioRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> {
                    ConfiguracionUsuario nuevo = new ConfiguracionUsuario();
                    nuevo.setUsuarioId(usuarioId);
                    return usuarioRepository.save(nuevo);
                });

        if (request != null && request.getSystemConfig() != null) {
            ConfiguracionSistemaRequest s = request.getSystemConfig();
            if (s.getTasaInteres() != null) sistema.setTasaInteres(s.getTasaInteres());
            if (s.getDiasGracia() != null) sistema.setDiasGracia(s.getDiasGracia());
            if (s.getMontoMinimoPago() != null) sistema.setMontoMinimoPago(s.getMontoMinimoPago());
            if (s.getEnvioAutomaticoRecibos() != null) sistema.setEnvioAutomaticoRecibos(s.getEnvioAutomaticoRecibos());
            if (s.getRecordatoriosPago() != null) sistema.setRecordatoriosPago(s.getRecordatoriosPago());
            sistemaRepository.save(sistema);
        }

        if (request != null && request.getUserConfig() != null) {
            ConfiguracionUsuarioRequest u = request.getUserConfig();
            if (u.getTelefono() != null) usuario.setTelefono(u.getTelefono());
            if (u.getNotificaciones() != null) usuario.setNotificaciones(u.getNotificaciones());
            if (u.getEmailAlerts() != null) usuario.setEmailAlerts(u.getEmailAlerts());
            if (u.getWhatsappAlerts() != null) usuario.setWhatsappAlerts(u.getWhatsappAlerts());
            usuarioRepository.save(usuario);
        }

        return new ConfiguracionResponse(usuario, sistema);
    }
}
