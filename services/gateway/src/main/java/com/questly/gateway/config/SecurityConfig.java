package com.questly.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import reactor.core.publisher.Flux;

import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Value("${spring.security.oauth2.resourceserver.jwt.public-key-value}")
    private String publicKeyPem;

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeExchange(exchanges -> exchanges
                .pathMatchers("/api/auth/**").permitAll()
                .pathMatchers("/actuator/**").permitAll()
                .pathMatchers("/health").permitAll()
                .pathMatchers("/error").permitAll()
                .pathMatchers("/internal/**").denyAll()
                
                // Specific Student POST flows allowed first (to prevent being blocked by broad course/assignment creation POST blocks below)
                .pathMatchers(HttpMethod.POST, "/api/courses/*/enroll").hasAnyRole("STUDENT", "TUTOR", "ADMIN")
                .pathMatchers(HttpMethod.POST, "/api/courses/*/modules/*/complete").hasAnyRole("STUDENT", "TUTOR", "ADMIN")
                .pathMatchers(HttpMethod.POST, "/api/assignments/*/submit").hasAnyRole("STUDENT", "TUTOR", "ADMIN")
                
                // Course-service / Assignment-service role rejections (TUTOR and ADMIN only)
                .pathMatchers(HttpMethod.POST, "/api/courses", "/api/courses/**").hasAnyRole("TUTOR", "ADMIN")
                .pathMatchers(HttpMethod.PUT, "/api/courses/**").hasAnyRole("TUTOR", "ADMIN")
                .pathMatchers(HttpMethod.DELETE, "/api/courses/**").hasAnyRole("TUTOR", "ADMIN")
                .pathMatchers("/api/courses/*/enrollments").hasAnyRole("TUTOR", "ADMIN")
                
                .pathMatchers(HttpMethod.POST, "/api/assignments", "/api/assignments/**").hasAnyRole("TUTOR", "ADMIN")
                .pathMatchers(HttpMethod.PUT, "/api/assignments/**").hasAnyRole("TUTOR", "ADMIN")
                .pathMatchers(HttpMethod.DELETE, "/api/assignments/**").hasAnyRole("TUTOR", "ADMIN")
                .pathMatchers("/api/assignments/*/submissions").hasAnyRole("TUTOR", "ADMIN")
                
                // User Administration Admin-only endpoints
                .pathMatchers(HttpMethod.GET, "/api/users").hasRole("ADMIN")
                .pathMatchers(HttpMethod.PATCH, "/api/users/*/role").hasRole("ADMIN")
                .pathMatchers(HttpMethod.DELETE, "/api/users/*").hasRole("ADMIN")
                
                .pathMatchers("/api/analytics/platform").hasRole("ADMIN")
                .pathMatchers("/api/analytics/students/**").hasAnyRole("TUTOR", "ADMIN")
                
                .anyExchange().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));
        return http.build();
    }

    @Bean
    public ReactiveJwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");
        jwtGrantedAuthoritiesConverter.setAuthoritiesClaimName("role");

        ReactiveJwtAuthenticationConverter jwtAuthenticationConverter = new ReactiveJwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(
            jwt -> Flux.fromIterable(jwtGrantedAuthoritiesConverter.convert(jwt))
        );
        return jwtAuthenticationConverter;
    }

    @Bean
    public ReactiveJwtDecoder jwtDecoder() {
        try {
            String key = publicKeyPem
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s", "");
            byte[] keyBytes = Base64.getDecoder().decode(key);
            X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
            KeyFactory kf = KeyFactory.getInstance("RSA");
            RSAPublicKey publicKey = (RSAPublicKey) kf.generatePublic(spec);
            return NimbusReactiveJwtDecoder.withPublicKey(publicKey).build();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to configure ReactiveJwtDecoder", e);
        }
    }
}
