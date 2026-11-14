import { useEffect, useRef, useState } from 'react';
import { PsychologicalScores } from '../types/telemetry';

export function useNeuroStream(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [metrics, setMetrics] = useState<PsychologicalScores | null>(null);
  const [feedback, setFeedback] = useState<string>("Initializing telemetry stream...");
  const [history, setHistory] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws/analyze";
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status === "success" && data.scores) {
        setMetrics(data.scores);
        setFeedback(data.feedback);

        const timeStr = new Date().toLocaleTimeString();
        setHistory(prev => [
          ...prev.slice(-20),
          {
            time: timeStr,
            stress: data.scores.stress,
            valence: data.scores.valence,
            engagement: data.scores.engagement,
            anxiety: data.scores.anxiety,
          }
        ]);
      } else {
        setFeedback("No face detected in frame. Please adjust positioning.");
      }
    };

    const canvas = document.createElement('canvas');
    const interval = setInterval(() => {
      if (!videoRef.current || ws.readyState !== WebSocket.OPEN) return;
      const video = videoRef.current;
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const image = canvas.toDataURL("image/jpeg", 0.6);
      ws.send(JSON.stringify({ image }));
    }, 100);

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, [videoRef]);

  return { metrics, feedback, history };
}