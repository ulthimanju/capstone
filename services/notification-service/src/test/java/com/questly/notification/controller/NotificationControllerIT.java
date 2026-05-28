package com.questly.notification.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import java.time.Duration;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
public class NotificationControllerIT {

    @Container
    @ServiceConnection
    protected static final PostgreSQLContainer<?> postgres = 
        new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("db_notification_test")
            .withUsername("test")
            .withPassword("test");

    @Container
    @ServiceConnection(name = "redis")
    protected static final GenericContainer<?> redis = 
        new GenericContainer<>("redis:7-alpine")
            .withExposedPorts(6379);

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

        // Establish the Server-Sent Events reactive stream using WebTestClient
        Flux<ServerSentEvent<NotificationController.NotificationDto>> stream = webTestClient.get()
                .uri("/api/notifications/stream")
                .header("X-User-Id", userId.toString())
                .accept(MediaType.TEXT_EVENT_STREAM)
                .exchange()
                .expectStatus().isOk()
                .returnResult(NotificationController.NotificationDto.class)
                .getResponseBody()
                .map(dto -> ServerSentEvent.<NotificationController.NotificationDto>builder()
                        .data(dto)
                        .event("notification")
                        .build());

        NotificationController.NotificationDto notifPayload = NotificationController.NotificationDto.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .title("New Assignment Posted")
                .body("Review details inside notebook-service.")
                .type("ASSIGNMENT")
                .isRead(false)
                .build();

        String rawJson = objectMapper.writeValueAsString(notifPayload);

        // Verify using StepVerifier
        StepVerifier.create(stream)
                .then(() -> {
                    // Introduce a tiny delay to allow client connection to stabilize on the Redis subscription
                    try {
                        Thread.sleep(500);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                    // Publish raw payload to Redis Pub/Sub channel
                    reactiveRedisTemplate.convertAndSend(channel, rawJson).subscribe();
                })
                .assertNext(sse -> {
                    assertNotNull(sse.data());
                    assertEquals("New Assignment Posted", sse.data().getTitle());
                    assertEquals("ASSIGNMENT", sse.data().getType());
                    assertEquals(userId, sse.data().getUserId());
                })
                .thenCancel()
                .verify(Duration.ofSeconds(5));
    }
}
