from __future__ import annotations

import json
import threading
import time
from collections import deque
from typing import Any, Optional

import cv2
import numpy as np
import uvicorn
from fastapi import FastAPI
from fastapi.responses import JSONResponse, RedirectResponse, StreamingResponse
from pydantic import BaseModel

from app_config import load_config
from camera import CameraError, Webcam
from domain import FaceDetection
from exercise_service import ExerciseService
from face_recognition_service import FaceRecognitionService
from gesture_service import GestureService
from overlay import draw_exercise, draw_faces, draw_gestures, draw_status


class RegisterRequest(BaseModel):
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None


class LoginRequest(BaseModel):
    name: Optional[str] = None


class ExerciseSampleRequest(BaseModel):
    label: str


class WorkoutStartRequest(BaseModel):
    exercise: str
    targetReps: Optional[int] = None


class ProgressRequest(BaseModel):
    scoreDelta: int = 0
    levelDelta: int = 0
    completedSet: bool = False


class RecognitionEngine:
    def __init__(self) -> None:
        self.config = load_config("config.yaml")
        self.camera = Webcam(self.config.camera)
        self.face_service = FaceRecognitionService(self.config.face)
        self.gesture_service = GestureService(self.config.gesture)
        self.exercise_service = ExerciseService(self.config.exercise)
        self.lock = threading.Lock()
        self.latest_jpeg: bytes | None = None
        self.latest_faces = []
        self.recent_registration_faces: deque[tuple[float, FaceDetection]] = deque(maxlen=12)
        self.registration_sample_window_seconds = 3.0
        self.min_registration_samples = 3
        self.latest_gestures = []
        self.latest_exercise = None
        self.error: str | None = None
        self.running = False
        self.thread: threading.Thread | None = None
        self.fps = 0.0
        self.placeholder_jpeg = self._create_placeholder_frame("Waiting for camera permission")
        self.active_user: str | None = None
        self.workout_exercise = "weight_lift"
        self.workout_baseline_reps = 0
        self.workout_current_reps = 0
        self.workout_target_reps = 5
        self.workout_target_source = "level"
        self.workout_state = "idle"
        self.workout_message = "Select an exercise and start a set."
        self.workout_guidance = "Choose an exercise, keep your full body visible, then start a set."
        self.workout_completed = False

    @property
    def min_face_confidence(self) -> float:
        return self.config.face.min_detection_confidence

    @property
    def min_recognition_confidence(self) -> float:
        return self.config.face.recognition_threshold

    def start(self) -> None:
        if self.running:
            return
        try:
            self.camera.open()
        except CameraError as error:
            self.error = str(error)
            return
        self.running = True
        self.thread = threading.Thread(target=self._run, daemon=True)
        self.thread.start()

    def stop(self) -> None:
        self.running = False
        self.camera.release()

    def _run(self) -> None:
        try:
            for camera_frame in self.camera.frames():
                if not self.running:
                    break

                frame = camera_frame.image
                if self.config.overlay.mirror:
                    frame = cv2.flip(frame, 1)

                if camera_frame.frame_index % self.config.face.process_every_n_frames == 0:
                    faces = self.face_service.detect(frame)
                else:
                    faces = self.latest_faces

                if camera_frame.frame_index % self.config.gesture.process_every_n_frames == 0:
                    gestures = self.gesture_service.detect(frame)
                else:
                    gestures = self.latest_gestures

                if camera_frame.frame_index % self.config.exercise.process_every_n_frames == 0:
                    exercise = self.exercise_service.detect(frame)
                else:
                    exercise = self.latest_exercise

                draw_faces(frame, faces)
                draw_gestures(frame, gestures or [self.gesture_service.fallback()])
                draw_exercise(frame, exercise or self.exercise_service.fallback())
                draw_status(
                    frame,
                    camera_active=True,
                    debug=True,
                    exercise_error=self.exercise_service.import_error,
                    exercise_ready=self.exercise_service.pose is not None,
                    face_count=len(faces),
                    fps=camera_frame.fps,
                    gesture_count=len(gestures),
                    gesture_error=self.gesture_service.import_error,
                    gesture_ready=self.gesture_service.hands is not None,
                )

                ok, encoded = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 82])
                if not ok:
                    continue

                with self.lock:
                    self.latest_jpeg = encoded.tobytes()
                    self.latest_faces = faces
                    self._remember_registration_face(faces)
                    self.latest_gestures = gestures
                    self.latest_exercise = exercise
                    self.fps = camera_frame.fps
                    self.error = None

                if exercise is not None:
                    self._update_workout(exercise.label, exercise.state, exercise.repetitions)

        except CameraError as error:
            with self.lock:
                self.error = str(error)
        except Exception as error:
            with self.lock:
                self.error = f"{type(error).__name__}: {error}"
        finally:
            self.camera.release()

    def stream(self):
        frame_delay = 1 / max(self.config.camera.target_fps, 1)
        while True:
            with self.lock:
                frame = self.latest_jpeg or self.placeholder_jpeg

            if frame is not None:
                yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"

            time.sleep(frame_delay)

    def status(self) -> dict[str, Any]:
        with self.lock:
            recognized_faces = [
                {
                    "name": face.name,
                    "canSignIn": self._can_sign_in_with_face(face),
                }
                for face in self.latest_faces
            ]
            sign_in_candidates = [
                {
                    "name": face.name,
                }
                for face in self.latest_faces
                if self._can_sign_in_with_face(face)
            ]
            gestures = [
                {
                    "label": gesture.label,
                    "confidence": gesture.confidence,
                    "handedness": gesture.handedness,
                }
                for gesture in self.latest_gestures
            ]
            exercise = self.latest_exercise

            return {
                "authenticated": self.active_user is not None,
                "authenticatedName": self.active_user,
                "activeProfile": self.face_service.get_registered_profile(self.active_user),
                "error": self.error,
                "exercise": {
                    "label": exercise.label if exercise else "unknown",
                    "confidence": exercise.confidence if exercise else 0.0,
                    "source": exercise.source if exercise else "none",
                    "state": exercise.state if exercise else "unknown",
                    "repetitions": exercise.repetitions if exercise else 0,
                },
                "exerciseError": self.exercise_service.import_error,
                "exerciseReady": self.exercise_service.pose is not None,
                "exerciseSampleCount": self.exercise_service.sample_count,
                "exerciseLabels": self.exercise_service.learned_labels,
                "faceCount": len(self.latest_faces),
                "faces": recognized_faces,
                "fps": round(self.fps, 1),
                "gestureCount": len(self.latest_gestures),
                "gestureError": self.gesture_service.import_error,
                "gestures": gestures,
                "minFaceConfidence": self.min_face_confidence,
                "minRecognitionConfidence": self.min_recognition_confidence,
                "recognitionReady": self.face_service.recognition_ready,
                "registrationSamplesReady": len(self._registration_faces_from_history()),
                "minRegistrationSamples": self.min_registration_samples,
                "profiles": self.face_service.registered_profiles,
                "signInCandidates": sign_in_candidates,
                "workout": {
                    "exercise": self.workout_exercise,
                    "currentReps": self.workout_current_reps,
                    "targetReps": self.workout_target_reps,
                    "targetSource": self.workout_target_source,
                    "state": self.workout_state,
                    "message": self.workout_message,
                    "guidance": self.workout_guidance,
                    "completed": self.workout_completed,
                },
            }

    def register(self, name: str, age: int | None, gender: str | None) -> tuple[bool, str]:
        with self.lock:
            faces = list(self.latest_faces)
            registration_faces = self._registration_faces_from_history()

        if not faces:
            return False, "No face is visible. Look into the camera and try again."

        if len(faces) > 1:
            return False, "Only one face should be visible during registration."

        if len(registration_faces) < self.min_registration_samples:
            return (
                False,
                "Keep your face visible for a moment, then register again. "
                f"{len(registration_faces)}/{self.min_registration_samples} samples are ready.",
            )

        try:
            for index, target in enumerate(registration_faces):
                self.face_service.register(
                    name,
                    target,
                    age if index == 0 else None,
                    gender if index == 0 else None,
                )
        except Exception as error:
            return False, str(error)

        with self.lock:
            self.recent_registration_faces.clear()

        return (
            True,
            f"{name} has been registered with {len(registration_faces)} face samples. "
            "Select the recognized face to sign in.",
        )

    def sign_in(self, requested_name: str | None = None) -> tuple[bool, str]:
        with self.lock:
            faces = list(self.latest_faces)

        recognized = next(
            (face for face in faces if self._can_sign_in_with_face(face)),
            None,
        )

        if recognized is None:
            return False, "No registered face recognized yet."

        if requested_name and requested_name.casefold() != recognized.name.casefold():
            return False, f"Recognized {recognized.name}, not {requested_name}."

        self.active_user = recognized.name
        self.face_service.record_login(recognized.name)
        self._reset_workout_for_profile()
        return True, f"Welcome back, {recognized.name}."

    def logout(self) -> None:
        self.active_user = None
        self.exercise_service.set_target_exercise(None)
        self.workout_state = "idle"
        self.workout_message = "Select an exercise and start a set."
        self.workout_guidance = "Choose an exercise, keep your full body visible, then start a set."

    def add_exercise_sample(self, label: str) -> tuple[bool, str]:
        with self.lock:
            exercise = self.latest_exercise
        return self.exercise_service.add_sample(label, exercise)

    def train_exercise_model(self) -> tuple[bool, str]:
        self.exercise_service.train()
        return True, f"Trained on {self.exercise_service.sample_count} exercise samples."

    def start_workout(self, exercise: str, target_reps: int | None = None) -> tuple[bool, str]:
        if self.active_user is None:
            return False, "Sign in before starting a workout."

        cleaned_exercise = exercise.strip().lower().replace(" ", "_")
        allowed = {"weight_lift", "jump", "arm_raises"}
        if cleaned_exercise not in allowed:
            return False, "Choose weight_lift, jump or arm_raises."

        self.exercise_service.set_target_exercise(cleaned_exercise)
        latest_reps = self.exercise_service.repetitions.get(cleaned_exercise, 0)
        self.workout_exercise = cleaned_exercise
        self.workout_baseline_reps = latest_reps
        self.workout_current_reps = 0
        self.workout_target_reps = self._target_reps_for_active_user(target_reps)
        self.workout_target_source = "custom" if target_reps is not None else "level"
        self.workout_state = "running"
        self.workout_completed = False
        self.workout_message = f"Set started: {self._display_exercise(cleaned_exercise)}."
        self.workout_guidance = self._guidance_for_exercise(cleaned_exercise, "down")
        return True, self.workout_message

    def record_progress(self, request: ProgressRequest) -> tuple[bool, str, dict[str, Any] | None]:
        if self.active_user is None:
            return False, "Sign in before saving progress.", None

        try:
            profile = self.face_service.record_progress(
                self.active_user,
                score_delta=request.scoreDelta,
                level_delta=request.levelDelta,
                completed_sets_delta=1 if request.completedSet else 0,
            )
        except Exception as error:
            return False, str(error), None

        return True, "Progress saved.", profile

    def _target_reps_for_active_user(self, target_reps: int | None = None) -> int:
        if target_reps is not None:
            return max(1, min(int(target_reps), 100))

        profile = self.face_service.get_registered_profile(self.active_user)
        level = 1
        if profile is not None:
            level = int(profile.get("level") or 1)
        return max(5, level * 5)

    def _reset_workout_for_profile(self) -> None:
        self.workout_baseline_reps = self.exercise_service.repetitions.get(self.workout_exercise, 0)
        self.workout_current_reps = 0
        self.workout_target_reps = self._target_reps_for_active_user()
        self.workout_target_source = "level"
        self.workout_state = "idle"
        self.workout_completed = False
        self.workout_message = "Select an exercise and start a set."
        self.workout_guidance = "Choose an exercise, keep your full body visible, then start a set."

    def _update_workout(self, label: str, state: str, total_reps: int) -> None:
        if self.active_user is None or self.workout_state != "running" or self.workout_completed:
            return

        if label != self.workout_exercise:
            self.workout_message = f"Waiting for {self._display_exercise(self.workout_exercise)}."
            self.workout_guidance = "Show your full body and move into the exercise start position."
            return

        current_reps = max(0, total_reps - self.workout_baseline_reps)
        self.workout_current_reps = min(current_reps, self.workout_target_reps)
        self.workout_message = f"{self.workout_current_reps}/{self.workout_target_reps} reps."
        self.workout_guidance = self._guidance_for_exercise(label, state)

        if current_reps < self.workout_target_reps:
            return

        score_delta = self.workout_target_reps * 10
        self.face_service.record_progress(
            self.active_user,
            score_delta=score_delta,
            level_delta=1,
            completed_sets_delta=1,
        )
        self.workout_state = "completed"
        self.workout_completed = True
        self.exercise_service.set_target_exercise(None)
        self.workout_message = f"Set complete. +{score_delta} score and level up."
        self.workout_guidance = "Set complete. Rest briefly or choose the next exercise."

    def _display_exercise(self, label: str) -> str:
        labels = {
            "weight_lift": "Hand Weight Lifting",
            "jump": "Jumping Jacks",
            "arm_raises": "Arm Raises",
        }
        return labels.get(label, label.replace("_", " ").title())

    def _guidance_for_exercise(self, label: str, state: str) -> str:
        if label == "weight_lift":
            return (
                "Lower the arm before the next curl."
                if state == "up"
                else "Curl at least one arm upward, then return to the start position."
            )
        if label == "jump":
            return (
                "Land and stand still before the next Jumping Jack."
                if state == "up"
                else "Jump clearly upward from the baseline so the camera can count it."
            )
        if label == "arm_raises":
            return (
                "Lower both hands below shoulder height before the next rep."
                if state == "up"
                else "Raise both hands above shoulder height together."
            )
        return "Keep your full body visible and follow the exercise rule."

    def _can_sign_in_with_face(self, face: FaceDetection) -> bool:
        return (
            face.name not in {"unknown", "face"}
            and face.confidence > self.min_face_confidence
            and face.similarity >= self.min_recognition_confidence
        )

    def _remember_registration_face(self, faces: list[FaceDetection]) -> None:
        if len(faces) != 1:
            return

        target = faces[0]
        if self._face_area(target) < 80 * 80:
            return

        self.recent_registration_faces.append((time.monotonic(), self._copy_face_detection(target)))

    def _registration_faces_from_history(self) -> list[FaceDetection]:
        now = time.monotonic()
        fresh_faces = [
            face
            for timestamp, face in self.recent_registration_faces
            if now - timestamp <= self.registration_sample_window_seconds
        ]
        if not fresh_faces:
            return []

        return fresh_faces[-5:]

    def _face_area(self, face: FaceDetection) -> int:
        x1, y1, x2, y2 = face.box
        return max(0, x2 - x1) * max(0, y2 - y1)

    def _copy_face_detection(self, face: FaceDetection) -> FaceDetection:
        return FaceDetection(
            box=face.box,
            confidence=face.confidence,
            embedding=face.embedding.copy(),
            name=face.name,
            similarity=face.similarity,
            crop=face.crop.copy() if face.crop is not None else None,
        )

    def _create_placeholder_frame(self, text: str) -> bytes:
        frame = np.zeros((720, 1280, 3), dtype=np.uint8)
        frame[:, :] = (18, 24, 36)
        cv2.putText(
            frame,
            text,
            (80, 350),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.4,
            (245, 245, 245),
            3,
            cv2.LINE_AA,
        )
        cv2.putText(
            frame,
            "Allow camera access for Terminal / Python, then restart.",
            (80, 410),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.9,
            (80, 220, 245),
            2,
            cv2.LINE_AA,
        )
        ok, encoded = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 82])
        return encoded.tobytes() if ok else b""


engine = RecognitionEngine()
app = FastAPI(title="SIAVI FaceID Login")


@app.on_event("startup")
def on_startup() -> None:
    engine.start()


@app.on_event("shutdown")
def on_shutdown() -> None:
    engine.stop()


@app.get("/")
def index() -> RedirectResponse:
    return RedirectResponse("http://127.0.0.1:3000")


@app.get("/video.mjpg")
def video_feed() -> StreamingResponse:
    return StreamingResponse(engine.stream(), media_type="multipart/x-mixed-replace; boundary=frame")


@app.get("/api/status")
def status() -> JSONResponse:
    return JSONResponse(engine.status())


@app.post("/api/register")
def register(request: RegisterRequest) -> JSONResponse:
    ok, message = engine.register(request.name, request.age, request.gender)
    return JSONResponse({"ok": ok, "message": message}, status_code=200 if ok else 400)


@app.post("/api/sign-in")
def sign_in(request: LoginRequest) -> JSONResponse:
    ok, message = engine.sign_in(request.name)
    return JSONResponse({"ok": ok, "message": message}, status_code=200 if ok else 400)


@app.post("/api/logout")
def logout() -> JSONResponse:
    engine.logout()
    return JSONResponse({"ok": True, "message": "Signed out."})


@app.post("/api/exercise/sample")
def add_exercise_sample(request: ExerciseSampleRequest) -> JSONResponse:
    ok, message = engine.add_exercise_sample(request.label)
    return JSONResponse({"ok": ok, "message": message}, status_code=200 if ok else 400)


@app.post("/api/exercise/train")
def train_exercise_model() -> JSONResponse:
    ok, message = engine.train_exercise_model()
    return JSONResponse({"ok": ok, "message": message})


@app.post("/api/workout/start")
def start_workout(request: WorkoutStartRequest) -> JSONResponse:
    ok, message = engine.start_workout(request.exercise, request.targetReps)
    return JSONResponse({"ok": ok, "message": message}, status_code=200 if ok else 400)


@app.post("/api/progress")
def record_progress(request: ProgressRequest) -> JSONResponse:
    ok, message, profile = engine.record_progress(request)
    return JSONResponse(
        {"ok": ok, "message": message, "profile": profile},
        status_code=200 if ok else 400,
    )


def main() -> None:
    uvicorn.run("web_app:app", host="127.0.0.1", port=8000, reload=False, app_dir="src")


if __name__ == "__main__":
    main()
