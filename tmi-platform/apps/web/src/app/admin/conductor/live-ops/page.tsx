"use client";

import { useEffect, useState } from "react";

export default function ConductorLiveOpsPage() {
  const [status, setStatus] = useState<any>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [killSwitches, setKillSwitches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/conductor/status").then((r) => r.json()),
      fetch("/api/conductor/incidents?limit=20").then((r) => r.json()),
      fetch("/api/conductor/kill-switches").then((r) => r.json()),
    ]).then(([st, inc, ks]) => {
      setStatus(st);
      setIncidents(inc.incidents ?? []);
      setKillSwitches(ks.switches ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const liveSwitches = killSwitches.filter((s) =>
    ["rooms", "games", "battles", "shows", "concerts", "voting", "cypher"].includes(s.key)
  );

  const openIncidents = incidents.filter((i) => i.status === "open");

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <a href="/admin/conductor" className="text-white/30 text-xs hover:text-white/60 mb-1 block">← MC Command Center</a>
          <h1 className="text-2xl font-black">Live Ops</h1>
          <p className="text-white/40 text-sm">Rooms · Games · Battles · Cyphers · Shows · Voting</p>
        </div>

        {loading ? (
          <div className="text-white/40 text-sm">Loading live ops data...</div>
        ) : (
          <div className="space-y-8">
            {/* Live Platform Status */}
            <section>
              <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Platform Status</div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className={`text-xl font-black ${status?.status === "OPERATIONAL" ? "text-green-400" : "text-red-400"}`}>
                  {status?.status ?? "UNKNOWN"}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                  <div><div className="text-white font-bold">{status?.openIncidents ?? 0}</div><div className="text-white/40 text-xs">Open Incidents</div></div>
                  <div><div className="text-white font-bold">{status?.openEscalations ?? 0}</div><div className="text-white/40 text-xs">Open Escalations</div></div>
                  <div><div className="text-white font-bold">{status?.activeAgents ?? 0}</div><div className="text-white/40 text-xs">Active Agents</div></div>
                  <div><div className="text-white font-bold">{status?.openTasks ?? 0}</div><div className="text-white/40 text-xs">Open Tasks</div></div>
                </div>
              </div>
            </section>

            {/* Live Kill Switches */}
            {liveSwitches.length > 0 && (
              <section>
                <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Live Feature Kill Switches</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {liveSwitches.map((sw) => (
                    <div key={sw.id} className={`rounded-lg border p-3 ${sw.isEnabled ? "border-green-500/30 bg-green-950/10" : "border-red-500/30 bg-red-950/10"}`}>
                      <div className="text-xs font-mono text-white">{sw.key}</div>
                      <div className={`text-sm font-bold ${sw.isEnabled ? "text-green-400" : "text-red-400"}`}>
                        {sw.isEnabled ? "ON" : "OFF"}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Open Incidents */}
            <section>
              <div className="text-xs text-white/40 uppercase tracking-wider mb-3">
                Open Incidents ({openIncidents.length})
              </div>
              {openIncidents.length === 0 ? (
                <div className="rounded-lg border border-green-500/20 bg-green-950/10 p-4 text-green-400 text-xs">
                  No open incidents. Live ops healthy.
                </div>
              ) : (
                <div className="space-y-2">
                  {openIncidents.map((inc) => (
                    <div key={inc.id} className="rounded-lg border border-red-500/20 bg-red-950/10 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-white font-semibold">{inc.title}</div>
                          <div className="text-xs text-white/40">{inc.subsystem} · {inc.priority}</div>
                        </div>
                        <span className="text-xs text-red-400">{inc.status.toUpperCase()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
