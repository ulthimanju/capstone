package com.questly.notebook.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmbedResponse {

    private String status;
    private int chunkCount;
    private String collectionId;
    private String error;
}
