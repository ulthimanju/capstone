package com.questly.notification.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.questly.notification.model.Notification;
import com.questly.notification.repository.NotificationRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final ReactiveStringRedisTemplate reactiveRedisTemplate;
    private final ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(
            @RequestParam(value = "unreadOnly", defaultValue = "false") boolean unreadOnly,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        List<Notification> list;
        if (unreadOnly) {
            list = notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
        } else {
            list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }
        return ResponseEntity.ok(list);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        
        if (!notif.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        notif.setRead(true);
        notificationRepository.save(notif);
        return ResponseEntity.ok(notif);
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
        return ResponseEntity.noContent().build();
    }

    /**
     * Stateless Server Sent Events (SSE) Stream using WebFlux and Redis Pub/Sub.
     * Scale-out friendly, survives microservice restarts.
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<NotificationDto>> streamNotifications(@RequestHeader("X-User-Id") UUID userId) {
        String channel = "user:notifications:" + userId;
        log.info("Client connected to notification SSE stream for channel: {}", channel);

        return reactiveRedisTemplate.listenToChannel(channel)
                .map(msg -> {
                    String rawJson = msg.getMessage();
                    try {
                        NotificationDto dto = objectMapper.readValue(rawJson, NotificationDto.class);
                        return ServerSentEvent.<NotificationDto>builder()
                                .data(dto)
                                .event("notification")
                                .build();
                    } catch (IOException e) {
                        log.error("Failed to parse Redis PubSub message to NotificationDto: {}", e.getMessage());
                        return ServerSentEvent.<NotificationDto>builder()
                                .data(NotificationDto.builder()
                                        .title("Alert")
                                        .body(rawJson)
                                        .type("RAW")
                                        .build())
                                        .event("notification")
                                        .build();
                    }
                })
                .doOnError(err -> log.error("Error in SSE notification stream: {}", err.getMessage()))
                .doOnTerminate(() -> log.info("SSE stream disconnected for user {}", userId));
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

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationDto {
        private UUID id;
        private UUID userId;
        private String title;
        private String body;
        private String type;
        private UUID refId;
        private boolean isRead;
        private String createdAt;
    }
}
