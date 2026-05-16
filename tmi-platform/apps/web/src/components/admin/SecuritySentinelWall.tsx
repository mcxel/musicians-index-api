"use client";

import { useEffect, useReducer, useState } from "react";

type AttackVector = "auth" | "ticket" | "bot" | "payment" | "api";
type ThreatLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

interface SentinelEvent {
  id: string;
  vector: AttackVector;
  level: ThreatLevel;
  title: string;
  detail: string;
  ip?: string;
  userId?: string;
  count: number;
  ts: string;
  resolved: boolean;
}

const SEED: SentinelEvent[] = [
  { id: "s1",  vector: "auth",    level: "CRITICAL", title: "Credential Stuffing Attack",    detail: "4,200 login attempts in 8 min from 12 IPs. Pattern matches known breach list.",  ip: "185.220.x.x",  count: 4200, ts: "live",   resolved: false },
  { id: "s2",  vector: "payment", level: "CRITICAL", title: "Card Testing Pattern",           detail: "Sequential card BIN testing on /checkout. 38 declined in 4 min.",               ip: "91.108.x.x",   count: 38,   ts: "2m ago", resolved: false },
  { id: "s3",  vector: "ticket",  level: "HIGH",     title: "QR Re-use Detected",             detail: "Same QR hash validated 4×. Gate 3 and Gate 5 within 11 min.",                   userId: "u-3308",   count: 4,    ts: "4m ago", resolved: false },
  { id: "s4",  vector: "api",     level: "HIGH",     title: "Rate-Limit Bypass",              detail: "Rotated User-Agent headers bypassing /api/vote rate limiter. 1,200 req/min.",   ip: "45.33.x.x",    count: 1200, ts: "7m ago", resolved: false },
  { id: "s5",  vector: "bot",     level: "HIGH",     title: "Coordinated Bot Flood",          detail: "190 msg/min in Cypher Room 3 — non-human cadence. Auto-ban triggered.",                              count: 190,  ts: "9m ago", resolved: false },
  { id: "s6",  vector: "auth",    level: "MEDIUM",   title: "Session Token Replay",           detail: "Expired JWT reused from different device fingerprint.",                          userId: "u-7712",   count: 3,    ts: "13m ago", resolved: false },
  { id: "s7",  vector: "ticket",  level: "MEDIUM",   title: "Multi-device Purchase",          detail: "6 tickets, 1 device, 3 billing addresses in 8 min.",                            userId: "u-4421",   count: 6,    ts: "18m ago", resolved: false },
  { id: "s8",  vector: "payment", level: "LOW",      title: "Chargeback Velocity",            detail: "3 chargebacks in 24h from same card prefix — flagged.",                         userId: "u-9901",   count: 3,    ts: "1h ago", resolved: true  },
  { id: "s9",  vector: "auth",    level: "LOW",      title: "2FA Failure Spike",              detail: "12 failed 2FA in 30 min, no lockout reached.",                                  userId: "u-2247",   count: 12,   ts: "1h ago", resolved: true  },
];

const AUTO_INJECT: Omit<SentinelEvent, "id" | "ts" | "resolved" | "count">[] = [
  { vector: "api",     level: "HIGH",     title: "Endpoint Scan Detected",       detail: "Sequential probe of /api/* routes — 440 requests in 90s.",       ip: "5.188.x.x"    },
  { vector: "auth",    level: "MEDIUM",   title: "Password Spray Pattern",       detail: "One password tested across 80 accounts in rotating cadence.",     ip: "194.165.x.x"  },
  { vector: "bot",     level: "LOW",      title: "Spam Wave — Battle Feed",      detail: "Auto-filtered 200 spam entries from Battle Feed in 60s."                              },
  { vector: "ticket",  level: "MEDIUM",   title: "Refund Loop Detected",         detail: "Buy → refund cycle repeated 5× in 20 min — abuse pattern.",       userId: "u-5504"   },
  { vector: "payment", level: "HIGH",     title: "Stolen Card Alert",            detail: "Card linked to fraud report DB. Transaction blocked, user flagged.", ip: "77.88.x.x" },
];

const LEVEL_STYLE: Record<ThreatLevel, string> = {
  CRITICAL: "border-red-500/60 bg-red-500/10 text-red-300",
  HIGH:     "border-orange-500/50 bg-orange-500/10 text-orange-200",
  MEDIUM:   "border-amber-400/40 bg-amber-500/10 text-amber-200",
  LOW:      "border-zinc-600/40 bg-zinc-800/20 text-zinc-500",
};

const VECTOR_LABEL: Record<AttackVector, string> = {
  auth:    "AUTH",
  ticket:  "TICKET",
  bot:     "BOT",
  payment: "PAY",
  api:     "API",
};

const VECTOR_COLOR: Record<AttackVector, string> = {
  auth:    "text-rose-300",
  ticket:  "text-amber-300",
  bot:     "text-fuchsia-300",
  payment: "text-red-300",
  api:     "text-cyan-300",
};

type Action =
  | { type: "resolve"; id: string }
  | { type: "inject"; event: SentinelEvent };

function reducer(state: SentinelEvent[], action: Action): SentinelEvent[] {
  if (action.type === "resolve") {
    return state.map((e) => e.id === action.id ? { ...e, resolved: true } : e);
  }
  if (action.type === "inject") {
    return [action.event, ...state].slice(0, 24);
  }
  return state;
}

let _nextId = 200;

export default function SecuritySentinelWall() {
  const [events, dispatch] = useReducer(reducer, SEED);
  const [filterVector, setFilterVector] = useState<AttackVector | "all">("all");
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      const template = AUTO_INJECT[Math.floor(Math.random() * AUTO_INJECT.length)];
      if (!template) return;
      dispatch({
        type: "inject",
        event: {
          ...template,
          id: `auto-${_nextId++}`,
          count: Math.floor(Math.random() * 500) + 1,
          ts: "just now",
          resolved: false,
        },
      });
    }, 22_000);
    return () => clearInterval(id);
  }, []);

  const active   = events.filter((e) => !e.resolved);
  const resolved = events.filter((e) => e.resolved);

  const criticalCount = active.filter((e) => e.level === "CRITICAL").length;
  const highCount     = active.filter((e) => e.level === "HIGH").length;

  const VECTORS: AttackVector[] = ["auth", "ticket", "bot", "payment", "api"];

  const visibleActive = active.filter((e) => filterVector === "all" || e.vector === filterVector);

  return (
    <section className="flex h-full flex-col rounded-xl border border-red-500/30 bg-black/60 p-3">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-red-400">Security Sentinel</p>
          <p className="text-[11px] font-black uppercase text-white">Attack Intelligence</p>
        </div>
        <div className="flex gap-1.5">
          {criticalCount > 0 && (
            <span className="rounded border border-red-500/60 bg-red-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-red-300">
              {criticalCount} CRIT
            </span>
          )}
          {highCount > 0 && (
            <span className="rounded border border-orange-500/50 bg-orange-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-orange-300">
              {highCount} HIGH
            </span>
          )}
          <span className="rounded border border-zinc-600/40 bg-zinc-800/20 px-2 py-0.5 text-[9px] font-black uppercase text-zinc-500">
            {active.length} ACTIVE
          </span>
        </div>
      </header>

      {/* Vector filter */}
      <div className="mb-3 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setFilterVector("all")}
          className={`rounded border px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] transition ${filterVector === "all" ? "border-white/30 bg-white/10 text-white" : "border-white/10 text-zinc-500 hover:text-zinc-300"}`}
        >
          All
        </button>
        {VECTORS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setFilterVector(v)}
            className={`rounded border px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] transition ${filterVector === v ? `border-white/20 bg-white/5 ${VECTOR_COLOR[v]}` : "border-white/10 text-zinc-500 hover:text-zinc-300"}`}
          >
            {VECTOR_LABEL[v]}
          </button>
        ))}
      </div>

      {/* Active events */}
      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {visibleActive.length === 0 && (
          <p className="py-4 text-center text-[9px] uppercase tracking-[0.14em] text-zinc-600">
            No active threats{filterVector !== "all" ? ` in ${VECTOR_LABEL[filterVector]}` : ""}
          </p>
        )}

        {visibleActive.map((e) => (
          <div key={e.id} className={`rounded-lg border p-2 ${LEVEL_STYLE[e.level]}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-1">
                  <span className={`text-[7px] font-black uppercase ${VECTOR_COLOR[e.vector]}`}>
                    [{VECTOR_LABEL[e.vector]}]
                  </span>
                  <span className="text-[7px] font-black uppercase">{e.level}</span>
                  {e.count > 1 && (
                    <span className="rounded border border-white/10 bg-black/30 px-1 py-0.5 text-[6px] font-black">
                      ×{e.count}
                    </span>
                  )}
                  {e.ip && <span className="text-[7px] text-zinc-600">{e.ip}</span>}
                  {e.userId && <span className="text-[7px] text-zinc-600">{e.userId}</span>}
                </div>
                <p className="text-[9px] font-black uppercase leading-snug">{e.title}</p>
                <p className="mt-0.5 text-[8px] leading-snug text-zinc-400">{e.detail}</p>
                <p className="mt-0.5 text-[7px] text-zinc-600">{e.ts}</p>
              </div>
              <button
                type="button"
                onClick={() => dispatch({ type: "resolve", id: e.id })}
                className="flex-shrink-0 rounded border border-white/10 bg-black/30 px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.1em] text-zinc-400 hover:border-white/25 hover:text-white"
              >
                ACK
              </button>
            </div>
          </div>
        ))}

        {/* Resolved section */}
        {resolved.length > 0 && (
          <details className="mt-2" open={showResolved}>
            <summary
              className="cursor-pointer text-[8px] font-black uppercase tracking-[0.14em] text-zinc-600 hover:text-zinc-400"
              onClick={() => setShowResolved((p) => !p)}
            >
              {resolved.length} acknowledged
            </summary>
            <div className="mt-1 space-y-0.5">
              {resolved.map((e) => (
                <div key={e.id} className="rounded border border-zinc-700/20 bg-zinc-900/30 px-2 py-1 text-[8px] text-zinc-600">
                  <span className={`mr-1 font-black uppercase ${VECTOR_COLOR[e.vector]}`}>[{VECTOR_LABEL[e.vector]}]</span>
                  {e.title}
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </section>
  );
}
