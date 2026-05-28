package com.questly.user.kafka;

import com.questly.user.BaseIntegrationTest;
import com.questly.user.event.UserRegisteredEvent;
import com.questly.user.repository.UserProfileRepository;
import com.questly.user.repository.UserStatsRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.kafka.core.KafkaTemplate;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.utility.DockerImageName;

import java.time.Duration;
import java.util.UUID;

import static org.awaitility.Awaitility.await;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class UserRegisteredConsumerIT extends BaseIntegrationTest {

    @Container
    @ServiceConnection
    static final KafkaContainer kafka = new KafkaContainer(
            DockerImageName.parse("confluentinc/cp-kafka:7.6.0")
    );

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private UserStatsRepository userStatsRepository;

    @Test
    void testConsumerCreatesProfileAndStatsOnEvent() {
        UUID newUserId = UUID.randomUUID();
        UserRegisteredEvent event = UserRegisteredEvent.builder()
                .userId(newUserId)
                .email("newuser@questly.com")
                .displayName("New Learner")
                .role("STUDENT")
                .build();

        // Publish event to the user.registered topic
        kafkaTemplate.send("user.registered", newUserId.toString(), event);

        // Await asynchronous consumption and database insertion
        await().atMost(Duration.ofSeconds(8)).untilAsserted(() -> {
            assertTrue(userProfileRepository.existsById(newUserId));
            assertTrue(userStatsRepository.existsById(newUserId));
        });
    }
}
