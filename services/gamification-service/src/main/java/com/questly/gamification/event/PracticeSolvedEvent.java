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
public class PracticeSolvedEvent {
    private UUID userId;
    private UUID itemId;
    private UUID listId;
    private String difficulty;
    private String timestamp;
}
