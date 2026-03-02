package com.alpay.cobranza.repository;

import com.alpay.cobranza.model.ConfiguracionUsuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConfiguracionUsuarioRepository extends JpaRepository<ConfiguracionUsuario, Integer> {
    Optional<ConfiguracionUsuario> findByUsuarioId(Integer usuarioId);
}
