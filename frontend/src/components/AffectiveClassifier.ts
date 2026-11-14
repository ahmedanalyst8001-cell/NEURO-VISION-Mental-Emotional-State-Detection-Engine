import {
  PsychologicalScores,
  EmotionCategory,
  BiometricEfficiency,
  TelemetryPoint,
} from '../types/telemetry';

export function classifyAffectiveState(
  scores: PsychologicalScores,
  history: TelemetryPoint[]
): {
  primaryEmotion: EmotionCategory;
  secondaryEmotion: EmotionCategory;
  confidence: number;
  efficiency: BiometricEfficiency;
  clinicalInsight: string;
} {
  const { stress, valence, engagement, anxiety } = scores;

  // Calculate temporal volatility from recent frames
  const recent = history.slice(-10);
  let volatility = 0;
  if (recent.length > 1) {
    const diffs = recent.slice(1).map((pt, idx) =>
      Math.abs(pt.stress - recent[idx].stress) + Math.abs(pt.valence - recent[idx].valence)
    );
    volatility = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  }

  // Score each of the 9 distinct emotional states using multi-dimensional vectors
  const candidates: { emotion: EmotionCategory; weight: number }[] = [
    {
      emotion: 'Acute Stress / Tension',
      weight: stress * 0.65 + anxiety * 0.25 + (100 - valence) * 0.1,
    },
    {
      emotion: 'Anxious / Apprehensive',
      weight: anxiety * 0.65 + stress * 0.2 + volatility * 0.8,
    },
    {
      emotion: 'Frustrated / Agitated',
      weight: stress * 0.45 + (100 - valence) * 0.4 + engagement * 0.15,
    },
    {
      emotion: 'Cognitive Overload',
      weight: engagement * 0.45 + stress * 0.4 + anxiety * 0.15,
    },
    {
      emotion: 'Fatigued / Drowsy',
      weight: (100 - engagement) * 0.6 + (100 - stress) * 0.2 + (50 - Math.abs(valence - 50)) * 0.2,
    },
    {
      emotion: 'Low Mood / Melancholic',
      weight: (100 - valence) * 0.6 + (100 - engagement) * 0.25 + (100 - stress) * 0.15,
    },
    {
      emotion: 'Joyful / Positive Affect',
      weight: valence * 0.7 + engagement * 0.2 + (100 - stress) * 0.1,
    },
    {
      emotion: 'Focused & Engaged',
      weight: engagement * 0.6 + (100 - anxiety) * 0.25 + (100 - stress) * 0.15,
    },
    {
      emotion: 'Calm & Balanced',
      weight: (100 - stress) * 0.4 + (100 - anxiety) * 0.35 + valence * 0.25,
    },
  ];

  candidates.sort((a, b) => b.weight - a.weight);
  const primaryEmotion = candidates[0].emotion;
  const secondaryEmotion = candidates[1].emotion;
  const spread = Math.max(5, candidates[0].weight - candidates[1].weight);
  const confidence = Math.min(98, Math.round(72 + spread * 1.4));

  // Realistic Biometric Health & Efficiency Matrices
  // Normal resting blink rate is 14-18 bpm; drops under high cognitive load (6-10 bpm) and rises under stress/fatigue (22-30 bpm)
  const estimatedBlinkRate = Math.round(
    Math.max(6, Math.min(32, 16 + (stress - 40) * 0.14 - (engagement - 50) * 0.1))
  );

  const cognitiveLoadIndex = Math.round(
    Math.min(100, Math.max(0, engagement * 0.55 + stress * 0.35 + anxiety * 0.1))
  );

  const autonomicBalance = Math.round(
    Math.min(100, Math.max(0, 100 - (stress * 0.55 + anxiety * 0.45)))
  );

  const fatigueRisk = Math.round(
    Math.min(100, Math.max(0, (100 - engagement) * 0.65 + (stress > 65 ? 20 : 0)))
  );

  const emotionalRegulation = Math.round(
    Math.min(100, Math.max(15, 95 - volatility * 1.8 - anxiety * 0.2))
  );

  const attentionStability = Math.round(
    Math.min(100, Math.max(10, engagement * 0.7 + emotionalRegulation * 0.3 - fatigueRisk * 0.25))
  );

  const insightsMap: Record<EmotionCategory, string> = {
    'Focused & Engaged': 'Optimal prefrontal focus detected. Ocular fixation steady; low brow tension.',
    'Calm & Balanced': 'Parasympathetic dominance. Facial musculature relaxed with steady baseline affect.',
    'Joyful / Positive Affect': 'Duchenne zygomaticus activation detected. High positive valence and social openness.',
    'Cognitive Overload': 'Sustained mental exertion coupled with rising corrugator tension. Recommend 5-min micro-break.',
    'Acute Stress / Tension': 'Elevated sympathetic arousal (AU4 brow lowerer / lip press). Consider paced diaphragmatic breathing.',
    'Anxious / Apprehensive': 'Micro-tremor volatility and elevated upper-lid tension detected. Grounding protocol advised.',
    'Fatigued / Drowsy': 'Reduced tonic facial engagement and slower blink recovery. Cognitive throughput declining.',
    'Frustrated / Agitated': 'Negative valence paired with high task engagement. High risk of decision fatigue.',
    'Low Mood / Melancholic': 'Depressed lip corner pull (AU15) and blunted affect responsiveness observed.',
  };

  return {
    primaryEmotion,
    secondaryEmotion,
    confidence,
    efficiency: {
      cognitiveLoadIndex,
      autonomicBalance,
      attentionStability,
      fatigueRisk,
      emotionalRegulation,
      estimatedBlinkRate,
    },
    clinicalInsight: insightsMap[primaryEmotion],
  };
}