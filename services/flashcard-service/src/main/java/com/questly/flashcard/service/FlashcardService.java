package com.questly.flashcard.service;

import com.questly.flashcard.dto.*;
import com.questly.flashcard.event.FlashcardReviewedEvent;
import com.questly.flashcard.model.Flashcard;
import com.questly.flashcard.model.FlashcardReview;
import com.questly.flashcard.repository.FlashcardRepository;
import com.questly.flashcard.repository.FlashcardReviewRepository;
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FlashcardService {

    private final FlashcardRepository flashcardRepository;
    private final FlashcardReviewRepository flashcardReviewRepository;
    private final RestClient notebookRestClient;
    private final RestClient aiRestClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String KAFKA_TOPIC = "flashcard.reviewed";

    /**
     * AI-generation of flashcards. Resolves minio paths from notebook-service,
     * forwards to ai-service, and persists the generated questions.
     */
    @Transactional
    public List<Flashcard> generateFlashcards(UUID userId, UUID notebookId, int count) {
        log.info("Request to generate {} flashcards for user {} from notebook {}", count, userId, notebookId);

        // 1. Resolve documents from notebook-service (verifies ownership downstream via X-User-Id header)
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
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No documents exist in the selected notebook to generate cards from.");
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

        // 2. Call ai-service
        Map<String, Object> body = new HashMap<>();
        body.put("notebookId", notebookId);
        body.put("documents", readyDocs);
        body.put("count", count > 0 ? count : 10);

        FlashcardGenResponse genResponse;
        try {
            genResponse = aiRestClient.post()
                    .uri("/internal/v1/ai/generate/flashcards")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(FlashcardGenResponse.class);
        } catch (Exception e) {
            log.error("AI service card generation failed: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "AI generation engine unavailable: " + e.getMessage());
        }

        if (genResponse == null || genResponse.getFlashcards() == null || genResponse.getFlashcards().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Local AI engine did not return any flashcards. Please try again.");
        }

        // 3. Persist generated cards
        List<Flashcard> savedCards = new ArrayList<>();
        for (FlashcardDto dto : genResponse.getFlashcards()) {
            Flashcard card = Flashcard.builder()
                    .userId(userId)
                    .notebookId(notebookId)
                    .question(dto.getQuestion())
                    .answer(dto.getAnswer())
                    .easeFactor(new BigDecimal("2.50"))
                    .interval(1)
                    .repetitions(0)
                    .nextReview(LocalDate.now())
                    .build();
            savedCards.add(flashcardRepository.save(card));
        }

        log.info("Successfully persisted {} generated flashcards for user {}", savedCards.size(), userId);
        return savedCards;
    }

    /**
     * Lists all flashcards owned by the user (with optional notebookId filter).
     */
    @Transactional(readOnly = true)
    public List<Flashcard> listOwnFlashcards(UUID userId, UUID notebookId) {
        if (notebookId != null) {
            return flashcardRepository.findByUserIdAndNotebookId(userId, notebookId);
        }
        return flashcardRepository.findAll().stream()
                .filter(c -> userId.equals(c.getUserId()))
                .toList();
    }

    /**
     * Lists due cards.
     */
    @Transactional(readOnly = true)
    public List<Flashcard> getDueFlashcards(UUID userId, UUID notebookId) {
        LocalDate today = LocalDate.now();
        if (notebookId != null) {
            return flashcardRepository.findByUserIdAndNotebookIdAndNextReviewLessThanEqual(userId, notebookId, today);
        }
        return flashcardRepository.findByUserIdAndNextReviewLessThanEqual(userId, today);
    }

    /**
     * Submits a rating (0-5) for a card review and computes next review schedule using the SuperMemo SM-2 algorithm.
     */
    @Transactional
    public Flashcard reviewFlashcard(UUID userId, UUID cardId, int rating) {
        if (rating < 0 || rating > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 0 and 5 inclusive.");
        }

        Flashcard card = flashcardRepository.findById(cardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Flashcard not found."));

        if (!card.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied. You do not own this card.");
        }

        // Apply SM-2 Algorithmic Recalculations
        int reps = card.getRepetitions();
        BigDecimal ef = card.getEaseFactor();
        int interval;

        if (rating < 3) {
            // Poor rating: reset sequence
            reps = 0;
            interval = 1;
        } else {
            // Correct answer rating: calculate repetitions and intervals
            reps += 1;
            if (reps == 1) {
                interval = 1;
            } else if (reps == 2) {
                interval = 6;
            } else {
                // interval = round(previous_interval * ease_factor)
                interval = new BigDecimal(card.getInterval())
                        .multiply(ef)
                        .setScale(0, RoundingMode.HALF_UP)
                        .intValue();
            }

            // Adjust Ease Factor (EF)
            // EF = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
            double q = rating;
            double efAdjustment = 0.1 - (5.0 - q) * (0.08 + (5.0 - q) * 0.02);
            ef = ef.add(BigDecimal.valueOf(efAdjustment)).setScale(2, RoundingMode.HALF_UP);
            
            // Clamp Ease Factor at a minimum of 1.30
            if (ef.compareTo(new BigDecimal("1.30")) < 0) {
                ef = new BigDecimal("1.30");
            }
        }

        // Save review record
        FlashcardReview review = FlashcardReview.builder()
                .flashcardId(cardId)
                .userId(userId)
                .rating(rating)
                .build();
        flashcardReviewRepository.save(review);

        // Update card scheduling
        LocalDate nextReview = LocalDate.now().plusDays(interval);
        card.setRepetitions(reps);
        card.setEaseFactor(ef);
        card.setInterval(interval);
        card.setNextReview(nextReview);
        flashcardRepository.save(card);

        log.info("Flashcard {} reviewed: reps={}, EF={}, interval={}, nextReview={}",
                cardId, reps, ef, interval, nextReview);

        // Publish event to Kafka
        publishReviewEvent(userId, cardId, rating, nextReview);

        return card;
    }

    /**
     * Deletes a flashcard.
     */
    @Transactional
    public void deleteFlashcard(UUID userId, UUID cardId) {
        Flashcard card = flashcardRepository.findById(cardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Flashcard not found."));

        if (!card.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied. You do not own this card.");
        }

        flashcardRepository.delete(card);
        log.info("Deleted flashcard {} successfully for user {}", cardId, userId);
    }

    /**
     * Publishes review logs asynchronously to Kafka.
     */
    private void publishReviewEvent(UUID userId, UUID cardId, int rating, LocalDate nextReview) {
        try {
            FlashcardReviewedEvent event = FlashcardReviewedEvent.builder()
                    .userId(userId)
                    .cardId(cardId)
                    .rating(rating)
                    .nextReview(nextReview)
                    .build();

            kafkaTemplate.send(KAFKA_TOPIC, cardId.toString(), event);
            log.info("Published flashcard.reviewed event for card {} to Kafka.", cardId);
        } catch (Exception e) {
            log.error("Failed to publish flashcard.reviewed event to Kafka: {}", e.getMessage());
            // Fail silently to keep application active
        }
    }
}
