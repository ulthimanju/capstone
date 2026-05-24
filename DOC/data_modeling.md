# Questly — Data Modeling

> **Completed**: 2026-05-24
> **Author**: Manju (Solo Developer)
> **Scope**: PostgreSQL schema per service (schema-per-service isolation) + ChromaDB collection structure

---

## Status Summary

| # | Task | Status | Notes |
|---|---|---|---|
| 24 | Draft Entity-Relationship Diagram (ERD) | ✅ Done | All 18 core entities defined |
| 25 | Define PostgreSQL schema per service | ✅ Done | Schema-per-service isolation |
| 26 | Define ChromaDB collection structure | ✅ Done | Collection naming, metadata, dimensions |

---

## 25. PostgreSQL Schema — Per Service

---

### Auth Service — `db_auth`

```sql
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255),                        -- null for OAuth users
    role        VARCHAR(20) NOT NULL DEFAULT 'STUDENT', -- STUDENT | TUTOR | ADMIN
    provider    VARCHAR(20) DEFAULT 'LOCAL',          -- LOCAL | GOOGLE
    provider_id VARCHAR(255),                         -- Google sub ID
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       TEXT NOT NULL UNIQUE,
    expires_at  TIMESTAMP NOT NULL,
    revoked     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

### User Service — `db_user`

```sql
CREATE TABLE profiles (
    id          UUID PRIMARY KEY,                    -- same as users.id
    name        VARCHAR(255) NOT NULL,
    avatar_url  TEXT,
    bio         TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE user_stats (
    user_id          UUID PRIMARY KEY,
    xp               INT NOT NULL DEFAULT 0,          -- materialized cache; source of truth is xp_ledger
    streak           INT NOT NULL DEFAULT 0,
    last_active_at   TIMESTAMP,
    total_quizzes    INT NOT NULL DEFAULT 0,
    total_flashcards INT NOT NULL DEFAULT 0,
    total_solved     INT NOT NULL DEFAULT 0
);
```

---

### Notebook Service — `db_notebook`

```sql
CREATE TABLE notebooks (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL,
    name         VARCHAR(255) NOT NULL,
    description  TEXT,
    source_count INT NOT NULL DEFAULT 0,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE documents (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notebook_id UUID NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL,
    name        VARCHAR(255) NOT NULL,
    format      VARCHAR(20) NOT NULL,               -- PDF | MD | TXT | GDOC | GSLIDE
    minio_path  TEXT NOT NULL,
    word_count  INT,
    status      VARCHAR(20) NOT NULL DEFAULT 'PROCESSING', -- PROCESSING | READY | FAILED
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

### Quiz Service — `db_quiz`

```sql
CREATE TABLE quizzes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notebook_id UUID NOT NULL,
    user_id     UUID NOT NULL,
    title       VARCHAR(255),
    questions   JSONB NOT NULL,                     -- array of question objects
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- questions JSONB structure:
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

CREATE TABLE quiz_attempts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id         UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL,
    score           DECIMAL(5,2) NOT NULL,
    total_questions INT NOT NULL,
    wrong_topic_ids TEXT[],                          -- array of topic strings
    completed_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE weak_spots (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL,
    notebook_id    UUID NOT NULL,
    topic          VARCHAR(255) NOT NULL,
    wrong_count    INT NOT NULL DEFAULT 1,
    correct_streak INT NOT NULL DEFAULT 0,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    last_seen_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, notebook_id, topic)
);
```

---

### Flashcard Service — `db_flashcard`

```sql
CREATE TABLE flashcards (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notebook_id UUID NOT NULL,
    user_id     UUID NOT NULL,
    question    TEXT NOT NULL,
    answer      TEXT NOT NULL,
    -- SM-2 fields
    ease_factor DECIMAL(4,2) NOT NULL DEFAULT 2.50,
    interval    INT NOT NULL DEFAULT 1,             -- days until next review
    repetitions INT NOT NULL DEFAULT 0,
    next_review DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE flashcard_reviews (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL,
    rating       INT NOT NULL CHECK (rating BETWEEN 0 AND 5),
    -- SM-2 scale: 0=Blackout, 1=Wrong, 2=Hard, 3=Correct(effort), 4=Good, 5=Easy
    -- UI maps 4 buttons → values: Again=0, Hard=2, Good=4, Easy=5
    reviewed_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

### Course Service — `db_course`

```sql
CREATE TABLE courses (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id     UUID NOT NULL,
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    thumbnail    TEXT,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE modules (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    content     TEXT,
    order_index INT NOT NULL,
    drip_unlock BOOLEAN NOT NULL DEFAULT TRUE       -- unlock only after prev module done
);

CREATE TABLE enrollments (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL,
    course_id        UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    progress         DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    unlocked_modules UUID[] NOT NULL DEFAULT '{}',
    completed        BOOLEAN NOT NULL DEFAULT FALSE,
    enrolled_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, course_id)
);
```

---

### Assignment Service — `db_assignment`

```sql
CREATE TABLE assignments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id   UUID NOT NULL,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    rubric      TEXT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE submissions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL,
    content       TEXT,
    file_path     TEXT,
    ai_grade      DECIMAL(5,2),
    ai_feedback   TEXT,
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING | GRADED
    submitted_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    graded_at     TIMESTAMP
);
```

---

### Practice Service — `db_practice`

```sql
CREATE TABLE practice_lists (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL,
    name       VARCHAR(255) NOT NULL,
    platform   VARCHAR(100) DEFAULT 'LeetCode',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE practice_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id     UUID NOT NULL REFERENCES practice_lists(id) ON DELETE CASCADE,
    title       VARCHAR(255),
    problem_url TEXT NOT NULL,
    difficulty  VARCHAR(10),                        -- EASY | MEDIUM | HARD
    status      VARCHAR(20) NOT NULL DEFAULT 'UNSOLVED', -- UNSOLVED | ATTEMPTED | SOLVED
    solved_at   TIMESTAMP,
    added_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

### Gamification Service — `db_gamification`

```sql
CREATE TABLE xp_ledger (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL,
    amount     INT NOT NULL,
    reason     VARCHAR(100) NOT NULL,               -- QUIZ_COMPLETED | FLASHCARD_REVIEWED | etc.
    ref_id     UUID,                                -- quiz_id | flashcard_id | module_id
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
    -- xp_ledger is the audit log / source of truth
    -- user_stats.xp is a materialized cache updated via xp.awarded Kafka event
);

CREATE TABLE badges (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT,
    icon            TEXT,
    condition_type  VARCHAR(50) NOT NULL,           -- XP_THRESHOLD | STREAK | QUIZ_COUNT | etc.
    condition_value INT NOT NULL
);

CREATE TABLE user_badges (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id   UUID NOT NULL,
    badge_id  UUID NOT NULL REFERENCES badges(id),
    earned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, badge_id)
);

CREATE TABLE skill_tree_nodes (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label            VARCHAR(255) NOT NULL,
    description      TEXT,
    prerequisites    UUID[] NOT NULL DEFAULT '{}',  -- array of node IDs
    unlock_condition VARCHAR(100),                  -- QUIZ_PASS | MODULE_COMPLETE | etc.
    unlock_ref_id    UUID
);

CREATE TABLE user_skill_progress (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL,
    node_id      UUID NOT NULL REFERENCES skill_tree_nodes(id),
    unlocked     BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP,
    UNIQUE (user_id, node_id)
);

CREATE TABLE challenges (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id       UUID NOT NULL,
    challenger_id UUID NOT NULL,
    opponent_id   UUID NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING | ACCEPTED | REJECTED | ACTIVE | COMPLETED
    winner_id     UUID,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
    -- challenge.completed is produced and consumed by gamification-service (separate consumer group)
    -- self-consumption is intentional: producer handles lifecycle, consumer triggers XP award logic
);
```

---

### Analytics Service — `db_analytics`

```sql
CREATE TABLE activity_events (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,               -- QUIZ_COMPLETED | MODULE_COMPLETED | etc.
    ref_id     UUID,
    topic      VARCHAR(255),
    score      DECIMAL(5,2),
    duration_s INT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE daily_summaries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL,
    date            DATE NOT NULL,
    xp_earned       INT NOT NULL DEFAULT 0,
    quizzes_taken   INT NOT NULL DEFAULT 0,
    avg_score       DECIMAL(5,2),
    cards_reviewed  INT NOT NULL DEFAULT 0,
    problems_solved INT NOT NULL DEFAULT 0,
    study_time_s    INT NOT NULL DEFAULT 0,
    UNIQUE (user_id, date)
);
```

---

### Notification Service — `db_notification`

```sql
CREATE TABLE notifications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL,
    title      VARCHAR(255) NOT NULL,
    body       TEXT NOT NULL,
    type       VARCHAR(50) NOT NULL,               -- BADGE_EARNED | ASSIGNMENT_GRADED | etc.
    ref_id     UUID,
    is_read    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## 26. ChromaDB Collection Structure

ChromaDB uses one collection per notebook for strict isolation.

**Collection Naming:**
```
notebook_{notebook_id}
```

**Document Metadata Schema (per chunk):**
```json
{
  "document_id": "uuid",
  "notebook_id": "uuid",
  "user_id":     "uuid",
  "chunk_index": 0,
  "source_name": "lecture_notes.pdf",
  "format":      "PDF",
  "page":        3,
  "word_count":  128,
  "created_at":  "2026-05-22T10:00:00Z"
}
```

**Embedding Model:** `nomic-embed-text` via Ollama
**Embedding Dimensions:** 768
**Distance Function:** Cosine similarity
**Chunk Size:** 512 tokens
**Chunk Overlap:** 64 tokens

**Query Flow:**
```
User query
  → embed query via nomic-embed-text
  → similarity search in notebook_{id} collection
  → retrieve top-5 chunks
  → inject chunks into LLM prompt
  → llama3.2:3b generates grounded answer
```
