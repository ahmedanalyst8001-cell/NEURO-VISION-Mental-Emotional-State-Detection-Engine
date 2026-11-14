import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface TrendChartProps {
  history: any[];
}

export function TrendChart({ history }: TrendChartProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 text-slate-100 shadow col-span-1 lg:col-span-2 p-6">
      <div className="flex flex-col space-y-1.5 mb-4">
        <h3 className="font-semibold leading-none tracking-tight text-sm font-mono text-slate-300">PSYCHOLOGICAL PARAMETER TIMELINE</h3>
      </div>
      <div>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="stress" stroke="#06b6d4" strokeWidth={2} dot={false} name="Stress" />
              <Line type="monotone" dataKey="valence" stroke="#10b981" strokeWidth={2} dot={false} name="Valence" />
              <Line type="monotone" dataKey="anxiety" stroke="#f59e0b" strokeWidth={2} dot={false} name="Anxiety" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}