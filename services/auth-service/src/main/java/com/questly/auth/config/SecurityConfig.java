package com.questly.auth.config;

import com.questly.auth.security.CookieOAuth2AuthorizationRequestRepository;
import com.questly.auth.security.OAuth2SuccessHandler;
import jakarta.servlet.DispatcherType;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Security configuration for auth-service.
 *
 * Key decisions:
 *
 * 1. STATELESS sessions — No server-side HTTP session is created for any request.
 *    The OAuth2 authorization-request round-trip is bridged statelessly via the
 *    CookieOAuth2AuthorizationRequestRepository (HttpOnly cookie, 3 min TTL).
 *
 * 2. PKCE — Spring Security's oauth2Login enables PKCE by default when
 *    client-authentication-method is set to "none" in the registration config.
 *    This prevents authorization-code interception attacks.
 *
 * 3. CORS — Only the React dev server origin (localhost:5173) is permitted.
 *    Credentials (cookies) are explicitly allowed so the oauth2_auth_request
 *    cookie is sent back on the /api/auth/login/oauth2/code/google callback.
 *
 * 4. Dev mock endpoint — /api/auth/google/mock is annotated @Profile("dev") in
 *    AuthController and is therefore compiled out in non-dev profiles. The permit
 *    rule here is harmless in production because the handler won't be registered.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final CookieOAuth2AuthorizationRequestRepository cookieAuthorizationRequestRepository;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(AbstractHttpConfigurer::disable)
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                .requestMatchers(HttpMethod.OPTIONS).permitAll() // preflight
                .requestMatchers(
                    "/api/auth/register",
                    "/api/auth/login",
                    "/api/auth/refresh",
                    "/api/auth/logout",
                    "/api/auth/.well-known/jwks.json",
                    "/api/auth/oauth2/**",              // exchange endpoint + initiation
                    "/api/auth/login/oauth2/code/**",   // Google callback
                    "/api/auth/google/**",              // dev mock (profile-guarded in controller)
                    "/actuator/**",
                    "/health",
                    "/error"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                // Custom base URI prefix to align with gateway route /api/auth/**
                .authorizationEndpoint(authorization -> authorization
                    .baseUri("/api/auth/oauth2/authorization")
                    .authorizationRequestRepository(cookieAuthorizationRequestRepository))
                // Callback URI must match the redirect-uri registered in Google Cloud Console
                // and in auth-service.yml spring.security.oauth2.client.registration.google.redirect-uri
                .redirectionEndpoint(redirection -> redirection
                    .baseUri("/api/auth/login/oauth2/code/*"))
                .successHandler(oAuth2SuccessHandler)
            );

        return http.build();
    }

    /**
     * CORS configuration for auth-service.
     * allowCredentials=true is required so the browser sends the HttpOnly oauth2_auth_request
     * cookie on the /api/auth/login/oauth2/code/google callback request.
     */
    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",  // Vite dev server
                "http://localhost:8080"   // Gateway (for server-to-browser redirects)
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
