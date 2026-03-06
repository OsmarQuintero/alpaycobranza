package com.alpay.cobranza.config;

import com.alpay.cobranza.exception.ApiErrorResponse;
import com.alpay.cobranza.security.JwtAuthenticationFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        ObjectMapper mapper = new ObjectMapper();

        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            mapper.writeValue(
                                    response.getOutputStream(),
                                    ApiErrorResponse.of(401, "UNAUTHORIZED", "Debes iniciar sesion", null, request.getRequestURI())
                            );
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            mapper.writeValue(
                                    response.getOutputStream(),
                                    ApiErrorResponse.of(403, "ACCESS_DENIED", "No tienes permisos para esta operacion", null, request.getRequestURI())
                            );
                        })
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/").permitAll()
                        .requestMatchers("/healthz").permitAll()
                        .requestMatchers("/api/").permitAll()
                        .requestMatchers("/api/health").permitAll()
                        .requestMatchers("/api/healthz").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/contacto/**").permitAll()
                        .requestMatchers("/api/suscripciones/**").permitAll()
                        .requestMatchers("/api/usuarios/registro").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/clientes/admin-expedientes").hasAnyAuthority("ROLE_ADMIN", "ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/clientes/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_OFICINA", "ROLE_COBRADOR", "ADMIN", "OFICINA", "COBRADOR")
                        .requestMatchers(HttpMethod.GET, "/api/cuentas/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_OFICINA", "ROLE_COBRADOR", "ADMIN", "OFICINA", "COBRADOR")
                        .requestMatchers(HttpMethod.GET, "/api/pagos/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_OFICINA", "ROLE_COBRADOR", "ADMIN", "OFICINA", "COBRADOR")

                        .requestMatchers(HttpMethod.GET, "/api/promesas/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_OFICINA", "ROLE_COBRADOR", "ADMIN", "OFICINA", "COBRADOR")
                        .requestMatchers(HttpMethod.GET, "/api/geocode/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_OFICINA", "ROLE_COBRADOR", "ADMIN", "OFICINA", "COBRADOR")
                        .requestMatchers(HttpMethod.POST, "/api/promesas/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_OFICINA", "ROLE_COBRADOR", "ADMIN", "OFICINA", "COBRADOR")
                        .requestMatchers(HttpMethod.PATCH, "/api/promesas/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_OFICINA", "ROLE_COBRADOR", "ADMIN", "OFICINA", "COBRADOR")

                        .requestMatchers("/api/usuarios/admin").hasAnyAuthority("ROLE_ADMIN", "ADMIN")
                        .requestMatchers("/api/usuarios/*/foto").hasAnyAuthority("ROLE_ADMIN", "ROLE_OFICINA", "ROLE_COBRADOR", "ADMIN", "OFICINA", "COBRADOR")
                        .requestMatchers("/api/usuarios/**").hasAnyAuthority("ROLE_ADMIN", "ADMIN")

                        .requestMatchers("/api/clientes/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_OFICINA", "ADMIN", "OFICINA")
                        .requestMatchers("/api/cuentas/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_OFICINA", "ADMIN", "OFICINA")
                        .requestMatchers("/api/reportes/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_OFICINA", "ADMIN", "OFICINA")

                        .requestMatchers("/api/pagos/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_COBRADOR", "ADMIN", "COBRADOR")
                        .requestMatchers("/api/historial/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_COBRADOR", "ADMIN", "COBRADOR")

                        .requestMatchers("/api/configuracion/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_OFICINA", "ROLE_COBRADOR", "ADMIN", "OFICINA", "COBRADOR")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
