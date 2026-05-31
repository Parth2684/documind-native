-- Add migration script here
CREATE TABLE IF NOT EXISTS ocr_text(
    id  TEXT    PRIMARY KEY NOT NULL,
    text    TEXT  UNIQUE  NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
)