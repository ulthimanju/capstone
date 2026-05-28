package com.questly.gamification.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizCompletedEvent {
    private UUID userId;
    private UUID quizId;
    private BigDecimal score;
    private int totalQuestions;
    private List<String> wrongTopics;
    private UUID challengeId;
    private String timestamp;
}
