package com.questly.auth.security;

import com.questly.auth.dto.AuthResponse;
import com.questly.auth.model.OAuth2ExchangeCode;
import com.questly.auth.repository.OAuth2ExchangeCodeRepository;
import com.questly.auth.service.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Invoked by Spring Security after a successful Google OAuth2 callback.
 *
 * Security design:
 *  - Tokens are NEVER placed in the redirect URL.
 *  - Instead a short-lived (60 s) one-time UUID exchange code is persisted in
 *    the database and only that code is appended to the redirect URL.
 *  - The React SPA POSTs the code to /api/auth/oauth2/exchange over HTTPS to
 *    retrieve the tokens in the response body.
 *  - The code is deleted immediately on first use (single-use enforcement).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final int EXCHANGE_CODE_TTL_SECONDS = 60;

    private final AuthService authService;
    private final OAuth2ExchangeCodeRepository exchangeCodeRepository;

    @Value("${auth.frontend-redirect-url:http://localhost:5173/login}")
    private String frontendRedirectUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email    = oAuth2User.getAttribute("email");
        String name     = oAuth2User.getAttribute("name");
        String googleId = oAuth2User.getAttribute("sub"); // Google unique subject ID

        log.info("Google OAuth2 authentication successful for email={}", email);

        // Resolve (or create) the local Questly user and generate tokens
        AuthResponse authResponse = authService.oauth2LoginOrRegister(email, name, googleId);

        // Persist a short-lived exchange code that wraps the tokens
        String exchangeCode = UUID.randomUUID().toString();
        OAuth2ExchangeCode codeEntity = OAuth2ExchangeCode.builder()
                .code(exchangeCode)
                .userId(authResponse.getUserId())
                .accessToken(authResponse.getAccessToken())
                .refreshToken(authResponse.getRefreshToken())
                .expiryDate(OffsetDateTime.now().plusSeconds(EXCHANGE_CODE_TTL_SECONDS))
                .build();
        exchangeCodeRepository.save(codeEntity);

        log.info("Issued OAuth2 exchange code for userId={} (expires in {}s)",
                authResponse.getUserId(), EXCHANGE_CODE_TTL_SECONDS);

        // Redirect to the SPA with only the opaque exchange code — no tokens in URL
        String targetUrl = UriComponentsBuilder.fromUriString(frontendRedirectUrl)
                .queryParam("code", exchangeCode)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
