from src.shared.schemas import EventStatus
from src.video.schemas import ProcessVideosRequest
from src.video.service import process


def test_process_returns_completed_when_input_dir_has_no_videos(tmp_path):
    request = ProcessVideosRequest(
        in_dir=str(tmp_path),
        out_dir=str(tmp_path / "out"),
    )

    events = list(
        process(
            request=request,
            video_engine=object(),
            ocr_engine=object(),
            ocr_config=object(),
            subtitle_config=object(),
            inpaint_engine=object(),
            inpaint_config=object(),
            llm_models=request.llm_models,
        )
    )

    assert len(events) == 1
    assert events[0].status == EventStatus.COMPLETED
    assert events[0].message == "No videos to process"
