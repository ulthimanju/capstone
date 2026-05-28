package com.questly.course.event;

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
public class ModuleCompletedEvent {
    private UUID userId;
    private UUID courseId;
    private UUID moduleId;
    @Builder.Default
    private String timestamp = LocalDateTime.now().toString();
}
