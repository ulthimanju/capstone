package com.questly.gamification.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDispatchEvent {
    private UUID userId;
    private String title;
    private String body;
    private String type; // DOCUMENT_FAILED | SKILL_TREE_UNLOCKED | BADGE_EARNED | CHALLENGE_COMPLETED
    private UUID refId;
    @Builder.Default
    private String timestamp = LocalDateTime.now().toString();
}
