package com.questly.notebook.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.UUID;

@Data
public class QueryRequest {

    private UUID sessionId;

    @NotBlank(message = "Question must not be blank")
    private String question;
}
