-- Questly Flashcard Service Database Schema (db_flashcard)
-- Canonical Source: DOC/data_modeling.md
-- Target Database: PostgreSQL

CREATE TABLE IF NOT EXISTS flashcards (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notebook_id UUID NOT NULL,                      -- maps to db_notebook.notebooks.id
    user_id     UUID NOT NULL,                      -- maps to db_auth.users.id
    question    TEXT NOT NULL,
    answer      TEXT NOT NULL,
    -- SM-2 Scheduling variables
    ease_factor DECIMAL(4,2) NOT NULL DEFAULT 2.50,
    interval    INT NOT NULL DEFAULT 1,             -- Repetition interval in days
    repetitions INT NOT NULL DEFAULT 0,              -- Number of consecutive correct reviews
    next_review DATE NOT NULL DEFAULT CURRENT_DATE,  -- Date of next scheduled review
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS flashcard_reviews (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL,                      -- maps to db_auth.users.id
    rating       INT NOT NULL CHECK (rating BETWEEN 0 AND 5),
    -- SM-2 Scale: 0=Forgot, 2=Incorrect/Easy, 4=Correct/Hesitant, 5=Perfect
    reviewed_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexing for fast review scheduling query lookups
CREATE INDEX IF NOT EXISTS idx_flashcards_user_notebook ON flashcards(user_id, notebook_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_due_date ON flashcards(user_id, next_review);
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_card_id ON flashcard_reviews(flashcard_id);
