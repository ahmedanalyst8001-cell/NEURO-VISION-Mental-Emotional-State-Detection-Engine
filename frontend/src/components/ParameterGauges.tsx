import React from 'react';
import { PsychologicalScores } from '../types/telemetry';

interface ParameterGaugesProps {
  metrics: PsychologicalScores | null;
}

export function ParameterGauges({ metrics }: ParameterGaugesProps) {
  const getClamped = (val?: number) => Math.min(100, Math.max(0, val ?? 0));

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 text-slate-100 shadow p-6">
      <div className="flex flex-col space-y-1.5 mb-6">
        <h3 className="font-semibold leading-none tracking-tight text-sm font-mono text-slate-300">REAL-TIME PSYCHOLOGICAL PARAMETERS (0–100)</h3>
      </div>
      <div className="space-y-6">
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span>STRESS INDEX</span>
            <span className="text-cyan-400">{metrics?.stress ?? 0} / 100</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full bg-cyan-500 transition-all duration-300 ease-in-out" style={{ width: `${getClamped(metrics?.stress)}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span>VALENCE (AFFECTIVE POSITIVITY)</span>
            <span className="text-emerald-400">{metrics?.valence ?? 50} / 100</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full bg-emerald-500 transition-all duration-300 ease-in-out" style={{ width: `${getClamped(metrics?.valence)}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span>COGNITIVE ENGAGEMENT</span>
            <span className="text-indigo-400">{metrics?.engagement ?? 50} / 100</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full bg-indigo-500 transition-all duration-300 ease-in-out" style={{ width: `${getClamped(metrics?.engagement)}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span>ANXIETY INDEX</span>
            <span className="text-amber-400">{metrics?.anxiety ?? 0} / 100</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full bg-amber-500 transition-all duration-300 ease-in-out" style={{ width: `${getClamped(metrics?.anxiety)}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}