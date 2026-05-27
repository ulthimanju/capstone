package com.questly.flashcard.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashcardReviewedEvent {
    private UUID userId;
    private UUID cardId;
    private int rating;
    private LocalDate nextReview;
}
