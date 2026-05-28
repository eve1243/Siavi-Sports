from __future__ import annotations

import io
import json
import sqlite3
from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np

from domain import FaceConfig, FaceDetection, normalize_box


@dataclass
class FaceProfile:
    name: str
    embeddings: list[np.ndarray]
    age: int | None = None
    gender: str | None = None


@dataclass
class OpenCvFaceSample:
    name: str
    image: np.ndarray
    age: int | None = None
    gender: str | None = None


def _normalize_embedding(embedding: np.ndarray) -> np.ndarray:
    norm = np.linalg.norm(embedding)
    if norm == 0:
        return embedding
    return embedding / norm


def _cosine_similarity(first: np.ndarray, second: np.ndarray) -> float:
    return float(np.dot(_normalize_embedding(first), _normalize_embedding(second)))


class FaceRecognitionService:
    def __init__(self, config: FaceConfig) -> None:
        self.config = config
        self.app = None
        self.import_error: str | None = None
        self.haar_detector = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )
        self.profiles: list[FaceProfile] = []
        self.database_path = Path(config.database_path)
        self.legacy_json_path = self._legacy_path("faces.json")
        self.opencv_database_path = self._legacy_path("opencv_faces.npz")
        self.opencv_samples: list[OpenCvFaceSample] = []
        self.opencv_recognizer = self._create_opencv_recognizer()
        self._ensure_database()
        self.load_profiles()
        self.load_opencv_profiles()

    def initialize(self) -> None:
        if not self.config.enabled or self.app is not None or self.import_error is not None:
            return

        try:
            from insightface.app import FaceAnalysis
        except ImportError as error:
            self.import_error = str(error)
            return

        try:
            self.app = FaceAnalysis(name=self.config.model_name, providers=self.config.providers)
            self.app.prepare(ctx_id=-1, det_size=self.config.detection_size)
        except Exception as error:
            self.import_error = str(error)
            self.app = None

    @property
    def recognition_ready(self) -> bool:
        self.initialize()
        return self.app is not None or self.opencv_recognizer is not None

    @property
    def registered_names(self) -> list[str]:
        return [profile["name"] for profile in self.registered_profiles]

    @property
    def registered_profiles(self) -> list[dict[str, str | int | None]]:
        profiles: dict[str, dict[str, str | int | None]] = {
            profile.name: {"name": profile.name, "age": profile.age, "gender": profile.gender}
            for profile in self.profiles
        }

        for sample in self.opencv_samples:
            profiles[sample.name] = {
                "name": sample.name,
                "age": sample.age,
                "gender": sample.gender,
            }

        return sorted(profiles.values(), key=lambda profile: str(profile["name"]).casefold())

    def load_profiles(self) -> None:
        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT profiles.id, profiles.name, profiles.age, profiles.gender, embeddings.embedding
                FROM profiles
                LEFT JOIN embeddings ON embeddings.profile_id = profiles.id
                ORDER BY profiles.name, embeddings.id
                """
            ).fetchall()

        by_id: dict[int, FaceProfile] = {}
        for profile_id, name, age, gender, raw_embedding in rows:
            profile = by_id.setdefault(
                int(profile_id),
                FaceProfile(name=str(name), embeddings=[], age=age, gender=gender),
            )
            if raw_embedding is not None:
                profile.embeddings.append(self._array_from_blob(raw_embedding))

        self.profiles = list(by_id.values())

    def load_opencv_profiles(self) -> None:
        if self.opencv_recognizer is None:
            return

        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT profiles.name, profiles.age, profiles.gender, opencv_samples.image
                FROM opencv_samples
                JOIN profiles ON profiles.id = opencv_samples.profile_id
                ORDER BY profiles.name, opencv_samples.id
                """
            ).fetchall()

        self.opencv_samples = [
            OpenCvFaceSample(
                name=str(name),
                image=self._array_from_blob(image).astype(np.uint8),
                age=int(age) if age is not None else None,
                gender=str(gender) if gender is not None else None,
            )
            for name, age, gender, image in rows
        ]
        self._train_opencv_recognizer()

    def save_opencv_profiles(self) -> None:
        with self._connect() as connection:
            connection.execute("DELETE FROM opencv_samples")
            for sample in self.opencv_samples:
                profile_id = self._upsert_profile(connection, sample.name, sample.age, sample.gender)
                connection.execute(
                    "INSERT INTO opencv_samples (profile_id, image) VALUES (?, ?)",
                    (profile_id, self._array_to_blob(sample.image)),
                )

    def save_profiles(self) -> None:
        with self._connect() as connection:
            connection.execute("DELETE FROM embeddings")
            for profile in self.profiles:
                profile_id = self._upsert_profile(connection, profile.name, profile.age, profile.gender)
                for embedding in profile.embeddings:
                    connection.execute(
                        "INSERT INTO embeddings (profile_id, embedding) VALUES (?, ?)",
                        (profile_id, self._array_to_blob(embedding.astype(np.float32))),
                    )

    def detect(self, frame: np.ndarray) -> list[FaceDetection]:
        if not self.config.enabled:
            return []

        self.initialize()

        if self.app is None:
            return self.detect_with_opencv(frame)

        detections: list[FaceDetection] = []
        for face in self.app.get(frame):
            confidence = float(face.det_score)
            if confidence <= self.config.min_detection_confidence:
                continue

            embedding = np.asarray(face.embedding, dtype=np.float32)
            name, similarity = self.match_embedding(embedding)
            detections.append(
                FaceDetection(
                    box=normalize_box(face.bbox),
                    confidence=confidence,
                    embedding=embedding,
                    name=name,
                    similarity=similarity,
                )
            )

        return detections

    def detect_with_opencv(self, frame: np.ndarray) -> list[FaceDetection]:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.equalizeHist(gray)
        faces = self.haar_detector.detectMultiScale(
            gray,
            scaleFactor=1.05,
            minNeighbors=6,
            minSize=(64, 64),
        )

        detections: list[FaceDetection] = []
        for x, y, width, height in faces:
            crop = self._crop_face(gray, int(x), int(y), int(width), int(height))
            name, similarity = self.match_opencv_face(crop)
            detections.append(
                FaceDetection(
                    box=(int(x), int(y), int(x + width), int(y + height)),
                    confidence=1.0,
                    embedding=np.zeros(512, dtype=np.float32),
                    name=name,
                    similarity=similarity,
                    crop=crop,
                )
            )

        return detections

    def match_embedding(self, embedding: np.ndarray) -> tuple[str, float]:
        best_name = "unknown"
        best_similarity = 0.0

        for profile in self.profiles:
            similarities = [
                _cosine_similarity(embedding, known_embedding)
                for known_embedding in profile.embeddings
            ]
            if not similarities:
                continue

            top_matches = sorted(similarities, reverse=True)[:3]
            similarity = float(np.mean(top_matches))
            if similarity > best_similarity:
                best_name = profile.name
                best_similarity = similarity

        if best_similarity < self.config.recognition_threshold:
            return "unknown", best_similarity

        return best_name, best_similarity

    def match_opencv_face(self, crop: np.ndarray) -> tuple[str, float]:
        if self.opencv_recognizer is None or not self.opencv_samples:
            return "unknown", 0.0

        label, distance = self.opencv_recognizer.predict(crop)
        similarity = max(0.0, 1.0 - float(distance) / max(self.config.opencv_threshold, 1.0))

        if distance > self.config.opencv_threshold or label >= len(self.opencv_samples):
            return "unknown", similarity

        return self.opencv_samples[label].name, similarity

    def register(
        self,
        name: str,
        detection: FaceDetection,
        age: int | None = None,
        gender: str | None = None,
    ) -> None:
        cleaned_name = name.strip()
        if not cleaned_name:
            raise ValueError("Name must not be empty.")

        if self.app is None:
            self.register_opencv(cleaned_name, detection, age, gender)
            return

        if np.linalg.norm(detection.embedding) == 0:
            raise RuntimeError(
                "FaceID registration needs InsightFace. Install requirements-face-recognition.txt."
            )

        for profile in self.profiles:
            if profile.name.casefold() == cleaned_name.casefold():
                profile.embeddings.append(detection.embedding)
                profile.age = age
                profile.gender = gender
                self.save_profiles()
                return

        self.profiles.append(
            FaceProfile(name=cleaned_name, embeddings=[detection.embedding], age=age, gender=gender)
        )
        self.save_profiles()

    def register_opencv(
        self,
        name: str,
        detection: FaceDetection,
        age: int | None = None,
        gender: str | None = None,
    ) -> None:
        if self.opencv_recognizer is None:
            raise RuntimeError("OpenCV Face recognizer is not available.")

        if detection.crop is None:
            raise RuntimeError("No face crop is available for registration.")

        self.opencv_samples.append(
            OpenCvFaceSample(name=name, image=detection.crop, age=age, gender=gender)
        )
        self._train_opencv_recognizer()
        self.save_opencv_profiles()

    def _ensure_database(self) -> None:
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS profiles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE COLLATE NOCASE,
                    age INTEGER,
                    gender TEXT,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS embeddings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
                    embedding BLOB NOT NULL,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS opencv_samples (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
                    image BLOB NOT NULL,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )

            has_profiles = connection.execute("SELECT 1 FROM profiles LIMIT 1").fetchone()
            if not has_profiles:
                self._import_legacy_json(connection)
                self._import_legacy_opencv(connection)

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path)
        connection.execute("PRAGMA foreign_keys = ON")
        return connection

    def _legacy_path(self, filename: str) -> Path:
        if self.database_path.suffix == ".json" and filename == "faces.json":
            return self.database_path
        return self.database_path.with_name(filename)

    def _upsert_profile(
        self,
        connection: sqlite3.Connection,
        name: str,
        age: int | None = None,
        gender: str | None = None,
    ) -> int:
        connection.execute(
            """
            INSERT INTO profiles (name, age, gender)
            VALUES (?, ?, ?)
            ON CONFLICT(name) DO UPDATE SET
                age = COALESCE(excluded.age, profiles.age),
                gender = COALESCE(excluded.gender, profiles.gender)
            """,
            (name, age, gender),
        )
        row = connection.execute("SELECT id FROM profiles WHERE name = ?", (name,)).fetchone()
        if row is None:
            raise RuntimeError(f"Could not save profile for {name}.")
        return int(row[0])

    def _import_legacy_json(self, connection: sqlite3.Connection) -> None:
        if not self.legacy_json_path.exists() or self.legacy_json_path.suffix != ".json":
            return

        with self.legacy_json_path.open("r", encoding="utf-8") as file:
            raw_profiles = json.load(file)

        for entry in raw_profiles:
            profile_id = self._upsert_profile(connection, str(entry["name"]))
            for value in entry.get("embeddings", []):
                embedding = np.asarray(value, dtype=np.float32)
                connection.execute(
                    "INSERT INTO embeddings (profile_id, embedding) VALUES (?, ?)",
                    (profile_id, self._array_to_blob(embedding)),
                )

    def _import_legacy_opencv(self, connection: sqlite3.Connection) -> None:
        if not self.opencv_database_path.exists():
            return

        raw = np.load(self.opencv_database_path, allow_pickle=True)
        names = [str(name) for name in raw["names"].tolist()]
        images = [image.astype(np.uint8) for image in raw["images"]]
        ages = raw["ages"].tolist() if "ages" in raw else [None] * len(names)
        genders = raw["genders"].tolist() if "genders" in raw else [None] * len(names)

        for name, image, age, gender in zip(names, images, ages, genders):
            profile_id = self._upsert_profile(
                connection,
                name,
                int(age) if age is not None else None,
                str(gender) if gender is not None else None,
            )
            connection.execute(
                "INSERT INTO opencv_samples (profile_id, image) VALUES (?, ?)",
                (profile_id, self._array_to_blob(image)),
            )

    def _array_to_blob(self, array: np.ndarray) -> bytes:
        buffer = io.BytesIO()
        np.save(buffer, array, allow_pickle=False)
        return buffer.getvalue()

    def _array_from_blob(self, blob: bytes) -> np.ndarray:
        buffer = io.BytesIO(blob)
        return np.load(buffer, allow_pickle=False)

    def _train_opencv_recognizer(self) -> None:
        if self.opencv_recognizer is None or not self.opencv_samples:
            return

        images = [sample.image for sample in self.opencv_samples]
        labels = np.arange(len(self.opencv_samples), dtype=np.int32)
        self.opencv_recognizer.train(images, labels)

    def _create_opencv_recognizer(self):
        face_module = getattr(cv2, "face", None)
        if face_module is None:
            return None
        return face_module.LBPHFaceRecognizer_create()

    def _crop_face(self, gray: np.ndarray, x: int, y: int, width: int, height: int) -> np.ndarray:
        face = gray[y : y + height, x : x + width]
        if face.size == 0:
            return np.zeros((160, 160), dtype=np.uint8)
        return cv2.resize(face, (160, 160), interpolation=cv2.INTER_AREA)
