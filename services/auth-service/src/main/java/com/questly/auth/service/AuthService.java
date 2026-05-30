package com.questly.auth.service;

import com.questly.auth.config.JwtConfig;
import com.questly.auth.dto.*;
import com.questly.auth.event.UserRegisteredEvent;
import com.questly.auth.kafka.UserEventProducer;
import com.questly.auth.model.OAuth2ExchangeCode;
import com.questly.auth.model.RefreshToken;
import com.questly.auth.model.User;
import com.questly.auth.repository.OAuth2ExchangeCodeRepository;
import com.questly.auth.repository.RefreshTokenRepository;
import com.questly.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.nimbusds.jwt.SignedJWT;

import java.security.interfaces.RSAPrivateKey;
import java.time.OffsetDateTime;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final long ACCESS_TOKEN_EXPIRY_SECONDS = 900L;
    private static final long REFRESH_TOKEN_EXPIRY_DAYS = 7L;

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OAuth2ExchangeCodeRepository exchangeCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtConfig jwtConfig;
    private final RSAPrivateKey privateKey;
    private final UserEventProducer userEventProducer;

    @Autowired(required = false)
    private StringRedisTemplate stringRedisTemplate;

    /**
     * Register a new local user account.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getDisplayName())
                .role("STUDENT")
                .build();

        user = userRepository.save(user);
        log.info("New user registered: id={}, email={}", user.getId(), user.getEmail());

        // Publish Kafka event
        publishRegistrationEvent(user);

        String accessToken = generateAccessToken(user);
        String refreshToken = generateRefreshToken(user);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    /**
     * Login with email and password.
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (user.getPasswordHash() == null ||
                !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        log.info("User logged in: id={}, email={}", user.getId(), user.getEmail());
        String accessToken = generateAccessToken(user);
        String refreshToken = generateRefreshToken(user);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    /**
     * Refresh access token using a valid refresh token.
     */
    @Transactional
    public AuthResponse refresh(String rawRefreshToken) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(rawRefreshToken)
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired refresh token"));

        if (storedToken.getExpiryDate().isBefore(OffsetDateTime.now())) {
            refreshTokenRepository.delete(storedToken);
            throw new InvalidTokenException("Refresh token has expired");
        }

        User user = userRepository.findById(storedToken.getUserId())
                .orElseThrow(() -> new InvalidTokenException("User not found for refresh token"));

        // Delete old refresh token and issue new one
        refreshTokenRepository.delete(storedToken);

        String accessToken = generateAccessToken(user);
        String newRefreshToken = generateRefreshToken(user);

        return buildAuthResponse(user, accessToken, newRefreshToken);
    }

    /**
     * Logout by deleting the refresh token, blacklisting the access token, and optionally revoking all user sessions globally.
     */
    @Transactional
    public void logout(String rawRefreshToken, boolean global, String authHeader) {
        UUID userId = null;
        String jti = null;
        long ttlSeconds = 0;

        // Parse and validate current access token from Authorization header if present
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String accessToken = authHeader.substring(7);
                SignedJWT signedJWT = SignedJWT.parse(accessToken);
                String sub = signedJWT.getJWTClaimsSet().getSubject();
                if (sub != null) {
                    userId = UUID.fromString(sub);
                }
                jti = signedJWT.getJWTClaimsSet().getJWTID();
                Date expiry = signedJWT.getJWTClaimsSet().getExpirationTime();
                if (expiry != null) {
                    ttlSeconds = (expiry.getTime() - System.currentTimeMillis()) / 1000;
                }
            } catch (Exception e) {
                log.warn("Failed to parse access token during logout", e);
            }
        }

        // Revoke the specific refresh token
        if (rawRefreshToken != null) {
            Optional<RefreshToken> storedTokenOpt = refreshTokenRepository.findByToken(rawRefreshToken);
            if (storedTokenOpt.isPresent()) {
                RefreshToken storedToken = storedTokenOpt.get();
                userId = storedToken.getUserId(); // Fallback if access token wasn't provided or parsed
                log.info("User id={} initiated logout, invalidating refresh token", userId);
                refreshTokenRepository.delete(storedToken);
            } else {
                log.info("Logout requested for non-existent or already deleted refresh token");
            }
        }

        // Global logout: revoke all active sessions for the user
        if (global && userId != null) {
            refreshTokenRepository.deleteByUserId(userId);
            log.info("Global logout completed: all refresh tokens deleted for user id={}", userId);
        }

        // Blacklist current access token in Redis
        if (jti != null && ttlSeconds > 0) {
            if (stringRedisTemplate != null) {
                try {
                    String blacklistKey = "blacklist:jwt:" + jti;
                    stringRedisTemplate.opsForValue().set(blacklistKey, "blacklisted", java.time.Duration.ofSeconds(ttlSeconds));
                    log.info("Access token JTI={} successfully blacklisted in Redis for {} seconds", jti, ttlSeconds);
                } catch (Exception e) {
                    log.error("Redis error while storing blacklisted JTI={}; fail-open", jti, e);
                }
            } else {
                log.warn("StringRedisTemplate is unavailable; skipping JTI={} blacklist storage", jti);
            }
        }
    }

    /**
     * Google Mock login — for dev only. Find or create a user by email with googleId.
     */
    @Transactional
    public AuthResponse googleMockLogin(GoogleMockRequest request) {
        boolean isNewUser = false;

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            // Create a new Google user
            user = User.builder()
                    .email(request.getEmail())
                    .displayName(request.getDisplayName())
                    .role("STUDENT")
                    .googleId("mock-google-" + UUID.randomUUID())
                    .build();
            user = userRepository.save(user);
            isNewUser = true;
            log.info("New Google mock user created: id={}, email={}", user.getId(), user.getEmail());
        } else {
            log.info("Existing user logged in via Google mock: id={}", user.getId());
        }

        if (isNewUser) {
            publishRegistrationEvent(user);
        }

        String accessToken = generateAccessToken(user);
        String refreshToken = generateRefreshToken(user);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    /**
     * Find or create a local user account for a Google OAuth2 login.
     *
     * Look-up priority:
     *  1. By googleId (covers returning Google users).
     *  2. By email (covers accounts originally registered locally — links the googleId).
     *  3. New registration (first-time Google sign-in).
     *
     * password_hash is intentionally left null for federated accounts.
     */
    @Transactional
    public AuthResponse oauth2LoginOrRegister(String email, String displayName, String googleId) {
        boolean isNewUser = false;

        User user = userRepository.findByGoogleId(googleId)
                .orElseGet(() -> userRepository.findByEmail(email).orElse(null));

        if (user == null) {
            // Brand-new Google user — no local account exists
            user = User.builder()
                    .email(email)
                    .displayName(displayName)
                    .role("STUDENT")
                    .googleId(googleId)
                    .build();
            user = userRepository.save(user);
            isNewUser = true;
            log.info("New Google OAuth2 user created: id={}, email={}", user.getId(), user.getEmail());
        } else {
            // Existing user — backfill googleId if they previously registered locally
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
                user = userRepository.save(user);
                log.info("Linked googleId to existing local account: id={}", user.getId());
            } else {
                log.info("Returning Google OAuth2 user resolved: id={}", user.getId());
            }
        }

        if (isNewUser) {
            publishRegistrationEvent(user);
        }

        String accessToken  = generateAccessToken(user);
        String refreshToken = generateRefreshToken(user);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    /**
     * Redeem a one-time OAuth2 exchange code.
     *
     * The code must exist, be unexpired, and is deleted immediately on first use
     * (single-use enforcement). This prevents replay attacks.
     */
    @Transactional
    public AuthResponse exchangeCode(String code) {
        OAuth2ExchangeCode entity = exchangeCodeRepository.findById(code)
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired exchange code"));

        if (entity.getExpiryDate().isBefore(OffsetDateTime.now())) {
            exchangeCodeRepository.delete(entity);
            throw new InvalidTokenException("Exchange code has expired");
        }

        // Consume immediately — single-use
        exchangeCodeRepository.delete(entity);

        User user = userRepository.findById(entity.getUserId())
                .orElseThrow(() -> new InvalidTokenException("User not found for exchange code"));

        log.info("OAuth2 exchange code redeemed for userId={}", user.getId());

        return AuthResponse.builder()
                .accessToken(entity.getAccessToken())
                .refreshToken(entity.getRefreshToken())
                .expiresIn(ACCESS_TOKEN_EXPIRY_SECONDS)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    // ---- Private helpers ----

    private String generateAccessToken(User user) {
        return jwtConfig.buildAccessToken(user, privateKey);
    }

    private String generateRefreshToken(User user) {
        String tokenValue = UUID.randomUUID().toString() + "." + UUID.randomUUID().toString();
        OffsetDateTime expiry = OffsetDateTime.now().plusDays(REFRESH_TOKEN_EXPIRY_DAYS);

        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenValue)
                .userId(user.getId())
                .expiryDate(expiry)
                .build();

        refreshTokenRepository.save(refreshToken);
        return tokenValue;
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(ACCESS_TOKEN_EXPIRY_SECONDS)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    private void publishRegistrationEvent(User user) {
        UserRegisteredEvent event = UserRegisteredEvent.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .role(user.getRole())
                .build();
        userEventProducer.publishUserRegistered(event);
    }

    // ---- Custom exceptions ----

    public static class EmailAlreadyExistsException extends RuntimeException {
        public EmailAlreadyExistsException(String message) {
            super(message);
        }
    }

    public static class InvalidCredentialsException extends RuntimeException {
        public InvalidCredentialsException(String message) {
            super(message);
        }
    }

    public static class InvalidTokenException extends RuntimeException {
        public InvalidTokenException(String message) {
            super(message);
        }
    }
}
