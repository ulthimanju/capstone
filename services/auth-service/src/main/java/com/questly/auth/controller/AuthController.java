package com.questly.auth.controller;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import com.questly.auth.dto.*;
import com.questly.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JWKSource<SecurityContext> jwkSource;

    /**
     * Register a new user with email and password. Returns 201 Created.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Register request for email={}", request.getEmail());
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Login with email and password. Returns 200 OK.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login request for email={}", request.getEmail());
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Exchange a refresh token for a new access + refresh token pair (token rotation).
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody TokenRequest request) {
        AuthResponse response = authService.refresh(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    /**
     * Logout by invalidating the stored refresh token.
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody TokenRequest request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.noContent().build();
    }

    /**
     * JWKS endpoint — returns the RSA public key set so downstream services and
     * the gateway can verify JWT signatures without calling auth-service.
     */
    @GetMapping("/.well-known/jwks.json")
    public ResponseEntity<Map<String, Object>> jwks() throws Exception {
        JWKSet jwkSet = new JWKSet(jwkSource.get(null, null));
        return ResponseEntity.ok(jwkSet.toJSONObject());
    }

    /**
     * OAuth2 one-time code exchange.
     *
     * After a successful Google OAuth2 login the browser is redirected to the React SPA
     * with ?code=UUID. The SPA POSTs that code here to receive tokens safely in the
     * response body — tokens never appear in browser history or server access logs.
     */
    @PostMapping("/oauth2/exchange")
    public ResponseEntity<AuthResponse> exchangeCode(@Valid @RequestBody ExchangeRequest request) {
        log.info("OAuth2 exchange code redemption requested");
        AuthResponse response = authService.exchangeCode(request.getCode());
        return ResponseEntity.ok(response);
    }

    /**
     * Authenticated user profile endpoint.
     *
     * The Gateway validates the JWT and injects X-User-Id and X-User-Role headers.
     * The SPA calls this after any login flow to obtain server-verified identity claims
     * rather than parsing the JWT client-side (which would trust unverified data).
     *
     * Requires a valid Bearer token in the Authorization header (enforced by Gateway).
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> me(
            @RequestHeader("X-User-Id")   String userId,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader(value = "X-User-Email", required = false) String email) {
        return ResponseEntity.ok(Map.of(
                "userId", userId,
                "role",   role,
                "email",  email != null ? email : ""
        ));
    }

    /**
     * Dev-only Google mock login — bypasses the real OAuth2 flow.
     * Guarded by @Profile("dev") so it is NEVER available in production builds.
     */
    @Profile("dev")
    @PostMapping("/google/mock")
    public ResponseEntity<AuthResponse> googleMock(@Valid @RequestBody GoogleMockRequest request) {
        log.info("Google mock login for email={}", request.getEmail());
        AuthResponse response = authService.googleMockLogin(request);
        return ResponseEntity.ok(response);
    }

    // ---- Exception handlers ----

    @ExceptionHandler(AuthService.EmailAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleEmailExists(AuthService.EmailAlreadyExistsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(AuthService.InvalidCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleInvalidCredentials(AuthService.InvalidCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(AuthService.InvalidTokenException.class)
    public ResponseEntity<Map<String, String>> handleInvalidToken(AuthService.InvalidTokenException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", ex.getMessage()));
    }
}
