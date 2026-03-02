package com.alpay.cobranza.repository;

import com.alpay.cobranza.model.ConfiguracionSistema;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConfiguracionSistemaRepository extends JpaRepository<ConfiguracionSistema, Integer> {
    Optional<ConfiguracionSistema> findFirstByOrderByIdAsc();
}
