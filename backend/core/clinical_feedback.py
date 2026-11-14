def generate_clinical_feedback(scores: dict) -> str:
    stress = scores["stress"]
    valence = scores["valence"]
    anxiety = scores["anxiety"]

    if stress > 75:
        return "Elevated micro-facial muscle tension detected around the corrugator supercilii. Suggesting deep diaphragmatic breathing exercise protocols."
    elif anxiety > 65:
        return "Asymmetrical facial micro-movements indicate potential acute cognitive load or agitation. Recommend ground-state recalibration."
    elif valence > 70:
        return "Positive valence equilibrium maintained. Optimal emotional baseline stability observed."
    else:
        return "Neutral affective state detected. Stable biometric baseline across tracked Action Units."