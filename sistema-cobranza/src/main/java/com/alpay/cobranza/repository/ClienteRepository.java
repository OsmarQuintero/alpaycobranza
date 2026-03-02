package com.alpay.cobranza.repository;

import com.alpay.cobranza.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Integer> {

    // Buscar cliente por RFC
    Optional<Cliente> findByRfc(String rfc);

    // Buscar clientes por nombre (búsqueda parcial)
    List<Cliente> findByNombreContainingIgnoreCase(String nombre);

    // Buscar clientes por teléfono
    Optional<Cliente> findByTelefono(String telefono);
}