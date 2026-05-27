package com.questly.flashcard.controller;

import com.questly.flashcard.dto.FlashcardGenRequest;
import com.questly.flashcard.dto.FlashcardReviewRequest;
import com.questly.flashcard.model.Flashcard;
import com.questly.flashcard.service.FlashcardService;
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
@RequestMapping("/api/flashcards")
@RequiredArgsConstructor
public class FlashcardController {

    private final FlashcardService flashcardService;

    /**
     * Generate flashcards from document content.
     */
    @PostMapping("/generate")
    public ResponseEntity<List<Flashcard>> generateFlashcards(
            @Valid @RequestBody FlashcardGenRequest req,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        List<Flashcard> cards = flashcardService.generateFlashcards(userId, req.getNotebookId(), req.getCount());
        return ResponseEntity.status(201).body(cards);
    }

    /**
     * Lists own flashcards, optionally filtered by notebookId.
     */
    @GetMapping
    public ResponseEntity<List<Flashcard>> listFlashcards(
            @RequestParam(required = false) UUID notebookId,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        List<Flashcard> cards = flashcardService.listOwnFlashcards(userId, notebookId);
        return ResponseEntity.ok(cards);
    }

    /**
     * Lists cards due for review today.
     */
    @GetMapping("/due")
    public ResponseEntity<List<Flashcard>> getDueFlashcards(
            @RequestParam(required = false) UUID notebookId,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        List<Flashcard> cards = flashcardService.getDueFlashcards(userId, notebookId);
        return ResponseEntity.ok(cards);
    }

    /**
     * Submit rating for a flashcard review.
     */
    @PostMapping("/{id}/review")
    public ResponseEntity<Flashcard> reviewFlashcard(
            @PathVariable UUID id,
            @Valid @RequestBody FlashcardReviewRequest req,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        Flashcard updatedCard = flashcardService.reviewFlashcard(userId, id, req.getRating());
        return ResponseEntity.ok(updatedCard);
    }

    /**
     * Delete a specific flashcard.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlashcard(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        flashcardService.deleteFlashcard(userId, id);
        return ResponseEntity.noContent().build();
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
