-- Questly Gamification Service Database Schema (db_gamification)
-- Canonical Source: DOC/data_modeling.md
-- Target Database: PostgreSQL

CREATE TABLE IF NOT EXISTS xp_ledger (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL,                      -- maps to db_auth.users.id
    amount     INT NOT NULL,
    reason     VARCHAR(100) NOT NULL,               -- QUIZ_COMPLETED | FLASHCARD_REVIEWED | etc.
    ref_id     UUID,                                -- quiz_id | flashcard_id | module_id
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS badges (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT,
    icon            TEXT,
    condition_type  VARCHAR(50) NOT NULL,           -- XP_THRESHOLD | STREAK | QUIZ_COUNT
    condition_value INT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_badges (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id   UUID NOT NULL,                      -- maps to db_auth.users.id
    badge_id  UUID NOT NULL REFERENCES badges(id),
    earned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS skill_tree_nodes (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label            VARCHAR(255) NOT NULL,
    description      TEXT,
    prerequisites    UUID[] NOT NULL DEFAULT '{}',  -- array of prerequisites node UUIDs
    unlock_condition VARCHAR(100),                  -- QUIZ_PASS | MODULE_COMPLETE
    unlock_ref_id    UUID
);

CREATE TABLE IF NOT EXISTS user_skill_progress (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL,                      -- maps to db_auth.users.id
    node_id      UUID NOT NULL REFERENCES skill_tree_nodes(id),
    unlocked     BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP,
    UNIQUE (user_id, node_id)
);

CREATE TABLE IF NOT EXISTS challenges (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id       UUID NOT NULL,                      -- maps to db_quiz.quizzes.id
    challenger_id UUID NOT NULL,                      -- maps to db_auth.users.id
    opponent_id   UUID NOT NULL,                      -- maps to db_auth.users.id
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING | ACCEPTED | REJECTED | ACTIVE | COMPLETED
    winner_id     UUID,                               -- maps to db_auth.users.id
    version       INT NOT NULL DEFAULT 0,              -- Version column for optimistic locking protection
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexing to optimize leaderboard, profile progress, and ledger sums
CREATE INDEX IF NOT EXISTS idx_xp_ledger_user ON xp_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skill_progress_user ON user_skill_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_challenger_opponent ON challenges(challenger_id, opponent_id);
