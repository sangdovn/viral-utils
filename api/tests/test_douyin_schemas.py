from src.douyin.schemas import Video, VideoResponse


def test_video_response_does_not_expose_audit_fields():
    video = Video(
        id=1,
        aweme_id="aweme-1",
        title="Title",
        translated_title=None,
        create_time=1,
        digg_count=10,
        duration=None,
        urls='["https://example.com/video.mp4"]',
        is_downloaded=False,
        user_id=2,
        created_at=3,
        updated_at=4,
    )

    response = VideoResponse.model_validate(video.model_dump())

    assert "created_at" not in response.model_dump()
    assert "updated_at" not in response.model_dump()
