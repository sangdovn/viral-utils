CREATE INDEX IF NOT EXISTS idx_videos_create_time_id
ON videos(create_time DESC, id DESC);
