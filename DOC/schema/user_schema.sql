-- Questly User Service Database Schema (db_user)
-- Canonical Source: DOC/data_modeling.md
-- Target Database: PostgreSQL

CREATE TABLE IF NOT EXISTS profiles (
    id          UUID PRIMARY KEY,                    -- maps exactly to db_auth.users.id
    name        VARCHAR(255) NOT NULL,
    avatar_url  TEXT,
    bio         TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_stats (
    user_id          UUID PRIMARY KEY,               -- maps exactly to db_auth.users.id
    xp               INT NOT NULL DEFAULT 0,          -- Materialized cache sum; audited by xp_ledger
    streak           INT NOT NULL DEFAULT 0,
    last_active_at   TIMESTAMP WITH TIME ZONE,
    total_quizzes    INT NOT NULL DEFAULT 0,
    total_flashcards INT NOT NULL DEFAULT 0,
    total_solved     INT NOT NULL DEFAULT 0
);
