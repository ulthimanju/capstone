package com.questly.notebook;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;
import com.questly.notebook.model.Document;
import com.questly.notebook.model.Notebook;
import com.questly.notebook.repository.DocumentRepository;
import com.questly.notebook.repository.NotebookRepository;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
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

import java.io.InputStream;
import java.util.UUID;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
public class DocumentIngestionIT {

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

    @Autowired
    private MinioClient minioClient;

    private UUID testNotebookId;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        documentRepository.deleteAll();
        notebookRepository.deleteAll();
        wireMockServer.resetAll();

        testUserId = UUID.randomUUID();
        Notebook notebook = Notebook.builder()
                .title("Test Notebook")
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
    void testIngestDocumentSuccess() throws Exception {
        wireMockServer.stubFor(post(urlEqualTo("/internal/v1/ai/embed"))
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"status\":\"COMPLETED\",\"chunkCount\":5,\"collectionId\":\"coll-123\",\"error\":null}")));

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-document.txt",
                MediaType.TEXT_PLAIN_VALUE,
                "Hello World! This is an integration test for document ingestion.".getBytes()
        );

        mockMvc.perform(multipart("/api/notebooks/{notebookId}/documents", testNotebookId)
                        .file(file)
                        .header("X-User-Id", testUserId.toString()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("test-document.txt")))
                .andExpect(jsonPath("$.status", is("READY")))
                .andExpect(jsonPath("$.errorMsg").isEmpty());

        assertThat(documentRepository.count()).isEqualTo(1);
        Document savedDoc = documentRepository.findAll().get(0);
        assertThat(savedDoc.getStatus()).isEqualTo("READY");
        assertThat(savedDoc.getNotebookId()).isEqualTo(testNotebookId);

        try (InputStream stream = minioClient.getObject(
                GetObjectArgs.builder()
                        .bucket("documents")
                        .object(savedDoc.getMinioPath())
                        .build())) {
            byte[] fileBytes = stream.readAllBytes();
            assertThat(new String(fileBytes)).isEqualTo("Hello World! This is an integration test for document ingestion.");
        }

        wireMockServer.verify(postRequestedFor(urlEqualTo("/internal/v1/ai/embed")));

        wireMockServer.stubFor(post(urlEqualTo("/internal/v1/ai/query"))
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"answer\":\"The answer is Hello World!\",\"sources\":[{\"documentId\":\"" + savedDoc.getId() + "\",\"sourceName\":\"test-document.txt\",\"chunk\":\"Hello World!\"}]}")));

        mockMvc.perform(post("/api/notebooks/{notebookId}/query", testNotebookId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"question\":\"What is this about?\"}")
                        .header("X-User-Id", testUserId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answer", is("The answer is Hello World!")))
                .andExpect(jsonPath("$.sources[0].sourceName", is("test-document.txt")));
    }

    @Test
    void testIngestDocumentFailure() throws Exception {
        wireMockServer.stubFor(post(urlEqualTo("/internal/v1/ai/embed"))
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"status\":\"FAILED\",\"chunkCount\":0,\"collectionId\":null,\"error\":\"Failed to parse PDF\"}")));

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "bad-document.pdf",
                "application/pdf",
                "Invalid PDF content".getBytes()
        );

        mockMvc.perform(multipart("/api/notebooks/{notebookId}/documents", testNotebookId)
                        .file(file)
                        .header("X-User-Id", testUserId.toString()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("bad-document.pdf")))
                .andExpect(jsonPath("$.status", is("FAILED")))
                .andExpect(jsonPath("$.errorMsg", is("Failed to parse PDF")));

        assertThat(documentRepository.count()).isEqualTo(1);
        Document savedDoc = documentRepository.findAll().get(0);
        assertThat(savedDoc.getStatus()).isEqualTo("FAILED");
        assertThat(savedDoc.getErrorMsg()).isEqualTo("Failed to parse PDF");
    }
}
