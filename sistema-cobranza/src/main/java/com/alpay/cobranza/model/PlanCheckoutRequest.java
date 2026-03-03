package com.alpay.cobranza.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class PlanCheckoutRequest {

    @NotBlank(message = "El plan es obligatorio")
    @Size(max = 30)
    private String planId;

    @NotBlank(message = "El ciclo es obligatorio")
    @Pattern(regexp = "MENSUAL|ANUAL", message = "El ciclo debe ser MENSUAL o ANUAL")
    private String billingCycle;

    @Email(message = "Email invalido")
    @Size(max = 160)
    private String email;

    public String getPlanId() {
        return planId;
    }

    public void setPlanId(String planId) {
        this.planId = planId;
    }

    public String getBillingCycle() {
        return billingCycle;
    }

    public void setBillingCycle(String billingCycle) {
        this.billingCycle = billingCycle;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
