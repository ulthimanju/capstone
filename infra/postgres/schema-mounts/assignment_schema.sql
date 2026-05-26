-- Questly Assignment Service Database Schema (db_assignment)
-- Canonical Source: DOC/data_modeling.md
-- Target Database: PostgreSQL

CREATE TABLE IF NOT EXISTS assignments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id   UUID NOT NULL,                      -- maps to db_course.courses.id
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    rubric      TEXT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submissions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL,                      -- maps to db_auth.users.id
    content       TEXT,
    file_path     TEXT,                               -- maps to storage location in MinIO
    ai_grade      DECIMAL(5,2),
    ai_feedback   TEXT,
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING | GRADED
    submitted_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    graded_at     TIMESTAMP
);

-- Indexing for assignments per course and user submissions lookup
CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
