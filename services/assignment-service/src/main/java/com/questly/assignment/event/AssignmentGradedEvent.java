package com.questly.assignment.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentGradedEvent {
    private UUID submissionId;
    private UUID userId;
    private BigDecimal grade;
    private String feedback;
    @Builder.Default
    private String timestamp = LocalDateTime.now().toString();
}
