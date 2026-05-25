-- Questly Notification Service Database Schema (db_notification)
-- Canonical Source: DOC/data_modeling.md
-- Target Database: PostgreSQL

CREATE TABLE IF NOT EXISTS notifications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL,                      -- maps to db_auth.users.id
    title      VARCHAR(255) NOT NULL,
    body       TEXT NOT NULL,
    type       VARCHAR(50) NOT NULL,               -- BADGE_EARNED | ASSIGNMENT_GRADED | etc.
    ref_id     UUID,                                -- references specific entity (e.g. badgeId)
    is_read    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexing to optimize notification delivery lists for active students
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
