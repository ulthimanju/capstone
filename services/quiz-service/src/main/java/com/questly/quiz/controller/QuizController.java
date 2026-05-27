package com.questly.quiz.controller;

import com.questly.quiz.dto.QuizAttemptRequest;
import com.questly.quiz.dto.QuizAttemptResponse;
import com.questly.quiz.dto.QuizGenRequest;
import com.questly.quiz.model.Quiz;
import com.questly.quiz.model.QuizAttempt;
import com.questly.quiz.model.WeakSpot;
import com.questly.quiz.service.QuizService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    /**
     * Generate a new AI study quiz.
     */
    @PostMapping("/generate")
    public ResponseEntity<Quiz> generateQuiz(
            @Valid @RequestBody QuizGenRequest req,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        Quiz quiz = quizService.generateQuiz(userId, req.getNotebookId(), req.getCount(), req.getTypes(), req.getTitle());
        return ResponseEntity.status(HttpStatus.CREATED).body(quiz);
    }

    /**
     * Lists own quizzes, optionally filtered by notebookId.
     */
    @GetMapping
    public ResponseEntity<List<Quiz>> listQuizzes(
            @RequestParam(required = false) UUID notebookId,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        List<Quiz> quizzes = quizService.listOwnQuizzes(userId, notebookId);
        return ResponseEntity.ok(quizzes);
    }

    /**
     * Get quiz structure securely (hiding correct answers to prevent console cheating).
     */
    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuiz(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        Quiz quiz = quizService.getQuizSecure(userId, id);
        return ResponseEntity.ok(quiz);
    }

    /**
     * Submit an attempt/answers to be scored.
     */
    @PostMapping("/{id}/attempt")
    public ResponseEntity<QuizAttemptResponse> attemptQuiz(
            @PathVariable UUID id,
            @Valid @RequestBody QuizAttemptRequest req,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        QuizAttemptResponse response = quizService.attemptQuiz(userId, id, req);
        return ResponseEntity.ok(response);
    }

    /**
     * Lists quiz attempt history, optionally filtered by quizId.
     */
    @GetMapping("/attempts")
    public ResponseEntity<List<QuizAttempt>> getAttemptHistory(
            @RequestParam(required = false) UUID quizId,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        List<QuizAttempt> history = quizService.getQuizAttemptHistory(userId, quizId);
        return ResponseEntity.ok(history);
    }

    /**
     * Lists active weak spots.
     */
    @GetMapping("/weak-spots")
    public ResponseEntity<List<WeakSpot>> getActiveWeakSpots(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        List<WeakSpot> weakSpots = quizService.getActiveWeakSpots(userId);
        return ResponseEntity.ok(weakSpots);
    }

    private UUID extractUserId(HttpServletRequest request) {
        String header = request.getHeader("X-User-Id");
        if (header == null || header.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing X-User-Id header");
        }
        try {
            return UUID.fromString(header);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid X-User-Id header format");
        }
    }
}
