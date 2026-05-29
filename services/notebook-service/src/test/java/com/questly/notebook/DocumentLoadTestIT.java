package com.questly.notebook;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;
import com.questly.notebook.model.Notebook;
import com.questly.notebook.repository.DocumentRepository;
import com.questly.notebook.repository.NotebookRepository;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
public class DocumentLoadTestIT {

    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("db_notebook")
            .withUsername("postgres")
            .withPassword("postgres")
            .withInitScript("db_notebook_schema.sql");

    static GenericContainer<?> minio = new GenericContainer<>("minio/minio:latest")
            .withEnv("MINIO_ROOT_USER", "minioadmin")
            .withEnv("MINIO_ROOT_PASSWORD", "minioadmin")
            .withCommand("server /data")
            .withExposedPorts(9000);

    static WireMockServer wireMockServer = new WireMockServer(WireMockConfiguration.wireMockConfig().dynamicPort());

    static {
        postgres.start();
        minio.start();
        wireMockServer.start();
        WireMock.configureFor("localhost", wireMockServer.port());
    }

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.hikari.maximum-pool-size", () -> 25);
        registry.add("spring.datasource.hikari.connection-timeout", () -> 30000);
        registry.add("minio.endpoint", () -> "http://" + minio.getHost() + ":" + minio.getMappedPort(9000));
        registry.add("minio.access-key", () -> "minioadmin");
        registry.add("minio.secret-key", () -> "minioadmin");
        registry.add("minio.bucket", () -> "documents");
        registry.add("ai-service.base-url", () -> wireMockServer.baseUrl());
        registry.add("eureka.client.enabled", () -> "false");
        registry.add("spring.cloud.config.enabled", () -> "false");
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private NotebookRepository notebookRepository;

    @Autowired
    private DocumentRepository documentRepository;

    private UUID testNotebookId;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        documentRepository.deleteAll();
        notebookRepository.deleteAll();
        wireMockServer.resetAll();

        testUserId = UUID.randomUUID();
        Notebook notebook = Notebook.builder()
                .title("Load Test Notebook")
                .userId(testUserId)
                .build();
        notebook = notebookRepository.save(notebook);
        testNotebookId = notebook.getId();
    }

    @AfterAll
    static void tearDown() {
        wireMockServer.stop();
    }

    @Test
    void testConcurrentDocumentIngestion() throws Exception {
        wireMockServer.stubFor(post(urlEqualTo("/internal/v1/ai/embed"))
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"status\":\"COMPLETED\",\"chunkCount\":3,\"collectionId\":\"coll-load\",\"error\":null}")));

        int concurrentUploads = 10;
        ExecutorService executorService = Executors.newFixedThreadPool(concurrentUploads);
        List<CompletableFuture<Void>> futures = new ArrayList<>();

        for (int i = 0; i < concurrentUploads; i++) {
            final int index = i;
            CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                try {
                    MockMultipartFile file = new MockMultipartFile(
                            "file",
                            "doc-" + index + ".txt",
                            MediaType.TEXT_PLAIN_VALUE,
                            ("This is the concurrent test file content number " + index).getBytes()
                    );

                    mockMvc.perform(multipart("/api/notebooks/{notebookId}/documents", testNotebookId)
                                    .file(file)
                                    .header("X-User-Id", testUserId.toString()))
                            .andExpect(status().isCreated());
                } catch (Exception e) {
                    throw new RuntimeException("Upload failed for index: " + index, e);
                }
            }, executorService);
            futures.add(future);
        }

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        executorService.shutdown();

        long readyCount = documentRepository.findAll().stream()
                .filter(doc -> "READY".equals(doc.getStatus()))
                .count();

        assertThat(readyCount).isEqualTo(concurrentUploads);
        assertThat(documentRepository.count()).isEqualTo(concurrentUploads);

        wireMockServer.verify(concurrentUploads, postRequestedFor(urlEqualTo("/internal/v1/ai/embed")));
    }
}
