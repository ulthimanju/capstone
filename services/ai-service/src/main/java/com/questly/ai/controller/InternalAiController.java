package com.questly.ai.controller;

import com.questly.ai.dto.*;
import com.questly.ai.service.CollectionService;
import com.questly.ai.service.EmbeddingService;
import com.questly.ai.service.RagQueryService;
import com.questly.ai.service.StreamingRagQueryService;
import com.questly.ai.service.AiGenerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/internal/v1/ai")
@RequiredArgsConstructor
public class InternalAiController {

    private final EmbeddingService embeddingService;
    private final RagQueryService ragQueryService;
    private final StreamingRagQueryService streamingRagQueryService;
    private final CollectionService collectionService;
    private final AiGenerationService aiGenerationService;

    /**
     * Embed a document into ChromaDB.
     * Called by notebook-service after uploading a document to MinIO.
     */
    @PostMapping("/embed")
    public ResponseEntity<EmbedResponse> embed(@RequestBody EmbedRequest request) {
        log.info("Received embed request for document {} in notebook {}",
                request.getDocumentId(), request.getNotebookId());
        EmbedResponse response = embeddingService.embed(request);
        return ResponseEntity.ok(response);
    }

    /**
     * RAG query against a notebook's ChromaDB collection.
     */
    @PostMapping("/query")
    public ResponseEntity<QueryResponse> query(@RequestBody QueryRequest request) {
        log.info("Received query request for notebook {}: {}", request.getNotebookId(), request.getQuestion());
        QueryResponse response = ragQueryService.query(request);
        return ResponseEntity.ok(response);
    }

    /**
     * RAG query with SSE streaming.
     */
    @PostMapping(value = "/query/stream", produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
    public reactor.core.publisher.Flux<String> streamQuery(@RequestBody QueryRequest request) {
        log.info("Received streaming query request for notebook {}: {}", request.getNotebookId(), request.getQuestion());
        return streamingRagQueryService.streamQuery(request);
    }

    /**
     * Delete all ChromaDB chunks for a specific document within a notebook collection.
     */
    @DeleteMapping("/embed/{documentId}")
    public ResponseEntity<Void> deleteDocumentChunks(
            @PathVariable UUID documentId,
            @RequestParam UUID notebookId) {
        log.info("Received delete chunks request for document {} in notebook {}", documentId, notebookId);
        collectionService.deleteDocumentChunks(documentId, notebookId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Delete the entire ChromaDB collection for a notebook.
     */
    @DeleteMapping("/collection/{notebookId}")
    public ResponseEntity<Void> deleteCollection(@PathVariable UUID notebookId) {
        log.info("Received delete collection request for notebook {}", notebookId);
        collectionService.deleteCollection(notebookId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Generate flashcards from document context.
     * Called by flashcard-service.
     */
    @PostMapping("/generate/flashcards")
    public ResponseEntity<FlashcardGenResponse> generateFlashcards(@RequestBody FlashcardGenRequest request) {
        log.info("Received generate flashcards request for notebook {}", request.getNotebookId());
        FlashcardGenResponse response = aiGenerationService.generateFlashcards(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Generate quiz questions from document context.
     * Called by quiz-service.
     */
    @PostMapping("/generate/quiz")
    public ResponseEntity<QuizGenResponse> generateQuiz(@RequestBody QuizGenRequest request) {
        log.info("Received generate quiz request for notebook {}", request.getNotebookId());
        QuizGenResponse response = aiGenerationService.generateQuiz(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Generate plain-language summary of a document.
     * Called by notebook-service.
     */
    @PostMapping("/summarize")
    public ResponseEntity<SummarizeResponse> summarize(@RequestBody SummarizeRequest request) {
        log.info("Received summarize request for document path: {}", request.getMinioPath());
        SummarizeResponse response = aiGenerationService.summarize(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Grade student submission.
     * Called by assignment-service.
     */
    @PostMapping("/grade")
    public ResponseEntity<GradeResponse> gradeSubmission(@RequestBody GradeRequest request) {
        log.info("Received assignment grading request");
        GradeResponse response = aiGenerationService.gradeSubmission(request);
        return ResponseEntity.ok(response);
    }
}

