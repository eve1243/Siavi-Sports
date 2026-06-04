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
class ExerciseDetection:
    label: str
    confidence: float
    source: str
    state: str = "unknown"
    repetitions: int = 0
    landmarks: list[tuple[int, int]] = field(default_factory=list)
    connections: list[tuple[int, int]] = field(default_factory=list)
    features: np.ndarray | None = None


@dataclass
class CameraConfig:
    index: int = 0
    width: int = 640
    height: int = 480
    target_fps: int = 30
    backend: str = "auto"
    buffer_size: int = 1


@dataclass
class FaceConfig:
    enabled: bool = True
    model_name: str = "buffalo_l"
    detection_size: tuple[int, int] = (640, 640)
    min_detection_confidence: float = 0.6
    recognition_threshold: float = 0.5
    opencv_threshold: float = 72.0
    database_path: str = "data/faces.sqlite"
    providers: list[str] = field(default_factory=lambda: ["CPUExecutionProvider"])
    process_every_n_frames: int = 3


@dataclass
class GestureConfig:
    enabled: bool = True
    max_hands: int = 2
    detection_confidence: float = 0.55
    tracking_confidence: float = 0.55
    fallback_label: str = "unknown"
    process_every_n_frames: int = 2


@dataclass
class ExerciseConfig:
    enabled: bool = True
    detection_confidence: float = 0.55
    tracking_confidence: float = 0.55
    fallback_label: str = "unknown"
    process_every_n_frames: int = 2
    samples_path: str = "data/exercise_samples.csv"
    model_path: str = "data/exercise_knn.npz"
    min_samples_per_label: int = 3
    k_neighbors: int = 5


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
    exercise: ExerciseConfig = field(default_factory=ExerciseConfig)
    overlay: OverlayConfig = field(default_factory=OverlayConfig)


def normalize_box(raw_box: Any) -> Box:
    x1, y1, x2, y2 = [int(round(float(value))) for value in raw_box[:4]]
    return x1, y1, x2, y2
