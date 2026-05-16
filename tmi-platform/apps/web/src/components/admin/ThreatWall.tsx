"use client";

import { useEffect, useReducer } from "react";

type ThreatType = "moderation" | "ticket" | "bot" | "auth" | "fraud";
type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

interface ThreatAlert {
  id: string;
  type: ThreatType;
  severity: Severity;
  message: string;
  userId?: string;
  ts: string;
  cleared: boolean;
}

const SEED: ThreatAlert[] = [
  { id: "t1", type: "fraud",      severity: "CRITICAL", message: "Multi-account ticket purchase — 6 tickets, 1 device",  userId: "u-4421", ts: "just now", cleared: false },
  { id: "t2", type: "auth",       severity: "HIGH",     message: "Brute-force login pattern — 28 attempts in 90s",       userId: "u-7712", ts: "1m ago",   cleared: false },
  { id: "t3", type: "ticket",     severity: "HIGH",     message: "Suspicious scan — same QR re-used at Gate 3",          userId: "u-3308", ts: "3m ago",   cleared: false },
  { id: "t4", type: "bot",        severity: "MEDIUM",   message: "Bot flood in Cypher Room 3 — 190 messages/min",                          ts: "5m ago",   cleared: false },
  { id: "t5", type: "moderation", severity: "MEDIUM",   message: "Hate speech incident — Room 7, user escalated",        userId: "u-5508", ts: "9m ago",   cleared: false },
  { id: "t6", type: "auth",       severity: "LOW",      message: "Failed 2FA x5 — no lockout triggered yet",             userId: "u-2247", ts: "14m ago",  cleared: true  },
  { id: "t7", type: "ticket",     severity: "LOW",      message: "Refund anomaly — rapid cancel + rebuy pattern",        userId: "u-9901", ts: "22m ago",  cleared: true  },
];

const AUTO_INJECT: Omit<ThreatAlert, "id" | "ts" | "cleared">[] = [
  { type: "bot",        severity: "MEDIUM",   message: "Rate-limit bypass on /api/vote" },
  { type: "auth",       severity: "HIGH",     message: "Token replay attempt — expired JWT reused" },
  { type: "moderation", severity: "LOW",      message: "Spam wave in Battle feed — filtered" },
  { type: "ticket",     severity: "MEDIUM",   message: "QR scan velocity anomaly — Gate 1" },
  { type: "fraud",      severity: "CRITICAL", message: "Card testing pattern on checkout route" },
];

const SEV_STYLE: Record<Severity, string> = {
  CRITICAL: "border-red-500/70 bg-red-500/10 text-red-300",
  HIGH:     "border-orange-500/60 bg-orange-500/10 text-orange-200",
  MEDIUM:   "border-amber-400/50 bg-amber-500/10 text-amber-200",
  LOW:      "border-zinc-500/40 bg-zinc-700/20 text-zinc-400",
};

const TYPE_LABEL: Record<ThreatType, string> = {
  moderation: "MOD",
  ticket:     "TICKET",
  bot:        "BOT",
  auth:       "AUTH",
  fraud:      "FRAUD",
};

type Action =
  | { type: "clear"; id: string }
  | { type: "inject"; alert: ThreatAlert };

function alertReducer(state: ThreatAlert[], action: Action): ThreatAlert[] {
  if (action.type === "clear") {
    return state.map((a) => a.id === action.id ? { ...a, cleared: true } : a);
  }
  if (action.type === "inject") {
    return [action.alert, ...state].slice(0, 20);
  }
  return state;
}

let _nextId = 100;

export default function ThreatWall() {
  const [alerts, dispatch] = useReducer(alertReducer, SEED);

  useEffect(() => {
    const id = setInterval(() => {
      const template = AUTO_INJECT[Math.floor(Math.random() * AUTO_INJECT.length)];
      if (!template) return;
      dispatch({
        type: "inject",
        alert: {
          ...template,
          id: `auto-${_nextId++}`,
          ts: "just now",
          cleared: false,
        },
      });
    }, 18_000);
    return () => clearInterval(id);
  }, []);

  const active  = alerts.filter((a) => !a.cleared);
  const cleared = alerts.filter((a) => a.cleared);

  return (
    <section className="flex h-full flex-col rounded-xl border border-rose-400/30 bg-black/60 p-3">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-rose-400">Threat Wall</p>
          <p className="text-[11px] font-black uppercase text-white">Live Security Feed</p>
        </div>
        <div className="flex gap-1.5">
          <span className="rounded border border-red-500/60 bg-red-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-red-300">
            {active.length} ACTIVE
          </span>
          <span className="rounded border border-zinc-600/40 bg-zinc-800/30 px-2 py-0.5 text-[9px] font-black uppercase text-zinc-500">
            {cleared.length} CLR
          </span>
        </div>
      </header>

      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {active.length === 0 && (
          <p className="py-4 text-center text-[9px] uppercase tracking-[0.14em] text-zinc-600">No active threats</p>
        )}
        {active.map((a) => (
          <div key={a.id} className={`rounded-lg border p-2 ${SEV_STYLE[a.severity]}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="mb-0.5 flex items-center gap-1.5">
                  <span className="rounded border border-white/10 bg-black/30 px-1 py-0.5 text-[7px] font-black uppercase">
                    {TYPE_LABEL[a.type]}
                  </span>
                  <span className="text-[7px] font-black uppercase">{a.severity}</span>
                  {a.userId && (
                    <span className="text-[7px] text-zinc-500">{a.userId}</span>
                  )}
                </div>
                <p className="text-[9px] font-semibold leading-snug">{a.message}</p>
                <p className="mt-0.5 text-[7px] text-zinc-500">{a.ts}</p>
              </div>
              <button
                type="button"
                onClick={() => dispatch({ type: "clear", id: a.id })}
                className="flex-shrink-0 rounded border border-white/10 bg-black/30 px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.1em] text-zinc-400 hover:border-white/25 hover:text-white"
              >
                CLR
              </button>
            </div>
          </div>
        ))}

        {cleared.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer text-[8px] font-black uppercase tracking-[0.14em] text-zinc-600 hover:text-zinc-400">
              {cleared.length} cleared
            </summary>
            <div className="mt-1 space-y-1">
              {cleared.map((a) => (
                <div key={a.id} className="rounded border border-zinc-700/30 bg-zinc-900/30 px-2 py-1 text-[8px] text-zinc-600">
                  [{TYPE_LABEL[a.type]}] {a.message}
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </section>
  );
}
