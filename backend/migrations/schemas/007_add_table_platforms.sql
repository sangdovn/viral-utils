CREATE TABLE IF NOT EXISTS platforms(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
	type TEXT NOT NULL CHECK (type IN ('facebook', 'tiktok', 'youtube')),
	name TEXT NOT NULL,
	url TEXT,
	status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'restricted', 'suspended', 'banned')),
    reason TEXT,
	system_id INTEGER REFERENCES systems(id),
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
)