package com.questly.notebook.controller;

import com.questly.notebook.dto.DocumentResponse;
import com.questly.notebook.service.IngestionService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/notebooks/{notebookId}/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final IngestionService ingestionService;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<DocumentResponse> uploadDocument(
            @PathVariable UUID notebookId,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        DocumentResponse response = ingestionService.ingestFile(notebookId, userId, file);
        return ResponseEntity.status(201).body(response);
    }

    @DeleteMapping("/{docId}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable UUID notebookId,
            @PathVariable UUID docId,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        ingestionService.deleteDocument(notebookId, docId, userId);
        return ResponseEntity.noContent().build();
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
