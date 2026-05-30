package com.questly.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.BearerTokenAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.ServerAuthenticationConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.config.GlobalCorsProperties;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Value("${spring.security.oauth2.resourceserver.jwt.public-key-value}")
    private String publicKeyPem;

    /**
     * Autowire GlobalCorsProperties which binds spring.cloud.gateway.globalcors.*
     * from the centralized config-server gateway.yml. Adding a new allowed origin
     * or method only requires updating gateway.yml — no code changes needed.
     */
    @Autowired
    private GlobalCorsProperties globalCorsProperties;

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeExchange(exchanges -> exchanges
                .pathMatchers(HttpMethod.OPTIONS).permitAll()
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
            .oauth2ResourceServer(oauth2 -> oauth2
                .bearerTokenConverter(new CustomBearerTokenAuthenticationConverter())
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
            );
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

    /**
     * Build a reactive CorsConfigurationSource by reading the centralized
     * spring.cloud.gateway.globalcors.cors-configurations map from the config server.
     *
     * This means ALL CORS policy lives in gateway.yml served by config-server.
     * To add a new origin, method, or header: update gateway.yml only.
     *
     * Falls back to a secure developer default if no configuration is found
     * (e.g. in isolated unit-test environments where config-server is unavailable).
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        Map<String, CorsConfiguration> corsConfigurations = globalCorsProperties.getCorsConfigurations();
        if (corsConfigurations != null && !corsConfigurations.isEmpty()) {
            // Dynamically wire every pattern -> CorsConfiguration entry from gateway.yml
            corsConfigurations.forEach(source::registerCorsConfiguration);
        } else {
            // Fallback: permit Vite dev server when no centralised config is resolved
            CorsConfiguration fallback = new CorsConfiguration();
            fallback.setAllowedOrigins(List.of("http://localhost:5173"));
            fallback.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
            fallback.setAllowedHeaders(List.of("*"));
            fallback.setAllowCredentials(true);
            source.registerCorsConfiguration("/**", fallback);
        }

        return source;
    }

    private static class CustomBearerTokenAuthenticationConverter implements ServerAuthenticationConverter {
        @Override
        public Mono<Authentication> convert(ServerWebExchange exchange) {
            return Mono.justOrEmpty(resolveToken(exchange))
                    .map(BearerTokenAuthenticationToken::new);
        }

        private String resolveToken(ServerWebExchange exchange) {
            // 1. Check Authorization header
            String authorization = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authorization != null && authorization.toLowerCase().startsWith("bearer ")) {
                return authorization.substring(7);
            }
            // 2. Check "token" query parameter (e.g. for SSE)
            String token = exchange.getRequest().getQueryParams().getFirst("token");
            if (token != null && !token.trim().isEmpty()) {
                return token;
            }
            return null;
        }
    }
}
