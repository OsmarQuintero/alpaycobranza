package com.alpay.cobranza.service;

import com.alpay.cobranza.model.Cliente;
import com.alpay.cobranza.model.Pago;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class WhatsAppService {

    private static final Logger logger = LoggerFactory.getLogger(WhatsAppService.class);

    private final RestClient restClient;
    private final boolean enabled;
    private final String provider;
    private final String baseUrl;
    private final String apiVersion;
    private final String phoneNumberId;
    private final String accessToken;
    private final String defaultCountryCode;

    public WhatsAppService(
            @Value("${app.whatsapp.enabled:false}") boolean enabled,
            @Value("${app.whatsapp.provider:meta}") String provider,
            @Value("${app.whatsapp.base-url:https://graph.facebook.com}") String baseUrl,
            @Value("${app.whatsapp.api-version:v21.0}") String apiVersion,
            @Value("${app.whatsapp.phone-number-id:}") String phoneNumberId,
            @Value("${app.whatsapp.access-token:}") String accessToken,
            @Value("${app.whatsapp.default-country-code:52}") String defaultCountryCode
    ) {
        this.restClient = RestClient.create();
        this.enabled = enabled;
        this.provider = provider;
        this.baseUrl = baseUrl;
        this.apiVersion = apiVersion;
        this.phoneNumberId = phoneNumberId;
        this.accessToken = accessToken;
        this.defaultCountryCode = defaultCountryCode;
    }

    public void enviarReciboPago(Cliente cliente, Pago pago, BigDecimal nuevoSaldo) {
        String mensaje = String.format(
                "Hola %s, recibimos tu pago de $%s via %s. Tu nuevo saldo es $%s. Gracias por usar Alpay.",
                cliente.getNombre(),
                pago.getMonto(),
                pago.getMetodo(),
                nuevoSaldo
        );

        boolean sent = enviarMensajeTexto(cliente.getTelefono(), mensaje);
        if (!sent) {
            logger.warn("No se envio WhatsApp API para cliente {}. Se mantiene link de fallback.", cliente.getId());
        }
    }

    public boolean enviarMensajeTexto(String telefono, String mensaje) {
        if (!enabled) {
            logger.info("WhatsApp API desactivada (app.whatsapp.enabled=false)");
            return false;
        }

        if (!isConfigured()) {
            logger.warn("WhatsApp API no configurada. Faltan app.whatsapp.phone-number-id o app.whatsapp.access-token");
            return false;
        }

        String phone = normalizePhone(telefono);
        if (phone.isBlank()) {
            logger.warn("Telefono invalido para WhatsApp: {}", telefono);
            return false;
        }

        String url = buildMessagesUrl();
        Map<String, Object> payload = Map.of(
                "messaging_product", "whatsapp",
                "to", phone,
                "type", "text",
                "text", Map.of(
                        "preview_url", false,
                        "body", mensaje
                )
        );

        try {
            ResponseEntity<String> response = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + accessToken)
                    .body(payload)
                    .retrieve()
                    .toEntity(String.class);

            logger.info("WhatsApp enviado correctamente a {}. Status={}", phone, response.getStatusCode().value());
            return response.getStatusCode().is2xxSuccessful();
        } catch (RestClientResponseException ex) {
            logger.error("Error WhatsApp API. Status={} Body={}", ex.getStatusCode().value(), ex.getResponseBodyAsString());
            return false;
        } catch (Exception ex) {
            logger.error("Error WhatsApp API: {}", ex.getMessage(), ex);
            return false;
        }
    }

    public String generarLinkRecibo(Pago pago) {
        try {
            String text = String.format(
                    "Hola %s, se registro tu pago de $%s el dia %s. Folio: %s.",
                    pago.getCuenta().getCliente().getNombre(),
                    pago.getMonto(),
                    pago.getFechaPago(),
                    pago.getReferencia()
            );
            String encodedText = URLEncoder.encode(text, StandardCharsets.UTF_8.name());
            String phone = normalizePhone(pago.getCuenta().getCliente().getTelefono());
            return String.format("https://wa.me/%s?text=%s", phone, encodedText);
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException("Error al generar el link de WhatsApp", e);
        }
    }

    public WhatsAppStatus getStatus() {
        return new WhatsAppStatus(
                enabled,
                isConfigured(),
                provider,
                apiVersion,
                phoneNumberId,
                defaultCountryCode
        );
    }

    private boolean isConfigured() {
        return phoneNumberId != null && !phoneNumberId.isBlank()
                && accessToken != null && !accessToken.isBlank();
    }

    private String buildMessagesUrl() {
        String cleanBase = trimTrailingSlash(baseUrl);
        String cleanVersion = trimSlashes(apiVersion);
        String cleanPhoneId = trimSlashes(phoneNumberId);
        return cleanBase + "/" + cleanVersion + "/" + cleanPhoneId + "/messages";
    }

    private String normalizePhone(String raw) {
        if (raw == null) return "";

        String digits = raw.replaceAll("\\D", "");
        if (digits.startsWith("00")) {
            digits = digits.substring(2);
        }

        String cc = defaultCountryCode == null ? "" : defaultCountryCode.replaceAll("\\D", "");
        if (!cc.isBlank() && digits.length() == 10) {
            digits = cc + digits;
        }

        return digits;
    }

    private String trimTrailingSlash(String value) {
        if (value == null) return "";
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    private String trimSlashes(String value) {
        if (value == null) return "";
        return value.replaceAll("^/+|/+$", "");
    }

    public record WhatsAppStatus(
            boolean enabled,
            boolean configured,
            String provider,
            String apiVersion,
            String phoneNumberId,
            String defaultCountryCode
    ) {}
}
