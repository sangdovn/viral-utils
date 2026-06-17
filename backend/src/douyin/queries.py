# ==============================================================================
# USER
# ==============================================================================

INSERT_USER = """
INSERT INTO users (
    sec_uid,
    name,
    translated_name,
    status,
    topic,
    niche,
    sub_niche,
    micro_niche,
    note,
    last_fetched
)
VALUES (
    :sec_uid,
    :name,
    :translated_name,
    :status,
    :topic,
    :niche,
    :sub_niche,
    :micro_niche,
    :note,
    :last_fetched
)
"""

UPSERT_USER = """
INSERT INTO users (
    sec_uid,
    name,
    translated_name,
    status,
    topic,
    niche,
    sub_niche,
    micro_niche,
    note,
    last_fetched
)
VALUES (
    :sec_uid,
    :name,
    :translated_name,
    :status,
    :topic,
    :niche,
    :sub_niche,
    :micro_niche,
    :note,
    :last_fetched
)
ON CONFLICT (sec_uid)
DO UPDATE SET
    name = EXCLUDED.name,
    translated_name = EXCLUDED.translated_name,
    status = EXCLUDED.status,
    topic = EXCLUDED.topic,
    niche = EXCLUDED.niche,
    sub_niche = EXCLUDED.sub_niche,
    micro_niche = EXCLUDED.micro_niche,
    note = EXCLUDED.note,
    last_fetched = EXCLUDED.last_fetched
"""

SELECT_USERS = "SELECT * FROM users"

# TODO: update this query, add OR filter when ready
SELECT_ACTIVE_USERS = """
SELECT *
FROM users
WHERE status IN ('active', 'testing')
AND (
    last_fetched IS NULL
)
"""
# OR date(last_fetched, 'unixepoch') < date('now')

SELECT_USER_BY_ID = "SELECT * FROM users WHERE id = :id"

SELECT_USER_BY_SEC_UID = "SELECT * FROM users WHERE sec_uid = :sec_uid"

UPDATE_USER_BY_ID = """
UPDATE users
SET
    name = :name,
    translated_name = :translated_name,
    status = :status,
    topic = :topic,
    niche = :niche,
    sub_niche = :sub_niche,
    micro_niche = :micro_niche,
    note = :note,
    last_fetched = :last_fetched
WHERE id = :id
"""


# ==============================================================================
# VIDEO
# ==============================================================================

INSERT_VIDEO = """
INSERT INTO videos (
    aweme_id,
    title,
    t_title,
    create_time,
    digg_count,
    duration,
    urls,
    is_downloaded,
    user_id
)
VALUES (
    :aweme_id,
    :title,
    :t_title,
    :create_time,
    :digg_count,
    :duration,
    :urls,
    :is_downloaded,
    :user_id
)
"""

UPSERT_VIDEO = """
INSERT INTO videos (
    aweme_id,
    title,
    t_title,
    create_time,
    digg_count,
    duration,
    urls,
    is_downloaded,
    user_id
)
VALUES (
    :aweme_id,
    :title,
    :t_title,
    :create_time,
    :digg_count,
    :duration,
    :urls,
    :is_downloaded,
    :user_id
)
ON CONFLICT (aweme_id)
DO UPDATE SET
    title = EXCLUDED.title,
    t_title = EXCLUDED.t_title,
    create_time = EXCLUDED.create_time,
    digg_count = EXCLUDED.digg_count,
    duration = EXCLUDED.duration,
    urls = EXCLUDED.urls,
    is_downloaded = EXCLUDED.is_downloaded,
    user_id = EXCLUDED.user_id
"""

SELECT_VIDEOS = "SELECT * FROM videos"

# TODO: update this query, add OR filter when ready
SELECT_AVAILABLE_VIDEOS = """
SELECT * FROM videos v
INNER JOIN users u ON v.user_id = u.id
WHERE u.status IN ('active', 'testing')
AND u.last_fetched IS NULL
AND v.is_downloaded = 0
"""
# OR date(last_fetched, 'unixepoch') < date('now')


SELECT_VIDEO_BY_ID = "SELECT * FROM videos WHERE id = :id"

SELECT_VIDEO_BY_AWEME_ID = "SELECT * FROM videos WHERE aweme_id = :aweme_id"

SELECT_VIDEOS_BY_USER_ID = "SELECT * FROM videos WHERE user_id = :user_id"

SELECT_SYSTEM_NAME_BY_VIDEO_ID = """
SELECT s.name, u.translated_name
FROM videos v
INNER JOIN users u ON v.user_id = u.id
LEFT JOIN systems s ON u.system_id = s.id
WHERE v.id = :id
"""

UPDATE_VIDEO_BY_ID = """
UPDATE videos
SET
    title = :title,
    t_title = :t_title,
    is_downloaded = :is_downloaded
WHERE id = :id
"""
