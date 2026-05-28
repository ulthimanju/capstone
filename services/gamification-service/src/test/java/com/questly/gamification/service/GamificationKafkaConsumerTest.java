package com.questly.gamification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.questly.gamification.event.QuizCompletedEvent;
import com.questly.gamification.model.Challenge;
import com.questly.gamification.repository.ChallengeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class GamificationKafkaConsumerTest {

    @Mock
    private GamificationService gamificationService;

    @Mock
    private ChallengeRepository challengeRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private GamificationKafkaConsumer consumer;

    private UUID challengerId;
    private UUID opponentId;
    private UUID quizId;
    private UUID challengeId;
    private Challenge challenge;

    @BeforeEach
    void setUp() {
        challengerId = UUID.randomUUID();
        opponentId = UUID.randomUUID();
        quizId = UUID.randomUUID();
        challengeId = UUID.randomUUID();

        challenge = Challenge.builder()
                .id(challengeId)
                .challengerId(challengerId)
                .opponentId(opponentId)
                .quizId(quizId)
                .status("ACTIVE")
                .version(0)
                .build();
    }

    /**
     * Test Case 1: First quiz completion submission in a duel.
     * Expected: Puts first score in cache, doesn't update database.
     */
    @Test
    void testResolveDuelScore_FirstSubmission() throws Exception {
        // Arrange
        QuizCompletedEvent event = new QuizCompletedEvent();
        event.setUserId(challengerId);
        event.setScore(BigDecimal.valueOf(90));
        event.setQuizId(quizId);
        event.setChallengeId(challengeId);
        event.setDurationS(45);

        String message = "{}";
        when(objectMapper.readValue(message, QuizCompletedEvent.class)).thenReturn(event);
        when(challengeRepository.findById(challengeId)).thenReturn(Optional.of(challenge));

        // Act
        consumer.consumeQuizCompleted(message);

        // Assert: first submission should not save to repository yet
        verify(challengeRepository, never()).save(any(Challenge.class));
        verify(gamificationService, never()).publishChallengeCompletedEvent(any(), any(), any(), any());
    }

    /**
     * Test Case 2: Second quiz completion submission in a duel.
     * Expected: Resolves duel, declares winner, saves challenge to DB, cleans cache, publishes event.
     */
    @Test
    void testResolveDuelScore_SecondSubmission_DeclaresWinner() throws Exception {
        // Arrange
        // Simulate first submission already in cache (Opponent completed it with score 80, duration 60s)
        QuizCompletedEvent firstEvent = new QuizCompletedEvent();
        firstEvent.setUserId(opponentId);
        firstEvent.setScore(BigDecimal.valueOf(80));
        firstEvent.setQuizId(quizId);
        firstEvent.setChallengeId(challengeId);
        firstEvent.setDurationS(60);

        String msg1 = "msg1";
        when(objectMapper.readValue(msg1, QuizCompletedEvent.class)).thenReturn(firstEvent);
        when(challengeRepository.findById(challengeId)).thenReturn(Optional.of(challenge));

        // Execute first submission
        consumer.consumeQuizCompleted(msg1);

        // Now simulate second submission (Challenger completes with score 90, duration 50s)
        QuizCompletedEvent secondEvent = new QuizCompletedEvent();
        secondEvent.setUserId(challengerId);
        secondEvent.setScore(BigDecimal.valueOf(90));
        secondEvent.setQuizId(quizId);
        secondEvent.setChallengeId(challengeId);
        secondEvent.setDurationS(50);

        String msg2 = "msg2";
        reset(objectMapper, challengeRepository);
        when(objectMapper.readValue(msg2, QuizCompletedEvent.class)).thenReturn(secondEvent);
        when(challengeRepository.findById(challengeId)).thenReturn(Optional.of(challenge));

        // Act
        consumer.consumeQuizCompleted(msg2);

        // Assert: Challenger should be winner (90 > 80)
        assertEquals("COMPLETED", challenge.getStatus());
        assertEquals(challengerId, challenge.getWinnerId());
        verify(challengeRepository, times(1)).save(challenge);
        verify(gamificationService, times(1)).publishChallengeCompletedEvent(challengeId, challengerId, opponentId, challengerId);
    }

    /**
     * Test Case 3: Ties evaluated on speed duration tie-breaker.
     * Expected: Player with lower duration in seconds is crowned winner.
     */
    @Test
    void testResolveDuelScore_SpeedTieBreaker() throws Exception {
        // Arrange
        // Opponent first submission: score 90, duration 75s
        QuizCompletedEvent firstEvent = new QuizCompletedEvent();
        firstEvent.setUserId(opponentId);
        firstEvent.setScore(BigDecimal.valueOf(90));
        firstEvent.setQuizId(quizId);
        firstEvent.setChallengeId(challengeId);
        firstEvent.setDurationS(75);

        String msg1 = "msg1";
        when(objectMapper.readValue(msg1, QuizCompletedEvent.class)).thenReturn(firstEvent);
        when(challengeRepository.findById(challengeId)).thenReturn(Optional.of(challenge));
        consumer.consumeQuizCompleted(msg1);

        // Challenger second submission: score 90 (TIED), duration 60s (FASTER!)
        QuizCompletedEvent secondEvent = new QuizCompletedEvent();
        secondEvent.setUserId(challengerId);
        secondEvent.setScore(BigDecimal.valueOf(90));
        secondEvent.setQuizId(quizId);
        secondEvent.setChallengeId(challengeId);
        secondEvent.setDurationS(60);

        String msg2 = "msg2";
        reset(objectMapper, challengeRepository);
        when(objectMapper.readValue(msg2, QuizCompletedEvent.class)).thenReturn(secondEvent);
        when(challengeRepository.findById(challengeId)).thenReturn(Optional.of(challenge));

        // Act
        consumer.consumeQuizCompleted(msg2);

        // Assert: Challenger should win because of faster speed (60s < 75s)
        assertEquals("COMPLETED", challenge.getStatus());
        assertEquals(challengerId, challenge.getWinnerId());
        verify(challengeRepository, times(1)).save(challenge);
    }

    /**
     * Test Case 4: Concurrency optimistic locking retry loop.
     * Expected: Retries save operations up to 3 times on ObjectOptimisticLockingFailureException.
     */
    @Test
    void testResolveDuelScore_OptimisticLockingFailureRetryLoop() throws Exception {
        // Arrange
        // Seed first submission by Opponent
        QuizCompletedEvent firstEvent = new QuizCompletedEvent();
        firstEvent.setUserId(opponentId);
        firstEvent.setScore(BigDecimal.valueOf(80));
        firstEvent.setQuizId(quizId);
        firstEvent.setChallengeId(challengeId);
        firstEvent.setDurationS(50);

        String msg1 = "msg1";
        when(objectMapper.readValue(msg1, QuizCompletedEvent.class)).thenReturn(firstEvent);
        when(challengeRepository.findById(challengeId)).thenReturn(Optional.of(challenge));
        consumer.consumeQuizCompleted(msg1);

        // Second submission by Challenger
        QuizCompletedEvent secondEvent = new QuizCompletedEvent();
        secondEvent.setUserId(challengerId);
        secondEvent.setScore(BigDecimal.valueOf(85));
        secondEvent.setQuizId(quizId);
        secondEvent.setChallengeId(challengeId);
        secondEvent.setDurationS(45);

        String msg2 = "msg2";
        reset(objectMapper, challengeRepository);
        when(objectMapper.readValue(msg2, QuizCompletedEvent.class)).thenReturn(secondEvent);
        when(challengeRepository.findById(challengeId)).thenAnswer(invocation -> {
            Challenge freshChallenge = Challenge.builder()
                .id(challengeId)
                .challengerId(challengerId)
                .opponentId(opponentId)
                .quizId(quizId)
                .status("ACTIVE")
                .version(0)
                .build();
            return Optional.of(freshChallenge);
        });

        // Throw lock exception on first save call, succeed on second save call
        doThrow(new ObjectOptimisticLockingFailureException(Challenge.class, challengeId))
                .doAnswer(invocation -> invocation.getArgument(0))
                .when(challengeRepository).save(any(Challenge.class));

        // Act
        consumer.consumeQuizCompleted(msg2);

        // Assert: verify that save is retried, meaning it is called twice!
        verify(challengeRepository, times(2)).save(any(Challenge.class));
        verify(gamificationService, times(1)).publishChallengeCompletedEvent(eq(challengeId), eq(challengerId), eq(opponentId), eq(challengerId));
    }
}
