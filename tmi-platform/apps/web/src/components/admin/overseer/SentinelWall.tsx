"use client";

import { useState } from "react";

type AlertSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

interface SentinelAlert {
  id: string;
  type: "moderation" | "fraud" | "spam" | "exploit" | "breach";
  severity: AlertSeverity;
  message: string;
  userId?: string;
  ts: string;
  resolved: boolean;
}

const SEED_ALERTS: SentinelAlert[] = [
  { id: "a1", type: "fraud",      severity: "CRITICAL", message: "Multi-account ticket fraud detected",    userId: "u-4421", ts: "2m ago",  resolved: false },
  { id: "a2", type: "breach",     severity: "HIGH",     message: "Unusual auth pattern — 14 rapid logins", userId: "u-7712", ts: "5m ago",  resolved: false },
  { id: "a3", type: "exploit",    severity: "HIGH",     message: "Rate limit bypass attempt on /api/vote",              ts: "8m ago",  resolved: false },
  { id: "a4", type: "spam",       severity: "MEDIUM",   message: "Bot-pattern chat flood in Cypher Room 3",userId: "u-0931", ts: "12m ago", resolved: false },
  { id: "a5", type: "moderation", severity: "MEDIUM",   message: "Hate speech incident flagged — Room 12",  userId: "u-5508", ts: "18m ago", resolved: true  },
  { id: "a6", type: "spam",       severity: "LOW",      message: "Duplicate tip submission blocked",        userId: "u-2247", ts: "31m ago", resolved: true  },
];

const SEVERITY_STYLE: Record<AlertSeverity, string> = {
  CRITICAL: "border-red-500/70 bg-red-500/10 text-red-300",
  HIGH:     "border-orange-500/60 bg-orange-500/10 text-orange-200",
  MEDIUM:   "border-amber-400/50 bg-amber-500/10 text-amber-200",
  LOW:      "border-zinc-500/40 bg-zinc-700/20 text-zinc-400",
};

export default function SentinelWall() {
  const [alerts, setAlerts] = useState(SEED_ALERTS);
  const active = alerts.filter((a) => !a.resolved);
  const resolved = alerts.filter((a) => a.resolved);

  function resolve(id: string) {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, resolved: true } : a));
  }

  return (
    <section className="flex h-full flex-col rounded-xl border border-rose-400/30 bg-black/60 p-3">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-rose-400">Security Sentinel</p>
          <p className="text-[11px] font-black uppercase text-white">Threat Wall</p>
        </div>
        <div className="flex gap-1.5">
          <span className="rounded border border-red-500/50 bg-red-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-red-300">
            {active.length} ACTIVE
          </span>
          <span className="rounded border border-zinc-600/40 bg-zinc-800/30 px-2 py-0.5 text-[9px] font-black uppercase text-zinc-400">
            {resolved.length} CLR
          </span>
        </div>
      </header>

      {/* Active alerts */}
      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-lg border p-2 ${alert.resolved ? "opacity-40" : ""} ${SEVERITY_STYLE[alert.severity]}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="mb-0.5 flex items-center gap-1.5">
                  <span className="text-[8px] font-black uppercase">{alert.severity}</span>
                  <span className="text-[8px] uppercase text-zinc-500">·</span>
                  <span className="text-[8px] uppercase text-zinc-400">{alert.type}</span>
                  <span className="ml-auto text-[8px] text-zinc-500">{alert.ts}</span>
                </div>
                <p className="text-[10px] font-bold text-white">{alert.message}</p>
                {alert.userId && (
                  <p className="mt-0.5 text-[8px] text-zinc-400">UID: {alert.userId}</p>
                )}
              </div>
              {!alert.resolved && (
                <button
                  onClick={() => resolve(alert.id)}
                  className="shrink-0 rounded border border-rose-400/40 px-1.5 py-0.5 text-[8px] font-black uppercase text-rose-200 hover:bg-rose-500/20"
                >
                  CLR
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
