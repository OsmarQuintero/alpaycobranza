package com.alpay.cobranza.service;

import com.alpay.cobranza.model.Cuenta;
import com.alpay.cobranza.model.Pago;
import com.alpay.cobranza.repository.CuentaRepository;
import com.alpay.cobranza.repository.PagoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class CobranzaService {

    private static final Logger logger = LoggerFactory.getLogger(CobranzaService.class);

    private final CuentaRepository cuentaRepository;
    private final PagoRepository pagoRepository;
    private final WhatsAppService whatsAppService;

    public CobranzaService(CuentaRepository cuentaRepository, PagoRepository pagoRepository, WhatsAppService whatsAppService) {
        this.cuentaRepository = cuentaRepository;
        this.pagoRepository = pagoRepository;
        this.whatsAppService = whatsAppService;
    }

    @Transactional
    public Pago registrarNuevoPago(Integer idCuenta, BigDecimal monto, String metodo, String referencia) {
        // Buscar la cuenta
        Cuenta cuenta = cuentaRepository.findById(idCuenta)
                .orElseThrow(() -> new RuntimeException("Cuenta no encontrada"));

        // Validar que el monto no sea mayor al saldo
        if (monto.compareTo(cuenta.getSaldo()) > 0) {
            throw new RuntimeException("El monto no puede ser mayor al saldo pendiente");
        }

        // Crear el registro del pago
        Pago pago = new Pago();
        pago.setCuenta(cuenta);
        pago.setMonto(monto);
        pago.setMetodo(metodo);
        pago.setReferencia(referencia);
        pago.setFechaPago(LocalDate.now());

        // Guardar el pago en la base de datos
        Pago pagoGuardado = pagoRepository.save(pago);

        // Actualizar el saldo de la cuenta restando el pago
        BigDecimal nuevoSaldo = cuenta.getSaldo().subtract(monto);
        cuenta.setSaldo(nuevoSaldo);
        cuentaRepository.save(cuenta);

        // Enviar comprobante por WhatsApp (Lógica Alpay)
        try {
            whatsAppService.enviarReciboPago(cuenta.getCliente(), pago, nuevoSaldo);
        } catch (Exception e) {
            logger.warn("Error al enviar WhatsApp API: {}", e.getMessage());
            // No bloqueamos la transacción si falla el mensaje
        }

        return pagoGuardado;
    }

    public List<Pago> obtenerPagosPorCuenta(Integer cuentaId) {
        return pagoRepository.findByCuentaIdOrderByFechaPagoDesc(cuentaId);
    }

    public List<Pago> obtenerUltimosPagos() {
        return pagoRepository.findTop10ByOrderByFechaPagoDesc();
    }
}
