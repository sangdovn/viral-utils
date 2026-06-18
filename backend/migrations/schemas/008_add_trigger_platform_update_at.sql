CREATE TRIGGER IF NOT EXISTS platforms_updated_at
AFTER UPDATE ON platforms
FOR EACH ROW
BEGIN
    UPDATE platforms SET updated_at = unixepoch() WHERE id = OLD.id;
END;