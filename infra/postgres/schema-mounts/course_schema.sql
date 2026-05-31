-- Questly Course Service Database Schema (db_course)
-- Canonical Source: DOC/data_modeling.md
-- Target Database: PostgreSQL

CREATE TABLE IF NOT EXISTS courses (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id     UUID NOT NULL,                      -- maps to db_auth.users.id
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    thumbnail    TEXT,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS modules (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    content     TEXT,
    order_index INT NOT NULL,
    drip_unlock BOOLEAN NOT NULL DEFAULT TRUE       -- true means unlock only when previous is done
);

CREATE TABLE IF NOT EXISTS enrollments (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL,                      -- maps to db_auth.users.id
    course_id        UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    progress         DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    unlocked_modules UUID[] NOT NULL DEFAULT '{}',       -- dynamic array of module UUIDs unlocked
    completed_modules UUID[] NOT NULL DEFAULT '{}',
    completed        BOOLEAN NOT NULL DEFAULT FALSE,
    enrolled_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, course_id)
);

-- Indexing for curriculum loading and user enrollment checks
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_tutor_id ON courses(tutor_id);
