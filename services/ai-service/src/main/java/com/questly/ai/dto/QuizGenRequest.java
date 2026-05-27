package com.questly.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizGenRequest {
    private UUID notebookId;
    private List<DocumentPath> documents;
    private int count;
    private List<String> types;
    private List<String> topics;
}
