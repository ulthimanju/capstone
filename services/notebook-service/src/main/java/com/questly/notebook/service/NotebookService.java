package com.questly.notebook.service;

import com.questly.notebook.dto.CreateNotebookRequest;
import com.questly.notebook.dto.NotebookResponse;
import com.questly.notebook.dto.DocumentResponse;
import com.questly.notebook.model.Notebook;
import com.questly.notebook.model.Document;
import com.questly.notebook.repository.NotebookRepository;
import com.questly.notebook.repository.DocumentRepository;
import io.minio.ListObjectsArgs;
import io.minio.MinioClient;
import io.minio.RemoveObjectArgs;
import io.minio.Result;
import io.minio.messages.Item;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class NotebookService {

    private final NotebookRepository notebookRepository;
    private final DocumentRepository documentRepository;
    private final MinioClient minioClient;
    private final RestClient aiRestClient;

    @Value("${minio.bucket}")
    private String bucketName;

    public NotebookResponse createNotebook(CreateNotebookRequest req, UUID userId) {
        Notebook notebook = Notebook.builder()
                .title(req.getTitle())
                .userId(userId)
                .build();
        notebook = notebookRepository.save(notebook);
        log.info("Created notebook {} for user {}", notebook.getId(), userId);
        return toResponse(notebook, 0);
    }

    @Transactional(readOnly = true)
    public List<NotebookResponse> listNotebooks(UUID userId) {
        List<Notebook> notebooks = notebookRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return notebooks.stream()
                .map(nb -> {
                    int count = documentRepository.findByNotebookIdOrderByCreatedAtDesc(nb.getId()).size();
                    return toResponse(nb, count);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NotebookResponse getNotebook(UUID notebookId, UUID userId) {
        Notebook notebook = notebookRepository.findByIdAndUserId(notebookId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notebook not found"));
        int count = documentRepository.findByNotebookIdOrderByCreatedAtDesc(notebookId).size();
        return toResponse(notebook, count);
    }

    public void deleteNotebook(UUID notebookId, UUID userId) {
        Notebook notebook = notebookRepository.findByIdAndUserId(notebookId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notebook not found"));

        // Delete all MinIO objects for this notebook
        try {
            Iterable<Result<Item>> objects = minioClient.listObjects(
                    ListObjectsArgs.builder()
                            .bucket(bucketName)
                            .prefix(notebookId + "/")
                            .recursive(true)
                            .build()
            );
            for (Result<Item> result : objects) {
                Item item = result.get();
                minioClient.removeObject(
                        RemoveObjectArgs.builder()
                                .bucket(bucketName)
                                .object(item.objectName())
                                .build()
                );
                log.debug("Deleted MinIO object: {}", item.objectName());
            }
        } catch (Exception e) {
            log.warn("Error cleaning MinIO objects for notebook {}: {}", notebookId, e.getMessage());
        }

        // Delete ChromaDB collection via ai-service
        try {
            aiRestClient.delete()
                    .uri("/internal/v1/ai/collection/" + notebookId)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            log.warn("Error deleting ChromaDB collection for notebook {}: {}", notebookId, e.getMessage());
        }

        notebookRepository.delete(notebook);
        log.info("Deleted notebook {}", notebookId);
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> listDocuments(UUID notebookId, UUID userId) {
        notebookRepository.findByIdAndUserId(notebookId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notebook not found"));
        return documentRepository.findByNotebookIdOrderByCreatedAtDesc(notebookId)
                .stream()
                .map(this::toDocumentResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DocumentResponse getDocumentStatus(UUID notebookId, UUID docId, UUID userId) {
        notebookRepository.findByIdAndUserId(notebookId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notebook not found"));
        Document doc = documentRepository.findByIdAndNotebookId(docId, notebookId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
        return toDocumentResponse(doc);
    }

    @Transactional(readOnly = true)
    public Map<String, String> summarizeDocument(UUID notebookId, UUID docId, UUID userId) {
        notebookRepository.findByIdAndUserId(notebookId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notebook not found"));
        Document doc = documentRepository.findByIdAndNotebookId(docId, notebookId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));

        if (!"READY".equalsIgnoreCase(doc.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Document embedding is still processing or has failed.");
        }

        String format = doc.getMinioPath().substring(doc.getMinioPath().lastIndexOf(".") + 1).toUpperCase();

        Map<String, String> payload = Map.of(
                "minioPath", doc.getMinioPath(),
                "format", format
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, String> response = aiRestClient.post()
                    .uri("/internal/v1/ai/summarize")
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(Map.class);

            if (response == null || !response.containsKey("summary")) {
                return Map.of("summary", "Could not generate summary.");
            }
            return response;
        } catch (Exception e) {
            log.error("AI service summarize call failed for document {}: {}", docId, e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "AI generation engine unavailable: " + e.getMessage());
        }
    }

    private NotebookResponse toResponse(Notebook notebook, int documentCount) {
        return NotebookResponse.builder()
                .id(notebook.getId())
                .title(notebook.getTitle())
                .userId(notebook.getUserId())
                .createdAt(notebook.getCreatedAt())
                .documentCount(documentCount)
                .build();
    }

    private DocumentResponse toDocumentResponse(Document doc) {
        return DocumentResponse.builder()
                .id(doc.getId())
                .name(doc.getName())
                .status(doc.getStatus())
                .errorMsg(doc.getErrorMsg())
                .createdAt(doc.getCreatedAt())
                .build();
    }
}
