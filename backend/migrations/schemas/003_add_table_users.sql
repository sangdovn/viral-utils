CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sec_uid TEXT NOT NULL UNIQUE,
    name TEXT,
    translated_name TEXT,
    status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'testing', 'pending', "dropped")),
    topic TEXT,
    niche TEXT,
    sub_niche TEXT,
    micro_niche TEXT,
    note TEXT,
    last_fetched INTEGER,
    system_id INTEGER REFERENCES systems(id),
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
