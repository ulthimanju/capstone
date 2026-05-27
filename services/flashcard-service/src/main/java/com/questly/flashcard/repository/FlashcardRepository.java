package com.questly.flashcard.repository;

import com.questly.flashcard.model.Flashcard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface FlashcardRepository extends JpaRepository<Flashcard, UUID> {
    List<Flashcard> findByUserIdAndNotebookId(UUID userId, UUID notebookId);
    List<Flashcard> findByUserIdAndNextReviewLessThanEqual(UUID userId, LocalDate date);
    List<Flashcard> findByUserIdAndNotebookIdAndNextReviewLessThanEqual(UUID userId, UUID notebookId, LocalDate date);
}
