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
public class XpAwardedEvent {
    private UUID userId;
    private int amount;
    private String reason;
    private UUID refId;
    @Builder.Default
    private String timestamp = LocalDateTime.now().toString();
}
