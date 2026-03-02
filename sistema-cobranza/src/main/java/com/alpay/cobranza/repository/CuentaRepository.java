package com.alpay.cobranza.repository;

import com.alpay.cobranza.model.Cuenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CuentaRepository extends JpaRepository<Cuenta, Integer> {

    // Buscar cuentas por ID de cliente
    List<Cuenta> findByClienteId(Integer clienteId);

    // Buscar cuentas por estatus
    List<Cuenta> findByEstatus(String estatus);

    // Buscar cuentas activas con saldo pendiente
    List<Cuenta> findByEstatusAndSaldoGreaterThan(String estatus, java.math.BigDecimal saldo);
}