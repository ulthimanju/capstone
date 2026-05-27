-- Notebook Service Database Schema
-- Database: db_notebook
-- Spring Boot ddl-auto: validate (schema must exist before starting the service)

CREATE TABLE IF NOT EXISTS notebooks (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    title      VARCHAR(255) NOT NULL,
    user_id    UUID         NOT NULL,
    created_at TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    minio_path  VARCHAR(512) NOT NULL,
    file_hash   VARCHAR(64)  NOT NULL,
    status      VARCHAR(50)  NOT NULL,
    error_msg   TEXT,
    notebook_id UUID         NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_doc_dedup ON documents(notebook_id, file_hash);
CREATE INDEX IF NOT EXISTS idx_documents_notebook ON documents(notebook_id);
CREATE INDEX IF NOT EXISTS idx_notebooks_user ON notebooks(user_id);
