-- Questly Practice Service Database Schema (db_practice)
-- Canonical Source: DOC/data_modeling.md
-- Target Database: PostgreSQL

CREATE TABLE IF NOT EXISTS practice_lists (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL,                      -- maps to db_auth.users.id
    name       VARCHAR(255) NOT NULL,
    platform   VARCHAR(100) DEFAULT 'LeetCode',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS practice_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id     UUID NOT NULL REFERENCES practice_lists(id) ON DELETE CASCADE,
    title       VARCHAR(255),
    problem_url TEXT NOT NULL,
    difficulty  VARCHAR(10),                        -- EASY | MEDIUM | HARD
    status      VARCHAR(20) NOT NULL DEFAULT 'UNSOLVED', -- UNSOLVED | ATTEMPTED | SOLVED
    solved_at   TIMESTAMP,
    added_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexing for lists and items to optimize list dashboards
CREATE INDEX IF NOT EXISTS idx_practice_lists_user_id ON practice_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_items_list_id ON practice_items(list_id);
