package com.questly.notebook.service;

import com.questly.notebook.dto.DocumentResponse;
import com.questly.notebook.dto.EmbedRequest;
import com.questly.notebook.dto.EmbedResponse;
import com.questly.notebook.model.Document;
import com.questly.notebook.model.Document.DocumentStatus;
import com.questly.notebook.repository.DocumentRepository;
import com.questly.notebook.repository.NotebookRepository;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayInputStream;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class IngestionService {

    private final NotebookRepository notebookRepository;
    private final DocumentRepository documentRepository;
    private final MinioClient minioClient;
    private final RestClient aiRestClient;

    @Value("${minio.bucket}")
    private String bucketName;

    @Transactional
    public DocumentResponse ingestFile(UUID notebookId, UUID userId, MultipartFile file) {
        // 1. Ownership check
        notebookRepository.findByIdAndUserId(notebookId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notebook not found"));

        // 2. Read bytes and compute hash
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to read file: " + e.getMessage());
        }
        String hash = DigestUtils.sha256Hex(bytes);

        // 3. Deduplication check
        Optional<Document> existing = documentRepository.findByNotebookIdAndFileHash(notebookId, hash);
        if (existing.isPresent()) {
            log.info("Duplicate document detected for notebook {} (hash={}), returning existing", notebookId, hash);
            return toDocumentResponse(existing.get());
        }

        // 4. Determine format
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload";
        String format = detectFormat(file.getContentType(), originalFilename);

        // 5. Generate UUID and build MinIO path
        UUID docId = UUID.randomUUID();
        String minioPath = notebookId + "/" + docId + "/" + originalFilename;

        // 6. Upload to MinIO
        try {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(minioPath)
                            .stream(new ByteArrayInputStream(bytes), bytes.length, -1)
                            .contentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                            .build()
            );
            log.info("Uploaded file {} to MinIO at path {}", originalFilename, minioPath);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload to storage: " + e.getMessage());
        }

        // 7. Save Document with status PROCESSING
        Document doc = Document.builder()
                .id(docId)
                .name(originalFilename)
                .minioPath(minioPath)
                .fileHash(hash)
                .status(DocumentStatus.PROCESSING.name())
                .notebookId(notebookId)
                .build();
        doc = documentRepository.save(doc);

        // 8. Call ai-service synchronously
        EmbedRequest embedRequest = EmbedRequest.builder()
                .documentId(docId)
                .notebookId(notebookId)
                .minioPath(minioPath)
                .format(format)
                .build();

        try {
            EmbedResponse embedResponse = aiRestClient.post()
                    .uri("/internal/v1/ai/embed")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(embedRequest)
                    .retrieve()
                    .body(EmbedResponse.class);

            // 9. Success: update status to READY
            if (embedResponse != null && "COMPLETED".equals(embedResponse.getStatus())) {
                doc.setStatus(DocumentStatus.READY.name());
                log.info("Document {} embedded successfully with {} chunks", docId, embedResponse.getChunkCount());
            } else {
                String errMsg = embedResponse != null ? embedResponse.getError() : "Unknown error from ai-service";
                doc.setStatus(DocumentStatus.FAILED.name());
                doc.setErrorMsg(errMsg);
                log.warn("Embedding failed for document {}: {}", docId, errMsg);
            }
        } catch (Exception e) {
            // 10. Error: update status to FAILED
            doc.setStatus(DocumentStatus.FAILED.name());
            doc.setErrorMsg("AI service error: " + e.getMessage());
            log.error("AI service call failed for document {}: {}", docId, e.getMessage());
        }

        doc = documentRepository.save(doc);

        // 11. Return DocumentResponse
        return toDocumentResponse(doc);
    }

    @Transactional
    public void deleteDocument(UUID notebookId, UUID docId, UUID userId) {
        // 1. Ownership check
        notebookRepository.findByIdAndUserId(notebookId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notebook not found"));

        Document doc = documentRepository.findByIdAndNotebookId(docId, notebookId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));

        // 2. Delete MinIO object
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(doc.getMinioPath())
                            .build()
            );
            log.info("Deleted MinIO object: {}", doc.getMinioPath());
        } catch (Exception e) {
            log.warn("Failed to delete MinIO object {}: {}", doc.getMinioPath(), e.getMessage());
        }

        // 3. Call ai-service to clean up ChromaDB chunks
        try {
            aiRestClient.delete()
                    .uri("/internal/v1/ai/embed/" + docId + "?notebookId=" + notebookId)
                    .retrieve()
                    .toBodilessEntity();
            log.info("Deleted ChromaDB chunks for document {}", docId);
        } catch (Exception e) {
            log.warn("Failed to delete ChromaDB chunks for document {}: {}", docId, e.getMessage());
        }

        // 4. Delete from DB
        documentRepository.delete(doc);
        log.info("Deleted document {} from notebook {}", docId, notebookId);
    }

    private String detectFormat(String contentType, String filename) {
        if (contentType != null) {
            if (contentType.contains("pdf")) return "PDF";
            if (contentType.contains("markdown") || contentType.contains("text/plain")) {
                if (filename.toLowerCase().endsWith(".md")) return "MD";
                return "TXT";
            }
        }
        String lower = filename.toLowerCase();
        if (lower.endsWith(".pdf")) return "PDF";
        if (lower.endsWith(".md")) return "MD";
        if (lower.endsWith(".txt")) return "TXT";
        return "TXT";
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
