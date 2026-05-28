package com.questly.practice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PracticeStatsResponse {
    private long totalProblems;
    private long solved;
    private long attempted;
    private long unsolved;
}
