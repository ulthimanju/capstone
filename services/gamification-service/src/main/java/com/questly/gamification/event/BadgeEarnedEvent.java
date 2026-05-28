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
public class BadgeEarnedEvent {
    private UUID userId;
    private UUID badgeId;
    private String badgeName;
    @Builder.Default
    private String timestamp = LocalDateTime.now().toString();
}
