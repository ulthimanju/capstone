package com.questly.notification;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.lifecycle.Startables;

/**
 * Base class for notification-service integration tests using the Singleton Container Pattern.
 *
 * <p>Postgres and Redis containers are started ONCE via the static initializer and live for the
 * entire JVM lifetime. Every subclass registers the same {@link DynamicPropertySource} values,
 * so Spring's test-context cache produces a single context key and reuses the same
 * ApplicationContext across all IT classes — preventing the container stop/restart cycle
 * that caused Redis "Connection closed prematurely" errors.
 */
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.kafka.listener.auto-startup=false",
        "eureka.client.enabled=false",
        "spring.cloud.config.enabled=false"
    }
)
public abstract class BaseIntegrationTest {

    // -----------------------------------------------------------------------
    // Singleton containers — started once, never stopped between test classes.
    // Testcontainers Ryuk handles Docker cleanup on JVM exit.
    // -----------------------------------------------------------------------

    static final PostgreSQLContainer<?> postgres =
        new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("db_notification_test")
            .withUsername("test")
            .withPassword("test");

    @SuppressWarnings("resource")
    static final GenericContainer<?> redis =
        new GenericContainer<>("redis:7-alpine")
            .withExposedPorts(6379);

    static {
        Startables.deepStart(postgres, redis).join();
    }

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.data.redis.host", redis::getHost);
        registry.add("spring.data.redis.port", () -> redis.getMappedPort(6379));
    }
}
