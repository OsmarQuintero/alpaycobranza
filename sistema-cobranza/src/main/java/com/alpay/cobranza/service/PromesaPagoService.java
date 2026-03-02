package com.alpay.cobranza.service;

import com.alpay.cobranza.model.Cuenta;
import com.alpay.cobranza.model.HistorialCobranza;
import com.alpay.cobranza.model.PromesaPagoEstadoRequest;
import com.alpay.cobranza.model.PromesaPagoRequest;
import com.alpay.cobranza.model.PromesaPagoResponse;
import com.alpay.cobranza.repository.CuentaRepository;
import com.alpay.cobranza.repository.HistorialRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PromesaPagoService {

    private static final String TIPO = "ACTUALIZACION";
    private static final String PREFIJO = "PROMESA|";

    private final HistorialRepository historialRepository;
    private final CuentaRepository cuentaRepository;

    public PromesaPagoService(HistorialRepository historialRepository, CuentaRepository cuentaRepository) {
        this.historialRepository = historialRepository;
        this.cuentaRepository = cuentaRepository;
    }

    @Transactional
    public PromesaPagoResponse crear(PromesaPagoRequest request) {
        if (request == null || request.idCuenta() == null) {
            throw new RuntimeException("La cuenta es obligatoria");
        }

        Cuenta cuenta = cuentaRepository.findById(request.idCuenta())
                .orElseThrow(() -> new RuntimeException("Cuenta no encontrada"));

        BigDecimal monto = request.montoCompromiso();
        if (monto == null || monto.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Monto de compromiso invalido");
        }

        if (monto.compareTo(cuenta.getSaldo()) > 0) {
            throw new RuntimeException("La promesa no puede ser mayor al saldo pendiente");
        }

        LocalDate fechaCompromiso = request.fechaCompromiso();
        if (fechaCompromiso == null) {
            throw new RuntimeException("Fecha de compromiso obligatoria");
        }

        if (fechaCompromiso.isBefore(LocalDate.now())) {
            throw new RuntimeException("La fecha de compromiso no puede estar en el pasado");
        }

        String comentario = limpiar(request.comentario());

        HistorialCobranza promesa = new HistorialCobranza();
        promesa.setCuenta(cuenta);
        promesa.setTipo(TIPO);
        promesa.setDescripcion(construirDescripcion(monto, fechaCompromiso, "PENDIENTE", comentario));

        HistorialCobranza saved = historialRepository.save(promesa);
        return mapear(saved);
    }

    public List<PromesaPagoResponse> listarTodas() {
        return historialRepository.findByTipoAndDescripcionStartingWithOrderByFechaDesc(TIPO, PREFIJO)
                .stream()
                .map(this::mapear)
                .toList();
    }

    public List<PromesaPagoResponse> listarPorCuenta(Integer cuentaId) {
        return historialRepository.findByCuenta_IdAndTipoAndDescripcionStartingWithOrderByFechaDesc(cuentaId, TIPO, PREFIJO)
                .stream()
                .map(this::mapear)
                .toList();
    }

    @Transactional
    public PromesaPagoResponse actualizarEstado(Integer promesaId, PromesaPagoEstadoRequest request) {
        HistorialCobranza promesa = historialRepository.findById(promesaId)
                .orElseThrow(() -> new RuntimeException("Promesa no encontrada"));

        if (!TIPO.equals(promesa.getTipo()) || promesa.getDescripcion() == null || !promesa.getDescripcion().startsWith(PREFIJO)) {
            throw new RuntimeException("El registro no corresponde a una promesa de pago");
        }

        Map<String, String> data = parsearDescripcion(promesa.getDescripcion());

        String estado = request != null ? limpiar(request.estado()).toUpperCase() : "";
        if (!estado.equals("PENDIENTE") && !estado.equals("CUMPLIDA") && !estado.equals("INCUMPLIDA")) {
            throw new RuntimeException("Estado invalido. Usa PENDIENTE, CUMPLIDA o INCUMPLIDA");
        }

        data.put("estado", estado);
        if (request != null && request.fechaCumplimiento() != null) {
            data.put("fechaCumplimiento", request.fechaCumplimiento().toString());
        }

        promesa.setDescripcion(reconstruirDescripcion(data));
        HistorialCobranza saved = historialRepository.save(promesa);
        return mapear(saved);
    }

    private PromesaPagoResponse mapear(HistorialCobranza row) {
        Map<String, String> data = parsearDescripcion(row.getDescripcion());

        BigDecimal monto = new BigDecimal(data.getOrDefault("monto", "0"));
        LocalDate fechaCompromiso = LocalDate.parse(data.getOrDefault("fecha", LocalDate.now().toString()));
        String estado = data.getOrDefault("estado", "PENDIENTE");
        String comentario = data.getOrDefault("comentario", "");

        String cliente = row.getCuenta() != null && row.getCuenta().getCliente() != null
                ? row.getCuenta().getCliente().getNombre()
                : "Cliente";

        return new PromesaPagoResponse(
                row.getIdHistorial(),
                row.getCuenta() != null ? row.getCuenta().getId() : null,
                cliente,
                monto,
                fechaCompromiso,
                estado,
                comentario,
                row.getFecha()
        );
    }

    private String construirDescripcion(BigDecimal monto, LocalDate fecha, String estado, String comentario) {
        return PREFIJO
                + "monto=" + monto
                + "|fecha=" + fecha
                + "|estado=" + estado
                + "|comentario=" + limpiar(comentario);
    }

    private Map<String, String> parsearDescripcion(String descripcion) {
        Map<String, String> data = new HashMap<>();
        if (descripcion == null || !descripcion.startsWith(PREFIJO)) return data;

        String payload = descripcion.substring(PREFIJO.length());
        String[] pares = payload.split("\\|");
        for (String par : pares) {
            int idx = par.indexOf('=');
            if (idx > 0 && idx < par.length() - 1) {
                String key = par.substring(0, idx);
                String value = par.substring(idx + 1);
                data.put(key, value);
            }
        }
        return data;
    }

    private String reconstruirDescripcion(Map<String, String> data) {
        StringBuilder sb = new StringBuilder(PREFIJO);
        sb.append("monto=").append(data.getOrDefault("monto", "0"));
        sb.append("|fecha=").append(data.getOrDefault("fecha", LocalDate.now().toString()));
        sb.append("|estado=").append(data.getOrDefault("estado", "PENDIENTE"));
        sb.append("|comentario=").append(limpiar(data.getOrDefault("comentario", "")));

        if (data.containsKey("fechaCumplimiento")) {
            sb.append("|fechaCumplimiento=").append(data.get("fechaCumplimiento"));
        }

        return sb.toString();
    }

    private String limpiar(String raw) {
        if (raw == null) return "";
        return raw.replace("|", "/").trim();
    }
}
