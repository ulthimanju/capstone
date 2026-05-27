package com.questly.quiz.service;

import com.questly.quiz.dto.*;
import com.questly.quiz.event.QuizCompletedEvent;
import com.questly.quiz.model.Quiz;
import com.questly.quiz.model.QuizAttempt;
import com.questly.quiz.model.WeakSpot;
import com.questly.quiz.repository.QuizAttemptRepository;
import com.questly.quiz.repository.QuizRepository;
import com.questly.quiz.repository.WeakSpotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final WeakSpotRepository weakSpotRepository;
    private final RestClient notebookRestClient;
    private final RestClient aiRestClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String KAFKA_TOPIC = "quiz.completed";

    /**
     * Generates a quiz from the notebook's documents, incorporating active weak spots if any.
     */
    @Transactional
    public Quiz generateQuiz(UUID userId, UUID notebookId, int count, List<String> types, String title) {
        log.info("Request to generate quiz of {} questions for user {} in notebook {}", count, userId, notebookId);

        // 1. Resolve documents from notebook-service (verifies ownership downstream via X-User-Id)
        List<DocumentResponse> documents;
        try {
            documents = notebookRestClient.get()
                    .uri("/api/notebooks/" + notebookId + "/documents")
                    .header("X-User-Id", userId.toString())
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<DocumentResponse>>() {});
        } catch (Exception e) {
            log.error("Failed to query notebook-service for notebook {}: {}", notebookId, e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Notebook service unavailable: " + e.getMessage());
        }

        if (documents == null || documents.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No documents exist in the selected notebook to generate quizzes from.");
        }

        // Filter for READY documents only
        List<DocumentPath> readyDocs = new ArrayList<>();
        for (DocumentResponse doc : documents) {
            if ("READY".equalsIgnoreCase(doc.getStatus())) {
                String format = doc.getMinioPath().substring(doc.getMinioPath().lastIndexOf(".") + 1).toUpperCase();
                readyDocs.add(DocumentPath.builder()
                        .minioPath(doc.getMinioPath())
                        .format(format)
                        .build());
            }
        }

        if (readyDocs.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Document embedding is still processing. Please wait until documents are READY.");
        }

        // 2. Fetch active weak spot topics to focus on
        List<WeakSpot> activeWeakSpots = weakSpotRepository.findByUserIdAndNotebookIdAndIsActiveTrue(userId, notebookId);
        List<String> weakSpotTopics = activeWeakSpots.stream()
                .map(WeakSpot::getTopic)
                .toList();

        // 3. Call ai-service
        Map<String, Object> body = new HashMap<>();
        body.put("notebookId", notebookId);
        body.put("documents", readyDocs);
        body.put("count", count > 0 ? count : 5);
        body.put("types", (types != null && !types.isEmpty()) ? types : List.of("MCQ", "FILL", "SHORT"));
        body.put("topics", weakSpotTopics);

        QuizGenResponse genResponse;
        try {
            genResponse = aiRestClient.post()
                    .uri("/internal/v1/ai/generate/quiz")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(QuizGenResponse.class);
        } catch (Exception e) {
            log.error("AI service quiz generation failed: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "AI generation engine unavailable: " + e.getMessage());
        }

        if (genResponse == null || genResponse.getQuestions() == null || genResponse.getQuestions().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Local AI engine did not return any quiz questions. Please try again.");
        }

        // 4. Map questions and persist
        List<Quiz.QuizQuestion> questions = new ArrayList<>();
        for (int i = 0; i < genResponse.getQuestions().size(); i++) {
            QuizQuestionDto dto = genResponse.getQuestions().get(i);
            questions.add(Quiz.QuizQuestion.builder()
                    .id(UUID.randomUUID().toString())
                    .type(dto.getType())
                    .question(dto.getQuestion())
                    .options(dto.getOptions())
                    .answer(dto.getAnswer())
                    .topic(dto.getTopic() != null ? dto.getTopic() : "General Topic")
                    .build());
        }

        Quiz quiz = Quiz.builder()
                .userId(userId)
                .notebookId(notebookId)
                .title(title != null && !title.isBlank() ? title : "AI Study Quiz - " + LocalDate.now())
                .questions(questions)
                .build();

        return quizRepository.save(quiz);
    }

    /**
     * Lists quizzes owned by the user (with optional notebookId filter).
     */
    @Transactional(readOnly = true)
    public List<Quiz> listOwnQuizzes(UUID userId, UUID notebookId) {
        if (notebookId != null) {
            return quizRepository.findByUserIdAndNotebookId(userId, notebookId);
        }
        return quizRepository.findByUserId(userId);
    }

    /**
     * Fetches a quiz by ID and strips correct answers to prevent cheating in the browser console.
     */
    @Transactional(readOnly = true)
    public Quiz getQuizSecure(UUID userId, UUID quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found."));

        if (!quiz.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied. You do not own this quiz.");
        }

        // Clone and strip answers
        List<Quiz.QuizQuestion> strippedQuestions = quiz.getQuestions().stream()
                .map(q -> Quiz.QuizQuestion.builder()
                        .id(q.getId())
                        .type(q.getType())
                        .question(q.getQuestion())
                        .options(q.getOptions())
                        .answer(null) // STRIPPED FOR SECURITY
                        .topic(q.getTopic())
                        .build())
                .toList();

        return Quiz.builder()
                .id(quiz.getId())
                .notebookId(quiz.getNotebookId())
                .userId(quiz.getUserId())
                .title(quiz.getTitle())
                .questions(strippedQuestions)
                .createdAt(quiz.getCreatedAt())
                .build();
    }

    /**
     * Scores a quiz attempt and evaluates consecutive weak spots.
     */
    @Transactional
    public QuizAttemptResponse attemptQuiz(UUID userId, UUID quizId, QuizAttemptRequest req) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found."));

        if (!quiz.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied. You do not own this quiz.");
        }

        List<QuizAttemptResponse.QuestionFeedback> feedbackList = new ArrayList<>();
        List<String> wrongTopics = new ArrayList<>();
        int correctCount = 0;

        // Map submitted answers by questionId
        Map<String, String> submissions = new HashMap<>();
        if (req.getAnswers() != null) {
            for (QuizAttemptRequest.UserAnswer ua : req.getAnswers()) {
                submissions.put(ua.getQuestionId(), ua.getAnswer());
            }
        }

        // Evaluate each question
        for (Quiz.QuizQuestion q : quiz.getQuestions()) {
            String userAnswer = submissions.getOrDefault(q.getId(), "").trim();
            String correctAnswer = q.getAnswer() != null ? q.getAnswer().trim() : "";

            boolean isCorrect = userAnswer.equalsIgnoreCase(correctAnswer);

            if (isCorrect) {
                correctCount++;
                // Update WeakSpot: Reset consecutive wrong count on correct answer
                updateWeakSpotOnSuccess(userId, quiz.getNotebookId(), q.getTopic());
            } else {
                wrongTopics.add(q.getTopic());
                // Update WeakSpot: Increment consecutive wrong count
                updateWeakSpotOnFailure(userId, quiz.getNotebookId(), q.getTopic());
            }

            feedbackList.add(QuizAttemptResponse.QuestionFeedback.builder()
                    .questionId(q.getId())
                    .question(q.getQuestion())
                    .type(q.getType())
                    .topic(q.getTopic())
                    .options(q.getOptions())
                    .userAnswer(userAnswer)
                    .correctAnswer(correctAnswer)
                    .correct(isCorrect)
                    .build());
        }

        // Calculate final score
        BigDecimal score = BigDecimal.valueOf(correctCount)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(quiz.getQuestions().size()), 2, RoundingMode.HALF_UP);

        // Save Attempt
        QuizAttempt attempt = QuizAttempt.builder()
                .quizId(quizId)
                .userId(userId)
                .score(score)
                .totalQuestions(quiz.getQuestions().size())
                .wrongTopicIds(wrongTopics)
                .challengeId(req.getChallengeId())
                .build();
        quizAttemptRepository.save(attempt);

        log.info("Quiz {} completed by user {}: score={} ({} of {} correct)",
                quizId, userId, score, correctCount, quiz.getQuestions().size());

        // Publish Kafka event
        publishQuizCompletedEvent(userId, quizId, score, wrongTopics, req.getChallengeId());

        return QuizAttemptResponse.builder()
                .attemptId(attempt.getId())
                .score(score)
                .totalQuestions(quiz.getQuestions().size())
                .correctQuestions(correctCount)
                .feedback(feedbackList)
                .build();
    }

    /**
     * Lists quiz attempts owned by the user (with optional quizId filter).
     */
    @Transactional(readOnly = true)
    public List<QuizAttempt> getQuizAttemptHistory(UUID userId, UUID quizId) {
        if (quizId != null) {
            // Verify ownership of the quiz first
            Quiz quiz = quizRepository.findById(quizId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found."));
            if (!quiz.getUserId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied. You do not own this quiz.");
            }
            return quizAttemptRepository.findByQuizIdAndUserId(quizId, userId);
        }
        return quizAttemptRepository.findByUserId(userId);
    }

    /**
     * Lists all active weak spots for the user.
     */
    @Transactional(readOnly = true)
    public List<WeakSpot> getActiveWeakSpots(UUID userId) {
        return weakSpotRepository.findByUserIdAndIsActiveTrue(userId);
    }

    /**
     * Consecutive Weak Spot Failure Logic:
     * Increment wrong count, reset correct streak, and activate weak spot if consecutive incorrect attempts >= 2.
     */
    private void updateWeakSpotOnFailure(UUID userId, UUID notebookId, String topic) {
        if (topic == null || topic.isBlank()) return;
        Optional<WeakSpot> opt = weakSpotRepository.findByUserIdAndNotebookIdAndTopic(userId, notebookId, topic);

        if (opt.isEmpty()) {
            WeakSpot ws = WeakSpot.builder()
                    .userId(userId)
                    .notebookId(notebookId)
                    .topic(topic)
                    .wrongCount(1)
                    .correctStreak(0)
                    .isActive(false) // Not flagged active yet (requires 2 consecutive failures)
                    .build();
            weakSpotRepository.save(ws);
            log.info("Created weak spot tracking for user {} in topic '{}' (wrong_count=1)", userId, topic);
        } else {
            WeakSpot ws = opt.get();
            ws.setWrongCount(ws.getWrongCount() + 1);
            ws.setCorrectStreak(0); // Reset correct streak on wrong answer
            if (ws.getWrongCount() >= 2) {
                ws.setIsActive(true); // Flag active
            }
            weakSpotRepository.save(ws);
            log.info("Updated weak spot tracking for user {} in topic '{}' (wrong_count={}, active={})",
                    userId, topic, ws.getWrongCount(), ws.getIsActive());
        }
    }

    /**
     * Consecutive Weak Spot Success Logic:
     * Reset consecutive wrong count to 0. If currently active, increment correct streak.
     * Clear weak spot if correct streak >= 2.
     */
    private void updateWeakSpotOnSuccess(UUID userId, UUID notebookId, String topic) {
        if (topic == null || topic.isBlank()) return;
        Optional<WeakSpot> opt = weakSpotRepository.findByUserIdAndNotebookIdAndTopic(userId, notebookId, topic);

        if (opt.isPresent()) {
            WeakSpot ws = opt.get();
            // Reset consecutive incorrect count immediately
            ws.setWrongCount(0);

            if (ws.getIsActive()) {
                ws.setCorrectStreak(ws.getCorrectStreak() + 1);
                if (ws.getCorrectStreak() >= 2) {
                    ws.setIsActive(false); // Clear weak spot
                    ws.setCorrectStreak(0);
                }
                weakSpotRepository.save(ws);
                log.info("Weak spot success update for user {} in topic '{}' (streak={}, active={})",
                        userId, topic, ws.getCorrectStreak(), ws.getIsActive());
            } else {
                // Just save the wrong count reset
                weakSpotRepository.save(ws);
            }
        }
    }

    /**
     * Publishes quiz attempt updates to Kafka.
     */
    private void publishQuizCompletedEvent(UUID userId, UUID quizId, BigDecimal score, List<String> wrongTopics, UUID challengeId) {
        try {
            QuizCompletedEvent event = QuizCompletedEvent.builder()
                    .userId(userId)
                    .quizId(quizId)
                    .score(score)
                    .wrongTopics(wrongTopics)
                    .challengeId(challengeId)
                    .build();

            kafkaTemplate.send(KAFKA_TOPIC, quizId.toString(), event);
            log.info("Published quiz.completed event for quiz {} to Kafka.", quizId);
        } catch (Exception e) {
            log.error("Failed to publish quiz.completed event to Kafka: {}", e.getMessage());
            // Fail silently to keep application active
        }
    }
}
