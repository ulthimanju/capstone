package com.questly.auth.kafka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.questly.auth.model.User;
import com.questly.auth.repository.RefreshTokenRepository;
import com.questly.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserEventConsumer {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "user.role-updated", groupId = "auth-service-sync")
    @Transactional
    public void consumeRoleUpdated(String message) {
        log.info("Received user.role-updated event: {}", message);
        try {
            JsonNode event = objectMapper.readTree(message);
            UUID userId = UUID.fromString(event.get("userId").asText());
            String role = event.get("role").asText();

            userRepository.findById(userId).ifPresentOrElse(user -> {
                user.setRole(role);
                userRepository.save(user);
                log.info("Synchronized user role to {} for userId={}", role, userId);
            }, () -> {
                log.warn("User not found for role sync: userId={}", userId);
            });

            // Revoke active sessions
            refreshTokenRepository.deleteByUserId(userId);
            log.info("Revoked active refresh tokens for updated user: userId={}", userId);
        } catch (Exception e) {
            log.error("Failed to synchronize user role update: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "user.suspended", groupId = "auth-service-sync")
    @Transactional
    public void consumeUserSuspended(String message) {
        log.info("Received user.suspended event: {}", message);
        try {
            JsonNode event = objectMapper.readTree(message);
            UUID userId = UUID.fromString(event.get("userId").asText());

            userRepository.findById(userId).ifPresentOrElse(user -> {
                userRepository.delete(user);
                log.info("Deleted suspended user from auth credentials: userId={}", userId);
            }, () -> {
                log.warn("User not found for suspension sync: userId={}", userId);
            });

            // Revoke active sessions
            refreshTokenRepository.deleteByUserId(userId);
            log.info("Revoked active refresh tokens for suspended user: userId={}", userId);
        } catch (Exception e) {
            log.error("Failed to synchronize user suspension: {}", e.getMessage(), e);
        }
    }
}
