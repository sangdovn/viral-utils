dev:
	uv run uvicorn src.main:app --host localhost --port 8000 --reload --log-level warning

test:
	uv run pytest

lint:
	uv run ruff check .

format:
	uv run ruff format .

check: lint test

migrate:
	uv run python -m migrations.drop
	uv run python -m migrations.create
	uv run python -m migrations.migrate

cache-clear:
	curl -X DELETE localhost:8000/video/cache/clear

create:
	curl -X POST localhost:8000/douyin/user \
	-H "Content-Type: application/json" \
	-d '{ \
		"sec_uid": "MS4wLjABAAAA1BnF4HJ9tSoak-t0S8aOGXR0eNfAng0mgjBz4TTpsby2D87B1y4Xv50A-c7W_tPh", \
		"topic": "test topic", \
		"niche": "test niche", \
		"sub_niche": "test sub niche", \
		"micro_niche": "test micro niche", \
		"note": "test note" \
	}'

fetch:
	curl -X GET localhost:8000/douyin/fetch_latest_videos

download:
	curl -X GET localhost:8000/douyin/download_latest_videos

fetch-download:
	curl -X GET localhost:8000/douyin/fetch_and_download_latest_videos
