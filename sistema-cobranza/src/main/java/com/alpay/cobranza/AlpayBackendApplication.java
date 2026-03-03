package com.alpay.cobranza;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.alpay.cobranza.model.Usuario;
import com.alpay.cobranza.repository.UsuarioRepository;

@SpringBootApplication
public class  AlpayBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(AlpayBackendApplication.class, args);
	}

	@Bean
    CommandLineRunner initAdmin(UsuarioRepository repo, PasswordEncoder encoder) {
        return args -> {
            if (repo.findByEmail("admin@alpay.mx").isEmpty()) {
                Usuario admin = new Usuario();
                admin.setNombre("Administrador");
                admin.setEmail("admin@alpay.mx");
                admin.setPassword(encoder.encode("Lechuga23@"));
                admin.setRol("ADMIN");
                admin.setEstado("A");
                repo.save(admin);

                System.out.println("✅ ADMIN CREADO AUTOMATICAMENTE");
            } else {
                System.out.println("ℹ️ ADMIN YA EXISTE");
            }
        };
    }
}
