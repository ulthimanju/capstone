package com.questly.user;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.lifecycle.Startables;
import org.testcontainers.utility.DockerImageName;

/**
 * Base class for integration tests using the Singleton Container Pattern.
 *
 * <p>All containers are started ONCE in the static initializer and live for the entire JVM
 * lifetime (Testcontainers Ryuk cleans them up on exit). Because every subclass registers the
 * same dynamic property values, Spring's test-context cache sees a single context key and reuses
 * the same ApplicationContext — avoiding the costly stop/restart cycle that previously caused
 * HikariPool connection failures between test classes.
 */
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.kafka.producer.value-serializer=org.springframework.kafka.support.serializer.JsonSerializer",
        "eureka.client.enabled=false",
        "spring.cloud.config.enabled=false"
    }
)
public abstract class BaseIntegrationTest {

    // -----------------------------------------------------------------------
    // Singleton containers — started once for the entire JVM, never stopped
    // between test classes. Ryuk (Testcontainers resource reaper) handles
    // cleanup on JVM exit.
    // -----------------------------------------------------------------------

    static final PostgreSQLContainer<?> postgres =
        new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("db_user_test")
            .withUsername("test")
            .withPassword("test");

    @SuppressWarnings("resource")
    static final GenericContainer<?> redis =
        new GenericContainer<>("redis:7-alpine")
            .withExposedPorts(6379);

    static final KafkaContainer kafka =
        new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.6.0"));

    static {
        // Start all containers in parallel; block until all are healthy.
        Startables.deepStart(postgres, redis, kafka).join();
    }

    // -----------------------------------------------------------------------
    // Register container coordinates as Spring properties.
    // Because every subclass produces the same values (same container
    // instances → same ports), the Spring context cache key is identical
    // across all subclasses and the context is shared.
    // -----------------------------------------------------------------------

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.data.redis.host", redis::getHost);
        registry.add("spring.data.redis.port", () -> redis.getMappedPort(6379));
        registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
    }
}
