import React, { useEffect } from 'react';

interface BiometricFeedProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  feedback: string;
}

export function BiometricFeed({ videoRef, feedback }: BiometricFeedProps) {
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error("Webcam access error:", err));
  }, [videoRef]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 text-slate-100 shadow p-6">
      <div className="flex flex-col space-y-1.5 mb-4">
        <h3 className="font-semibold leading-none tracking-tight text-sm font-mono text-slate-300">BIOMETRIC SENSOR FEED</h3>
      </div>
      <div className="flex flex-col items-center">
        <video ref={videoRef} autoPlay playsInline muted className="rounded-lg border border-slate-700 w-full object-cover aspect-video bg-slate-950" />
        <div className="mt-4 p-3 bg-slate-950 rounded-md border border-slate-800 w-full">
          <span className="text-xs text-cyan-400 font-mono block mb-1">CLINICAL DIAGNOSTIC FEEDBACK:</span>
          <p className="text-xs text-slate-300 leading-relaxed">{feedback}</p>
        </div>
      </div>
    </div>
  );
}