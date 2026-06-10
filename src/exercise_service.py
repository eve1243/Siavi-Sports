from __future__ import annotations

import csv
from collections import Counter, defaultdict, deque
from pathlib import Path

import cv2
import numpy as np

from domain import ExerciseConfig, ExerciseDetection


POSE_CONNECTIONS = [
    (11, 12),
    (11, 13),
    (13, 15),
    (12, 14),
    (14, 16),
    (11, 23),
    (12, 24),
    (23, 24),
    (23, 25),
    (25, 27),
    (24, 26),
    (26, 28),
]

EXERCISE_ALIASES = {
    "weight_lift": "hand_curl",
    "weight_lifting": "hand_curl",
    "hand_curling": "hand_curl",
    "bicep_curl": "hand_curl",
    "biceps_curl": "hand_curl",
    "curl": "hand_curl",
}
ALLOWED_EXERCISES = {"hand_curl", "jump", "arm_raises", "squat", "side_arm_raises"}


class ExerciseService:
    def __init__(self, config: ExerciseConfig) -> None:
        self.config = config
        self.pose = None
        self.import_error: str | None = None
        self.samples_path = Path(config.samples_path)
        self.model_path = Path(config.model_path)
        self.features = np.empty((0, 0), dtype=np.float32)
        self.labels: list[str] = []
        self.repetitions: dict[str, int] = defaultdict(int)
        self.states: dict[str, str] = defaultdict(lambda: "unknown")
        self.jump_baseline_y: float | None = None
        self.recent_labels: deque[str] = deque(maxlen=7)
        self.active_label = config.fallback_label
        self.target_label: str | None = None
        self.load_model()

    @property
    def ready(self) -> bool:
        self.initialize()
        return self.pose is not None

    @property
    def learned_labels(self) -> list[str]:
        return sorted(set(self.labels))

    @property
    def sample_count(self) -> int:
        return len(self.labels)

    def initialize(self) -> None:
        if not self.config.enabled or self.pose is not None or self.import_error:
            return

        try:
            import mediapipe as mp
        except ImportError as error:
            self.import_error = str(error)
            return

        solutions = getattr(mp, "solutions", None)
        if solutions is None or not hasattr(solutions, "pose"):
            version = getattr(mp, "__version__", "unknown")
            self.import_error = f"MediaPipe {version} does not include the legacy Pose API."
            return

        try:
            self.pose = solutions.pose.Pose(
                min_detection_confidence=self.config.detection_confidence,
                min_tracking_confidence=self.config.tracking_confidence,
                model_complexity=1,
            )
        except Exception as error:
            self.import_error = f"{type(error).__name__}: {error}"

    def detect(self, frame: np.ndarray) -> ExerciseDetection | None:
        if not self.config.enabled:
            return None

        self.initialize()
        if self.pose is None:
            return None

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = self.pose.process(rgb)
        if not result.pose_landmarks:
            return None

        height, width = frame.shape[:2]
        raw_points = np.array(
            [
                [landmark.x, landmark.y, landmark.z, landmark.visibility]
                for landmark in result.pose_landmarks.landmark
            ],
            dtype=np.float32,
        )
        landmarks = [
            (int(point[0] * width), int(point[1] * height))
            for point in raw_points
        ]
        features = self.extract_features(raw_points)
        heuristic_label, heuristic_confidence, state = self.classify_with_rules(raw_points)
        model_label, model_confidence = self.classify_with_model(features)

        if self.target_label is not None:
            label = heuristic_label
            confidence = heuristic_confidence
            source = "rules"
        elif model_label != self.config.fallback_label and model_confidence >= 0.58:
            label = model_label
            confidence = model_confidence
            source = "learned"
        else:
            label = heuristic_label
            confidence = heuristic_confidence
            source = "rules"

        if label != self.config.fallback_label:
            self.active_label = label
        elif state == "down" and self.active_label != self.config.fallback_label:
            label = self.active_label
            confidence = 0.42

        if self.target_label is None:
            label = self._smooth_label(label)
        repetitions = self.update_repetitions(label, state) if self.target_label is not None else 0

        return ExerciseDetection(
            label=label,
            confidence=confidence,
            source=source,
            state=state,
            repetitions=repetitions,
            landmarks=landmarks,
            connections=POSE_CONNECTIONS,
            features=features,
        )

    def fallback(self) -> ExerciseDetection:
        return ExerciseDetection(
            label=self.config.fallback_label,
            confidence=0.0,
            source="none",
            repetitions=self.repetitions.get(self.config.fallback_label, 0),
        )

    def add_sample(self, label: str, detection: ExerciseDetection | None) -> tuple[bool, str]:
        cleaned_label = self.normalize_label(label)
        if not cleaned_label:
            return False, "Exercise label must not be empty."
        if detection is None or detection.features is None:
            return False, "No full body pose is visible yet."

        self.samples_path.parent.mkdir(parents=True, exist_ok=True)
        is_new_file = not self.samples_path.exists()
        with self.samples_path.open("a", newline="", encoding="utf-8") as file:
            writer = csv.writer(file)
            if is_new_file:
                writer.writerow(["label", *[f"f{i}" for i in range(len(detection.features))]])
            writer.writerow([cleaned_label, *[f"{value:.8f}" for value in detection.features]])

        self.train()
        return True, f"Saved training sample for {cleaned_label}."

    def set_target_exercise(self, label: str | None) -> None:
        if label is None:
            self.target_label = None
            return

        cleaned_label = self.normalize_label(label)
        if cleaned_label not in ALLOWED_EXERCISES:
            raise ValueError("Choose hand_curl, jump, arm_raises, squat or side_arm_raises.")

        self.target_label = cleaned_label
        self.active_label = cleaned_label
        self.repetitions[cleaned_label] = 0
        self.recent_labels.clear()
        self.states[cleaned_label] = "down"

    def train(self) -> None:
        if not self.samples_path.exists():
            self.features = np.empty((0, 0), dtype=np.float32)
            self.labels = []
            return

        labels: list[str] = []
        rows: list[list[float]] = []
        with self.samples_path.open("r", newline="", encoding="utf-8") as file:
            reader = csv.reader(file)
            header = next(reader, None)
            for row in reader:
                if len(row) < 2:
                    continue
                labels.append(self.normalize_label(row[0]))
                rows.append([float(value) for value in row[1:]])

        if not rows:
            self.features = np.empty((0, 0), dtype=np.float32)
            self.labels = []
            return

        self.features = np.asarray(rows, dtype=np.float32)
        self.labels = labels
        self.model_path.parent.mkdir(parents=True, exist_ok=True)
        np.savez_compressed(self.model_path, features=self.features, labels=np.asarray(labels))

    def load_model(self) -> None:
        if self.model_path.exists():
            raw = np.load(self.model_path, allow_pickle=False)
            self.features = raw["features"].astype(np.float32)
            self.labels = [str(label) for label in raw["labels"].tolist()]
            return

        self.train()

    def extract_features(self, points: np.ndarray) -> np.ndarray:
        xy = points[:, :2].copy()
        center = (xy[23] + xy[24]) / 2
        shoulder_width = float(np.linalg.norm(xy[11] - xy[12]))
        hip_width = float(np.linalg.norm(xy[23] - xy[24]))
        scale = max(shoulder_width, hip_width, 0.05)
        normalized = (xy - center) / scale
        selected = normalized[[11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]].flatten()
        angles = np.asarray(
            [
                self._angle(points, 11, 13, 15),
                self._angle(points, 12, 14, 16),
                self._angle(points, 23, 25, 27),
                self._angle(points, 24, 26, 28),
                self._angle(points, 11, 23, 25),
                self._angle(points, 12, 24, 26),
            ],
            dtype=np.float32,
        ) / 180.0
        return np.concatenate([selected.astype(np.float32), angles])

    def classify_with_model(self, features: np.ndarray) -> tuple[str, float]:
        if self.features.size == 0 or not self.labels:
            return self.config.fallback_label, 0.0

        counts = Counter(self.labels)
        usable = np.array(
            [counts[label] >= self.config.min_samples_per_label for label in self.labels],
            dtype=bool,
        )
        if not usable.any():
            return self.config.fallback_label, 0.0

        candidates = self.features[usable]
        candidate_labels = [label for label, ok in zip(self.labels, usable) if ok]
        distances = np.linalg.norm(candidates - features, axis=1)
        k = min(self.config.k_neighbors, len(distances))
        indexes = np.argsort(distances)[:k]
        vote = Counter(candidate_labels[index] for index in indexes)
        label, votes = vote.most_common(1)[0]
        mean_distance = float(np.mean(distances[indexes]))
        confidence = max(0.0, min(1.0, (votes / k) * (1.0 - mean_distance / 4.0)))
        return label, confidence

    def classify_with_rules(self, points: np.ndarray) -> tuple[str, float, str]:
        left_wrist_y, right_wrist_y = points[15][1], points[16][1]
        left_shoulder_y, right_shoulder_y = points[11][1], points[12][1]
        left_elbow = self._angle(points, 11, 13, 15)
        right_elbow = self._angle(points, 12, 14, 16)
        left_knee = self._angle(points, 23, 25, 27)
        right_knee = self._angle(points, 24, 26, 28)
        shoulder_y = float((left_shoulder_y + right_shoulder_y) / 2)
        ankle_y = float((points[27][1] + points[28][1]) / 2)
        hip_y = float((points[23][1] + points[24][1]) / 2)
        knee_y = float((points[25][1] + points[26][1]) / 2)

        left_wrist_x, right_wrist_x = points[15][0], points[16][0]
        left_shoulder_x, right_shoulder_x = points[11][0], points[12][0]
        shoulder_width = max(abs(float(left_shoulder_x - right_shoulder_x)), 0.05)
        wrists_outside_shoulders = (
            left_wrist_x > max(left_shoulder_x, right_shoulder_x) + shoulder_width * 0.28
            or right_wrist_x < min(left_shoulder_x, right_shoulder_x) - shoulder_width * 0.28
        )
        wrists_near_shoulders = (
            abs(float(left_wrist_y - left_shoulder_y)) < 0.16
            and abs(float(right_wrist_y - right_shoulder_y)) < 0.16
        )
        side_arms_up = wrists_outside_shoulders and wrists_near_shoulders

        if self.target_label == "hand_curl":
            return self._classify_hand_curl(
                left_elbow,
                right_elbow,
                points[13][0],
                points[14][0],
                left_wrist_y,
                right_wrist_y,
                left_wrist_x,
                right_wrist_x,
                left_shoulder_y,
                right_shoulder_y,
                left_shoulder_x,
                right_shoulder_x,
                shoulder_width,
            )

        if self.target_label == "jump":
            if self.jump_baseline_y is None:
                self.jump_baseline_y = ankle_y
            self.jump_baseline_y = self.jump_baseline_y * 0.96 + ankle_y * 0.04
            is_airborne = ankle_y < self.jump_baseline_y - 0.035
            return "jump", 0.72 if is_airborne else 0.56, "up" if is_airborne else "down"

        if self.target_label == "arm_raises":
            both_arms_up = left_wrist_y < left_shoulder_y - 0.04 and right_wrist_y < right_shoulder_y - 0.04
            return "arm_raises", 0.78 if both_arms_up else 0.57, "up" if both_arms_up else "down"

        if self.target_label == "squat":
            knees_bent = left_knee < 132 or right_knee < 132
            hips_lowered = hip_y > knee_y - 0.28
            is_squat = knees_bent and hips_lowered
            return "squat", 0.78 if is_squat else 0.57, "up" if is_squat else "down"

        if self.target_label == "side_arm_raises":
            return "side_arm_raises", 0.78 if side_arms_up else 0.57, "up" if side_arms_up else "down"

        both_arms_up = left_wrist_y < left_shoulder_y - 0.04 and right_wrist_y < right_shoulder_y - 0.04
        if both_arms_up:
            return "arm_raises", 0.74, "up"

        if side_arms_up:
            return "side_arm_raises", 0.72, "up"

        knees_bent = left_knee < 132 or right_knee < 132
        hips_lowered = hip_y > knee_y - 0.28
        if knees_bent and hips_lowered:
            return "squat", 0.72, "up"

        curl_label, curl_confidence, curl_state = self._classify_hand_curl(
            left_elbow,
            right_elbow,
            points[13][0],
            points[14][0],
            left_wrist_y,
            right_wrist_y,
            left_wrist_x,
            right_wrist_x,
            left_shoulder_y,
            right_shoulder_y,
            left_shoulder_x,
            right_shoulder_x,
            shoulder_width,
        )
        if curl_state == "up":
            return curl_label, max(0.68, curl_confidence), curl_state

        if self.jump_baseline_y is None:
            self.jump_baseline_y = ankle_y
        self.jump_baseline_y = self.jump_baseline_y * 0.96 + ankle_y * 0.04
        if ankle_y < self.jump_baseline_y - 0.035:
            return "jump", 0.66, "up"

        return self.config.fallback_label, 0.35, "down"

    def normalize_label(self, label: str) -> str:
        cleaned_label = label.strip().lower().replace("-", "_").replace(" ", "_")
        return EXERCISE_ALIASES.get(cleaned_label, cleaned_label)

    def _classify_hand_curl(
        self,
        left_elbow: float,
        right_elbow: float,
        left_elbow_x: float,
        right_elbow_x: float,
        left_wrist_y: float,
        right_wrist_y: float,
        left_wrist_x: float,
        right_wrist_x: float,
        left_shoulder_y: float,
        right_shoulder_y: float,
        left_shoulder_x: float,
        right_shoulder_x: float,
        shoulder_width: float,
    ) -> tuple[str, float, str]:
        left_arm_sideways = (
            left_wrist_x > max(left_shoulder_x, right_shoulder_x) + shoulder_width * 0.24
            and abs(float(left_wrist_y - left_shoulder_y)) < 0.20
        )
        right_arm_sideways = (
            right_wrist_x < min(left_shoulder_x, right_shoulder_x) - shoulder_width * 0.24
            and abs(float(right_wrist_y - right_shoulder_y)) < 0.20
        )
        if left_arm_sideways or right_arm_sideways:
            return "hand_curl", 0.40, "down"

        left_elbow_near_body = abs(float(left_elbow_x - left_shoulder_x)) < shoulder_width * 0.85
        right_elbow_near_body = abs(float(right_elbow_x - right_shoulder_x)) < shoulder_width * 0.85
        left_wrist_inside = left_wrist_x < max(left_shoulder_x, right_shoulder_x) + shoulder_width * 0.20
        right_wrist_inside = right_wrist_x > min(left_shoulder_x, right_shoulder_x) - shoulder_width * 0.20

        left_curled = (
            left_elbow < 92
            and left_wrist_y < left_shoulder_y + 0.16
            and left_elbow_near_body
            and left_wrist_inside
        )
        right_curled = (
            right_elbow < 92
            and right_wrist_y < right_shoulder_y + 0.16
            and right_elbow_near_body
            and right_wrist_inside
        )
        left_extended = left_elbow > 142 and left_wrist_y > left_shoulder_y + 0.22
        right_extended = right_elbow > 142 and right_wrist_y > right_shoulder_y + 0.22

        if left_curled or right_curled:
            best_angle = min(left_elbow, right_elbow)
            confidence = 0.74 + min(0.16, max(0.0, (92 - best_angle) / 120))
            return "hand_curl", confidence, "up"

        if left_extended or right_extended:
            return "hand_curl", 0.62, "down"

        return "hand_curl", 0.48, "down"

    def update_repetitions(self, label: str, state: str) -> int:
        if label == self.config.fallback_label:
            return 0

        previous = self.states[label]
        if previous == "down" and state == "up":
            self.repetitions[label] += 1
        self.states[label] = "up" if state == "up" else "down"
        return self.repetitions[label]

    def _smooth_label(self, label: str) -> str:
        self.recent_labels.append(label)
        label, count = Counter(self.recent_labels).most_common(1)[0]
        return label if count >= 3 else self.recent_labels[-1]

    def _angle(self, points: np.ndarray, first: int, middle: int, last: int) -> float:
        a = points[first][:2]
        b = points[middle][:2]
        c = points[last][:2]
        ba = a - b
        bc = c - b
        denominator = float(np.linalg.norm(ba) * np.linalg.norm(bc))
        if denominator == 0:
            return 180.0
        cosine = float(np.dot(ba, bc) / denominator)
        return float(np.degrees(np.arccos(np.clip(cosine, -1.0, 1.0))))
