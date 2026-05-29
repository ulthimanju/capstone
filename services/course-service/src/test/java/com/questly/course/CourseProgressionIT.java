package com.questly.course;

import com.questly.course.dto.CourseResponse;
import com.questly.course.dto.ProgressResponse;
import com.questly.course.event.ModuleCompletedEvent;
import com.questly.course.model.Course;
import com.questly.course.model.Enrollment;
import com.questly.course.model.Module;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
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
public class CourseProgressionIT {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("db_course_test")
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

    @Test
    void testCourseProgressionAndDripUnlockFlow() {
        UUID tutorId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();

        // 1. Create a course with modules
        Course courseReq = Course.builder()
                .title("Integration Testing in Spring")
                .description("A comprehensive course about Testcontainers")
                .isPublished(true)
                .build();

        Module m1 = Module.builder()
                .title("Introduction to Postgres Containers")
                .content("Postgres content")
                .orderIndex(0)
                .dripUnlock(true)
                .build();

        Module m2 = Module.builder()
                .title("Kafka Event Gating")
                .content("Kafka content")
                .orderIndex(1)
                .dripUnlock(true)
                .build();

        courseReq.setModules(List.of(m1, m2));

        HttpHeaders tutorHeaders = new HttpHeaders();
        tutorHeaders.set("X-User-Id", tutorId.toString());
        tutorHeaders.set("X-User-Role", "TUTOR");

        HttpEntity<Course> createEntity = new HttpEntity<>(courseReq, tutorHeaders);
        ResponseEntity<Course> createResponse = restTemplate.postForEntity("/api/courses", createEntity, Course.class);
        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        Course createdCourse = createResponse.getBody();
        assertThat(createdCourse).isNotNull();
        assertThat(createdCourse.getId()).isNotNull();
        assertThat(createdCourse.getModules()).hasSize(2);

        UUID courseId = createdCourse.getId();
        
        UUID module1Id = createdCourse.getModules().stream()
                .filter(m -> m.getOrderIndex() == 0)
                .findFirst()
                .orElseThrow()
                .getId();

        UUID module2Id = createdCourse.getModules().stream()
                .filter(m -> m.getOrderIndex() == 1)
                .findFirst()
                .orElseThrow()
                .getId();

        // Setup manual consumer to subscribe to Kafka topic
        Map<String, Object> consumerProps = new HashMap<>();
        consumerProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafka.getBootstrapServers());
        consumerProps.put(ConsumerConfig.GROUP_ID_CONFIG, "test-group-" + UUID.randomUUID());
        consumerProps.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        consumerProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        consumerProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
        consumerProps.put(ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, JsonDeserializer.class);
        consumerProps.put(JsonDeserializer.TRUSTED_PACKAGES, "*");

        DefaultKafkaConsumerFactory<String, ModuleCompletedEvent> cf = new DefaultKafkaConsumerFactory<>(
                consumerProps, new StringDeserializer(), new JsonDeserializer<>(ModuleCompletedEvent.class, false)
        );
        Consumer<String, ModuleCompletedEvent> consumer = cf.createConsumer();
        consumer.subscribe(Collections.singletonList("module.completed"));

        // 2. Enroll a student
        HttpHeaders studentHeaders = new HttpHeaders();
        studentHeaders.set("X-User-Id", studentId.toString());
        studentHeaders.set("X-User-Role", "STUDENT");

        HttpEntity<Void> studentEntity = new HttpEntity<>(studentHeaders);
        ResponseEntity<Enrollment> enrollResponse = restTemplate.postForEntity(
                "/api/courses/" + courseId + "/enroll",
                studentEntity,
                Enrollment.class
        );
        assertThat(enrollResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        Enrollment enrollment = enrollResponse.getBody();
        assertThat(enrollment).isNotNull();
        // By default, the first module should be unlocked
        assertThat(enrollment.getUnlockedModules()).containsExactly(module1Id);
        assertThat(enrollment.getProgress()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(enrollment.isCompleted()).isFalse();

        // 3. Complete Module 1
        ResponseEntity<ProgressResponse> completeResponse = restTemplate.postForEntity(
                "/api/courses/" + courseId + "/modules/" + module1Id + "/complete",
                studentEntity,
                ProgressResponse.class
        );
        assertThat(completeResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        ProgressResponse progress = completeResponse.getBody();
        assertThat(progress).isNotNull();
        // Progress should be 50% (1 completed out of 2 modules)
        assertThat(progress.getProgress()).isEqualByComparingTo(BigDecimal.valueOf(50.0).setScale(2));
        // Next module should be drip-unlocked dynamically
        assertThat(progress.getUnlockedModules()).containsExactlyInAnyOrder(module1Id, module2Id);
        assertThat(progress.isCompleted()).isFalse();

        // 4. Verify Kafka event is emitted
        await().atMost(Duration.ofSeconds(10)).untilAsserted(() -> {
            ConsumerRecords<String, ModuleCompletedEvent> records = consumer.poll(Duration.ofMillis(500));
            List<ModuleCompletedEvent> events = new ArrayList<>();
            records.forEach(r -> events.add(r.value()));

            assertThat(events).isNotEmpty();
            ModuleCompletedEvent event = events.stream()
                    .filter(e -> e.getModuleId().equals(module1Id))
                    .findFirst()
                    .orElseThrow();
            assertThat(event.getUserId()).isEqualTo(studentId);
            assertThat(event.getCourseId()).isEqualTo(courseId);
        });

        consumer.close();
    }
}
