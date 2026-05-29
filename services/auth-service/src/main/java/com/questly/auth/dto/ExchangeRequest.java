package com.questly.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request body for POST /api/auth/oauth2/exchange.
 * The React SPA sends the short-lived one-time code received via the redirect
 * query parameter to obtain the JWT access and refresh tokens in the response body,
 * keeping tokens out of browser history and server logs entirely.
 */
@Data
public class ExchangeRequest {

    @NotBlank(message = "Exchange code is required")
    private String code;
}
