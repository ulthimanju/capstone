package com.questly.auth.service;

import com.questly.auth.config.JwtConfig;
import com.questly.auth.dto.*;
import com.questly.auth.event.UserRegisteredEvent;
import com.questly.auth.kafka.UserEventProducer;
import com.questly.auth.model.RefreshToken;
import com.questly.auth.model.User;
import com.questly.auth.repository.RefreshTokenRepository;
import com.questly.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.interfaces.RSAPrivateKey;
import java.time.OffsetDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final long ACCESS_TOKEN_EXPIRY_SECONDS = 900L;
    private static final long REFRESH_TOKEN_EXPIRY_DAYS = 7L;

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtConfig jwtConfig;
    private final RSAPrivateKey privateKey;
    private final UserEventProducer userEventProducer;

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
     * Logout by deleting the refresh token.
     */
    @Transactional
    public void logout(String rawRefreshToken) {
        refreshTokenRepository.findByToken(rawRefreshToken)
                .ifPresent(refreshTokenRepository::delete);
        log.info("Refresh token deleted for logout");
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
