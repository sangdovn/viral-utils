SELECT_PLATFORMS = "SELECT * FROM platforms"

SELECT_PLATFORM_BY_ID = "SELECT * FROM platforms WHERE id = :id"

INSERT_PLATFORM = """
INSERT INTO platforms (
    type,
    name,
    url,
    status,
    reason,
    system_id
)
VALUES (
    :type,
    :name,
    :url,
    :status,
    :reason,
    :system_id
)
"""

UPDATE_PLATFORM_BY_ID = """
UPDATE platforms
SET
    type = :type,
    name = :name,
    url = :url,
    status = :status,
    reason = :reason,
    system_id = :system_id
WHERE id = :id
"""

DELETE_PLATFORM_BY_ID = "DELETE FROM platforms WHERE id = :id"
