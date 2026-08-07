"use client";

import { useReducer, useState } from "react";

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

const SEED: SentinelEvent[] = [];

const AUTO_INJECT: Omit<SentinelEvent, "id" | "ts" | "resolved" | "count">[] = [];

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
