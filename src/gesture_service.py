from __future__ import annotations

import cv2
import numpy as np

from domain import GestureConfig, GestureDetection


FINGER_TIPS = [4, 8, 12, 16, 20]
FINGER_PIPS = [3, 6, 10, 14, 18]
HAND_CONNECTIONS = [
    (0, 1),
    (1, 2),
    (2, 3),
    (3, 4),
    (0, 5),
    (5, 6),
    (6, 7),
    (7, 8),
    (5, 9),
    (9, 10),
    (10, 11),
    (11, 12),
    (9, 13),
    (13, 14),
    (14, 15),
    (15, 16),
    (13, 17),
    (17, 18),
    (18, 19),
    (19, 20),
    (0, 17),
]


class GestureService:
    def __init__(self, config: GestureConfig) -> None:
        self.config = config
        self.hands = None
        self.import_error: str | None = None

    def initialize(self) -> None:
        if not self.config.enabled or self.hands is not None or self.import_error:
            return

        try:
            import mediapipe as mp
        except ImportError as error:
            self.import_error = str(error)
            return

        try:
            self.hands = mp.solutions.hands.Hands(
                max_num_hands=self.config.max_hands,
                min_detection_confidence=self.config.detection_confidence,
                min_tracking_confidence=self.config.tracking_confidence,
                model_complexity=1,
            )
        except Exception as error:
            self.import_error = str(error)
            self.hands = None

    def detect(self, frame: np.ndarray) -> list[GestureDetection]:
        if not self.config.enabled:
            return []

        self.initialize()

        if self.hands is None:
            return []

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = self.hands.process(rgb)

        if not result.multi_hand_landmarks:
            return []

        detections: list[GestureDetection] = []
        height, width = frame.shape[:2]

        for index, hand_landmarks in enumerate(result.multi_hand_landmarks):
            points = [
                (int(landmark.x * width), int(landmark.y * height))
                for landmark in hand_landmarks.landmark
            ]
            handedness = "hand"
            confidence = 1.0

            if result.multi_handedness and index < len(result.multi_handedness):
                classification = result.multi_handedness[index].classification[0]
                handedness = classification.label.lower()
                confidence = float(classification.score)

            x_values = [point[0] for point in points]
            y_values = [point[1] for point in points]
            box = (
                max(0, min(x_values) - 18),
                max(0, min(y_values) - 18),
                min(width, max(x_values) + 18),
                min(height, max(y_values) + 18),
            )
            label = classify_gesture(points, handedness, self.config.fallback_label)

            detections.append(
                GestureDetection(
                    box=box,
                    label=label,
                    confidence=confidence,
                    handedness=handedness,
                    landmarks=points,
                    connections=HAND_CONNECTIONS,
                )
            )

        return detections

    def fallback(self) -> GestureDetection:
        return GestureDetection(box=None, label=self.config.fallback_label, confidence=0.0)


def classify_gesture(points: list[tuple[int, int]], handedness: str, fallback_label: str) -> str:
    if len(points) < 21:
        return fallback_label

    fingers = _finger_states(points, handedness)
    thumb, index, middle, ring, pinky = fingers
    open_count = sum(fingers)

    if open_count == 0:
        return "fist"

    if open_count >= 5:
        return "open_hand"

    if thumb and not index and not middle and not ring and not pinky:
        return "thumbs_up"

    if index and middle and not ring and not pinky:
        return "peace"

    if index and not middle and not ring and not pinky:
        return "pointing"

    if index and middle and ring and pinky and not thumb:
        return "stop"

    return fallback_label


def _finger_states(points: list[tuple[int, int]], handedness: str) -> list[bool]:
    thumb_tip_x = points[4][0]
    thumb_joint_x = points[3][0]
    is_left = handedness == "left"
    thumb_is_open = thumb_tip_x > thumb_joint_x if is_left else thumb_tip_x < thumb_joint_x

    fingers = [thumb_is_open]
    for tip, pip in zip(FINGER_TIPS[1:], FINGER_PIPS[1:]):
        fingers.append(points[tip][1] < points[pip][1])

    return fingers
