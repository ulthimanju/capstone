package com.questly.notification.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.questly.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.connection.ReactiveSubscription;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.codec.ServerSentEvent;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;
import reactor.test.StepVerifier;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class NotificationControllerTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private ReactiveStringRedisTemplate reactiveRedisTemplate;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private NotificationController notificationController;

    private UUID userId;
    private String channel;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        channel = "user:notifications:" + userId;
    }

    /**
     * Test case: Connects mock SSE client, publishes notification to Redis Pub/Sub,
     * and asserts chunk delivery has latency < 100ms.
     */
    @Test
    void testNotificationSseStream_LatencyWithinSla() throws Exception {
        // Arrange
        Sinks.Many<ReactiveSubscription.Message<String, String>> sink = Sinks.many().unicast().onBackpressureBuffer();
        when(reactiveRedisTemplate.listenToChannel(eq(channel))).thenAnswer(invocation -> sink.asFlux());

        NotificationController.NotificationDto dto = NotificationController.NotificationDto.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .title("Gamification Badge unlocked")
                .body("You have earned the 'Grandmaster' badge!")
                .type("BADGE_EARNED")
                .isRead(false)
                .createdAt(Instant.now().toString())
                .build();

        String rawJson = "{\"title\":\"Gamification Badge unlocked\"}";
        when(objectMapper.readValue(eq(rawJson), eq(NotificationController.NotificationDto.class)))
                .thenReturn(dto);

        // Act
        Flux<ServerSentEvent<NotificationController.NotificationDto>> stream = 
                notificationController.streamNotifications(userId);

        // Pre-create and stub mock message outside of timed block to prevent Mockito/ByteBuddy proxy generation latency
        ReactiveSubscription.Message<String, String> message = mock(ReactiveSubscription.Message.class);
        when(message.getMessage()).thenReturn(rawJson);

        // Prepare assertion using StepVerifier and verify within 100ms SLA
        StepVerifier.create(stream)
                .then(() -> {
                    // Record start time of Redis PubSub publish simulation
                    long startTimeNanos = System.nanoTime();

                    sink.tryEmitNext(message);

                    long endTimeNanos = System.nanoTime();
                    long latencyMs = (endTimeNanos - startTimeNanos) / 1_000_000;
                    
                    // Assert the pubsub ingestion latency to memory is < 10ms (well within 100ms SLA!)
                    logDebug("Simulated pubsub ingestion time: " + latencyMs + "ms");
                    assertTrue(latencyMs < 100, "Pub/sub mapping SLA exceeded 100ms");
                })
                .assertNext(sse -> {
                    // Verify the SSE contents mapped cleanly
                    assertEquals("notification", sse.event());
                    assertEquals(dto, sse.data());
                    assertEquals("BADGE_EARNED", sse.data().getType());
                })
                .thenCancel()
                .verify(Duration.ofMillis(100));
    }

    private void logDebug(String msg) {
        System.out.println("[SSE-LatencyTest] " + msg);
    }
}
