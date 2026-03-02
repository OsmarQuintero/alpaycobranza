package com.alpay.cobranza.controller;

import com.alpay.cobranza.model.Cliente;
import com.alpay.cobranza.model.ClienteAdminExpediente;
import com.alpay.cobranza.model.ClienteResponse;
import com.alpay.cobranza.service.ClienteService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping
    public List<ClienteResponse> listarTodos() {
        return clienteService.obtenerTodos().stream().map(this::toClienteResponse).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponse> obtenerPorId(@PathVariable Integer id) {
        return clienteService.obtenerPorId(id)
                .map(c -> ResponseEntity.ok(toClienteResponse(c)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/admin-expedientes")
    public List<ClienteAdminExpediente> listarExpedientesAdmin() {
        return clienteService.obtenerTodos().stream().map(this::toClienteAdminExpediente).toList();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ClienteResponse crear(
            @RequestParam String nombre,
            @RequestParam(required = false) String rfc,
            @RequestParam String telefono,
            @RequestParam(required = false) String direccion,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestPart(value = "ineFrente", required = false) MultipartFile ineFrente,
            @RequestPart(value = "selfie", required = false) MultipartFile selfie
    ) {
        Cliente cliente = new Cliente();
        cliente.setNombre(nombre);
        cliente.setRfc(rfc);
        cliente.setTelefono(telefono);
        cliente.setDireccion(direccion);
        cliente.setLat(lat);
        cliente.setLng(lng);

        Cliente saved = clienteService.crearCliente(cliente, ineFrente, selfie);
        return toClienteResponse(saved);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ClienteResponse actualizar(
            @PathVariable Integer id,
            @RequestParam String nombre,
            @RequestParam(required = false) String rfc,
            @RequestParam String telefono,
            @RequestParam(required = false) String direccion,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestPart(value = "ineFrente", required = false) MultipartFile ineFrente,
            @RequestPart(value = "selfie", required = false) MultipartFile selfie
    ) {
        Cliente cliente = new Cliente();
        cliente.setNombre(nombre);
        cliente.setRfc(rfc);
        cliente.setTelefono(telefono);
        cliente.setDireccion(direccion);
        cliente.setLat(lat);
        cliente.setLng(lng);

        Cliente updated = clienteService.actualizarCliente(id, cliente, ineFrente, selfie);
        return toClienteResponse(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        clienteService.eliminarCliente(id);
        return ResponseEntity.ok(Map.of("message", "Cliente eliminado correctamente"));
    }

    @GetMapping("/buscar")
    public List<ClienteResponse> buscarPorNombre(@RequestParam String nombre) {
        return clienteService.buscarPorNombre(nombre).stream().map(this::toClienteResponse).toList();
    }

    private ClienteResponse toClienteResponse(Cliente c) {
        return new ClienteResponse(
                c.getId(),
                c.getNombre(),
                c.getRfc(),
                c.getTelefono(),
                c.getDireccion(),
                c.getLat(),
                c.getLng(),
                c.getFechaRegistro(),
                c.getVerificacionEstado()
        );
    }

    private ClienteAdminExpediente toClienteAdminExpediente(Cliente c) {
        return new ClienteAdminExpediente(
                c.getId(),
                c.getNombre(),
                c.getRfc(),
                c.getTelefono(),
                c.getDireccion(),
                c.getLat(),
                c.getLng(),
                c.getFechaRegistro(),
                c.getVerificacionEstado(),
                toUploadUrl(c.getIneFrente()),
                toUploadUrl(c.getSelfie())
        );
    }

    private String toUploadUrl(String rawPath) {
        if (rawPath == null || rawPath.isBlank()) return null;
        String normalized = rawPath.replace('\\', '/');
        int idx = normalized.indexOf("uploads/");
        if (idx >= 0) {
            return "/" + normalized.substring(idx);
        }
        return normalized.startsWith("/") ? normalized : "/" + normalized;
    }
}
