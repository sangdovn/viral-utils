dev:
	uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000 --log-level debug

test:
	uv run pytest

lint:
	uv run ruff check .

format:
	uv run ruff format .

format-check:
	uv run ruff format --check .

check:
	lint format-check test

gen:
	uv run alembic revision --autogenerate -m "$(m)"

up:
	uv run alembic upgrade head

downbase:
	uv run alembic downgrade base