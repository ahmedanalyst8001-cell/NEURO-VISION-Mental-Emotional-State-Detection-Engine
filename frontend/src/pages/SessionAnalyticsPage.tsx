import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import { Download, History, Trash2, BarChart3 } from 'lucide-react';
import { SessionRecord, TelemetryPoint } from '../types/telemetry';

interface SessionAnalyticsProps {
  sessions: SessionRecord[];
  liveHistory: TelemetryPoint[];
  onClearSessions: () => void;
}

export const SessionAnalyticsPage: React.FC<SessionAnalyticsProps> = ({
  sessions,
  liveHistory,
  onClearSessions,
}) => {
  // Aggregate emotion frequency from current live buffer
  const emotionCounts = liveHistory.reduce<Record<string, number>>((acc, pt) => {
    acc[pt.emotion] = (acc[pt.emotion] || 0) + 1;
    return acc;
  }, {});

  const distributionData = Object.entries(emotionCounts).map(([emotion, count]) => ({
    emotion,
    percentage: Math.round((count / Math.max(1, liveHistory.length)) * 100),
  }));

  const exportCSV = () => {
    if (liveHistory.length === 0) return;
    const headers = ['Time', 'Detected Emotion', 'Stress', 'Valence', 'Engagement', 'Anxiety', 'Cognitive Load'];
    const rows = liveHistory.map((pt) => [
      pt.time,
      `"${pt.emotion}"`,
      pt.stress,
      pt.valence,
      pt.engagement,
      pt.anxiety,
      pt.cognitiveLoad,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `neuro_vision_telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Emotion Distribution Breakdown */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" /> Affective State Distribution (Current Buffer)
            </h3>
            <p className="text-xs text-slate-400">
              Proportional breakdown of distinct emotional states detected across recent telemetry frames
            </p>
          </div>
          <button
            onClick={exportCSV}
            disabled={liveHistory.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-cyan-300 border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Live Telemetry (CSV)
          </button>
        </div>

        <div className="w-full h-[260px]">
          {distributionData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} unit="%" />
                <YAxis type="category" dataKey="emotion" width={165} stroke="#cbd5e1" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px' }}
                />
                <Bar dataKey="percentage" radius={[0, 6, 6, 0]}>
                  {distributionData.map((_, idx) => (
                    <Cell key={idx} fill={idx % 2 === 0 ? '#06b6d4' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              No telemetry frames captured yet. Return to Live Monitor to stream facial data.
            </div>
          )}
        </div>
      </div>

      {/* Saved Clinical Sessions Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" /> Archived Clinical Evaluation Sessions
          </h3>
          {sessions.length > 0 && (
            <button
              onClick={onClearSessions}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear History
            </button>
          )}
        </div>

        {sessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs uppercase text-slate-400">
                  <th className="py-3 pr-4">Timestamp</th>
                  <th className="py-3 px-3">Duration</th>
                  <th className="py-3 px-3">Dominant Emotion</th>
                  <th className="py-3 px-3">Avg Stress</th>
                  <th className="py-3 px-3">Avg Valence</th>
                  <th className="py-3 px-3">Avg Engagement</th>
                  <th className="py-3 pl-3">Efficiency Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="py-3 pr-4 font-mono text-xs">{s.startTime}</td>
                    <td className="py-3 px-3 font-mono text-xs">{s.durationSec}s</td>
                    <td className="py-3 px-3 font-semibold text-cyan-300">{s.dominantEmotion}</td>
                    <td className="py-3 px-3 font-mono text-rose-400">{s.avgStress.toFixed(1)}</td>
                    <td className="py-3 px-3 font-mono text-emerald-400">{s.avgValence.toFixed(1)}</td>
                    <td className="py-3 px-3 font-mono text-cyan-400">{s.avgEngagement.toFixed(1)}</td>
                    <td className="py-3 pl-3 font-mono font-bold text-indigo-300">{s.efficiencyScore}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-400 py-6 text-center">
            No saved sessions yet. Click <strong>"Record Clinical Session"</strong> on the Live Monitor page to log an evaluation.
          </p>
        )}
      </div>
    </div>
  );
};