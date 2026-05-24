// Per-session warp rhythm recorder — tracks arrival timing metrics.

export interface WarpEntry {
  sessionId: string;
  warpDurationMs: number;       // flying phase length (target: 1800–3200ms)
  voidPrecisionMs: number;      // pausing phase length (target: ~140ms)
  flashSyncOffsetMs: number;    // landing phase length (target: ~900ms)
  arrivalStabilityMs: number | null; // ms from seated → first interaction
  first5sEngagement: boolean;   // interacted within 5s of seated
  recordedAt: number;
}

interface ActiveEntry {
  sessionId: string;
  phaseStarts: Partial<Record<string, number>>;
  seatedAt: number | null;
  arrivalStabilityMs: number | null;
  first5sEngagement: boolean;
  recordedAt: number;
}

let active: ActiveEntry | null = null;
const entries: WarpEntry[] = [];
let _seq = 0;

export const WarpEntryLog = {
  start(): void {
    _seq++;
    active = {
      sessionId: `warp-${Date.now()}-${_seq}`,
      phaseStarts: { flying: Date.now() },
      seatedAt: null,
      arrivalStabilityMs: null,
      first5sEngagement: false,
      recordedAt: Date.now(),
    };
  },

  markPhaseEnd(completedPhase: "flying" | "pausing" | "landing"): void {
    if (!active) return;
    const next = completedPhase === "flying"
      ? "pausing"
      : completedPhase === "pausing"
        ? "landing"
        : "seated";
    active.phaseStarts[next] = Date.now();
  },

  markSeated(): void {
    if (active) active.seatedAt = Date.now();
  },

  markInteraction(): void {
    if (!active?.seatedAt || active.arrivalStabilityMs !== null) return;
    const delta = Date.now() - active.seatedAt;
    active.arrivalStabilityMs = delta;
    active.first5sEngagement = delta <= 5000;
  },

  commit(): WarpEntry | null {
    if (!active) return null;
    const p = active.phaseStarts;
    const t0 = p["flying"]  ?? active.recordedAt;
    const t1 = p["pausing"] ?? t0;
    const t2 = p["landing"] ?? t1;
    const t3 = p["seated"]  ?? t2;

    const entry: WarpEntry = {
      sessionId: active.sessionId,
      warpDurationMs: t1 - t0,
      voidPrecisionMs: t2 - t1,
      flashSyncOffsetMs: t3 - t2,
      arrivalStabilityMs: active.arrivalStabilityMs,
      first5sEngagement: active.first5sEngagement,
      recordedAt: active.recordedAt,
    };
    entries.push(entry);
    active = null;
    return entry;
  },

  getAll(): WarpEntry[] { return [...entries]; },
  getLast(): WarpEntry | null { return entries.at(-1) ?? null; },
};
