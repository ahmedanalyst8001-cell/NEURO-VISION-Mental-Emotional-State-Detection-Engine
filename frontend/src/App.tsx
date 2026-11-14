
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, BarChart, Bar, Cell,
} from 'recharts';
import {
  Brain, Activity, HeartPulse, BarChart3, Camera, ShieldAlert,
  Eye, AlertTriangle, Sparkles, ShieldCheck, Zap, Clock,
  Download, History, Trash2, Radio, Wifi, WifiOff,
} from 'lucide-react';

type ActiveTab = 'monitor' | 'efficiency' | 'analytics';

type EmotionCategory =
  | 'Focused & Engaged'
  | 'Calm & Balanced'
  | 'Positive Affect'
  | 'Cognitive Overload'
  | 'Stress / Tension'
  | 'Anxious / Apprehensive'
  | 'Fatigued / Drowsy'
  | 'Frustrated / Agitated'
  | 'Low Positive Affect'
  | 'Undetermined';

interface PsychologicalScores {
  stress: number;
  valence: number;
  engagement: number;
  anxiety: number;
}

interface EfficiencyMetrics {
  cognitiveLoadIndex: number;
  attentionStability: number;
  fatigueRisk: number;
  emotionalRegulation: number;
}

interface TelemetryPoint {
  time: string;
  timestamp: number;
  stress: number;
  valence: number;
  engagement: number;
  anxiety: number;
  cognitiveLoad: number;
  emotion: EmotionCategory;
}

interface SessionRecord {
  id: string;
  startTime: string;
  durationSec: number;
  dominantEmotion: EmotionCategory;
  avgStress: number;
  avgValence: number;
  avgEngagement: number;
  avgAnxiety: number;
  efficiencyScore: number;
  sampleCount: number;
}

interface BackendPayload {
  status?: string;
  scores?: Partial<PsychologicalScores>;
  feedback?: string;
}

const INITIAL_METRICS: PsychologicalScores = {
  stress: 22,
  valence: 64,
  engagement: 72,
  anxiety: 18,
};

const MAX_HISTORY = 300;
const MAX_SESSIONS = 100;
const FRAME_INTERVAL = 250;
const MAX_RECONNECT_DELAY = 15000;

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

const average = (values: number[]) =>
  values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;

function validateScores(
  scores?: Partial<PsychologicalScores>
): PsychologicalScores | null {
  if (!scores) return null;

  const keys: (keyof PsychologicalScores)[] = [
    'stress', 'valence', 'engagement', 'anxiety',
  ];

  for (const key of keys) {
    const value = scores[key];

    if (
      typeof value !== 'number' ||
      !Number.isFinite(value) ||
      value < 0 ||
      value > 100
    ) {
      return null;
    }
  }

  return {
    stress: scores.stress!,
    valence: scores.valence!,
    engagement: scores.engagement!,
    anxiety: scores.anxiety!,
  };
}

function classifyAffectiveState(
  scores: PsychologicalScores,
  history: TelemetryPoint[]
) {
  const { stress, valence, engagement, anxiety } = scores;

  const recent = history.slice(-10);
  const differences = recent.slice(1).map((point, index) =>
    Math.abs(point.stress - recent[index].stress) +
    Math.abs(point.valence - recent[index].valence)
  );

  const volatility = average(differences) / 2;

  const candidates: { emotion: EmotionCategory; weight: number }[] = [
    {
      emotion: 'Stress / Tension',
      weight: stress * 0.65 + anxiety * 0.25 + (100 - valence) * 0.1,
    },
    {
      emotion: 'Anxious / Apprehensive',
      weight: anxiety * 0.65 + stress * 0.2 + volatility * 0.15,
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
      weight: (100 - engagement) * 0.6 +
        (100 - stress) * 0.2 +
        (50 - Math.abs(valence - 50)) * 0.2,
    },
    {
      emotion: 'Low Positive Affect',
      weight: (100 - valence) * 0.6 +
        (100 - engagement) * 0.25 +
        (100 - stress) * 0.15,
    },
    {
      emotion: 'Positive Affect',
      weight: valence * 0.7 +
        engagement * 0.2 +
        (100 - stress) * 0.1,
    },
    {
      emotion: 'Focused & Engaged',
      weight: engagement * 0.6 +
        (100 - anxiety) * 0.25 +
        (100 - stress) * 0.15,
    },
    {
      emotion: 'Calm & Balanced',
      weight: (100 - stress) * 0.4 +
        (100 - anxiety) * 0.35 +
        valence * 0.25,
    },
  ];

  candidates.sort((a, b) => b.weight - a.weight);

  const first = candidates[0];
  const second = candidates[1];

  const confidence = Math.round(
    clamp(50 + (first.weight - second.weight) * 0.5, 50, 85)
  );

  const cognitiveLoadIndex = Math.round(
    clamp(engagement * 0.55 + stress * 0.35 + anxiety * 0.1)
  );

  const emotionalRegulation = Math.round(
    clamp(95 - volatility * 1.8 - anxiety * 0.2, 15, 100)
  );

  const fatigueRisk = Math.round(
    clamp((100 - engagement) * 0.65 + (stress > 65 ? 20 : 0))
  );

  const attentionStability = Math.round(
    clamp(
      engagement * 0.7 +
      emotionalRegulation * 0.3 -
      fatigueRisk * 0.25
    )
  );

  const insights: Record<EmotionCategory, string> = {
    'Focused & Engaged':
      'High engagement with relatively low stress and anxiety indicators.',
    'Calm & Balanced':
      'Low stress and anxiety indicators with a relatively positive valence.',
    'Positive Affect':
      'High positive valence with sustained engagement.',
    'Cognitive Overload':
      'Elevated engagement combined with increased stress indicators.',
    'Stress / Tension':
      'Elevated stress-related indicators detected.',
    'Anxious / Apprehensive':
      'Elevated anxiety-related indicators detected.',
    'Fatigued / Drowsy':
      'Reduced engagement indicators detected.',
    'Frustrated / Agitated':
      'Elevated stress combined with reduced positive valence.',
    'Low Positive Affect':
      'Reduced positive valence and engagement indicators.',
    Undetermined:
      'Insufficient information to determine an affective pattern.',
  };

  return {
    primaryEmotion: first.emotion,
    secondaryEmotion: second.emotion,
    confidence,
    efficiency: {
      cognitiveLoadIndex,
      attentionStability,
      fatigueRisk,
      emotionalRegulation,
    } as EfficiencyMetrics,
    insight: insights[first.emotion],
  };
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining = seconds % 60;

  return [
    hours ? `${hours}h` : '',
    minutes ? `${minutes}m` : '',
    `${remaining}s`,
  ].filter(Boolean).join(' ');
}

function escapeCSV(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('monitor');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldConnectRef = useRef(true);
  const isRecordingRef = useRef(false);
  const sessionStartRef = useRef<number | null>(null);
  const sessionBufferRef = useRef<TelemetryPoint[]>([]);
  const lastFrameRef = useRef(0);

  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [backendFeedback, setBackendFeedback] = useState('Initializing...');
  const [history, setHistory] = useState<TelemetryPoint[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);

  const classification = useMemo(
    () => classifyAffectiveState(metrics, history),
    [metrics, history]
  );

  const {
    primaryEmotion,
    secondaryEmotion,
    confidence,
    efficiency,
    insight,
  } = classification;

  const startCamera = useCallback(async () => {
    if (streamRef.current?.active) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera access is unavailable.');
      return;
    }

    try {
      setCameraError('');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 15, max: 30 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }

      setIsCameraReady(true);
      setBackendFeedback('Camera ready.');
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Camera access failed.';

      setCameraError(message);
      setIsCameraReady(false);
      setBackendFeedback(message);
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraReady(false);
  }, []);

  useEffect(() => {
    void startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleBackendMessage = useCallback((raw: string) => {
    try {
      const data = JSON.parse(raw) as BackendPayload;

      if (data.status !== 'success' || !data.scores) {
        if (typeof data.feedback === 'string') {
          setBackendFeedback(data.feedback);
        }
        return;
      }

      const validated = validateScores(data.scores);

      if (!validated) {
        setBackendFeedback('Invalid backend response.');
        return;
      }

      setMetrics(validated);

      if (typeof data.feedback === 'string') {
        setBackendFeedback(data.feedback);
      }

      const timestamp = Date.now();

      setHistory(previous => {
        const result = classifyAffectiveState(validated, previous);

        const point: TelemetryPoint = {
          time: new Date(timestamp).toLocaleTimeString([], {
            hour12: false,
          }),
          timestamp,
          stress: Math.round(validated.stress),
          valence: Math.round(validated.valence),
          engagement: Math.round(validated.engagement),
          anxiety: Math.round(validated.anxiety),
          cognitiveLoad: result.efficiency.cognitiveLoadIndex,
          emotion: result.primaryEmotion,
        };

        if (isRecordingRef.current) {
          sessionBufferRef.current.push(point);
        }

        return [...previous, point].slice(-MAX_HISTORY);
      });
    } catch {
      setBackendFeedback('Invalid backend response.');
    }
  }, []);

  useEffect(() => {
    shouldConnectRef.current = true;

    function scheduleReconnect() {
      if (!shouldConnectRef.current || reconnectTimerRef.current) return;

      const delay = Math.min(
        1000 * 2 ** reconnectAttemptsRef.current,
        MAX_RECONNECT_DELAY
      );

      reconnectAttemptsRef.current++;

      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;
        connect();
      }, delay);
    }

    function connect() {
      if (!shouldConnectRef.current) return;

      const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      const url = `${protocol}//localhost:8000/ws/analyze`;

      let socket: WebSocket;

      try {
        socket = new WebSocket(url);
      } catch {
        scheduleReconnect();
        return;
      }

      socketRef.current = socket;

      socket.onopen = () => {
        reconnectAttemptsRef.current = 0;
        setIsConnected(true);
        setBackendFeedback('Connected to analysis engine.');
      };

      socket.onmessage = event => {
        if (typeof event.data === 'string') {
          handleBackendMessage(event.data);
        }
      };

      socket.onerror = () => {
        setIsConnected(false);
        setBackendFeedback('Connection error.');
      };

      socket.onclose = () => {
        setIsConnected(false);

        if (shouldConnectRef.current) {
          setBackendFeedback('Reconnecting to analysis engine...');
          scheduleReconnect();
        }
      };
    }

    connect();

    return () => {
      shouldConnectRef.current = false;

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      const socket = socketRef.current;
      socketRef.current = null;

      if (socket) {
        socket.onclose = null;
        socket.close();
      }

      setIsConnected(false);
    };
  }, [handleBackendMessage]);

  useEffect(() => {
    const canvas = document.createElement('canvas');

    const interval = window.setInterval(() => {
      const video = videoRef.current;
      const socket = socketRef.current;

      if (
        !video ||
        !isCameraReady ||
        !socket ||
        socket.readyState !== WebSocket.OPEN ||
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
        !video.videoWidth ||
        !video.videoHeight
      ) return;

      const now = Date.now();
      if (now - lastFrameRef.current < FRAME_INTERVAL) return;

      lastFrameRef.current = now;

      canvas.width = 640;
      canvas.height = 480;

      const context = canvas.getContext('2d');
      if (!context) return;

      context.drawImage(video, 0, 0, 640, 480);

      try {
        socket.send(JSON.stringify({
          image: canvas.toDataURL('image/jpeg', 0.65),
          timestamp: now,
        }));
      } catch {
        setBackendFeedback('Frame transmission failed.');
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isCameraReady]);

  useEffect(() => {
    if (!isRecording) return;

    const timer = setInterval(() => {
      if (sessionStartRef.current !== null) {
        setSessionDuration(
          Math.floor((Date.now() - sessionStartRef.current) / 1000)
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isRecording]);

  const toggleSession = useCallback(() => {
    if (!isRecordingRef.current) {
      sessionStartRef.current = Date.now();
      sessionBufferRef.current = [];
      isRecordingRef.current = true;

      setSessionDuration(0);
      setIsRecording(true);
      return;
    }

    const endTime = Date.now();
    const startTime = sessionStartRef.current ?? endTime;
    const buffer = [...sessionBufferRef.current];

    isRecordingRef.current = false;
    sessionStartRef.current = null;
    sessionBufferRef.current = [];

    setIsRecording(false);

    if (!buffer.length) {
      setBackendFeedback('No data collected during this session.');
      setActiveTab('analytics');
      return;
    }

    const avgStress = average(buffer.map(p => p.stress));
    const avgValence = average(buffer.map(p => p.valence));
    const avgEngagement = average(buffer.map(p => p.engagement));
    const avgAnxiety = average(buffer.map(p => p.anxiety));

    const frequencies = new Map<EmotionCategory, number>();

    buffer.forEach(point => {
      frequencies.set(
        point.emotion,
        (frequencies.get(point.emotion) ?? 0) + 1
      );
    });

    const dominantEmotion = [...frequencies.entries()]
      .sort((a, b) => b[1] - a[1])[0][0];

    const efficiencyScore = Math.round(
      clamp(100 - avgStress * 0.4 + avgEngagement * 0.2)
    );

    const record: SessionRecord = {
      id: `${startTime}-${endTime}`,
      startTime: new Date(startTime).toLocaleString(),
      durationSec: Math.max(1, Math.round((endTime - startTime) / 1000)),
      dominantEmotion,
      avgStress,
      avgValence,
      avgEngagement,
      avgAnxiety,
      efficiencyScore,
      sampleCount: buffer.length,
    };

    setSessions(previous =>
      [record, ...previous].slice(0, MAX_SESSIONS)
    );

    setBackendFeedback('Session saved.');
    setActiveTab('analytics');
  }, []);

  const exportCSV = useCallback(() => {
    if (!history.length) {
      setBackendFeedback('No telemetry available for export.');
      return;
    }

    const headers = [
      'Timestamp', 'Time', 'Affective Pattern',
      'Stress', 'Valence', 'Engagement',
      'Anxiety', 'Cognitive Load',
    ];

    const rows = history.map(point => [
      new Date(point.timestamp).toISOString(),
      point.time,
      point.emotion,
      point.stress,
      point.valence,
      point.engagement,
      point.anxiety,
      point.cognitiveLoad,
    ]);

    const csv = [
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.map(escapeCSV).join(',')),
    ].join('\r\n');

    const blob = new Blob(['\uFEFF', csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `neuro_vision_${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }, [history]);

  const overallReadiness = Math.round(
    efficiency.attentionStability * 0.4 +
    efficiency.emotionalRegulation * 0.3 +
    (100 - efficiency.fatigueRisk) * 0.3
  );

  const radarData = [
    { subject: 'Attention', score: efficiency.attentionStability },
    { subject: 'Regulation', score: efficiency.emotionalRegulation },
    { subject: 'Valence', score: metrics.valence },
    { subject: 'Alertness', score: 100 - efficiency.fatigueRisk },
    { subject: 'Capacity', score: 100 - Math.max(0, efficiency.cognitiveLoadIndex - 65) },
  ];

  const emotionDistribution = useMemo(() => {
    const counts: Record<string, number> = {};

    history.forEach(point => {
      counts[point.emotion] = (counts[point.emotion] || 0) + 1;
    });

    return Object.entries(counts).map(([emotion, count]) => ({
      emotion,
      count,
    }));
  }, [history]);

  const metricCards = [
    { title: 'Stress', val: metrics.stress, color: 'text-rose-400', bar: 'bg-rose-500', icon: <ShieldAlert className="w-4 h-4 text-rose-400" /> },
    { title: 'Valence', val: metrics.valence, color: 'text-emerald-400', bar: 'bg-emerald-500', icon: <HeartPulse className="w-4 h-4 text-emerald-400" /> },
    { title: 'Engagement', val: metrics.engagement, color: 'text-cyan-400', bar: 'bg-cyan-500', icon: <Eye className="w-4 h-4 text-cyan-400" /> },
    { title: 'Anxiety', val: metrics.anxiety, color: 'text-amber-400', bar: 'bg-amber-500', icon: <AlertTriangle className="w-4 h-4 text-amber-400" /> },
  ];

  const efficiencyMetrics = [
    { label: 'Attention Stability', val: efficiency.attentionStability, color: 'bg-cyan-500' },
    { label: 'Emotional Regulation', val: efficiency.emotionalRegulation, color: 'bg-indigo-500' },
    { label: 'Cognitive Load', val: efficiency.cognitiveLoadIndex, color: 'bg-amber-500' },
    { label: 'Fatigue Risk', val: efficiency.fatigueRisk, color: 'bg-rose-500' },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col bg-black text-white font-sans">

      <header className="sticky top-0 z-50 border-b border-zinc-900 bg-black/95 px-6 py-4 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl">
              <Brain className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-wider">
                NEURO-VISION
              </h1>
              <p className="text-xs text-zinc-400">
                Facial Analysis & Cognitive Indicators
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            {([
              ['monitor', 'Live Monitor', Activity],
              ['efficiency', 'Efficiency', HeartPulse],
              ['analytics', `Analytics (${sessions.length})`, BarChart3],
            ] as const).map(([tab, label, Icon]) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === tab
                    ? 'bg-white text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border ${
            isConnected
              ? 'text-emerald-400 border-emerald-900'
              : 'text-rose-400 border-rose-900'
          }`}>
            {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {isConnected ? 'Online' : 'Offline'}
          </div>

        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-6 space-y-6">

        {activeTab === 'monitor' && (
          <div className="space-y-6">

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs uppercase tracking-wider text-zinc-400">
                    Detected Pattern
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    {primaryEmotion}
                  </span>
                  <span className="text-xs text-zinc-300 bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800">
                    Score: {confidence}% · Secondary: {secondaryEmotion}
                  </span>
                </div>
                <p className="text-sm text-zinc-300">{insight}</p>
              </div>

              <div className="flex items-center gap-3">
                {isRecording && (
                  <span className="text-xs font-mono text-rose-400">
                    <Clock className="inline w-3.5 h-3.5 mr-1" />
                    {formatDuration(sessionDuration)}
                  </span>
                )}

                <button
                  onClick={toggleSession}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition ${
                    isRecording
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                >
                  {isRecording ? 'Stop & Save' : 'Start Recording'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              <div className="lg:col-span-5 flex flex-col gap-6">

                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase text-zinc-400 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-cyan-400" />
                      Camera Feed
                    </span>
                    <span className={`text-xs ${isCameraReady ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isCameraReady ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden border border-zinc-800">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />

                    {!isCameraReady && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-400 text-sm">
                        <Camera className="w-8 h-8" />
                        Camera unavailable
                        <button onClick={() => void startCamera()} className="text-cyan-400 underline">
                          Retry
                        </button>
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2 right-2 bg-black/85 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 flex items-center gap-2">
                      <Radio className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{backendFeedback}</span>
                    </div>
                  </div>

                  {cameraError && (
                    <p className="mt-2 text-xs text-rose-400">{cameraError}</p>
                  )}

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => void startCamera()}
                      disabled={isCameraReady}
                      className="flex-1 rounded-lg bg-zinc-900 border border-zinc-800 py-2 text-xs disabled:opacity-40"
                    >
                      Start Camera
                    </button>
                    <button
                      onClick={stopCamera}
                      disabled={!isCameraReady}
                      className="flex-1 rounded-lg bg-zinc-900 border border-zinc-800 py-2 text-xs disabled:opacity-40"
                    >
                      Stop Camera
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
                  <h3 className="text-xs font-semibold uppercase text-zinc-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Efficiency Metrics
                  </h3>

                  {efficiencyMetrics.map(item => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-300">{item.label}</span>
                        <span className="font-mono text-white">{item.val}%</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                        <div
                          className={`${item.color} h-full transition-all duration-300`}
                          style={{ width: `${item.val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              <div className="lg:col-span-7 flex flex-col gap-6">

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {metricCards.map(metric => (
                    <div key={metric.title} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase">
                        <span>{metric.title}</span>
                        {metric.icon}
                      </div>
                      <div className="my-3">
                        <span className={`text-3xl font-extrabold font-mono ${metric.color}`}>
                          {metric.val.toFixed(1)}
                        </span>
                        <span className="text-xs text-zinc-500 ml-1">/100</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`${metric.bar} h-full transition-all duration-300`}
                          style={{ width: `${metric.val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl min-h-[320px]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold">Live Analysis</h3>
                    <span className="text-xs text-zinc-400 font-mono">
                      {history.length} Samples
                    </span>
                  </div>

                  <div className="w-full h-[260px]">
                    {history.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                          <XAxis dataKey="time" stroke="#71717a" tick={{ fontSize: 10 }} />
                          <YAxis domain={[0, 100]} stroke="#71717a" tick={{ fontSize: 11 }} />
                          <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff', borderRadius: '10px' }} />
                          <Area type="monotone" dataKey="stress" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.12} strokeWidth={2} isAnimationActive={false} />
                          <Area type="monotone" dataKey="valence" stroke="#10b981" fill="#10b981" fillOpacity={0.12} strokeWidth={2} isAnimationActive={false} />
                          <Area type="monotone" dataKey="engagement" stroke="#06b6d4" fill="none" strokeWidth={2} isAnimationActive={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                        Waiting for analysis data...
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {activeTab === 'efficiency' && (
          <div className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-cyan-400">
                    Readiness Index
                  </span>
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="my-4">
                  <span className="text-5xl font-black font-mono">{overallReadiness}</span>
                  <span className="text-sm text-zinc-400 ml-2">/100</span>
                </div>
                <p className="text-xs text-zinc-400">
                  Calculated from attention, regulation and fatigue indicators.
                </p>
              </div>

              <div className="md:col-span-2 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl overflow-x-auto">
                <h3 className="text-sm font-bold uppercase mb-4">
                  Efficiency Metrics
                </h3>

                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-xs uppercase text-zinc-400">
                      <th className="py-2.5">Parameter</th>
                      <th className="py-2.5">Current Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-zinc-200">
                    <tr>
                      <td className="py-3">Attention Stability</td>
                      <td className="py-3 font-mono text-cyan-400">{efficiency.attentionStability}%</td>
                    </tr>
                    <tr>
                      <td className="py-3">Cognitive Load</td>
                      <td className="py-3 font-mono text-amber-400">{efficiency.cognitiveLoadIndex}%</td>
                    </tr>
                    <tr>
                      <td className="py-3">Emotional Regulation</td>
                      <td className="py-3 font-mono text-indigo-400">{efficiency.emotionalRegulation}%</td>
                    </tr>
                    <tr>
                      <td className="py-3">Fatigue Risk</td>
                      <td className="py-3 font-mono text-rose-400">{efficiency.fatigueRisk}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-sm font-bold uppercase mb-4">
                  Multi-Axis Efficiency Profile
                </h3>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#27272a" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 10 }} />
                      <Radar name="Efficiency" dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-sm font-bold uppercase mb-4">
                  Pattern Distribution
                </h3>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={emotionDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="emotion" stroke="#71717a" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={100} />
                      <YAxis stroke="#71717a" />
                      <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
                      <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                        {emotionDistribution.map((_, index) => (
                          <Cell key={index} fill={['#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#6366f1'][index % 5]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: 'Total Sessions',
                  value: sessions.length,
                  icon: <History className="w-5 h-5 text-cyan-400" />,
                },
                {
                  label: 'Total Samples',
                  value: sessions.reduce((sum, item) => sum + item.sampleCount, 0),
                  icon: <Activity className="w-5 h-5 text-emerald-400" />,
                },
                {
                  label: 'Average Score',
                  value: sessions.length
                    ? `${Math.round(average(sessions.map(item => item.efficiencyScore)))}%`
                    : 'N/A',
                  icon: <Zap className="w-5 h-5 text-amber-400" />,
                },
              ].map(item => (
                <div key={item.label} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase text-zinc-400">{item.label}</span>
                    {item.icon}
                  </div>
                  <div className="text-3xl font-bold font-mono mt-3">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl">

              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <h3 className="text-sm font-bold uppercase">
                  Session History
                </h3>

                <div className="flex gap-2">
                  <button onClick={exportCSV} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs hover:bg-zinc-800">
                    <Download className="w-4 h-4" />
                    Export
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('Clear all telemetry history?')) {
                        setHistory([]);
                        setBackendFeedback('History cleared.');
                      }
                    }}
                    className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs hover:bg-zinc-800"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear History
                  </button>
                </div>
              </div>

              {sessions.length === 0 ? (
                <div className="py-16 text-center">
                  <History className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-300 text-sm">No recorded sessions.</p>
                  <p className="text-zinc-500 text-xs mt-1">
                    Start a recording to generate session analytics.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[800px]">
                    <thead>
                      <tr className="border-b border-zinc-800 text-xs uppercase text-zinc-400">
                        <th className="py-3 px-2">Session</th>
                        <th className="py-3 px-2">Start Time</th>
                        <th className="py-3 px-2">Duration</th>
                        <th className="py-3 px-2">Dominant Pattern</th>
                        <th className="py-3 px-2">Stress</th>
                        <th className="py-3 px-2">Engagement</th>
                        <th className="py-3 px-2">Score</th>
                        <th className="py-3 px-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {sessions.map((session, index) => (
                        <tr key={session.id} className="hover:bg-zinc-900/50">
                          <td className="py-4 px-2 text-zinc-400">#{sessions.length - index}</td>
                          <td className="py-4 px-2 text-xs text-zinc-300">{session.startTime}</td>
                          <td className="py-4 px-2 font-mono text-xs">{formatDuration(session.durationSec)}</td>
                          <td className="py-4 px-2 text-cyan-400 text-xs">{session.dominantEmotion}</td>
                          <td className="py-4 px-2 font-mono">{session.avgStress.toFixed(1)}</td>
                          <td className="py-4 px-2 font-mono">{session.avgEngagement.toFixed(1)}</td>
                          <td className="py-4 px-2 font-mono text-emerald-400">{session.efficiencyScore}%</td>
                          <td className="py-4 px-2">
                            <button
                              onClick={() => setSessions(previous => previous.filter(item => item.id !== session.id))}
                              title="Delete session"
                              className="text-rose-400 hover:text-rose-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </div>
        )}

      </main>

      <footer className="border-t border-zinc-900 px-6 py-4 mt-6">
        <div className="max-w-7xl mx-auto flex justify-between gap-3 text-xs text-zinc-600">
          <span>NEURO-VISION</span>
          <span>Facial Analysis & Cognitive Indicators</span>
        </div>
      </footer>

    </div>
  );
}
