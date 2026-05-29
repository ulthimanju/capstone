-- db_auth schema DDL
-- Run this manually against the db_auth PostgreSQL database before starting auth-service.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role          VARCHAR(50)  NOT NULL DEFAULT 'STUDENT',
    display_name  VARCHAR(255),
    google_id     VARCHAR(255) UNIQUE,
    created_at    TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    token       VARCHAR(512) UNIQUE NOT NULL,
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expiry_date TIMESTAMPTZ  NOT NULL,
    created_at  TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP
);

-- OAuth2 one-time exchange codes (60-second TTL, single-use)
CREATE TABLE IF NOT EXISTS oauth2_exchange_codes (
    code         VARCHAR(255) PRIMARY KEY,
    user_id      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    access_token TEXT         NOT NULL,
    refresh_token VARCHAR(512) NOT NULL,
    expiry_date  TIMESTAMPTZ  NOT NULL,
    created_at   TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email             ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id         ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_refresh_token           ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_user_id         ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_exchange_codes_expiry   ON oauth2_exchange_codes(expiry_date);
