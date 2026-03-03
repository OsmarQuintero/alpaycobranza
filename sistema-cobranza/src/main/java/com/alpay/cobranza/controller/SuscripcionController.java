package com.alpay.cobranza.controller;

import com.alpay.cobranza.model.PlanCheckoutRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/suscripciones")
public class SuscripcionController {

    @Value("${PAYMENT_BASIC_MENSUAL_URL:}")
    private String basicMensualUrl;

    @Value("${PAYMENT_BASIC_ANUAL_URL:}")
    private String basicAnualUrl;

    @Value("${PAYMENT_PRO_MENSUAL_URL:}")
    private String proMensualUrl;

    @Value("${PAYMENT_PRO_ANUAL_URL:}")
    private String proAnualUrl;

    @Value("${PAYMENT_EMPRESARIAL_MENSUAL_URL:}")
    private String empresarialMensualUrl;

    @Value("${PAYMENT_EMPRESARIAL_ANUAL_URL:}")
    private String empresarialAnualUrl;

    @GetMapping("/planes")
    public ResponseEntity<?> getPlanes() {
        List<Map<String, Object>> planes = List.of(
                buildPlan("BASIC", "Basico", 499, 4990,
                        List.of("1 sucursal", "Hasta 5 usuarios", "Reportes PDF y Excel", "Soporte por email")),
                buildPlan("PRO", "Profesional", 899, 8990,
                        List.of("Hasta 3 sucursales", "Hasta 20 usuarios", "KPIs avanzados", "Soporte prioritario")),
                buildPlan("EMPRESARIAL", "Empresarial", 1499, 14990,
                        List.of("Sucursales ilimitadas", "Usuarios ilimitados", "Automatizaciones", "Acompanamiento dedicado"))
        );

        return ResponseEntity.ok(Map.of("planes", planes, "currency", "MXN"));
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> createCheckout(@Valid @RequestBody PlanCheckoutRequest request) {
        String plan = normalize(request.getPlanId());
        String cycle = normalize(request.getBillingCycle());
        String checkoutUrl = resolveCheckoutUrl(plan, cycle);

        if (checkoutUrl == null || checkoutUrl.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "No hay URL de pago configurada para el plan seleccionado",
                    "plan", plan,
                    "billingCycle", cycle,
                    "requiredEnv", List.of(
                            "PAYMENT_BASIC_MENSUAL_URL", "PAYMENT_BASIC_ANUAL_URL",
                            "PAYMENT_PRO_MENSUAL_URL", "PAYMENT_PRO_ANUAL_URL",
                            "PAYMENT_EMPRESARIAL_MENSUAL_URL", "PAYMENT_EMPRESARIAL_ANUAL_URL"
                    )
            ));
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("checkoutUrl", checkoutUrl);
        response.put("provider", "HOSTED_CHECKOUT");
        response.put("plan", plan);
        response.put("billingCycle", cycle);
        response.put("status", "READY");
        return ResponseEntity.ok(response);
    }

    private String resolveCheckoutUrl(String plan, String cycle) {
        if ("BASIC".equals(plan) && "MENSUAL".equals(cycle)) return basicMensualUrl;
        if ("BASIC".equals(plan) && "ANUAL".equals(cycle)) return basicAnualUrl;
        if ("PRO".equals(plan) && "MENSUAL".equals(cycle)) return proMensualUrl;
        if ("PRO".equals(plan) && "ANUAL".equals(cycle)) return proAnualUrl;
        if ("EMPRESARIAL".equals(plan) && "MENSUAL".equals(cycle)) return empresarialMensualUrl;
        if ("EMPRESARIAL".equals(plan) && "ANUAL".equals(cycle)) return empresarialAnualUrl;
        return null;
    }

    private Map<String, Object> buildPlan(String id, String name, int mensual, int anual, List<String> features) {
        Map<String, Object> plan = new LinkedHashMap<>();
        plan.put("id", id);
        plan.put("name", name);
        plan.put("mensual", mensual);
        plan.put("anual", anual);
        plan.put("features", features);
        plan.put("highlight", "PRO".equals(id));
        return plan;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
    }
}
