package com.alpay.cobranza.model;

public class ConfiguracionSistemaRequest {
    private Double tasaInteres;
    private Integer diasGracia;
    private Double montoMinimoPago;
    private Boolean envioAutomaticoRecibos;
    private Boolean recordatoriosPago;

    public Double getTasaInteres() {
        return tasaInteres;
    }

    public void setTasaInteres(Double tasaInteres) {
        this.tasaInteres = tasaInteres;
    }

    public Integer getDiasGracia() {
        return diasGracia;
    }

    public void setDiasGracia(Integer diasGracia) {
        this.diasGracia = diasGracia;
    }

    public Double getMontoMinimoPago() {
        return montoMinimoPago;
    }

    public void setMontoMinimoPago(Double montoMinimoPago) {
        this.montoMinimoPago = montoMinimoPago;
    }

    public Boolean getEnvioAutomaticoRecibos() {
        return envioAutomaticoRecibos;
    }

    public void setEnvioAutomaticoRecibos(Boolean envioAutomaticoRecibos) {
        this.envioAutomaticoRecibos = envioAutomaticoRecibos;
    }

    public Boolean getRecordatoriosPago() {
        return recordatoriosPago;
    }

    public void setRecordatoriosPago(Boolean recordatoriosPago) {
        this.recordatoriosPago = recordatoriosPago;
    }
}
