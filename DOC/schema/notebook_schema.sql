-- Questly Notebook Service Database Schema (db_notebook)
-- Canonical Source: DOC/data_modeling.md
-- Target Database: PostgreSQL

CREATE TABLE IF NOT EXISTS notebooks (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL,                      -- maps to db_auth.users.id
    name         VARCHAR(255) NOT NULL,
    description  TEXT,
    source_count INT NOT NULL DEFAULT 0,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notebook_id UUID NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL,                      -- maps to db_auth.users.id
    name        VARCHAR(255) NOT NULL,
    format      VARCHAR(20) NOT NULL,               -- PDF | MD | TXT | GDOC | GSLIDE
    minio_path  TEXT NOT NULL,
    word_count  INT,
    status      VARCHAR(20) NOT NULL DEFAULT 'PROCESSING', -- PROCESSING | READY | FAILED
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index to optimize fetching all documents for a notebook
CREATE INDEX IF NOT EXISTS idx_documents_notebook_id ON documents(notebook_id);
-- Index to optimize querying notebooks owned by a specific user
CREATE INDEX IF NOT EXISTS idx_notebooks_user_id ON notebooks(user_id);
