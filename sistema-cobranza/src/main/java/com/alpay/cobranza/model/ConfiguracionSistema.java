package com.alpay.cobranza.model;

import jakarta.persistence.*;

@Entity
@Table(name = "configuracion_sistema")
public class ConfiguracionSistema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "tasa_interes", nullable = false)
    private Double tasaInteres = 3.5;

    @Column(name = "dias_gracia", nullable = false)
    private Integer diasGracia = 5;

    @Column(name = "monto_minimo_pago", nullable = false)
    private Double montoMinimoPago = 100.0;

    @Column(name = "envio_automatico_recibos", nullable = false)
    private Boolean envioAutomaticoRecibos = true;

    @Column(name = "recordatorios_pago", nullable = false)
    private Boolean recordatoriosPago = true;

    public Integer getId() {
        return id;
    }

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
