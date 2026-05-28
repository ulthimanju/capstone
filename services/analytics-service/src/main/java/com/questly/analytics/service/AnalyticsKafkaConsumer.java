package com.questly.analytics.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.questly.analytics.model.ActivityEvent;
import com.questly.analytics.model.DailySummary;
import com.questly.analytics.repository.ActivityEventRepository;
import com.questly.analytics.repository.DailySummaryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class AnalyticsKafkaConsumer {

    private final ActivityEventRepository activityEventRepository;
    private final DailySummaryRepository dailySummaryRepository;
    private final ObjectMapper objectMapper;

    /**
     * Consume learning completion events to run background study aggregation engine.
     */
    @KafkaListener(
            topics = {"quiz.completed", "flashcard.reviewed", "module.completed", "practice.solved", "challenge.completed"},
            groupId = "analytics-service-group"
    )
    @Transactional
    public void consumeAnalyticsEvents(String message, @org.springframework.messaging.handler.annotation.Header(org.springframework.kafka.support.KafkaHeaders.RECEIVED_TOPIC) String topic) {
        log.info("Received analytics event on topic '{}': {}", topic, message);
        try {
            JsonNode event = objectMapper.readTree(message);

            // 1. Core Parsing
            UUID userId = null;
            if (event.has("userId") && !event.get("userId").isNull()) {
                userId = UUID.fromString(event.get("userId").asText());
            } else if (event.has("challengerId") && !event.get("challengerId").isNull()) {
                // If it is challenge.completed, log duel stats for challenger
                userId = UUID.fromString(event.get("challengerId").asText());
            } else {
                log.warn("Analytics event missing userId, skipping: {}", message);
                return;
            }

            // Extract Timestamp or construct date
            Instant timestamp = Instant.now();
            if (event.has("timestamp") && !event.get("timestamp").isNull() && !event.get("timestamp").asText().isBlank()) {
                try {
                    timestamp = Instant.parse(event.get("timestamp").asText());
                } catch (Exception ignored) {}
            }
            LocalDate eventDate = timestamp.atZone(ZoneId.of("UTC")).toLocalDate();

            UUID refId = null;
            if (event.has("quizId") && !event.get("quizId").isNull()) {
                refId = UUID.fromString(event.get("quizId").asText());
            } else if (event.has("flashcardId") && !event.get("flashcardId").isNull()) {
                refId = UUID.fromString(event.get("flashcardId").asText());
            } else if (event.has("moduleId") && !event.get("moduleId").isNull()) {
                refId = UUID.fromString(event.get("moduleId").asText());
            } else if (event.has("itemId") && !event.get("itemId").isNull()) {
                refId = UUID.fromString(event.get("itemId").asText());
            } else if (event.has("challengeId") && !event.get("challengeId").isNull()) {
                refId = UUID.fromString(event.get("challengeId").asText());
            }

            // Save immutable ActivityEvent
            ActivityEvent.ActivityEventBuilder eventBuilder = ActivityEvent.builder()
                    .userId(userId)
                    .eventType(topic.replace(".", "_").toUpperCase())
                    .refId(refId);

            // Fetch or create DailySummary
            DailySummary summary = dailySummaryRepository.findByUserIdAndDate(userId, eventDate)
                    .orElseGet(() -> DailySummary.builder()
                            .userId(event.get("userId") != null ? UUID.fromString(event.get("userId").asText()) : UUID.fromString(event.get("challengerId").asText()))
                            .date(eventDate)
                            .xpEarned(0)
                            .quizzesTaken(0)
                            .cardsReviewed(0)
                            .problemsSolved(0)
                            .studyTimeS(0)
                            .build());

            // 2. Branch-specific calculations
            if ("quiz.completed".equalsIgnoreCase(topic)) {
                double scoreDouble = event.get("score").asDouble();
                BigDecimal score = BigDecimal.valueOf(scoreDouble);
                
                int duration = 120; // Default 2 minutes
                if (event.has("durationS") && !event.get("durationS").isNull()) {
                    duration = event.get("durationS").asInt();
                } else if (event.has("duration_s") && !event.get("duration_s").isNull()) {
                    duration = event.get("duration_s").asInt();
                }

                eventBuilder.score(score).durationS(duration);
                if (event.has("wrongTopics") && event.get("wrongTopics").isArray() && event.get("wrongTopics").size() > 0) {
                    eventBuilder.topic(event.get("wrongTopics").get(0).asText());
                }

                // Update summary
                int totalQuizzes = summary.getQuizzesTaken();
                BigDecimal currentAvg = summary.getAvgScore();
                if (currentAvg == null) {
                    summary.setAvgScore(score);
                } else {
                    BigDecimal totalScore = currentAvg.multiply(BigDecimal.valueOf(totalQuizzes)).add(score);
                    summary.setAvgScore(totalScore.divide(BigDecimal.valueOf(totalQuizzes + 1), 2, RoundingMode.HALF_UP));
                }
                summary.setQuizzesTaken(totalQuizzes + 1);
                summary.setStudyTimeS(summary.getStudyTimeS() + duration);
                
                // Tiered XP mapping
                int quizXp = (scoreDouble >= 80.0) ? 50 : (scoreDouble >= 50.0) ? 30 : 0;
                summary.setXpEarned(summary.getXpEarned() + quizXp);

            } else if ("flashcard.reviewed".equalsIgnoreCase(topic)) {
                int rating = event.get("rating").asInt();
                int duration = 30; // default 30s per flashcard
                eventBuilder.durationS(duration);

                summary.setCardsReviewed(summary.getCardsReviewed() + 1);
                summary.setStudyTimeS(summary.getStudyTimeS() + duration);
                if (rating >= 4) {
                    summary.setXpEarned(summary.getXpEarned() + 10);
                }

            } else if ("module.completed".equalsIgnoreCase(topic)) {
                summary.setXpEarned(summary.getXpEarned() + 100);

            } else if ("practice.solved".equalsIgnoreCase(topic)) {
                summary.setProblemsSolved(summary.getProblemsSolved() + 1);
                summary.setXpEarned(summary.getXpEarned() + 40);

            } else if ("challenge.completed".equalsIgnoreCase(topic)) {
                // Duel battle completed, log duel results in database for challenger
                eventBuilder.topic("Timed Quiz Duel");
                
                UUID winnerId = UUID.fromString(event.get("winnerId").asText());
                if (userId.equals(winnerId)) {
                    summary.setXpEarned(summary.getXpEarned() + 150); // Winner +150 XP
                }
            }

            activityEventRepository.save(eventBuilder.build());
            dailySummaryRepository.save(summary);

            log.info("Saved activity event and successfully upserted DailySummary: {}", summary);

        } catch (Exception e) {
            log.error("Failed to process event on topic '{}' in analytics consumer: {}", topic, e.getMessage(), e);
        }
    }
}
