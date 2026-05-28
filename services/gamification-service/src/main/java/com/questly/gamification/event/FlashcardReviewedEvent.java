package com.questly.gamification.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashcardReviewedEvent {
    private UUID userId;
    private UUID flashcardId;
    private int rating;
    private String nextReview;
    private String timestamp;
}
