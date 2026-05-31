-- Add migration script here

CREATE TABLE IF NOT EXISTS tts (
    id  TEXT    PRIMARY KEY NOT NULL ,
    path    TEXT    NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    time    REAL NOT NULL,
    ocr_id TEXT NOT NULL,
    FOREIGN KEY (ocr_id) REFERENCES ocr_text(id) ON DELETE CASCADE 
)
