import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from core.facs_mapper import map_blendshapes_to_scores
from core.clinical_feedback import generate_clinical_feedback


class NeuroVisionEngine:
    def __init__(self, model_path: str = "models/face_landmarker.task"):
        base_options = python.BaseOptions(model_asset_path=model_path)
        options = vision.FaceLandmarkerOptions(
            base_options=base_options,
            running_mode=vision.RunningMode.IMAGE,
            num_faces=1,
            output_face_blendshapes=True,
            output_facial_transformation_matrixes=True
        )
        self.detector = vision.FaceLandmarker.create_from_options(options)

    def process_frame(self, frame_bgr: np.ndarray):
        rgb_frame = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        detection_result = self.detector.detect(mp_image)

        if not detection_result.face_blendshapes:
            return None

        blendshapes = {
            category.category_name: category.score
            for category in detection_result.face_blendshapes[0]
        }

        scores = map_blendshapes_to_scores(blendshapes)
        feedback = generate_clinical_feedback(scores)
        return {"scores": scores, "feedback": feedback}