-- db_user schema DDL
-- Run this manually against the db_user PostgreSQL database before starting user-service.

CREATE TABLE IF NOT EXISTS user_profiles (
    id           UUID         PRIMARY KEY,
    email        VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    role         VARCHAR(50)  NOT NULL,
    created_at   TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_stats (
    user_id      UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
    xp           INT  NOT NULL DEFAULT 0,
    streak       INT  NOT NULL DEFAULT 0,
    last_active  TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
