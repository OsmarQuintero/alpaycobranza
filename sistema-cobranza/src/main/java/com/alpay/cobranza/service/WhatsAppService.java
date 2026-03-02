package com.alpay.cobranza.service;

import com.alpay.cobranza.model.Cliente;
import com.alpay.cobranza.model.Pago;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class WhatsAppService {

    private static final Logger logger = LoggerFactory.getLogger(WhatsAppService.class);

    public WhatsAppService() {
        // Constructor for injection
    }

    /**
     * Simulación de envío de recibo por WhatsApp para el sistema Alpay.
     * Aquí podrías integrar APIs como Twilio o Meta Business.
     */
    public void enviarReciboPago(Cliente cliente, Pago pago, BigDecimal nuevoSaldo) {
        String mensaje = String.format(
                "Hola %s, hemos recibido tu pago de $%s vía %s. Tu nuevo saldo es: $%s. ¡Gracias por usar Alpay!",
                cliente.getNombre(),
                pago.getMonto(),
                pago.getMetodo(),
                nuevoSaldo
        );

        logger.info("Enviando WhatsApp a {}: {}", cliente.getTelefono(), mensaje);
    }

    public String generarLinkRecibo(Pago pago) {
        try {
            String text = String.format(
                    "Hola %s, se ha registrado tu pago de $%s el día %s. Folio: %s.",
                    pago.getCuenta().getCliente().getNombre(),
                    pago.getMonto(),
                    pago.getFechaPago(),
                    pago.getReferencia()
            );
            String encodedText = URLEncoder.encode(text, StandardCharsets.UTF_8.name());
            return String.format("https://wa.me/%s?text=%s", pago.getCuenta().getCliente().getTelefono(), encodedText);
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException("Error al generar el link de WhatsApp", e);
        }
    }
}
