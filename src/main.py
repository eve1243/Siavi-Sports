from __future__ import annotations

import argparse
import sys

import cv2

from app_config import load_config
from camera import CameraError, Webcam
from exercise_service import ExerciseService
from face_recognition_service import FaceRecognitionService
from gesture_service import GestureService
from overlay import draw_exercise, draw_faces, draw_gestures, draw_status, save_snapshot


WINDOW_NAME = "SIAVI Local Face and Gesture Recognition"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Local webcam face and gesture recognition.")
    parser.add_argument("--config", default="config.yaml", help="Path to config.yaml.")
    return parser.parse_args()


def prompt_name() -> str:
    print("\nEnter name for the current face and press return:")
    return input("> ").strip()


def main() -> int:
    args = parse_args()
    config = load_config(args.config)
    camera = Webcam(config.camera)
    face_service = FaceRecognitionService(config.face)
    gesture_service = GestureService(config.gesture)
    exercise_service = ExerciseService(config.exercise)
    debug = config.overlay.debug
    latest_faces = []
    latest_gestures = []
    latest_exercise = None

    try:
        camera.open()
        cv2.namedWindow(WINDOW_NAME, cv2.WINDOW_NORMAL)

        for camera_frame in camera.frames():
            frame = camera_frame.image
            if config.overlay.mirror:
                frame = cv2.flip(frame, 1)

            if camera_frame.frame_index % config.face.process_every_n_frames == 0:
                latest_faces = face_service.detect(frame)

            if camera_frame.frame_index % config.gesture.process_every_n_frames == 0:
                latest_gestures = gesture_service.detect(frame)

            if camera_frame.frame_index % config.exercise.process_every_n_frames == 0:
                latest_exercise = exercise_service.detect(frame)

            faces = latest_faces
            gestures = latest_gestures

            draw_faces(frame, faces)
            draw_gestures(frame, gestures or [gesture_service.fallback()])
            draw_exercise(frame, latest_exercise or exercise_service.fallback())
            draw_status(
                frame,
                camera_active=True,
                debug=debug,
                exercise_error=exercise_service.import_error,
                exercise_ready=exercise_service.pose is not None,
                face_count=len(faces),
                fps=camera_frame.fps,
                gesture_count=len(gestures),
                gesture_error=gesture_service.import_error,
                gesture_ready=gesture_service.hands is not None,
            )

            cv2.imshow(WINDOW_NAME, frame)
            key = cv2.waitKey(1) & 0xFF

            if key == ord("q"):
                break

            if key == ord("d"):
                debug = not debug

            if key == ord("s"):
                path = save_snapshot(frame, config.overlay.snapshot_dir)
                print(f"Saved snapshot: {path}")

            if key == ord("r"):
                if not latest_faces:
                    print("No face visible to register.")
                    continue

                target_face = max(
                    latest_faces,
                    key=lambda face: (face.box[2] - face.box[0]) * (face.box[3] - face.box[1]),
                )
                name = prompt_name()
                if name:
                    face_service.register(name, target_face)
                    print(f"Registered face for: {name}")

    except CameraError as error:
        print(f"Camera error: {error}", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        return 0
    finally:
        camera.release()
        cv2.destroyAllWindows()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
