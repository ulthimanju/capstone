package com.questly.practice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PracticeItemRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String problemUrl;
    @NotBlank
    private String difficulty; // EASY | MEDIUM | HARD
}
