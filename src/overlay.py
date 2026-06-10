from __future__ import annotations

from datetime import datetime
from pathlib import Path

import cv2
import numpy as np

from domain import ExerciseDetection, FaceDetection, GestureDetection


GREEN = (80, 220, 120)
RED = (80, 80, 245)
YELLOW = (40, 220, 245)
CYAN = (230, 210, 60)
WHITE = (245, 245, 245)
BLACK = (20, 20, 20)


def _draw_label(frame: np.ndarray, text: str, x: int, y: int, color: tuple[int, int, int]) -> None:
    font = cv2.FONT_HERSHEY_SIMPLEX
    scale = 0.58
    thickness = 2
    (width, height), _ = cv2.getTextSize(text, font, scale, thickness)
    top = max(0, y - height - 12)
    cv2.rectangle(frame, (x, top), (x + width + 12, top + height + 10), BLACK, -1)
    cv2.putText(frame, text, (x + 6, top + height + 4), font, scale, color, thickness)


def draw_faces(frame: np.ndarray, faces: list[FaceDetection]) -> None:
    for face in faces:
        x1, y1, x2, y2 = face.box
        color = GREEN if face.name != "unknown" else YELLOW
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        label = face.name if face.name != "unknown" else "face"
        _draw_label(frame, label, x1, y1, color)


def draw_gestures(frame: np.ndarray, gestures: list[GestureDetection]) -> None:
    for gesture in gestures:
        label = f"{gesture.label} {gesture.confidence:.2f}"
        if gesture.box is None:
            _draw_label(frame, label, 16, frame.shape[0] - 18, RED)
            continue

        x1, y1, x2, y2 = gesture.box
        color = CYAN if gesture.label != "unknown" else RED
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        for start, end in gesture.connections:
            if start < len(gesture.landmarks) and end < len(gesture.landmarks):
                cv2.line(frame, gesture.landmarks[start], gesture.landmarks[end], color, 2)
        for point in gesture.landmarks:
            cv2.circle(frame, point, 4, WHITE, -1)
        _draw_label(frame, label, x1, y1, color)


def draw_exercise(frame: np.ndarray, exercise: ExerciseDetection | None) -> None:
    if exercise is None:
        return

    label = f"{exercise.label} x{exercise.repetitions} {exercise.confidence:.2f}"
    color = GREEN if exercise.label != "unknown" else YELLOW
    _draw_label(frame, label, 16, frame.shape[0] - 54, color)

    for start, end in exercise.connections:
        if start < len(exercise.landmarks) and end < len(exercise.landmarks):
            cv2.line(frame, exercise.landmarks[start], exercise.landmarks[end], color, 2)

    for point in exercise.landmarks:
        cv2.circle(frame, point, 4, WHITE, -1)


def draw_status(
    frame: np.ndarray,
    *,
    camera_active: bool,
    debug: bool,
    exercise_error: str | None = None,
    exercise_ready: bool,
    face_count: int | None,
    fps: float,
    gesture_count: int,
    gesture_error: str | None = None,
    gesture_ready: bool,
) -> None:
    gesture_status = "ready"
    if not gesture_ready:
        gesture_status = gesture_error or "install mediapipe"

    exercise_status = "ready"
    if not exercise_ready:
        exercise_status = exercise_error or "install mediapipe"

    status_lines = [
        f"Camera: {'active' if camera_active else 'inactive'}",
        f"Gestures: {gesture_count if gesture_count else 'unknown'}",
        f"Gesture tracking: {gesture_status}",
        f"Exercise AI: {exercise_status}",
        "Keys: q quit | s snapshot | d debug",
    ]

    if face_count is not None:
        status_lines.insert(1, f"Faces: {face_count}")
        status_lines[-1] = "Keys: q quit | r register face | s snapshot | d debug"

    if debug:
        status_lines.insert(1, f"FPS: {fps:.1f}")

    y = 24
    for line in status_lines:
        cv2.putText(
            frame,
            line,
            (16, y),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.58,
            WHITE,
            2,
            cv2.LINE_AA,
        )
        y += 24


def save_snapshot(frame: np.ndarray, snapshot_dir: str) -> Path:
    directory = Path(snapshot_dir)
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / f"snapshot-{datetime.now().strftime('%Y%m%d-%H%M%S')}.jpg"
    cv2.imwrite(str(path), frame)
    return path
