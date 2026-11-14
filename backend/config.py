import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Neuro-Vision Enterprise Engine"
    model_path: str = os.getenv("MODEL_PATH", "models/face_landmarker.task")

    class Config:
        env_file = ".env"


settings = Settings()