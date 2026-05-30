package com.questly.notebook.repository;

import com.questly.notebook.model.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, UUID> {
    List<ChatSession> findByNotebookIdOrderByUpdatedAtDesc(UUID notebookId);
    Optional<ChatSession> findByIdAndNotebookId(UUID id, UUID notebookId);
}
