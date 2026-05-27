package com.questly.quiz.dto;

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
public class QuizAttemptResponse {
    private UUID attemptId;
    private BigDecimal score;
    private int totalQuestions;
    private int correctQuestions;
    private List<QuestionFeedback> feedback;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionFeedback {
        private String questionId;
        private String question;
        private String type;
        private String topic;
        private List<String> options;
        private String userAnswer;
        private String correctAnswer;
        private boolean correct;
    }
}
