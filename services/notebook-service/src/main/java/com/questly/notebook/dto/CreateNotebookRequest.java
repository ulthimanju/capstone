package com.questly.notebook.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateNotebookRequest {

    @NotBlank(message = "Title must not be blank")
    private String title;
}
