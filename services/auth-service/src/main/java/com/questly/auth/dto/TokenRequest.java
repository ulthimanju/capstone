package com.questly.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TokenRequest {

    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
}
