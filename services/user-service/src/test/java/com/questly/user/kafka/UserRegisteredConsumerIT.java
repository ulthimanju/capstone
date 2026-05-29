package com.questly.user.kafka;

import com.questly.user.BaseIntegrationTest;
import com.questly.user.event.UserRegisteredEvent;
import com.questly.user.repository.UserProfileRepository;
import com.questly.user.repository.UserStatsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;

import java.time.Duration;
import java.util.UUID;

import static org.awaitility.Awaitility.await;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class UserRegisteredConsumerIT extends BaseIntegrationTest {

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private UserStatsRepository userStatsRepository;

    @BeforeEach
    void cleanUp() {
        userStatsRepository.deleteAll();
        userProfileRepository.deleteAll();
    }

    @Test
    void testConsumerCreatesProfileAndStatsOnEvent() {
        UUID newUserId = UUID.randomUUID();
        UserRegisteredEvent event = UserRegisteredEvent.builder()
                .userId(newUserId)
                .email("newuser@questly.com")
                .displayName("New Learner")
                .role("STUDENT")
                .build();

        // Publish event to the user.registered topic and flush to guarantee delivery
        kafkaTemplate.send("user.registered", newUserId.toString(), event);
        kafkaTemplate.flush();

        // Await asynchronous consumption and database insertion (15s to allow for rebalance)
        await().atMost(Duration.ofSeconds(15)).untilAsserted(() -> {
            assertTrue(userProfileRepository.existsById(newUserId));
            assertTrue(userStatsRepository.existsById(newUserId));
        });
    }
}
