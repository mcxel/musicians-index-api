"use client";

import { useEffect, useState } from "react";

type MCStatus = {
  conductor: string;
  masterCeo: string;
  status: string;
  openTasks: number;
  openEscalations: number;
  activeAgents: number;
  healthReportsToday: number;
  openIncidents: number;
  pendingApprovals: number;
  timestamp: string;
};

function StatCard({ label, value, urgent }: { label: string; value: number | string; urgent?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${urgent && Number(value) > 0 ? "border-red-500/60 bg-red-950/30" : "border-white/10 bg-white/5"}`}>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-white/50 mt-1">{label}</div>
    </div>
  );
}

export default function ConductorCommandCenter() {
  const [status, setStatus] = useState<MCStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/conductor/status")
      .then((r) => r.json())
      .then((d) => { setStatus(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
            <h1 className="text-3xl font-black tracking-tight">MICHAEL CHARLIE</h1>
            <span className="text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-2 py-0.5 rounded-full font-mono">
              CONDUCTOR CEO — TMI
            </span>
          </div>
          <p className="text-white/40 text-sm">
            Operating CEO of The Musician&apos;s Index. All teams, tasks, and escalations run through MC.
            Big Ace is master CEO of all companies.
          </p>
        </div>

        {loading ? (
          <div className="text-white/40 text-sm">Loading MC status...</div>
        ) : status ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
              <StatCard label="Open Tasks" value={status.openTasks} />
              <StatCard label="Escalations" value={status.openEscalations} urgent />
              <StatCard label="Active Agents" value={status.activeAgents} />
              <StatCard label="Health Reports Today" value={status.healthReportsToday} />
              <StatCard label="Open Incidents" value={status.openIncidents} urgent />
              <StatCard label="Pending Approvals" value={status.pendingApprovals} urgent />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Authority Chain</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gold-400 bg-yellow-400" />
                    <span className="text-sm font-bold text-yellow-300">Big Ace</span>
                    <span className="text-xs text-white/30 ml-auto">Master CEO — All Companies</span>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-sm font-bold text-blue-300">Michael Charlie</span>
                    <span className="text-xs text-white/30 ml-auto">Conductor CEO — TMI Only</span>
                  </div>
                  <div className="ml-8 text-xs text-white/30">↳ Bot Team Leads → Bot Agents</div>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Platform Status</div>
                <div className={`text-lg font-bold ${status.status === 'OPERATIONAL' ? 'text-green-400' : 'text-red-400'}`}>
                  {status.status}
                </div>
                <div className="text-xs text-white/30 mt-1">
                  Last updated: {new Date(status.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Quick nav */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                { href: "/admin/conductor/tasks", label: "Tasks", desc: "All MC task assignments" },
                { href: "/admin/conductor/bots", label: "Bot Teams", desc: "Registry + agent status" },
                { href: "/admin/conductor/escalations", label: "Escalations", desc: "P0/P1 issues" },
                { href: "/admin/conductor/checkpoints", label: "Checkpoints", desc: "Daily/weekly reviews" },
                { href: "/admin/conductor/reports", label: "Health Reports", desc: "Subsystem monitoring" },
                { href: "/admin/conductor/economy", label: "Economy Monitor", desc: "Wallet + revenue" },
                { href: "/admin/conductor/live-ops", label: "Live Ops", desc: "Rooms + games + shows" },
                { href: "/admin/conductor/build-ops", label: "Build Ops", desc: "Deploy + QA status" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 p-4 transition-colors"
                >
                  <div className="text-sm font-bold text-white">{item.label}</div>
                  <div className="text-xs text-white/40 mt-1">{item.desc}</div>
                </a>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-4 text-red-400 text-sm">
            MC status unavailable. API may be offline. Check /api/conductor/status.
          </div>
        )}
      </div>
    </main>
  );
}
