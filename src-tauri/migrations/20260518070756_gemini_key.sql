-- Add migration script here
CREATE TABLE IF NOT EXISTS gemini_keys (
    hash    TEXT    PRIMARY KEY NOT NULL, 
    name   TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expired INTEGER NOT NULL    DEFAULT 0 CHECK(expired IN (0, 1))
)