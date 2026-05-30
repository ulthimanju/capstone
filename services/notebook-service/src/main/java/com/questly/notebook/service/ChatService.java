package com.questly.notebook.service;

import com.questly.notebook.dto.ChatMessageDto;
import com.questly.notebook.dto.ChatMessageResponse;
import com.questly.notebook.dto.ChatSessionResponse;
import com.questly.notebook.model.ChatMessage;
import com.questly.notebook.model.ChatSession;
import com.questly.notebook.repository.ChatMessageRepository;
import com.questly.notebook.repository.ChatSessionRepository;
import com.questly.notebook.repository.NotebookRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ChatService {

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final NotebookRepository notebookRepository;

    public ChatSessionResponse createSession(UUID notebookId, UUID userId, String title) {
        notebookRepository.findByIdAndUserId(notebookId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notebook not found"));

        ChatSession session = ChatSession.builder()
                .notebookId(notebookId)
                .title(title != null && !title.isBlank() ? title : "New Chat")
                .build();
        
        session = sessionRepository.save(session);
        return toSessionResponse(session);
    }

    @Transactional(readOnly = true)
    public List<ChatSessionResponse> getSessions(UUID notebookId, UUID userId) {
        notebookRepository.findByIdAndUserId(notebookId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notebook not found"));

        return sessionRepository.findByNotebookIdOrderByUpdatedAtDesc(notebookId)
                .stream()
                .map(this::toSessionResponse)
                .collect(Collectors.toList());
    }

    public void deleteSession(UUID notebookId, UUID sessionId, UUID userId) {
        notebookRepository.findByIdAndUserId(notebookId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notebook not found"));

        ChatSession session = sessionRepository.findByIdAndNotebookId(sessionId, notebookId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat session not found"));

        sessionRepository.delete(session);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(UUID notebookId, UUID sessionId, UUID userId) {
        notebookRepository.findByIdAndUserId(notebookId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notebook not found"));

        sessionRepository.findByIdAndNotebookId(sessionId, notebookId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat session not found"));

        return messageRepository.findByChatSessionIdOrderByCreatedAtAsc(sessionId)
                .stream()
                .map(this::toMessageResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ChatMessageDto> getChatHistoryForAi(UUID sessionId) {
        if (sessionId == null) return List.of();
        
        return messageRepository.findByChatSessionIdOrderByCreatedAtAsc(sessionId)
                .stream()
                .map(msg -> ChatMessageDto.builder()
                        .role(msg.getRole())
                        .content(msg.getContent())
                        .build())
                .collect(Collectors.toList());
    }

    public void saveMessage(UUID sessionId, String role, String content) {
        if (sessionId == null) return;
        
        ChatMessage message = ChatMessage.builder()
                .chatSessionId(sessionId)
                .role(role)
                .content(content)
                .build();
        messageRepository.save(message);

        // Update session's updated_at
        sessionRepository.findById(sessionId).ifPresent(session -> {
            session.setTitle(session.getTitle()); // touch to trigger update
            sessionRepository.save(session);
        });
    }

    private ChatSessionResponse toSessionResponse(ChatSession session) {
        return ChatSessionResponse.builder()
                .id(session.getId())
                .title(session.getTitle())
                .notebookId(session.getNotebookId())
                .createdAt(session.getCreatedAt())
                .updatedAt(session.getUpdatedAt())
                .build();
    }

    private ChatMessageResponse toMessageResponse(ChatMessage message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .chatSessionId(message.getChatSessionId())
                .role(message.getRole())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
