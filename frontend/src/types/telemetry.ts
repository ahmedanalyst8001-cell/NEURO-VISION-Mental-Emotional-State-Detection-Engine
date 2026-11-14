export interface PsychologicalScores {
  stress: number;
  valence: number;
  engagement: number;
  anxiety: number;
}

export type EmotionCategory =
  | 'Focused & Engaged'
  | 'Calm & Balanced'
  | 'Joyful / Positive Affect'
  | 'Cognitive Overload'
  | 'Acute Stress / Tension'
  | 'Anxious / Apprehensive'
  | 'Fatigued / Drowsy'
  | 'Frustrated / Agitated'
  | 'Low Mood / Melancholic';

export interface BiometricEfficiency {
  cognitiveLoadIndex: number;      // 0-100 (Mental effort vs capacity)
  autonomicBalance: number;        // 0-100 (Parasympathetic vs Sympathetic proxy)
  attentionStability: number;      // 0-100 (Gaze & blink consistency)
  fatigueRisk: number;             // 0-100 (Eyelid droop & micro-expression decay)
  emotionalRegulation: number;     // 0-100 (Volatility dampening)
  estimatedBlinkRate: number;      // Blinks per minute (Normal: 12-20 bpm)
}

export interface TelemetryPoint {
  time: string;
  timestamp: number;
  stress: number;
  valence: number;
  engagement: number;
  anxiety: number;
  cognitiveLoad: number;
  emotion: EmotionCategory;
}

export interface SessionRecord {
  id: string;
  startTime: string;
  durationSec: number;
  dominantEmotion: EmotionCategory;
  avgStress: number;
  avgValence: number;
  avgEngagement: number;
  avgAnxiety: number;
  peakStress: number;
  efficiencyScore: number;
}