-- Add migration script here
CREATE TABLE IF NOT EXISTS ocr_text(
    id  TEXT    PRIMARY KEY,
    text    TEXT    NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)