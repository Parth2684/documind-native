-- Add migration script here
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS vault (
    id INTEGER  PRIMARY KEY CHECK(id = 1),
    present BOOLEAN NOT NULL DEFAULT 0 CHECK (present IN (0, 1))
)