package com.questly.notebook.service;

import com.questly.notebook.dto.ChatMessageDto;
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
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class QueryService {

    private final NotebookRepository notebookRepository;
    private final RestClient aiRestClient;
    private final WebClient aiWebClient;
    private final ChatService chatService;

    @Transactional
    public QueryResponse query(UUID notebookId, UUID userId, QueryRequest req) {
        // 1. Ownership check
        notebookRepository.findByIdAndUserId(notebookId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notebook not found"));

        UUID sessionId = req.getSessionId();
        if (sessionId == null) {
            sessionId = chatService.createSession(notebookId, userId, "Chat about " + req.getQuestion()).getId();
        }

        // Save user message
        chatService.saveMessage(sessionId, "user", req.getQuestion());

        List<ChatMessageDto> history = chatService.getChatHistoryForAi(sessionId);

        // 2. Build request body for ai-service
        Map<String, Object> body = new HashMap<>();
        body.put("notebookId", notebookId);
        body.put("question", req.getQuestion());
        body.put("chatHistory", history);

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
                        .sessionId(sessionId)
                        .answer("No response from AI service.")
                        .sources(Collections.emptyList())
                        .build();
            }
            
            response.setSessionId(sessionId);
            
            // Save assistant message
            chatService.saveMessage(sessionId, "assistant", response.getAnswer());

            return response;
        } catch (Exception e) {
            log.error("AI query failed for notebook {}: {}", notebookId, e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "AI service unavailable: " + e.getMessage());
        }
    }

    public Flux<String> streamQuery(UUID notebookId, UUID userId, QueryRequest req) {
        // 1. Ownership check
        notebookRepository.findByIdAndUserId(notebookId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notebook not found"));

        UUID finalSessionId;
        if (req.getSessionId() == null) {
            finalSessionId = chatService.createSession(notebookId, userId, "Chat about " + req.getQuestion()).getId();
        } else {
            finalSessionId = req.getSessionId();
        }

        // Save user message
        chatService.saveMessage(finalSessionId, "user", req.getQuestion());

        List<ChatMessageDto> history = chatService.getChatHistoryForAi(finalSessionId);

        Map<String, Object> body = new HashMap<>();
        body.put("notebookId", notebookId);
        body.put("question", req.getQuestion());
        body.put("chatHistory", history);

        StringBuilder fullAnswer = new StringBuilder();

        return aiWebClient.post()
                .uri("/internal/v1/ai/query/stream")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToFlux(String.class)
                .doOnNext(fullAnswer::append)
                .doOnComplete(() -> {
                    // Save assistant message when stream is complete
                    chatService.saveMessage(finalSessionId, "assistant", fullAnswer.toString());
                })
                .doOnError(e -> {
                    log.error("Streaming AI query failed for notebook {}: {}", notebookId, e.getMessage());
                });
    }
}
