package com.alpay.cobranza.repository;

import com.alpay.cobranza.model.HistorialCobranza;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistorialRepository extends JpaRepository<HistorialCobranza, Integer> {

    List<HistorialCobranza> findByCuenta_IdOrderByFechaDesc(Integer cuentaId);

    List<HistorialCobranza> findByTipoOrderByFechaDesc(String tipo);

    List<HistorialCobranza> findTop20ByOrderByFechaDesc();

    List<HistorialCobranza> findByTipoAndDescripcionStartingWithOrderByFechaDesc(String tipo, String descripcionPrefix);

    List<HistorialCobranza> findByCuenta_IdAndTipoAndDescripcionStartingWithOrderByFechaDesc(Integer cuentaId, String tipo, String descripcionPrefix);
}
