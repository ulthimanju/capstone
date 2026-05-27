package com.questly.notebook.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotebookResponse {

    private UUID id;
    private String title;
    private UUID userId;
    private OffsetDateTime createdAt;
    private int documentCount;
}
