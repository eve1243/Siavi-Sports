from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

import numpy as np


Box = tuple[int, int, int, int]


@dataclass
class FaceDetection:
    box: Box
    confidence: float
    embedding: np.ndarray
    name: str = "unknown"
    similarity: float = 0.0
    crop: np.ndarray | None = None


@dataclass
class GestureDetection:
    box: Box | None
    label: str
    confidence: float
    handedness: str = "hand"
    landmarks: list[tuple[int, int]] = field(default_factory=list)
    connections: list[tuple[int, int]] = field(default_factory=list)


@dataclass
class CameraConfig:
    index: int = 0
    width: int = 1280
    height: int = 720
    target_fps: int = 24


@dataclass
class FaceConfig:
    enabled: bool = True
    model_name: str = "buffalo_l"
    detection_size: tuple[int, int] = (640, 640)
    recognition_threshold: float = 0.38
    opencv_threshold: float = 72.0
    database_path: str = "data/faces.json"
    providers: list[str] = field(default_factory=lambda: ["CPUExecutionProvider"])


@dataclass
class GestureConfig:
    enabled: bool = True
    max_hands: int = 2
    detection_confidence: float = 0.55
    tracking_confidence: float = 0.55
    fallback_label: str = "unknown"


@dataclass
class OverlayConfig:
    debug: bool = True
    mirror: bool = True
    snapshot_dir: str = "snapshots"


@dataclass
class AppConfig:
    camera: CameraConfig = field(default_factory=CameraConfig)
    face: FaceConfig = field(default_factory=FaceConfig)
    gesture: GestureConfig = field(default_factory=GestureConfig)
    overlay: OverlayConfig = field(default_factory=OverlayConfig)


def normalize_box(raw_box: Any) -> Box:
    x1, y1, x2, y2 = [int(round(float(value))) for value in raw_box[:4]]
    return x1, y1, x2, y2
