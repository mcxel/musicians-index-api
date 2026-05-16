"use client";

import { useEffect, useState } from "react";

export default function ConductorBuildOpsPage() {
  const [gates, setGates] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/conductor/quality-gates").then((r) => r.json()),
      fetch("/api/conductor/tasks?subsystem=build&limit=20").then((r) => r.json()),
    ]).then(([g, t]) => {
      setGates(g.gates ?? []);
      setTasks(t.tasks ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const GATE_COLOR: Record<string, string> = {
    PASS: "text-green-400 border-green-500/30 bg-green-950/10",
    PARTIAL: "text-yellow-400 border-yellow-500/30 bg-yellow-950/10",
    FAIL: "text-red-400 border-red-500/30 bg-red-950/10",
  };

  const passCount = gates.filter((g) => g.result === "PASS").length;
  const failCount = gates.filter((g) => g.result === "FAIL").length;
  const partialCount = gates.filter((g) => g.result === "PARTIAL").length;

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <a href="/admin/conductor" className="text-white/30 text-xs hover:text-white/60 mb-1 block">← MC Command Center</a>
          <h1 className="text-2xl font-black">Build Ops</h1>
          <p className="text-white/40 text-sm">Quality gates · Build status · Deploy readiness · QA checkpoints</p>
        </div>

        {/* Gate summary */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="rounded-lg border border-green-500/30 bg-green-950/10 p-4 text-center">
            <div className="text-2xl font-black text-green-400">{passCount}</div>
            <div className="text-xs text-white/40 mt-1">PASS</div>
          </div>
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-950/10 p-4 text-center">
            <div className="text-2xl font-black text-yellow-400">{partialCount}</div>
            <div className="text-xs text-white/40 mt-1">PARTIAL</div>
          </div>
          <div className="rounded-lg border border-red-500/30 bg-red-950/10 p-4 text-center">
            <div className="text-2xl font-black text-red-400">{failCount}</div>
            <div className="text-xs text-white/40 mt-1">FAIL</div>
          </div>
        </div>

        {loading ? (
          <div className="text-white/40 text-sm">Loading build ops data...</div>
        ) : (
          <div className="space-y-8">
            {/* Quality Gates */}
            <section>
              <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Quality Gate Checks</div>
              {gates.length === 0 ? (
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-xs text-white/30">
                  No quality gate results yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {gates.map((g) => (
                    <div key={g.id} className={`rounded-lg border p-3 flex items-center justify-between ${GATE_COLOR[g.result] ?? "border-white/10 bg-white/5"}`}>
                      <div>
                        <div className="text-sm font-semibold text-white">{g.checkName}</div>
                        <div className="text-xs text-white/40">{g.subsystem}</div>
                        {g.proof && <div className="text-xs text-white/30 font-mono truncate max-w-sm mt-1">{g.proof}</div>}
                      </div>
                      <div className={`text-sm font-black ${g.result === "PASS" ? "text-green-400" : g.result === "PARTIAL" ? "text-yellow-400" : "text-red-400"}`}>
                        {g.result}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Build tasks */}
            {tasks.length > 0 && (
              <section>
                <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Build Tasks</div>
                <div className="space-y-2">
                  {tasks.map((t) => (
                    <div key={t.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="text-sm text-white font-semibold">{t.title}</div>
                      <div className="text-xs text-white/40">{t.status} · {t.priority}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
