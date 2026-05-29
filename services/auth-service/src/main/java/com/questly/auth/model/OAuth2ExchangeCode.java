package com.questly.auth.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Temporary one-time exchange code issued after a successful Google OAuth2 login.
 *
 * Flow:
 *  1. OAuth2SuccessHandler generates tokens and saves them here under a UUID code.
 *  2. Browser is redirected to the React SPA with only the code: ?code=UUID
 *  3. React SPA POSTs the code to /api/auth/oauth2/exchange
 *  4. AuthService looks up the code, returns the tokens in the response body,
 *     and immediately deletes this row (single-use enforcement).
 *
 * Rows with expired_date < NOW() are stale and will be rejected. A scheduled
 * cleanup job (or DB cron) can purge them periodically.
 */
@Entity
@Table(name = "oauth2_exchange_codes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OAuth2ExchangeCode {

    @Id
    @Column(name = "code", nullable = false, length = 255)
    private String code;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "access_token", nullable = false, columnDefinition = "TEXT")
    private String accessToken;

    @Column(name = "refresh_token", nullable = false, length = 512)
    private String refreshToken;

    @Column(name = "expiry_date", nullable = false)
    private OffsetDateTime expiryDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
