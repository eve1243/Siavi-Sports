from __future__ import annotations

import json
import threading
import time
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
        self.latest_gestures = []
        self.latest_exercise = None
        self.error: str | None = None
        self.running = False
        self.thread: threading.Thread | None = None
        self.fps = 0.0
        self.placeholder_jpeg = self._create_placeholder_frame("Waiting for camera permission")
        self.active_user: str | None = None

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
                    self.latest_gestures = gestures
                    self.latest_exercise = exercise
                    self.fps = camera_frame.fps
                    self.error = None

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
                "profiles": self.face_service.registered_profiles,
                "signInCandidates": sign_in_candidates,
            }

    def register(self, name: str, age: int | None, gender: str | None) -> tuple[bool, str]:
        with self.lock:
            faces = list(self.latest_faces)

        if not faces:
            return False, "No face is visible. Look into the camera and try again."

        target = max(faces, key=lambda face: (face.box[2] - face.box[0]) * (face.box[3] - face.box[1]))

        try:
            self.face_service.register(name, target, age, gender)
        except Exception as error:
            return False, str(error)

        return True, f"{name} has been registered. Select the recognized face to sign in."

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
        return True, f"Welcome back, {recognized.name}."

    def logout(self) -> None:
        self.active_user = None

    def add_exercise_sample(self, label: str) -> tuple[bool, str]:
        with self.lock:
            exercise = self.latest_exercise
        return self.exercise_service.add_sample(label, exercise)

    def train_exercise_model(self) -> tuple[bool, str]:
        self.exercise_service.train()
        return True, f"Trained on {self.exercise_service.sample_count} exercise samples."

    def _can_sign_in_with_face(self, face: FaceDetection) -> bool:
        return (
            face.name not in {"unknown", "face"}
            and face.confidence > self.min_face_confidence
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


def main() -> None:
    uvicorn.run("web_app:app", host="127.0.0.1", port=8000, reload=False, app_dir="src")


if __name__ == "__main__":
    main()
