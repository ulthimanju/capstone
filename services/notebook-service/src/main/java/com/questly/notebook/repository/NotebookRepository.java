package com.questly.notebook.repository;

import com.questly.notebook.model.Notebook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotebookRepository extends JpaRepository<Notebook, UUID> {

    List<Notebook> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Notebook> findByIdAndUserId(UUID id, UUID userId);
}
