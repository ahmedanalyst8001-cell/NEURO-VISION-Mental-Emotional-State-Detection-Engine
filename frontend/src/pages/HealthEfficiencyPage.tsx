import React from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip,
} from 'recharts';
import { HeartPulse, Brain, ShieldCheck, Activity, Zap, Clock } from 'lucide-react';
import { PsychologicalScores, BiometricEfficiency, EmotionCategory } from '../types/telemetry';

interface HealthEfficiencyProps {
  metrics: PsychologicalScores;
  efficiency: BiometricEfficiency;
  primaryEmotion: EmotionCategory;
}

export const HealthEfficiencyPage: React.FC<HealthEfficiencyProps> = ({
  metrics,
  efficiency,
  primaryEmotion,
}) => {
  // Composite Wellness & Productivity Readiness Score (0-100)
  const overallReadiness = Math.round(
    efficiency.autonomicBalance * 0.3 +
      efficiency.attentionStability * 0.25 +
      efficiency.emotionalRegulation * 0.25 +
      (100 - efficiency.fatigueRisk) * 0.2
  );

  const radarData = [
    { subject: 'Autonomic Balance', score: efficiency.autonomicBalance, fullMark: 100 },
    { subject: 'Attention Stability', score: efficiency.attentionStability, fullMark: 100 },
    { subject: 'Emotional Control', score: efficiency.emotionalRegulation, fullMark: 100 },
    { subject: 'Positive Valence', score: Math.round(metrics.valence), fullMark: 100 },
    { subject: 'Fatigue Resilience', score: 100 - efficiency.fatigueRisk, fullMark: 100 },
    { subject: 'Cognitive Capacity', score: 100 - Math.max(0, efficiency.cognitiveLoadIndex - 65), fullMark: 100 },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Executive Readiness Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-900 to-cyan-950/40 border border-cyan-800/40 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Neuro-Readiness Index
            </span>
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="my-4">
            <span className="text-5xl font-black font-mono text-white">{overallReadiness}</span>
            <span className="text-sm text-slate-400 ml-2">/ 100</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {overallReadiness >= 75
              ? 'Peak neuro-cognitive readiness. Ideal window for high-complexity analytical or creative work.'
              : overallReadiness >= 50
              ? 'Moderate physiological strain detected. Maintain hydration and pace cognitive workloads.'
              : 'Elevated autonomic stress or fatigue. Immediate restorative protocol recommended.'}
          </p>
        </div>

        {/* Biometric Matrix Table */}
        <div className="md:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" /> Clinical Biometric & Health Efficiency Matrix
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs uppercase text-slate-400">
                  <th className="py-2.5 pr-4">Biometric Parameter</th>
                  <th className="py-2.5 px-4">Live Value</th>
                  <th className="py-2.5 px-4">Clinical Reference</th>
                  <th className="py-2.5 pl-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-200">
                <tr>
                  <td className="py-3 pr-4 font-medium">Autonomic Nervous Balance</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">{efficiency.autonomicBalance}%</td>
                  <td className="py-3 px-4 text-slate-400 text-xs">65% – 100% (Parasympathetic)</td>
                  <td className="py-3 pl-4">
                    <StatusPill ok={efficiency.autonomicBalance >= 60} label={efficiency.autonomicBalance >= 60 ? 'Optimal' : 'Sympathetic Strain'} />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">Cognitive Load Index</td>
                  <td className="py-3 px-4 font-mono font-bold text-cyan-400">{efficiency.cognitiveLoadIndex}%</td>
                  <td className="py-3 px-4 text-slate-400 text-xs">35% – 75% (Productive Zone)</td>
                  <td className="py-3 pl-4">
                    <StatusPill ok={efficiency.cognitiveLoadIndex <= 78} label={efficiency.cognitiveLoadIndex <= 78 ? 'Sustainable' : 'Overload Risk'} />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">Estimated Ocular Blink Rate</td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-400">{efficiency.estimatedBlinkRate} bpm</td>
                  <td className="py-3 px-4 text-slate-400 text-xs">12 – 20 blinks / min</td>
                  <td className="py-3 pl-4">
                    <StatusPill
                      ok={efficiency.estimatedBlinkRate >= 10 && efficiency.estimatedBlinkRate <= 22}
                      label={efficiency.estimatedBlinkRate < 10 ? 'Screen Staring' : efficiency.estimatedBlinkRate > 22 ? 'Stress / Dry Eye' : 'Normal'}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">Fatigue & Burnout Risk</td>
                  <td className="py-3 px-4 font-mono font-bold text-rose-400">{efficiency.fatigueRisk}%</td>
                  <td className="py-3 px-4 text-slate-400 text-xs">&lt; 35% (Low Risk)</td>
                  <td className="py-3 pl-4">
                    <StatusPill ok={efficiency.fatigueRisk < 40} label={efficiency.fatigueRisk < 40 ? 'Alert' : 'Recovery Needed'} />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">Affective Regulation Stability</td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-400">{efficiency.emotionalRegulation}%</td>
                  <td className="py-3 px-4 text-slate-400 text-xs">70% – 100% (Steady)</td>
                  <td className="py-3 pl-4">
                    <StatusPill ok={efficiency.emotionalRegulation >= 65} label={efficiency.emotionalRegulation >= 65 ? 'Regulated' : 'High Volatility'} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Radar Chart + Actionable Clinical Protocols */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
            <Brain className="w-4 h-4 text-cyan-400" /> 6-Axis Neuro-Efficiency Profile
          </h3>
          <p className="text-xs text-slate-400 mb-4">Multidimensional balance across cognitive, autonomic, and affective domains</p>
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar
                  name="Efficiency"
                  dataKey="score"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.3}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-400" /> Adaptive Intervention Protocol
            </h3>
            <p className="text-xs text-slate-400">
              Tailored physiological adjustments based on current state: <strong className="text-cyan-300">{primaryEmotion}</strong>
            </p>
          </div>

          <div className="space-y-3">
            <ProtocolCard
              icon={<Zap className="w-4 h-4 text-amber-400" />}
              title="Autonomic Down-Regulation (Physiological Sigh)"
              desc={
                metrics.stress > 50 || metrics.anxiety > 50
                  ? 'Triggered: Elevated brow/lip tension detected. Perform 2 double-inhales through the nose followed by a long exhale to rapidly lower heart rate.'
                  : 'Standby: Sympathetic tone is currently within normal limits. Maintain steady posture.'
              }
            />
            <ProtocolCard
              icon={<Clock className="w-4 h-4 text-cyan-400" />}
              title="Ocular & Prefrontal Recovery (20-20-20 Rule)"
              desc={
                efficiency.estimatedBlinkRate < 11 || efficiency.cognitiveLoadIndex > 75
                  ? 'Triggered: Reduced blink frequency indicates intense screen fixation. Look 20 feet away for 20 seconds to reset ciliary muscles.'
                  : 'Optimal: Ocular blink cadence supports sustained visual processing without strain.'
              }
            />
            <ProtocolCard
              icon={<Brain className="w-4 h-4 text-emerald-400" />}
              title="Cognitive Pacing Recommendation"
              desc={
                efficiency.fatigueRisk > 50
                  ? 'High Fatigue Marker: Shift from deep analytical tasks to administrative or low-load review for the next 15 minutes.'
                  : 'High Cognitive Capacity: Prime window for problem-solving, coding, or strategic decision-making.'
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        ok
          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
          : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
      }`}
    >
      {label}
    </span>
  );
}

function ProtocolCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-1">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
        {icon}
        <span>{title}</span>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}