package com.questly.notification.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.questly.notification.BaseIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import java.time.Duration;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class NotificationControllerIT extends BaseIntegrationTest {

    @Autowired
    private WebTestClient webTestClient;

    @Autowired
    private ReactiveStringRedisTemplate reactiveRedisTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testNotificationSseStream_Success() throws Exception {
        UUID userId = UUID.randomUUID();
        String channel = "user:notifications:" + userId;

        NotificationController.NotificationDto notifPayload = NotificationController.NotificationDto.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .title("New Assignment Posted")
                .body("Review details inside notebook-service.")
                .type("ASSIGNMENT")
                .isRead(false)
                .build();

        String rawJson = objectMapper.writeValueAsString(notifPayload);

        // Publish periodically in a background thread until step verification completes
        java.util.concurrent.atomic.AtomicBoolean completed = new java.util.concurrent.atomic.AtomicBoolean(false);
        Thread publisherThread = new Thread(() -> {
            try {
                // Short initial sleep to allow WebTestClient to make request
                Thread.sleep(500);
                while (!completed.get() && !Thread.currentThread().isInterrupted()) {
                    reactiveRedisTemplate.convertAndSend(channel, rawJson).subscribe();
                    Thread.sleep(1000);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        publisherThread.setDaemon(true);
        publisherThread.start();

        try {
            // Establish the Server-Sent Events reactive stream using WebTestClient
            Flux<ServerSentEvent<NotificationController.NotificationDto>> stream = webTestClient.mutate()
                    .responseTimeout(Duration.ofSeconds(10))
                    .build()
                    .get()
                    .uri("/api/notifications/stream")
                    .header("X-User-Id", userId.toString())
                    .accept(MediaType.TEXT_EVENT_STREAM)
                    .exchange()
                    .returnResult(NotificationController.NotificationDto.class)
                    .getResponseBody()
                    .map(dto -> ServerSentEvent.<NotificationController.NotificationDto>builder()
                            .data(dto)
                            .event("notification")
                            .build());

            // Verify using StepVerifier
            StepVerifier.create(stream)
                    .assertNext(sse -> {
                        assertNotNull(sse.data());
                        assertEquals("New Assignment Posted", sse.data().getTitle());
                        assertEquals("ASSIGNMENT", sse.data().getType());
                        assertEquals(userId, sse.data().getUserId());
                    })
                    .thenCancel()
                    .verify(Duration.ofSeconds(10));
        } finally {
            completed.set(true);
            publisherThread.interrupt();
        }
    }
}
