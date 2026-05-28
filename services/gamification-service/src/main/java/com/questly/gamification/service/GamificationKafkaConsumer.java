package com.questly.gamification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.questly.gamification.event.*;
import com.questly.gamification.model.Challenge;
import com.questly.gamification.repository.ChallengeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class GamificationKafkaConsumer {

    private final GamificationService gamificationService;
    private final ChallengeRepository challengeRepository;
    private final ObjectMapper objectMapper;

    // Thread-safe in-memory cache to correlate duel scores before committing to PG
    private static final Map<UUID, DuelState> activeDuels = new ConcurrentHashMap<>();

    @RequiredArgsConstructor
    private static class DuelState {
        final BigDecimal challengerScore;
        final BigDecimal opponentScore;
    }

    /**
     * Consume Quiz Completed events for XP awards, skill tree mastery, and duel resolution.
     */
    @KafkaListener(topics = "quiz.completed", groupId = "gamification-quiz-group")
    public void consumeQuizCompleted(String message) {
        log.info("Received quiz.completed message: {}", message);
        try {
            QuizCompletedEvent event = objectMapper.readValue(message, QuizCompletedEvent.class);
            UUID userId = event.getUserId();
            BigDecimal score = event.getScore();
            UUID challengeId = event.getChallengeId();

            // 1. Regular XP and Skill Tree Unlock Flow (Normal path)
            int xpAmount = 0;
            if (score.compareTo(BigDecimal.valueOf(80)) >= 0) {
                xpAmount = 50;
            } else if (score.compareTo(BigDecimal.valueOf(50)) >= 0) {
                xpAmount = 30;
            }

            if (xpAmount > 0) {
                gamificationService.awardXp(userId, xpAmount, "QUIZ_COMPLETED", event.getQuizId());
            }

            // Progress skill tree node if they got a perfect score (>= 80%) on matching topics
            if (score.compareTo(BigDecimal.valueOf(80)) >= 0 && event.getWrongTopics() != null) {
                // If they completed a quiz with good score, complete matching skill tree nodes
                // e.g. for general programming topics
                gamificationService.completeSkillNodeByLabelMatch(userId, "Basic Programming");
            }

            // 2. Duel Resolution Gating (Conditional path correlation)
            if (challengeId != null) {
                resolveDuelScore(userId, challengeId, score);
            }

        } catch (Exception e) {
            log.error("Error processing quiz.completed event: {}", e.getMessage(), e);
        }
    }

    /**
     * Correlate duel scores and declare the winner under optimistic lock concurrency.
     */
    private void resolveDuelScore(UUID userId, UUID challengeId, BigDecimal score) {
        log.info("Processing duel score for user {} in challenge {}", userId, challengeId);
        
        // Optimistic locking retry loop (up to 3 attempts)
        int attempts = 0;
        while (attempts < 3) {
            try {
                Challenge challenge = challengeRepository.findById(challengeId).orElse(null);
                if (challenge == null || !"ACTIVE".equalsIgnoreCase(challenge.getStatus())) {
                    log.warn("Challenge {} not active or not found. Skipping duel scoring.", challengeId);
                    return;
                }

                boolean isChallenger = challenge.getChallengerId().equals(userId);
                boolean isOpponent = challenge.getOpponentId().equals(userId);

                if (!isChallenger && !isOpponent) {
                    log.warn("User {} is not part of challenge {}.", userId, challengeId);
                    return;
                }

                DuelState state = activeDuels.get(challengeId);
                if (state == null) {
                    // First submission
                    if (isChallenger) {
                        activeDuels.put(challengeId, new DuelState(score, null));
                    } else {
                        activeDuels.put(challengeId, new DuelState(null, score));
                    }
                    log.info("Recorded first submission for duel {} by user {}: score={}", challengeId, userId, score);
                    return;
                } else {
                    // Second submission
                    BigDecimal challengerScore = isChallenger ? score : state.challengerScore;
                    BigDecimal opponentScore = isOpponent ? score : state.opponentScore;

                    if (challengerScore == null || opponentScore == null) {
                        // DuelState correlation guard
                        if (isChallenger) {
                            activeDuels.put(challengeId, new DuelState(score, state.opponentScore));
                        } else {
                            activeDuels.put(challengeId, new DuelState(state.challengerScore, score));
                        }
                        log.info("Recorded submission for duel {} by user {}: score={}", challengeId, userId, score);
                        return;
                    }

                    // Both scores are now present! Declare winner
                    UUID winnerId;
                    if (challengerScore.compareTo(opponentScore) > 0) {
                        winnerId = challenge.getChallengerId();
                    } else if (opponentScore.compareTo(challengerScore) > 0) {
                        winnerId = challenge.getOpponentId();
                    } else {
                        // Tie-breaker rule (fallback: challenger wins in v1 since duration is not in event)
                        winnerId = challenge.getChallengerId();
                    }

                    challenge.setWinnerId(winnerId);
                    challenge.setStatus("COMPLETED");
                    challengeRepository.save(challenge);

                    log.info("Duel {} completed! Winner: {}", challengeId, winnerId);

                    // Clean cache
                    activeDuels.remove(challengeId);

                    // Publish challenge.completed event
                    gamificationService.publishChallengeCompletedEvent(challengeId, 
                            challenge.getChallengerId(), 
                            challenge.getOpponentId(), 
                            winnerId);
                    return;
                }
            } catch (ObjectOptimisticLockingFailureException e) {
                attempts++;
                log.warn("Optimistic locking failure during challenge resolution (attempt {}/3). Retrying...", attempts);
                try { Thread.sleep(200); } catch (InterruptedException ignored) {}
            }
        }
        log.error("Failed to resolve challenge {} after 3 attempts due to concurrency locking.", challengeId);
    }

    /**
     * Consume Flashcard Reviewed events to award XP.
     */
    @KafkaListener(topics = "flashcard.reviewed", groupId = "gamification-flashcard-group")
    public void consumeFlashcardReviewed(String message) {
        try {
            FlashcardReviewedEvent event = objectMapper.readValue(message, FlashcardReviewedEvent.class);
            if (event.getRating() >= 4) {
                gamificationService.awardXp(event.getUserId(), 10, "FLASHCARD_REVIEWED", event.getFlashcardId());
            }
        } catch (Exception e) {
            log.error("Error processing flashcard.reviewed event: {}", e.getMessage());
        }
    }

    /**
     * Consume Module Completed events to award XP and unlock Skill tree nodes.
     */
    @KafkaListener(topics = "module.completed", groupId = "gamification-course-group")
    public void consumeModuleCompleted(String message) {
        try {
            ModuleCompletedEvent event = objectMapper.readValue(message, ModuleCompletedEvent.class);
            gamificationService.awardXp(event.getUserId(), 100, "MODULE_COMPLETED", event.getModuleId());
            
            // Advance/Unlock Skill Tree DAG node
            gamificationService.completeSkillNodeByLabelMatch(event.getUserId(), "Data Structures");
        } catch (Exception e) {
            log.error("Error processing module.completed event: {}", e.getMessage());
        }
    }

    /**
     * Consume Practice Solved events to award XP.
     */
    @KafkaListener(topics = "practice.solved", groupId = "gamification-practice-group")
    public void consumePracticeSolved(String message) {
        try {
            PracticeSolvedEvent event = objectMapper.readValue(message, PracticeSolvedEvent.class);
            gamificationService.awardXp(event.getUserId(), 40, "PRACTICE_SOLVED", event.getItemId());
        } catch (Exception e) {
            log.error("Error processing practice.solved event: {}", e.getMessage());
        }
    }

    /**
     * Self-Consumption of Challenge Completed topic to award winner XP (+150 XP).
     */
    @KafkaListener(topics = "challenge.completed", groupId = "gamification-self-group")
    public void consumeChallengeCompleted(String message) {
        try {
            ChallengeCompletedEvent event = objectMapper.readValue(message, ChallengeCompletedEvent.class);
            log.info("Self-consuming challenge.completed: awarding XP to winner {}", event.getWinnerId());
            gamificationService.awardXp(event.getWinnerId(), 150, "CHALLENGE_WON", event.getChallengeId());
        } catch (Exception e) {
            log.error("Error self-consuming challenge.completed event: {}", e.getMessage());
        }
    }
}
