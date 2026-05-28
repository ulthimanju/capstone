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
public class ChallengeCompletedEvent {
    private UUID challengeId;
    private UUID challengerId;
    private UUID opponentId;
    private UUID winnerId;
    @Builder.Default
    private String timestamp = LocalDateTime.now().toString();
}
