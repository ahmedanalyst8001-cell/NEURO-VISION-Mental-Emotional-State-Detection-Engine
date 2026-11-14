import numpy as np

def map_blendshapes_to_scores(bs: dict) -> dict:
    smile = (bs.get("mouthSmileLeft", 0.0) + bs.get("mouthSmileRight", 0.0)) / 2.0
    frown = (bs.get("browDownLeft", 0.0) + bs.get("browDownRight", 0.0)) / 2.0
    valence = float(np.clip((smile - (frown * 0.8)) * 100 + 50, 0, 100))

    brow_furrow = (bs.get("browInnerUp", 0.0) + frown) / 2.0
    stress = float(np.clip((brow_furrow * 70 + (1.0 - smile) * 30), 0, 100))

    engagement = float(np.clip((1.0 - bs.get("eyeBlinkLeft", 0.0)) * 80 + 20, 0, 100))

    asymmetry = abs(bs.get("mouthSmileLeft", 0.0) - bs.get("mouthSmileRight", 0.0))
    anxiety = float(np.clip((stress * 0.6 + asymmetry * 200), 0, 100))

    return {
        "valence": round(valence, 1),
        "stress": round(stress, 1),
        "engagement": round(engagement, 1),
        "anxiety": round(anxiety, 1),
        "raw_blendshapes": {k: round(v, 3) for k, v in list(bs.items())[:8]}
    }