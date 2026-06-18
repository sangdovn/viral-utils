SELECT_SYSTEMS = "SELECT * FROM systems"

SELECT_SYSTEM_BY_ID = "SELECT * FROM systems WHERE id = :id"

INSERT_SYSTEM = """
INSERT INTO systems (
    name,
    description
)
VALUES (
    :name,
    :description
)
"""

UPDATE_SYSTEM_BY_ID = """
UPDATE systems
SET
    name = :name,
    description = :description
WHERE id = :id
"""

DELETE_SYSTEM_BY_ID = "DELETE FROM systems WHERE id = :id"
