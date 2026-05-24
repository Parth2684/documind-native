-- Add migration script here

CREATE TABLE IF NOT EXISTS tts (
    id  TEXT    PRIMARY KEY,
    path    TEXT    NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    time    REAL NOT NULL,
    ocr_id TEXT UNIQUE,
    FOREIGN KEY (ocr_id) REFERENCES ocr_text(id) ON DELETE CASCADE 
)
