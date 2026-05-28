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
public class ModuleCompletedEvent {
    private UUID userId;
    private UUID courseId;
    private UUID moduleId;
    private String timestamp;
}
