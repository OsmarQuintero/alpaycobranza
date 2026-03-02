package com.alpay.cobranza.service;

import com.alpay.cobranza.model.ContactoMensaje;
import com.alpay.cobranza.model.ContactoRequest;
import com.alpay.cobranza.repository.ContactoMensajeRepository;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class ContactoService {

    private final ContactoMensajeRepository contactoMensajeRepository;
    private final JavaMailSender mailSender;
    private final String destinatario;

    public ContactoService(
            ContactoMensajeRepository contactoMensajeRepository,
            JavaMailSender mailSender,
            @Value("${app.contact.to}") String destinatario
    ) {
        this.contactoMensajeRepository = contactoMensajeRepository;
        this.mailSender = mailSender;
        this.destinatario = destinatario;
    }

    public void registrarYNotificar(ContactoRequest request) {
        ContactoMensaje mensaje = new ContactoMensaje(
                request.getNombre(),
                request.getEmail(),
                request.getEmpresa(),
                request.getMensaje()
        );

        contactoMensajeRepository.save(mensaje);
        enviarCorreo(mensaje);
    }

    private void enviarCorreo(ContactoMensaje mensaje) {
        try {
            MimeMessage mail = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mail, false, "UTF-8");

            helper.setTo(destinatario);
            helper.setSubject("Nuevo contacto desde landing");
            helper.setText(
                    "Nombre: " + mensaje.getNombre() +
                    "\nCorreo: " + mensaje.getEmail() +
                    "\nEmpresa: " + (mensaje.getEmpresa() == null || mensaje.getEmpresa().isBlank() ? "-" : mensaje.getEmpresa()) +
                    "\n\nMensaje:\n" + mensaje.getMensaje(),
                    false
            );

            mailSender.send(mail);
        } catch (Exception e) {
            throw new RuntimeException("Error enviando correo de contacto", e);
        }
    }
}
