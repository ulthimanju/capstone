package com.questly.notebook.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class QueryRequest {

    @NotBlank(message = "Question must not be blank")
    private String question;
}
