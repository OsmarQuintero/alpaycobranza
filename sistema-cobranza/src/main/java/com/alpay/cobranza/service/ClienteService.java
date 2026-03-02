package com.alpay.cobranza.service;

import com.alpay.cobranza.model.Cliente;
import com.alpay.cobranza.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    private final Path uploadDir = Paths.get("uploads", "clientes");

    public List<Cliente> obtenerTodos() {
        return clienteRepository.findAll();
    }

    public Optional<Cliente> obtenerPorId(Integer id) {
        return clienteRepository.findById(id);
    }

    public Cliente crearCliente(Cliente cliente, MultipartFile ineFrente, MultipartFile selfie) {
        normalizarYValidar(cliente, null);

        // INE es obligatoria en alta
        String inePath = guardarArchivo(ineFrente, "ine");
        // Selfie opcional
        String selfiePath = guardarArchivoOpcional(selfie, "selfie");

        cliente.setIneFrente(inePath);
        cliente.setSelfie(selfiePath);
        cliente.setVerificacionEstado("PENDIENTE");

        return clienteRepository.save(cliente);
    }

    public Cliente actualizarCliente(Integer id, Cliente clienteActualizado, MultipartFile ineFrente, MultipartFile selfie) {
        return clienteRepository.findById(id)
                .map(cliente -> {
                    normalizarYValidar(clienteActualizado, id);

                    cliente.setNombre(clienteActualizado.getNombre());
                    cliente.setRfc(clienteActualizado.getRfc());
                    cliente.setTelefono(clienteActualizado.getTelefono());
                    cliente.setDireccion(clienteActualizado.getDireccion());
                    cliente.setLat(clienteActualizado.getLat());
                    cliente.setLng(clienteActualizado.getLng());

                    if (ineFrente != null && !ineFrente.isEmpty()) {
                        cliente.setIneFrente(guardarArchivo(ineFrente, "ine"));
                        cliente.setVerificacionEstado("PENDIENTE");
                    }

                    if (selfie != null && !selfie.isEmpty()) {
                        cliente.setSelfie(guardarArchivo(selfie, "selfie"));
                        cliente.setVerificacionEstado("PENDIENTE");
                    }

                    return clienteRepository.save(cliente);
                })
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    }

    public void eliminarCliente(Integer id) {
        clienteRepository.deleteById(id);
    }

    public List<Cliente> buscarPorNombre(String nombre) {
        return clienteRepository.findByNombreContainingIgnoreCase(nombre);
    }

    private void normalizarYValidar(Cliente cliente, Integer clienteIdActual) {
        if (cliente == null) {
            throw new RuntimeException("Datos de cliente requeridos");
        }

        cliente.setNombre(safeTrim(cliente.getNombre()));
        cliente.setRfc(safeTrim(cliente.getRfc()).toUpperCase());
        cliente.setTelefono(safeTrim(cliente.getTelefono()));
        cliente.setDireccion(safeTrim(cliente.getDireccion()));

        if (cliente.getNombre().length() < 3) {
            throw new RuntimeException("El nombre debe tener al menos 3 caracteres");
        }

        if (!cliente.getRfc().matches("^[A-Z&\\u00D1]{4}\\d{6}[A-Z0-9]{3}$")) {
            throw new RuntimeException("RFC invalido. Debe tener 13 caracteres");
        }

        if (cliente.getTelefono().replaceAll("\\D", "").length() < 10) {
            throw new RuntimeException("Telefono invalido. Minimo 10 digitos");
        }

        if (cliente.getDireccion().isBlank()) {
            throw new RuntimeException("La direccion es obligatoria");
        }

        boolean coordIncompleta = (cliente.getLat() == null && cliente.getLng() != null)
                || (cliente.getLat() != null && cliente.getLng() == null);
        if (coordIncompleta) {
            throw new RuntimeException("Latitud y longitud deben enviarse juntas");
        }

        if (cliente.getLat() != null && (cliente.getLat() < -90 || cliente.getLat() > 90)) {
            throw new RuntimeException("Latitud fuera de rango");
        }

        if (cliente.getLng() != null && (cliente.getLng() < -180 || cliente.getLng() > 180)) {
            throw new RuntimeException("Longitud fuera de rango");
        }

        clienteRepository.findByRfc(cliente.getRfc()).ifPresent(existente -> {
            if (clienteIdActual == null || !existente.getId().equals(clienteIdActual)) {
                throw new RuntimeException("El RFC ya esta registrado");
            }
        });
    }

    private String safeTrim(String value) {
        return value == null ? "" : value.trim();
    }

    private String guardarArchivoOpcional(MultipartFile file, String prefix) {
        if (file == null || file.isEmpty()) return null;
        return guardarArchivo(file, prefix);
    }

    private String guardarArchivo(MultipartFile file, String prefix) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("INE requerida para registrar cliente");
        }

        try {
            Files.createDirectories(uploadDir);
            String ext = getExtension(file.getOriginalFilename());
            String filename = prefix + "_" + UUID.randomUUID() + (ext.isEmpty() ? "" : "." + ext);
            Path target = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return target.toString().replace("\\", "/");
        } catch (IOException e) {
            throw new RuntimeException("Error guardando archivo", e);
        }
    }

    private String getExtension(String name) {
        if (name == null) return "";
        int idx = name.lastIndexOf('.');
        if (idx == -1) return "";
        return name.substring(idx + 1);
    }
}
