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

}
