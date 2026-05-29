package com.questly.user.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.questly.user.event.UserRegisteredEvent;
import com.questly.user.model.UserProfile;
import com.questly.user.model.UserStats;
import com.questly.user.repository.UserProfileRepository;
import com.questly.user.repository.UserStatsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserRegisteredConsumer {

    private final UserProfileRepository userProfileRepository;
    private final UserStatsRepository userStatsRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "user.registered", groupId = "user-service-group")
    @Transactional
    public void onUserRegistered(String message) {
        log.info("Received user.registered event: {}", message);
        try {
            UserRegisteredEvent event = objectMapper.readValue(message, UserRegisteredEvent.class);
            log.info("Processing parsed user.registered event for userId={}", event.getUserId());

            // Idempotent: only create if not already existing
            if (!userProfileRepository.existsById(event.getUserId())) {
                UserProfile profile = UserProfile.builder()
                        .id(event.getUserId())
                        .email(event.getEmail())
                        .displayName(event.getDisplayName())
                        .role(event.getRole() != null ? event.getRole() : "STUDENT")
                        .build();
                userProfileRepository.save(profile);
                log.info("UserProfile created for userId={}", event.getUserId());
            } else {
                log.info("UserProfile already exists for userId={}, skipping", event.getUserId());
            }

            if (!userStatsRepository.existsById(event.getUserId())) {
                UserStats stats = UserStats.builder()
                        .userId(event.getUserId())
                        .xp(0)
                        .streak(0)
                        .build();
                userStatsRepository.save(stats);
                log.info("UserStats created for userId={}", event.getUserId());
            } else {
                log.info("UserStats already exists for userId={}, skipping", event.getUserId());
            }
        } catch (Exception e) {
            log.error("Failed to parse or process user.registered event: {}", e.getMessage(), e);
        }
    }
}
