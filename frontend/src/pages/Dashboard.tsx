import React, { useRef } from "react";
import { BiometricFeed } from "../components/BiometricFeed";
import { ParameterGauges } from "../components/ParameterGauges";
import { ClinicalFeedbackPanel } from "../components/ClinicalFeedbackPanel";
import { TrendChart } from "../components/TrendChart";
import { useNeuroStream } from "../hooks/useNeuroStream";

export default function Dashboard() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { metrics, feedback, history } = useNeuroStream(videoRef);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <header className="mb-8 flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-cyan-400">NEURO-VISION ENGINE</h1>
          <p className="text-sm text-slate-400">Enterprise Mental & Emotional State Detection Suite</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-mono text-emerald-400">STREAM ACTIVE</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-6">
          <BiometricFeed videoRef={videoRef} feedback={feedback} />
          <ClinicalFeedbackPanel feedback={feedback} />
        </div>

        <div className="col-span-1 lg:col-span-2 space-y-6">
          <ParameterGauges metrics={metrics} />
          <TrendChart history={history} />
        </div>
      </div>
    </div>
  );
}