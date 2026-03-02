package com.alpay.cobranza.controller;

import com.alpay.cobranza.model.ContactoRequest;
import com.alpay.cobranza.service.ContactoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contacto")
public class ContactoController {

    private final ContactoService contactoService;

    public ContactoController(ContactoService contactoService) {
        this.contactoService = contactoService;
    }

    @PostMapping
    public ResponseEntity<Void> crear(@Valid @RequestBody ContactoRequest request) {
        contactoService.registrarYNotificar(request);
        return ResponseEntity.ok().build();
    }
}

