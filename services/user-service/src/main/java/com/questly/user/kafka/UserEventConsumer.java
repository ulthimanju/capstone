package com.questly.user.kafka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.questly.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserEventConsumer {

    private final UserService userService;
    private final ObjectMapper objectMapper;

    /**
     * Consume learning completed events to update timezone-aware daily streaks.
     */
    @KafkaListener(
            topics = {"quiz.completed", "flashcard.reviewed", "module.completed", "practice.solved"},
            groupId = "user-streak-group"
    )
    public void consumeLearningEvent(String message) {
        log.info("Received streak trigger learning event: {}", message);
        try {
            JsonNode event = objectMapper.readTree(message);
            
            // Extract userId
            JsonNode userIdNode = event.get("userId");
            if (userIdNode == null || userIdNode.isNull()) {
                log.warn("Learning event is missing 'userId', skipping streak evaluation: {}", message);
                return;
            }
            UUID userId = UUID.fromString(userIdNode.asText());

            // Extract event timestamp, fallback to current time if missing
            Instant eventTimestamp = Instant.now();
            JsonNode timestampNode = event.get("timestamp");
            if (timestampNode != null && !timestampNode.isNull() && !timestampNode.asText().isBlank()) {
                try {
                    eventTimestamp = Instant.parse(timestampNode.asText());
                } catch (Exception e) {
                    log.warn("Failed to parse event timestamp '{}', falling back to current system time.", 
                            timestampNode.asText());
                }
            }

            userService.evaluateStreak(userId, eventTimestamp);

        } catch (Exception e) {
            log.error("Error processing learning event for streak: {}", e.getMessage(), e);
        }
    }

    /**
     * Consume xp.awarded events to increment student totals.
     */
    @KafkaListener(topics = "xp.awarded", groupId = "user-xp-group")
    public void consumeXpAwarded(String message) {
        log.info("Received xp.awarded event: {}", message);
        try {
            JsonNode event = objectMapper.readTree(message);
            
            JsonNode userIdNode = event.get("userId");
            JsonNode amountNode = event.get("amount");
            
            if (userIdNode == null || userIdNode.isNull() || amountNode == null || amountNode.isNull()) {
                log.warn("xp.awarded event missing required fields, skipping: {}", message);
                return;
            }

            UUID userId = UUID.fromString(userIdNode.asText());
            int amount = amountNode.asInt();

            userService.incrementXp(userId, amount);

        } catch (Exception e) {
            log.error("Error processing xp.awarded event: {}", e.getMessage(), e);
        }
    }
}
