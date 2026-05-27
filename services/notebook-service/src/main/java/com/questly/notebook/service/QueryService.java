package com.questly.notebook.service;

import com.questly.notebook.dto.QueryRequest;
import com.questly.notebook.dto.QueryResponse;
import com.questly.notebook.repository.NotebookRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class QueryService {

    private final NotebookRepository notebookRepository;
    private final RestClient aiRestClient;

    @Transactional(readOnly = true)
    public QueryResponse query(UUID notebookId, UUID userId, QueryRequest req) {
        // 1. Ownership check
        notebookRepository.findByIdAndUserId(notebookId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notebook not found"));

        // 2. Build request body for ai-service
        Map<String, Object> body = Map.of(
                "notebookId", notebookId,
                "question", req.getQuestion()
        );

        // 3. Call ai-service
        try {
            QueryResponse response = aiRestClient.post()
                    .uri("/internal/v1/ai/query")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(QueryResponse.class);

            if (response == null) {
                return QueryResponse.builder()
                        .answer("No response from AI service.")
                        .sources(Collections.emptyList())
                        .build();
            }
            return response;
        } catch (Exception e) {
            log.error("AI query failed for notebook {}: {}", notebookId, e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "AI service unavailable: " + e.getMessage());
        }
    }
}
