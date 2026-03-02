package com.alpay.cobranza.repository;

import com.alpay.cobranza.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Integer> {

    // Pagos por cuenta
    List<Pago> findByCuentaIdOrderByFechaPagoDesc(Integer cuentaId);

    // Pagos por rango de fechas
    List<Pago> findByFechaPagoBetween(LocalDate inicio, LocalDate fin);

    // Total de pagos del día
    @Query("SELECT SUM(p.monto) FROM Pago p WHERE p.fechaPago = ?1")
    BigDecimal sumMontoByFechaPago(LocalDate fecha);

    // Últimos N pagos
    List<Pago> findTop10ByOrderByFechaPagoDesc();
}