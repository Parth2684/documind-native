-- Add migration script here
CREATE TABLE IF NOT EXISTS ocr_text(
    id  TEXT    PRIMARY KEY NOT NULL,
    text    TEXT    NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)