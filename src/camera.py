from __future__ import annotations

import time
import platform
from dataclasses import dataclass
from typing import Iterator

import cv2
import numpy as np

from domain import CameraConfig


@dataclass
class CameraFrame:
    image: np.ndarray
    fps: float
    frame_index: int


class CameraError(RuntimeError):
    pass


class Webcam:
    def __init__(self, config: CameraConfig) -> None:
        self.config = config
        self.capture: cv2.VideoCapture | None = None
        self._last_frame_at = 0.0
        self._fps = 0.0
        self._frame_index = 0

    def open(self) -> None:
        self.capture = cv2.VideoCapture(self.config.index, self._backend())

        if not self.capture.isOpened():
            raise CameraError(f"Could not open webcam index {self.config.index}.")

        self.capture.set(cv2.CAP_PROP_BUFFERSIZE, self.config.buffer_size)
        self.capture.set(cv2.CAP_PROP_FRAME_WIDTH, self.config.width)
        self.capture.set(cv2.CAP_PROP_FRAME_HEIGHT, self.config.height)
        self.capture.set(cv2.CAP_PROP_FPS, self.config.target_fps)

    def frames(self) -> Iterator[CameraFrame]:
        if self.capture is None:
            self.open()

        assert self.capture is not None
        frame_delay = 1 / max(self.config.target_fps, 1)

        while True:
            started_at = time.perf_counter()
            ok, image = self.capture.read()

            if not ok or image is None:
                raise CameraError("Could not read a frame from the webcam.")

            now = time.perf_counter()
            elapsed = now - self._last_frame_at if self._last_frame_at else 0.0
            self._fps = 1 / elapsed if elapsed > 0 else 0.0
            self._last_frame_at = now
            self._frame_index += 1

            yield CameraFrame(image=image, fps=self._fps, frame_index=self._frame_index)

            spent = time.perf_counter() - started_at
            if spent < frame_delay:
                time.sleep(frame_delay - spent)

    def _backend(self) -> int:
        backend = self.config.backend.strip().lower()
        if backend == "dshow":
            return cv2.CAP_DSHOW
        if backend == "msmf":
            return cv2.CAP_MSMF
        if backend == "avfoundation":
            return cv2.CAP_AVFOUNDATION
        if backend == "v4l2":
            return cv2.CAP_V4L2
        if backend != "auto":
            return cv2.CAP_ANY
        if platform.system() == "Windows":
            return cv2.CAP_DSHOW
        if platform.system() == "Darwin":
            return cv2.CAP_AVFOUNDATION
        if platform.system() == "Linux":
            return cv2.CAP_V4L2
        return cv2.CAP_ANY

    def release(self) -> None:
        if self.capture is not None:
            self.capture.release()
            self.capture = None
