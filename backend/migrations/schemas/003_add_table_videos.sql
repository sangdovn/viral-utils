CREATE TABLE IF NOT EXISTS videos(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aweme_id TEXT NOT NULL UNIQUE,
    title TEXT,
    t_title TEXT,
    create_time INTEGER,
    digg_count INTEGER,
    duration INTEGER,
    urls TEXT,
    is_downloaded INTEGER DEFAULT 0 CHECK (is_downloaded IN (0, 1)),
    user_id INTEGER NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);