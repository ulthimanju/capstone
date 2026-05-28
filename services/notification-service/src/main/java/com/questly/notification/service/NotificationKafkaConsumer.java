package com.questly.notification.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.questly.notification.model.Notification;
import com.questly.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationKafkaConsumer {

    private final NotificationRepository notificationRepository;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Consume welcome registered notification.
     */
    @KafkaListener(topics = "user.registered", groupId = "notification-user-group")
    public void consumeUserRegistered(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            UUID userId = UUID.fromString(event.get("userId").asText());
            String email = event.get("email").asText();

            saveAndPublishNotification(
                    userId,
                    "Welcome to Questly! 🚀",
                    "We are thrilled to have you! Let's start learning by uploading some study documents.",
                    "WELCOME",
                    null
            );
        } catch (Exception e) {
            log.error("Failed to process user.registered in notification consumer: {}", e.getMessage());
        }
    }

    /**
     * Consume assignment grading events.
     */
    @KafkaListener(topics = "assignment.graded", groupId = "notification-assignment-group")
    public void consumeAssignmentGraded(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            UUID userId = UUID.fromString(event.get("userId").asText());
            UUID submissionId = UUID.fromString(event.get("submissionId").asText());
            double grade = event.get("grade").asDouble();

            saveAndPublishNotification(
                    userId,
                    "Assignment Graded! 📝",
                    "Your assignment has been graded. Score: " + grade + "%. Click to see feedback.",
                    "ASSIGNMENT_GRADED",
                    submissionId
            );
        } catch (Exception e) {
            log.error("Failed to process assignment.graded in notification consumer: {}", e.getMessage());
        }
    }

    /**
     * Consume badge earned events.
     */
    @KafkaListener(topics = "badge.earned", groupId = "notification-badge-group")
    public void consumeBadgeEarned(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            UUID userId = UUID.fromString(event.get("userId").asText());
            UUID badgeId = UUID.fromString(event.get("badgeId").asText());
            String badgeName = event.get("badgeName").asText();

            saveAndPublishNotification(
                    userId,
                    "New Badge Earned! 🏆",
                    "Congratulations! You unlocked the '" + badgeName + "' badge. Keep it up!",
                    "BADGE_EARNED",
                    badgeId
            );
        } catch (Exception e) {
            log.error("Failed to process badge.earned in notification consumer: {}", e.getMessage());
        }
    }

    /**
     * Consume general dispatched alerts (skill tree unlockings, failed PDFs, etc.).
     */
    @KafkaListener(topics = "notification.dispatch", groupId = "notification-dispatch-group")
    public void consumeNotificationDispatch(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            UUID userId = UUID.fromString(event.get("userId").asText());
            String title = event.get("title").asText();
            String body = event.get("body").asText();
            String type = event.get("type").asText();
            
            UUID refId = null;
            if (event.has("refId") && !event.get("refId").isNull()) {
                refId = UUID.fromString(event.get("refId").asText());
            }

            saveAndPublishNotification(userId, title, body, type, refId);
        } catch (Exception e) {
            log.error("Failed to process notification.dispatch in notification consumer: {}", e.getMessage());
        }
    }

    /**
     * Consume XP awarded updates to trigger threshold alerts.
     */
    @KafkaListener(topics = "xp.awarded", groupId = "notification-xp-group")
    public void consumeXpAwarded(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            UUID userId = UUID.fromString(event.get("userId").asText());
            int amount = event.get("amount").asInt();
            String reason = event.get("reason").asText();

            // Notify user directly
            saveAndPublishNotification(
                    userId,
                    "+" + amount + " XP Earned! ⚡",
                    "You earned " + amount + " XP for: " + reason,
                    "XP_AWARDED",
                    null
            );
        } catch (Exception e) {
            log.error("Failed to process xp.awarded in notification consumer: {}", e.getMessage());
        }
    }

    /**
     * Consume Challenge and Duel topics, executing exact target recipient routing.
     */
    @KafkaListener(
            topics = {"challenge.accepted", "challenge.rejected", "challenge.completed"},
            groupId = "notification-challenge-group"
    )
    public void consumeChallengeEvents(String message, @org.springframework.messaging.handler.annotation.Header(org.springframework.kafka.support.KafkaHeaders.RECEIVED_TOPIC) String topic) {
        log.info("Received challenge event on topic '{}': {}", topic, message);
        try {
            JsonNode event = objectMapper.readTree(message);
            UUID challengeId = UUID.fromString(event.get("challengeId").asText());
            UUID challengerId = UUID.fromString(event.get("challengerId").asText());
            UUID opponentId = UUID.fromString(event.get("opponentId").asText());

            if ("challenge.accepted".equalsIgnoreCase(topic)) {
                // Target recipient: Challenger (opponent accepts challenge)
                saveAndPublishNotification(
                        challengerId,
                        "Challenge Accepted! ⚔️",
                        "Your opponent accepted the challenge. The battle is active!",
                        "CHALLENGE_ACCEPTED",
                        challengeId
                );
            } else if ("challenge.rejected".equalsIgnoreCase(topic)) {
                // Target recipient: Challenger (opponent declined challenge)
                saveAndPublishNotification(
                        challengerId,
                        "Challenge Declined 🛡️",
                        "Your opponent declined the duel invitation.",
                        "CHALLENGE_REJECTED",
                        challengeId
                );
            } else if ("challenge.completed".equalsIgnoreCase(topic)) {
                // Target recipient: BOTH participants
                UUID winnerId = UUID.fromString(event.get("winnerId").asText());
                
                // 1. Notify Challenger
                boolean challengerWon = challengerId.equals(winnerId);
                saveAndPublishNotification(
                        challengerId,
                        challengerWon ? "Victory! 👑" : "Defeat 💀",
                        challengerWon ? "Congratulations! You won the quiz battle duel." : "You lost the duel. Better luck next time!",
                        "CHALLENGE_COMPLETED",
                        challengeId
                );

                // 2. Notify Opponent
                boolean opponentWon = opponentId.equals(winnerId);
                saveAndPublishNotification(
                        opponentId,
                        opponentWon ? "Victory! 👑" : "Defeat 💀",
                        opponentWon ? "Congratulations! You won the quiz battle duel." : "You lost the duel. Better luck next time!",
                        "CHALLENGE_COMPLETED",
                        challengeId
                );
            }
        } catch (Exception e) {
            log.error("Failed to process challenge event in notification consumer: {}", e.getMessage(), e);
        }
    }

    /**
     * Standard helper to save notification in PG and push dynamically to Redis PubSub.
     */
    private void saveAndPublishNotification(UUID userId, String title, String body, String type, UUID refId) {
        Notification notif = Notification.builder()
                .userId(userId)
                .title(title)
                .body(body)
                .type(type)
                .refId(refId)
                .isRead(false)
                .build();

        notificationRepository.save(notif);
        log.info("Saved notification ID {} in PG db_notification for user {}", notif.getId(), userId);

        // Publish to Redis PubSub channel user:notifications:{userId}
        try {
            String redisChannel = "user:notifications:" + userId;
            String jsonPayload = objectMapper.writeValueAsString(notif);
            redisTemplate.convertAndSend(redisChannel, jsonPayload);
            log.info("Published notification JSON to Redis channel: {}", redisChannel);
        } catch (Exception e) {
            log.error("Failed to publish notification JSON to Redis PubSub: {}", e.getMessage());
        }
    }
}
