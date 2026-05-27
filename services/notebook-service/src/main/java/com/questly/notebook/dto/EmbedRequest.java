package com.questly.notebook.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmbedRequest {

    private UUID documentId;
    private UUID notebookId;
    private String minioPath;
    private String format;
}
