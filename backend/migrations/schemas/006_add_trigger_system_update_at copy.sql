CREATE TRIGGER IF NOT EXISTS systems_updated_at
AFTER UPDATE ON systems
FOR EACH ROW
BEGIN
    UPDATE systems SET updated_at = unixepoch() WHERE id = OLD.id;
END;