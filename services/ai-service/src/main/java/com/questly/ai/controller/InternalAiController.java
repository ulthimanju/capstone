package com.questly.ai.controller;

import com.questly.ai.dto.EmbedRequest;
import com.questly.ai.dto.EmbedResponse;
import com.questly.ai.dto.QueryRequest;
import com.questly.ai.dto.QueryResponse;
import com.questly.ai.service.CollectionService;
import com.questly.ai.service.EmbeddingService;
import com.questly.ai.service.RagQueryService;
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
    private final CollectionService collectionService;

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
}
