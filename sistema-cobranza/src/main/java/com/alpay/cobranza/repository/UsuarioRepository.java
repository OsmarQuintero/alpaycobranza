package com.alpay.cobranza.repository;

import com.alpay.cobranza.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByEmailAndEstado(String email, String estado);

    boolean existsByEmail(String email);

    List<Usuario> findByRol(String rol);

    List<Usuario> findByEstado(String estado);
}


