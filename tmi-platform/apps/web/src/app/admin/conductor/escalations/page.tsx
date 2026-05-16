"use client";

import { useEffect, useState } from "react";

type Escalation = {
  id: string;
  level: string;
  priority: string;
  reason: string;
  subsystem?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  createdAt: string;
  task?: { title: string; subsystem?: string } | null;
  agent?: { handle: string } | null;
};

const LEVEL_COLOR: Record<string, string> = {
  BOT_TEAM_LEAD: "text-blue-400 border-blue-500/40 bg-blue-950/20",
  MICHAEL_CHARLIE: "text-yellow-400 border-yellow-500/40 bg-yellow-950/20",
  BIG_ACE: "text-red-400 border-red-500/40 bg-red-950/20",
};

export default function ConductorEscalationsPage() {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/conductor/escalations?limit=50")
      .then((r) => r.json())
      .then((d) => { setEscalations(d.escalations ?? []); setTotal(d.total ?? 0); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const open = escalations.filter((e) => !e.resolvedAt);
  const resolved = escalations.filter((e) => e.resolvedAt);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <a href="/admin/conductor" className="text-white/30 text-xs hover:text-white/60 mb-1 block">← MC Command Center</a>
          <h1 className="text-2xl font-black">Escalation Engine</h1>
          <p className="text-white/40 text-sm">{open.length} open · {resolved.length} resolved · {total} total</p>
        </div>

        {loading ? (
          <div className="text-white/40 text-sm">Loading escalations...</div>
        ) : open.length === 0 ? (
          <div className="rounded-lg border border-green-500/20 bg-green-950/10 p-8 text-center text-green-400 text-sm">
            No open escalations. System is clean.
          </div>
        ) : null}

        {open.length > 0 && (
          <div className="mb-8">
            <div className="text-xs text-red-400 uppercase tracking-wider mb-3 font-bold">Open Escalations</div>
            <div className="space-y-3">
              {open.map((esc) => (
                <div key={esc.id} className="rounded-lg border border-red-500/20 bg-red-950/10 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${LEVEL_COLOR[esc.level] ?? "text-white/60 border-white/10"}`}>
                          → {esc.level.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-white/40">{esc.priority}</span>
                        {esc.subsystem && <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded">{esc.subsystem}</span>}
                      </div>
                      <div className="text-sm text-white/80">{esc.reason}</div>
                      {esc.task && (
                        <div className="text-xs text-white/30 mt-1">Task: {esc.task.title}</div>
                      )}
                      {esc.agent && (
                        <div className="text-xs text-white/30">Agent: {esc.agent.handle}</div>
                      )}
                    </div>
                    <div className="text-xs text-white/20 whitespace-nowrap">{new Date(esc.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {resolved.length > 0 && (
          <div>
            <div className="text-xs text-white/30 uppercase tracking-wider mb-3">Resolved</div>
            <div className="space-y-2">
              {resolved.slice(0, 10).map((esc) => (
                <div key={esc.id} className="rounded-lg border border-white/5 bg-white/3 p-3 opacity-60">
                  <div className="text-xs text-white/50">{esc.reason}</div>
                  {esc.resolution && <div className="text-xs text-white/30 mt-0.5">Resolution: {esc.resolution}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
