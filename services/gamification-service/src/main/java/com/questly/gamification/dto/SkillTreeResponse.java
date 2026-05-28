package com.questly.gamification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillTreeResponse {
    private List<NodeDto> nodes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NodeDto {
        private UUID id;
        private String label;
        private String description;
        private boolean unlocked;
        private boolean completed;
        private LocalDateTime completedAt;
        private List<UUID> prerequisites;
    }
}
