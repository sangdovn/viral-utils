CREATE TRIGGER IF NOT EXISTS videos_updated_at
AFTER UPDATE ON videos
FOR EACH ROW
BEGIN
    UPDATE videos SET updated_at = unixepoch() WHERE id = OLD.id;
END;