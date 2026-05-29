package com.questly.quiz;

import com.questly.quiz.dto.QuizAttemptRequest;
import com.questly.quiz.dto.QuizAttemptResponse;
import com.questly.quiz.event.QuizCompletedEvent;
import com.questly.quiz.model.Quiz;
import com.questly.quiz.model.WeakSpot;
import com.questly.quiz.repository.QuizRepository;
import com.questly.quiz.repository.WeakSpotRepository;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "spring.jpa.hibernate.ddl-auto=create-drop",
                "spring.cloud.config.enabled=false",
                "eureka.client.enabled=false",
                "spring.cloud.discovery.enabled=false"
        }
)
@Testcontainers
public class QuizWeakSpotIT {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("db_quiz_test")
            .withUsername("test")
            .withPassword("test");

    @Container
    @ServiceConnection
    static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.6.0"));

    @org.springframework.test.context.DynamicPropertySource
    static void registerKafkaProperties(org.springframework.test.context.DynamicPropertyRegistry registry) {
        registry.add("SPRING_KAFKA_BOOTSTRAP_SERVERS", kafka::getBootstrapServers);
        registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
    }

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private WeakSpotRepository weakSpotRepository;

    @Test
    void testQuizAttemptsScoreWrongTopicsTrackingAndWeakSpotLifecycle() {
        UUID userId = UUID.randomUUID();
        UUID notebookId = UUID.randomUUID();

        // 1. Seed a sample quiz into the DB
        Quiz quiz = Quiz.builder()
                .userId(userId)
                .notebookId(notebookId)
                .title("Chemistry Assessment")
                .questions(List.of(
                        Quiz.QuizQuestion.builder()
                                .id("q1")
                                .type("MCQ")
                                .question("What is water's chemical formula?")
                                .options(List.of("H2O", "CO2", "O2"))
                                .answer("H2O")
                                .topic("Chemistry")
                                .build()
                ))
                .build();

        quiz = quizRepository.save(quiz);
        assertThat(quiz.getId()).isNotNull();

        UUID quizId = quiz.getId();

        // Setup manual consumer to subscribe to Kafka topic
        Map<String, Object> consumerProps = new HashMap<>();
        consumerProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafka.getBootstrapServers());
        consumerProps.put(ConsumerConfig.GROUP_ID_CONFIG, "test-quiz-group-" + UUID.randomUUID());
        consumerProps.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        consumerProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        consumerProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
        consumerProps.put(ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, JsonDeserializer.class);
        consumerProps.put(JsonDeserializer.TRUSTED_PACKAGES, "*");

        DefaultKafkaConsumerFactory<String, QuizCompletedEvent> cf = new DefaultKafkaConsumerFactory<>(
                consumerProps, new StringDeserializer(), new JsonDeserializer<>(QuizCompletedEvent.class, false)
        );
        Consumer<String, QuizCompletedEvent> consumer = cf.createConsumer();
        consumer.subscribe(Collections.singletonList("quiz.completed"));

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-Id", userId.toString());

        // 2. Submit FIRST incorrect attempt
        QuizAttemptRequest attempt1 = QuizAttemptRequest.builder()
                .answers(List.of(
                        QuizAttemptRequest.UserAnswer.builder()
                                .questionId("q1")
                                .answer("CO2") // Wrong answer
                                .build()
                ))
                .build();

        HttpEntity<QuizAttemptRequest> entity1 = new HttpEntity<>(attempt1, headers);
        ResponseEntity<QuizAttemptResponse> response1 = restTemplate.postForEntity(
                "/api/quizzes/" + quizId + "/attempt",
                entity1,
                QuizAttemptResponse.class
        );
        assertThat(response1.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response1.getBody()).isNotNull();
        assertThat(response1.getBody().getScore()).isEqualByComparingTo(BigDecimal.ZERO);

        // Verify database state: WeakSpot entry exists but inactive (requires 2 consecutive failures)
        WeakSpot ws1 = weakSpotRepository.findByUserIdAndNotebookIdAndTopic(userId, notebookId, "Chemistry").orElse(null);
        assertThat(ws1).isNotNull();
        assertThat(ws1.getWrongCount()).isEqualTo(1);
        assertThat(ws1.getIsActive()).isFalse();

        // 3. Submit SECOND incorrect attempt
        QuizAttemptRequest attempt2 = QuizAttemptRequest.builder()
                .answers(List.of(
                        QuizAttemptRequest.UserAnswer.builder()
                                .questionId("q1")
                                .answer("O2") // Wrong answer
                                .build()
                ))
                .build();

        HttpEntity<QuizAttemptRequest> entity2 = new HttpEntity<>(attempt2, headers);
        ResponseEntity<QuizAttemptResponse> response2 = restTemplate.postForEntity(
                "/api/quizzes/" + quizId + "/attempt",
                entity2,
                QuizAttemptResponse.class
        );
        assertThat(response2.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Verify database state: WeakSpot active since consecutive failures = 2
        WeakSpot ws2 = weakSpotRepository.findByUserIdAndNotebookIdAndTopic(userId, notebookId, "Chemistry").orElse(null);
        assertThat(ws2).isNotNull();
        assertThat(ws2.getWrongCount()).isEqualTo(2);
        assertThat(ws2.getIsActive()).isTrue();

        // 4. Verify weak spot is returned from REST endpoint
        HttpEntity<Void> getWeakSpotsEntity = new HttpEntity<>(headers);
        ResponseEntity<List<WeakSpot>> weakSpotsResponse = restTemplate.exchange(
                "/api/quizzes/weak-spots",
                HttpMethod.GET,
                getWeakSpotsEntity,
                new ParameterizedTypeReference<List<WeakSpot>>() {}
        );
        assertThat(weakSpotsResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(weakSpotsResponse.getBody()).isNotNull();
        assertThat(weakSpotsResponse.getBody().stream().map(WeakSpot::getTopic)).contains("Chemistry");

        // 5. Submit FIRST correct attempt (consecutive success 1)
        QuizAttemptRequest attempt3 = QuizAttemptRequest.builder()
                .answers(List.of(
                        QuizAttemptRequest.UserAnswer.builder()
                                .questionId("q1")
                                .answer("H2O") // Correct answer
                                .build()
                ))
                .build();

        HttpEntity<QuizAttemptRequest> entity3 = new HttpEntity<>(attempt3, headers);
        ResponseEntity<QuizAttemptResponse> response3 = restTemplate.postForEntity(
                "/api/quizzes/" + quizId + "/attempt",
                entity3,
                QuizAttemptResponse.class
        );
        assertThat(response3.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response3.getBody()).isNotNull();
        assertThat(response3.getBody().getScore()).isEqualByComparingTo(BigDecimal.valueOf(100.0).setScale(2));

        // Verify database state: WeakSpot wrongCount reset to 0, correctStreak = 1, isActive still true
        WeakSpot ws3 = weakSpotRepository.findByUserIdAndNotebookIdAndTopic(userId, notebookId, "Chemistry").orElse(null);
        assertThat(ws3).isNotNull();
        assertThat(ws3.getWrongCount()).isEqualTo(0);
        assertThat(ws3.getCorrectStreak()).isEqualTo(1);
        assertThat(ws3.getIsActive()).isTrue();

        // 6. Submit SECOND correct attempt (consecutive success 2 -> should deactivate weak spot)
        QuizAttemptRequest attempt4 = QuizAttemptRequest.builder()
                .answers(List.of(
                        QuizAttemptRequest.UserAnswer.builder()
                                .questionId("q1")
                                .answer("H2O") // Correct answer
                                .build()
                ))
                .build();

        HttpEntity<QuizAttemptRequest> entity4 = new HttpEntity<>(attempt4, headers);
        ResponseEntity<QuizAttemptResponse> response4 = restTemplate.postForEntity(
                "/api/quizzes/" + quizId + "/attempt",
                entity4,
                QuizAttemptResponse.class
        );
        assertThat(response4.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Verify database state: WeakSpot isActive = false, correctStreak reset to 0
        WeakSpot ws4 = weakSpotRepository.findByUserIdAndNotebookIdAndTopic(userId, notebookId, "Chemistry").orElse(null);
        assertThat(ws4).isNotNull();
        assertThat(ws4.getWrongCount()).isEqualTo(0);
        assertThat(ws4.getCorrectStreak()).isEqualTo(0);
        assertThat(ws4.getIsActive()).isFalse();

        // 7. Verify weak spot list is now empty or doesn't contain Chemistry anymore
        ResponseEntity<List<WeakSpot>> weakSpotsResponse2 = restTemplate.exchange(
                "/api/quizzes/weak-spots",
                HttpMethod.GET,
                getWeakSpotsEntity,
                new ParameterizedTypeReference<List<WeakSpot>>() {}
        );
        assertThat(weakSpotsResponse2.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(weakSpotsResponse2.getBody()).isNotNull();
        assertThat(weakSpotsResponse2.getBody().stream().map(WeakSpot::getTopic)).doesNotContain("Chemistry");

        // 8. Assert Kafka events were emitted (we had 4 attempts, so 4 events should be in the topic)
        await().atMost(Duration.ofSeconds(10)).untilAsserted(() -> {
            ConsumerRecords<String, QuizCompletedEvent> records = consumer.poll(Duration.ofMillis(500));
            List<QuizCompletedEvent> events = new ArrayList<>();
            records.forEach(r -> events.add(r.value()));

            assertThat(events).hasSize(4);
            assertThat(events.get(0).getUserId()).isEqualTo(userId);
            assertThat(events.get(0).getQuizId()).isEqualTo(quizId);
            assertThat(events.get(0).getScore()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(events.get(2).getScore()).isEqualByComparingTo(BigDecimal.valueOf(100.0).setScale(2));
        });

        consumer.close();
    }
}
