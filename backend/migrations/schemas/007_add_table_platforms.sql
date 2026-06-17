CREATE TABLE IF NOT EXISTS platforms(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
	type TEXT CHECK (type IN ('facebook', 'tiktok', 'youtube')),
	name TEXT NOT NULL,
	url TEXT,
	status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'restricted', 'suspended', 'banned')),
    status_detail TEXT,
	system_id INTEGER NOT NULL REFERENCES systems(id) ON UPDATE CASCADE ON DELETE CASCADE,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
)