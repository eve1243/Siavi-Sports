from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml

from domain import AppConfig, CameraConfig, FaceConfig, GestureConfig, OverlayConfig


def _as_tuple(value: Any, fallback: tuple[int, int]) -> tuple[int, int]:
    if isinstance(value, (list, tuple)) and len(value) == 2:
        return int(value[0]), int(value[1])
    return fallback


def load_config(path: str = "config.yaml") -> AppConfig:
    config_path = Path(path)
    raw: dict[str, Any] = {}

    if config_path.exists():
        with config_path.open("r", encoding="utf-8") as file:
            loaded = yaml.safe_load(file) or {}
            if isinstance(loaded, dict):
                raw = loaded

    camera_raw = raw.get("camera", {})
    face_raw = raw.get("face", {})
    gesture_raw = raw.get("gesture", {})
    overlay_raw = raw.get("overlay", {})

    return AppConfig(
        camera=CameraConfig(
            index=int(camera_raw.get("index", 0)),
            width=int(camera_raw.get("width", 1280)),
            height=int(camera_raw.get("height", 720)),
            target_fps=int(camera_raw.get("target_fps", 24)),
        ),
        face=FaceConfig(
            enabled=bool(face_raw.get("enabled", True)),
            model_name=str(face_raw.get("model_name", "buffalo_l")),
            detection_size=_as_tuple(face_raw.get("detection_size"), (640, 640)),
            min_detection_confidence=float(face_raw.get("min_detection_confidence", 0.6)),
            recognition_threshold=float(face_raw.get("recognition_threshold", 0.6)),
            opencv_threshold=float(face_raw.get("opencv_threshold", 72.0)),
            database_path=str(face_raw.get("database_path", "data/faces.json")),
            providers=list(face_raw.get("providers", ["CPUExecutionProvider"])),
        ),
        gesture=GestureConfig(
            enabled=bool(gesture_raw.get("enabled", True)),
            max_hands=int(gesture_raw.get("max_hands", 2)),
            detection_confidence=float(gesture_raw.get("detection_confidence", 0.55)),
            tracking_confidence=float(gesture_raw.get("tracking_confidence", 0.55)),
            fallback_label=str(gesture_raw.get("fallback_label", "unknown")),
        ),
        overlay=OverlayConfig(
            debug=bool(overlay_raw.get("debug", True)),
            mirror=bool(overlay_raw.get("mirror", True)),
            snapshot_dir=str(overlay_raw.get("snapshot_dir", "snapshots")),
        ),
    )
