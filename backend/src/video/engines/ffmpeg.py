import json
import subprocess
from collections.abc import Generator
from pathlib import Path
from typing import Any

import numpy as np

from src.video.engine import (
    ColorPrimaries,
    ColorRange,
    ColorSpace,
    ColorTransfer,
    Frame,
    VideoEngineProtocol,
    VideoMetadata,
)
from src.video.exceptions import DecodeError
from src.video.schemas import VideoConfig


class FFmpeg(VideoEngineProtocol):
    def __init__(self, config: VideoConfig) -> None:
        self._config = config

    def get_metadata(self, path: str | Path) -> VideoMetadata:
        """
        ffprobe is a tool that ships with ffmpeg.
        it reads a video file and returns information about it without decoding any frames.
        We ask it to return JSON so we can parse it easily.
        """
        try:
            # fmt: off
            raw = subprocess.check_output(
                [
                    "ffprobe",
                    "-v", "error",              # suppress all logs except errors
                    "-select_streams", "v:0",   # v = video, 0 = first stream only
                                                # videos can have multiple streams (video, audio, subtitles)
                                                # we only care about the first video stream
                    "-show_entries",
                        "stream=width,height,r_frame_rate,nb_frames,"
                        "color_range,color_space,color_primaries,color_transfer,pix_fmt"
                        ":format=duration",     # format = container level info (not stream level)
                                                # duration lives at container level, not stream level
                    "-of","json",               # output format
                    str(path),
                ],
                text=True,                      # return string instead of bytes
            )
            # fmt: on
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"ffprobe failed: {path}") from e

        try:
            data: dict[str, Any] = json.loads(raw)
            stream = data["streams"][0]

            # r_frame_rate is a fraction string e.g. "30000/1001" for 29.97 fps
            # or "30/1" for exactly 30fps
            # we split and divide to get the actual float
            num, den = stream["r_frame_rate"].split("/")
            fps = float(num) / float(den)

            # duration is at the container (format) level, not stream level
            duration = float(data["format"]["duration"])

            # nb_frames is the exact frame count if the container has an index
            # some containers (e.g. MKV) don't store it, so we fall back to duration * fps
            # round() is safer than int() here because float math can give 29.999 instead of 30
            total_frames = int(stream.get("nb_frames", 0)) or round(duration * fps)

            # color_range tells us if the video uses:
            #   "tv" = limited range, Y is 16-235 (broadcast standard, most video files)
            #   "pc" = full range,    Y is 0-255  (screen recordings, computer graphics)
            # this matters because if we tell ffmpeg the wrong range on decode or encode
            # it will apply the wrong scaling and you get a washed out or crushed image
            color_range = stream.get("color_range", ColorRange.TV)

            # color_space (also called color matrix) defines how YUV was converted from RGB
            #   "bt709"     - modern HD video, most common
            #   "smpte170m" - older NTSC broadcast
            #   "bt470bg"   - older PAL broadcast
            # wrong matrix = wrong colours, slight green/magneta shift
            color_space = stream.get("color_space", ColorSpace.BT709)

            # color_primaries defines which physical display colours R G B map to
            #   "bt709"     - modern HD displays
            #   "bt470bg"   - older PAL displays
            # affects colour accuracy on wide colour displays
            color_primaries = stream.get("color_primaries", ColorPrimaries.BT709)

            # color_transfer is the gamma curve, how numeric values map to actual light output
            #   "bt709"     - standard HD gamma
            #   "bt2020"    - HDR
            # wrong gamma = image look too bright or too dark
            color_transfer = stream.get("color_transfer", ColorTransfer.BT709)

            # pix_fmt is the pixel format, defines how colour channels are stored in memory
            #   "yuv420p"   - most common, chroma (colour) is at half resolution of luma (brightness)
            #   "yuv422p"   - chroma at full horizontal resolution, used in broadcast
            #   "yuv444p"   - full chroma, no subsampling, used in professional/lossless
            # we decode to yuv420p regardless of source, since that's what opencv expects
            pix_fmt = stream.get("pix_fmt", "yuv420p")

            return VideoMetadata(
                width=int(stream["width"]),
                height=int(stream["height"]),
                fps=fps,
                total_frames=total_frames,
                duration=duration,
                color_range=color_range,
                color_space=color_space,
                color_primaries=color_primaries,
                color_transfer=color_transfer,
                pix_fmt=pix_fmt,
            )
        except (KeyError, ValueError) as e:
            raise RuntimeError(f"malformed ffprobe output: {path}") from e

    def iter_frames(self, path: str | Path) -> Generator[Frame]:
        """
        ffmpeg decodes the video file and writes raw pixel bytes to stdout.
        we read those bytes frame by frame and yield them as numpy arrays.

        why raw bytes through a pipe?
        because it's the simplest way to get frame data into python without
        a third party library. ffmpeg does the heavy decoding work,
        we just read the output.
        """

        # yuv420p frame size bytes
        # YUV420p layout in memory:
        #
        #   Y plane - one byte per pixel, full resolution (width * height bytes)
        #   U plane - one byte per 2x2 pixels, quarter resolution (width * height / 4 bytes)
        #   V plane - one byte per 2x2 pixels, quarter resolution (width * height / 4 bytes)
        #
        #   total   = width * height * 1.5
        #           = width * height * 3 // 2
        #
        # example: 1920x1080
        #   Y = 1920 * 1080 = 2,073,600 bytes
        #   U = 1920 * 1080 / 4 = 518,400 bytes
        #   V = 1920 * 1080 / 4 / 518,400 bytes
        #   total = 3,110,400 bytes per frame (~3MB)
        meta = self.get_metadata(path)
        w, h = meta.width, meta.height
        frame_bytes = w * h * 3 // 2

        # fmt: off
        cmd = [
                "ffmpeg",
                "-v", "error",      # suppress logs except errors

                # --- INPUT ---
                "-i", str(path),    # input file
                # colour flags on decode side - critical for colour correctness
                # these tell ffmpeg what colour space the SOURCE video uses
                # so it handles the raw bytes correctly when decoding
                # without, these, ffmpeg may guess wrong and apply wrong matrix/range
                # which causes the colour shift you saw before
                "-color_range",     meta.color_range,
                "-colorspace",      meta.color_space,
                "-color_primaries", meta.color_primaries,
                "-color_trc",       meta.color_transfer,

                # --- OUTPUT ---
                "-an",                  # no audio - we only want video frames
                                        # "an" = audio none

                "-f", "rawvideo",       # output format: raw bytes, no container
                                        # no mp4/mkv wrapper, just pure pixel data

                "-pix_fmt", "yuv420p",  # force output to yuv420p regardless of source format
                                        # opencv expects this format for YUV->BGR conversion
                                        # if source is yuv422p or yuv444p, ffmpeg converts it

                "pipe:1",               # write output to stdout (pipe:1)
                                        # pipe:0 = stdin, pipe:1 = stdout, pipe;2 = stderr
            ]
        # fmt: on
        decoder = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        idx = 0
        try:
            while True:
                # read exactly one frame worth of bytes from stdout
                # this blocks until ffmpeg has decoded and written a full frame
                # if the video ends, read() returns fewer bytes than expected
                if not decoder.stdout:
                    raise DecodeError("ffmpeg stdout is closed")

                chunk = decoder.stdout.read(frame_bytes)
                if len(chunk) < frame_bytes:
                    # end of video - ffmpeg closed the pipe
                    break

                # convert raw bytes to numpy array
                # frombuffer wraps the bytes without copying - efficient
                # reshape into (height * 1.5, width) which is how yuv420p is laid out:
                #
                #   rows 0      to h-1          = Y plane (full resolution luma)
                #   rows h      to h + h/4-1    = U plane (quarter resolution chroma)
                #   rows h+h/4  to h + h/2-1    = V plane (quarter resolution chroma)
                yuv = np.frombuffer(chunk, dtype=np.uint8).reshape(h * 3 // 2, w)

                yield Frame(index=idx, timestamp=idx / meta.fps, data=yuv)
                idx += 1
        finally:
            # always clean up the subprocess even if hte caller breaks out of the loop early
            # e.g. if cancel is set and pipeline stops iterating mid-video

            if decoder.stdout:
                decoder.stdout.close()

            # kill is safe here - we either finished naturally or are cancelling
            # SIGKILL is immediate, no graceful shutdown needed for a decoder
            decoder.kill()
            decoder.wait()  # wait for process to fully exit before continuing
            # avoids zombie processes

    def get_encoder(self, path: str | Path, out_path: str | Path) -> subprocess.Popen:
        """
        Builds and launches an ffmpeg encode subprocess.
        Returns the process handle - caller owns the life cycle.

        ffmpeg encode from a pipeworks like this:
            our python code writes raw YUV bytes to ffmpeg's stdin
            ffmpeg reads those bytes, encodes them, writes to output file
            when we close stdin, ffmpeg knows we're done and finalises the file

        why return the process instead of wrapping it?
            because the pipeline owns the loop, the cancel logic, and the cleanup
            no need to hide the process behind a class or context manager
            caller decides when to close stdin and when to wait
        """
        meta = self.get_metadata(path)

        # codec options:
        #
        #   "libx265"           - software HEVC encoder, works everywhere, slower
        #   "hevc_videotoolbox" - hardware HEVC encoder, Apple Silicon/Intel Mac only, faster
        #   "libx264"           - software H.264 encoder, works everywhere, fast, widely compatible
        #   "h264_videotoolbox" - hardware H.264 encoder, Apple Silicon/Intel Mac only, fastest
        #
        # HEVC (H.265) = better quality at same file size vs H.264, but slower to encode
        # and some older devices can't play it
        is_hevc = self._config.codec in {"hevc_videotoolbox", "libx265"}

        # quality scale for videotoolbox (hardware encoders):
        #   -q:v controls quality, range is 1-100
        #   higher = better quality, larger file
        #   for libx264/libx265 (software), -crf is more standard but -q:v works too
        #   typical values: 60-75 for good quality, 85+ for near lossless

        # colour flags - must match decode side exactly
        # on the encode side these tell ffmpeg two things:
        #   1. what colour space the raw bytes we're sending IN are (so it encodes correctly)
        #   2. what metadata to write INTO the output container (so players display correctly)
        # if these don't match the decode side, you get colour shift
        # fmt: off
        color_flags = [
            "-color_range",     meta.color_range,
            "-colorspace",      meta.color_space,
            "-color_primaries", meta.color_primaries,
            "-color_trc",       meta.color_transfer,
        ]

        cmd = [
            "ffmpeg",
            "-y",                   # overwrite output file if it exists without asking
            "-loglevel", "error",   # only print errors, not progress or info

            # --- PIPE INPUT (our raw YUV frames) ---
            "-f", "rawvideo",       # tell ffmpeg the input is raw bytes, no container
            "-pix_fmt", "yuv420p",  # tell ffmpeg the pixel format of our raw bytes
                                    # must match what iter_frames produces
            *color_flags,           # tell ffmpeg the colour space of our raw bytes
                                    # placed before -i so ffmpeg applies them to this input
            "-s", f"{meta.width}x{meta.height}",    # frame size - required for raw input
                                                    # ffmpeg can't detect this from raw bytes
            "-r", str(meta.fps),    # frame rate - required for raw input
                                    # tells ffmpeg how to set timestamps in the output
            "-i", "pipe:0",         # read input from stdin (pipe:0)

            # --- OPTIONAL AUDIO INPUT ---
            # we decode only video frames through the pipe (iter_frames uses -an)
            # so audio is completely absent from our pipe
            # to preserve the original audio, we open the source file as a second input
            # and copy the audio stream directly into the output without re-encoding
            "-i", str(path),

            # --- STREAM MAPPING ---
            # ffmpeg needs to know which streams go to the output
            # because we now have two inputs (pipe + audio file)
            "-map", "0:v",                  # 0 = first input (pipe), v = video stream
            "-map", "1:a", "-c:a", "copy",  # 1 = second input (audio file), a = audio stream
                                            # -c:a copy = copy audio without re-encoding
                                            # preserves original audio quality and avoids extra processing

            # --- VIDEO ENCODE ---
            "-c:v", self._config.codec,          # video codec to use for encoding
            "-q:v", str(self._config.quality),   # quality level (codec dependent)
            *color_flags,           # write colour metadata into output container
                                    # placed after -i so ffmpeg applies them to the output
                                    # same values as input - we're not changing colour space

            # --- CONTAINER FLAGS ---
            "-movflags", "+faststart",
                                    # moves the MP4 index (moov atom) to the start of the file
                                    # without this, the entire file must download before playback starts
                                    # with this, browsers and players can start playing immediately
                                    # essential for web delivery and tauri preview

            # --- HEVC SPECIFIC ---
            # "hvc1" is Apple's container tag for HEVC
            # without it, QuickTime and iOS refuse to play the file
            # "hev1" is the standard tag but Apple only accepts "hvc1"
            *(["-tag:v", "hvc1"] if is_hevc else []),

            str(out_path),            # output file path
        ]
        # fmt: on

        return subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,  # we write raw YUV frames here
            stderr=subprocess.PIPE,  # capture errors so we can raise them on failure
            # if we don't capture, errors go to terminal silently
        )

    def copy(self, src: str | Path, dst: str | Path) -> None:
        """
        Stream copy - fastest possible way to duplicate a video.

        why not just use shutil.copy()?
            shutil.copy copies the file byte for byte including any garbage,
            padding, or malformed data. ffmpeg with -c copy remuxes the file -
            it reads the container, validates the streams, and writes a clean
            new container. same content, cleaner file.

        what is remuxing?
            mux = multiplex = combine multiple streams (video, audio, subtitles)
                into one container file (mp4, mkv, etc.)
            remux = take streams out of one container, put into another
                    without touching the encoded data at all

        what is -c copy?
            -c = codec
            copy = don't re-encode, just copy the raw encoded packets as-is
            this means zero quality loss and near-instant processing
            a 2 minute video copies in under a second

        when do we use this?
            when OCR finds no subtitles - nothing to inpaint
            so we just copy the source to output and we're done
            no decode, no encode, no quality loss at all
        """
        try:
            # fmt: off
            subprocess.run(
                [
                    "ffmpeg",
                    "-y",                   # overwrite output if exists
                    "-loglevel", "error",   # only show errors
                    "-i", str(src),         # input file
                    "-c", "copy",           # copy all streams without re-encoding
                    str(dst),               # output file
                ],
                check=True,                 # raise CalledProcessError on non-zero exit
            )
            # fmt: on
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"ffmpeg copy failed: {src} -> {dst}") from e
