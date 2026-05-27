package com.questly.notebook.controller;

import com.questly.notebook.dto.CreateNotebookRequest;
import com.questly.notebook.dto.DocumentResponse;
import com.questly.notebook.dto.NotebookResponse;
import com.questly.notebook.dto.QueryRequest;
import com.questly.notebook.dto.QueryResponse;
import com.questly.notebook.service.NotebookService;
import com.questly.notebook.service.QueryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/notebooks")
@RequiredArgsConstructor
public class NotebookController {

    private final NotebookService notebookService;
    private final QueryService queryService;

    @PostMapping
    public ResponseEntity<NotebookResponse> createNotebook(
            @Valid @RequestBody CreateNotebookRequest req,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        NotebookResponse response = notebookService.createNotebook(req, userId);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping
    public ResponseEntity<List<NotebookResponse>> listNotebooks(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(notebookService.listNotebooks(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotebookResponse> getNotebook(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(notebookService.getNotebook(id, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotebook(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        notebookService.deleteNotebook(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/documents")
    public ResponseEntity<List<DocumentResponse>> listDocuments(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(notebookService.listDocuments(id, userId));
    }

    @GetMapping("/{id}/documents/{docId}/status")
    public ResponseEntity<DocumentResponse> getDocumentStatus(
            @PathVariable UUID id,
            @PathVariable UUID docId,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(notebookService.getDocumentStatus(id, docId, userId));
    }

    @PostMapping("/{id}/query")
    public ResponseEntity<QueryResponse> query(
            @PathVariable UUID id,
            @Valid @RequestBody QueryRequest req,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        return ResponseEntity.ok(queryService.query(id, userId, req));
    }

    private UUID extractUserId(HttpServletRequest request) {
        String header = request.getHeader("X-User-Id");
        if (header == null || header.isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED, "Missing X-User-Id header");
        }
        return UUID.fromString(header);
    }
}
