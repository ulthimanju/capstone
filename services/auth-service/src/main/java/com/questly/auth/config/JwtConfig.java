package com.questly.auth.config;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import com.questly.auth.model.User;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.security.KeyFactory;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Configuration
public class JwtConfig {

    private static final String KEY_ID = "questly-auth-key-1";
    private static final String ISSUER = "questly-auth";
    private static final long ACCESS_TOKEN_EXPIRY_SECONDS = 900L;

    /**
     * PKCS#8 base64-encoded private key (no headers) from config server application.yml
     * property: auth.jwt.private-key
     */
    @Value("${auth.jwt.private-key}")
    private String privateKeyBase64;

    /**
     * PEM public key from config server gateway.yml
     * property: spring.security.oauth2.resourceserver.jwt.public-key-value
     */
    @Value("${spring.security.oauth2.resourceserver.jwt.public-key-value}")
    private String publicKeyPem;

    @Getter
    private RSAPrivateKey privateKey;

    @Getter
    private RSAPublicKey publicKey;

    @Bean
    public RSAPrivateKey privateKey() throws Exception {
        // Strip whitespace/newlines from the base64 string (PKCS#8 — no PEM headers)
        String cleaned = privateKeyBase64.replaceAll("\\s+", "");
        byte[] decoded = Base64.getDecoder().decode(cleaned);
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(decoded);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        this.privateKey = (RSAPrivateKey) kf.generatePrivate(keySpec);
        log.info("RSA private key loaded successfully");
        return this.privateKey;
    }

    @Bean
    public RSAPublicKey publicKey() throws Exception {
        // Strip PEM headers/footers and whitespace
        String cleaned = publicKeyPem
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s+", "");
        byte[] decoded = Base64.getDecoder().decode(cleaned);
        X509EncodedKeySpec keySpec = new X509EncodedKeySpec(decoded);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        this.publicKey = (RSAPublicKey) kf.generatePublic(keySpec);
        log.info("RSA public key loaded successfully");
        return this.publicKey;
    }

    @Bean
    public JWKSource<SecurityContext> jwkSource(RSAPublicKey publicKey, RSAPrivateKey privateKey) {
        RSAKey rsaKey = new RSAKey.Builder(publicKey)
                .privateKey(privateKey)
                .keyID(KEY_ID)
                .algorithm(JWSAlgorithm.RS256)
                .build();
        JWKSet jwkSet = new JWKSet(rsaKey);
        return new ImmutableJWKSet<>(jwkSet);
    }

    /**
     * Builds a signed RS256 JWT access token for the given user.
     */
    public String buildAccessToken(User user, RSAPrivateKey privateKey) {
        try {
            Instant now = Instant.now();
            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .subject(user.getId().toString())
                    .issuer(ISSUER)
                    .issueTime(Date.from(now))
                    .expirationTime(Date.from(now.plusSeconds(ACCESS_TOKEN_EXPIRY_SECONDS)))
                    .jwtID(UUID.randomUUID().toString())
                    .claim("email", user.getEmail())
                    .claim("role", user.getRole())
                    .build();

            JWSHeader header = new JWSHeader.Builder(JWSAlgorithm.RS256)
                    .keyID(KEY_ID)
                    .build();

            SignedJWT signedJWT = new SignedJWT(header, claims);
            JWSSigner signer = new RSASSASigner(privateKey);
            signedJWT.sign(signer);

            return signedJWT.serialize();
        } catch (Exception e) {
            throw new RuntimeException("Failed to build access token", e);
        }
    }
}
