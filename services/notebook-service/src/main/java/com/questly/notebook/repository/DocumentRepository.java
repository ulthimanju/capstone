package com.questly.notebook.repository;

import com.questly.notebook.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {

    List<Document> findByNotebookIdOrderByCreatedAtDesc(UUID notebookId);

    Optional<Document> findByNotebookIdAndFileHash(UUID notebookId, String fileHash);

    Optional<Document> findByIdAndNotebookId(UUID id, UUID notebookId);
}
