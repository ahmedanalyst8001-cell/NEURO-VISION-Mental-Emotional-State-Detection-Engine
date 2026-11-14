from pydantic import BaseModel
from typing import Dict, List

class PsychologicalScores(BaseModel):
    valence: float
    stress: float
    engagement: float
    anxiety: float
    raw_blendshapes: Dict[str, float]

class TelemetryResponse(BaseModel):
    status: str
    scores: PsychologicalScores | None = None
    feedback: str | None = None