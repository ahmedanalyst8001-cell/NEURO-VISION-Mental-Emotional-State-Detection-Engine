import React from 'react';

export function ClinicalFeedbackPanel({ feedback }: { feedback: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 text-slate-100 shadow p-6">
      <div className="flex flex-col space-y-1.5 mb-4">
        <h3 className="font-semibold leading-none tracking-tight text-sm font-mono text-slate-300">DIAGNOSTIC PROTOCOL & LOGS</h3>
      </div>
      <div>
        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
          <div className="text-cyan-400 font-bold">SYSTEM ACTIVE: 60 FPS SAMPLING</div>
          <p className="leading-relaxed">{feedback}</p>
        </div>
      </div>
    </div>
  );
}