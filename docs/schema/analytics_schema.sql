-- Questly Analytics Service Database Schema (db_analytics)
-- Canonical Source: DOC/data_modeling.md
-- Target Database: PostgreSQL

CREATE TABLE IF NOT EXISTS activity_events (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL,                      -- maps to db_auth.users.id
    event_type VARCHAR(50) NOT NULL,               -- QUIZ_COMPLETED | MODULE_COMPLETED | etc.
    ref_id     UUID,                                -- references specific entity
    topic      VARCHAR(255),
    score      DECIMAL(5,2),
    duration_s INT,                                 -- duration in seconds
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_summaries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL,                      -- maps to db_auth.users.id
    date            DATE NOT NULL,
    xp_earned       INT NOT NULL DEFAULT 0,
    quizzes_taken   INT NOT NULL DEFAULT 0,
    avg_score       DECIMAL(5,2),
    cards_reviewed  INT NOT NULL DEFAULT 0,
    problems_solved INT NOT NULL DEFAULT 0,
    study_time_s    INT NOT NULL DEFAULT 0,
    UNIQUE (user_id, date)
);

-- Indexing for quick analytics dashboard lookups and time range queries
CREATE INDEX IF NOT EXISTS idx_activity_events_user_type ON activity_events(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_date ON daily_summaries(user_id, date);
