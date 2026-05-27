package com.questly.quiz.repository;

import com.questly.quiz.model.WeakSpot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WeakSpotRepository extends JpaRepository<WeakSpot, UUID> {
    List<WeakSpot> findByUserIdAndNotebookIdAndIsActiveTrue(UUID userId, UUID notebookId);
    List<WeakSpot> findByUserIdAndIsActiveTrue(UUID userId);
    Optional<WeakSpot> findByUserIdAndNotebookIdAndTopic(UUID userId, UUID notebookId, String topic);
}
