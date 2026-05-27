package com.questly.flashcard.repository;

import com.questly.flashcard.model.FlashcardReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FlashcardReviewRepository extends JpaRepository<FlashcardReview, UUID> {
    List<FlashcardReview> findByFlashcardId(UUID flashcardId);
}
