-- Questly Quiz Service Database Schema (db_quiz)
-- Canonical Source: DOC/data_modeling.md
-- Target Database: PostgreSQL

CREATE TABLE IF NOT EXISTS quizzes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notebook_id UUID NOT NULL,                      -- maps to db_notebook.notebooks.id
    user_id     UUID NOT NULL,                      -- maps to db_auth.users.id
    title       VARCHAR(255),
    questions   JSONB NOT NULL,                     -- array of question objects (structured)
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- JSONB format details:
-- [
--   {
--     "id": "uuid",
--     "type": "MCQ | FILL | SHORT",
--     "question": "...",
--     "options": ["A","B","C","D"],   -- MCQ only
--     "answer": "...",
--     "topic": "..."
--   }
-- ]

CREATE TABLE IF NOT EXISTS quiz_attempts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id         UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL,                      -- maps to db_auth.users.id
    score           DECIMAL(5,2) NOT NULL,
    total_questions INT NOT NULL,
    wrong_topic_ids TEXT[],                          -- array of topic labels for weak spots
    challenge_id    UUID,                            -- references db_gamification.challenges.id
    completed_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weak_spots (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL,                      -- maps to db_auth.users.id
    notebook_id    UUID NOT NULL,                      -- maps to db_notebook.notebooks.id
    topic          VARCHAR(255) NOT NULL,
    wrong_count    INT NOT NULL DEFAULT 1,
    correct_streak INT NOT NULL DEFAULT 0,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    last_seen_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, notebook_id, topic)
);

-- Indexing user_id and notebook_id on quiz attempts and weak spots for analytics & reviews
CREATE INDEX IF NOT EXISTS idx_quizzes_notebook_id ON quizzes(notebook_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_challenge_id ON quiz_attempts(challenge_id);
CREATE INDEX IF NOT EXISTS idx_weak_spots_user_notebook ON weak_spots(user_id, notebook_id);
