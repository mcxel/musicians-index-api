"use client";

import { useEffect, useState } from "react";

export default function ConductorCheckpointsPage() {
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Checkpoints come from the quality gates + checkpoint models
    fetch("/api/conductor/quality-gates")
      .then((r) => r.json())
      .then((d) => { setCheckpoints(d.gates ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const FREQ_COLORS: Record<string, string> = {
    DAILY: "text-blue-400",
    WEEKLY: "text-yellow-400",
    MONTHLY: "text-orange-400",
    YEARLY: "text-red-400",
  };
  const RESULT_COLORS: Record<string, string> = {
    PASS: "text-green-400",
    PARTIAL: "text-yellow-400",
    FAIL: "text-red-400",
  };

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <a href="/admin/conductor" className="text-white/30 text-xs hover:text-white/60 mb-1 block">← MC Command Center</a>
          <h1 className="text-2xl font-black">Checkpoint Engine</h1>
          <p className="text-white/40 text-sm">Daily / Weekly / Monthly / Yearly reviews. Every team must pass.</p>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: "Daily", freq: "DAILY", color: "border-blue-500/30" },
            { label: "Weekly", freq: "WEEKLY", color: "border-yellow-500/30" },
            { label: "Monthly", freq: "MONTHLY", color: "border-orange-500/30" },
            { label: "Yearly", freq: "YEARLY", color: "border-red-500/30" },
          ].map((item) => (
            <div key={item.freq} className={`rounded-lg border ${item.color} bg-white/5 p-4 text-center`}>
              <div className={`text-sm font-bold ${FREQ_COLORS[item.freq]}`}>{item.label}</div>
              <div className="text-xs text-white/30 mt-1">checkpoint cycle</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-white/40 text-sm">Loading checkpoints...</div>
        ) : checkpoints.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center text-white/30 text-sm">
            No checkpoint data yet. Run quality gate checks to populate.
          </div>
        ) : (
          <div className="space-y-2">
            {checkpoints.map((gate: any) => (
              <div key={gate.id} className="rounded-lg border border-white/10 bg-white/5 p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">{gate.checkName}</div>
                  <div className="text-xs text-white/40">{gate.subsystem}</div>
                  {gate.proof && <div className="text-xs text-white/30 mt-1 font-mono truncate max-w-xs">{gate.proof}</div>}
                </div>
                <div className={`text-sm font-bold ${RESULT_COLORS[gate.result] ?? "text-white/60"}`}>
                  {gate.result}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
