/**
 * BattleBroadcastStateMachine
 * Drives what a Battle's BILLBOARD TILE shows — distinct from BattleMatchLifecycleEngine
 * (which governs the 18-minute match window/queue/leaderboard). This machine only answers
 * "what does the preview camera show right now" per the Live Billboard Preview Canon:
 * full-screen solo performer until a second competitor joins, then a versus reveal,
 * then a locked split-screen audience view for the rest of the match.
 */

export type BattleBroadcastState =
  | "SOLO_WAITING"
  | "OPPONENT_JOINED"
  | "VS_REVEAL"
  | "BATTLE_LIVE"
  | "ROUND_BREAK"
  | "WINNER_REVEAL";

export interface BattleBroadcastEntry {
  battleId: string;
  state: BattleBroadcastState;
  competitorAId?: string;
  competitorBId?: string;
  winnerId?: string;
  updatedAt: number;
}

type Listener = (entry: BattleBroadcastEntry) => void;

const VS_REVEAL_DURATION_MS = 3200; // matches the 3-2-1-BATTLE LIVE beat

class BattleBroadcastStateMachineImpl {
  private entries: Map<string, BattleBroadcastEntry> = new Map();
  private listeners: Map<string, Set<Listener>> = new Map();
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  private emit(entry: BattleBroadcastEntry) {
    this.entries.set(entry.battleId, entry);
    this.listeners.get(entry.battleId)?.forEach((fn) => fn(entry));
  }

  /** Call when the first competitor enters the room. */
  competitorAJoins(battleId: string, competitorAId: string): BattleBroadcastEntry {
    const entry: BattleBroadcastEntry = {
      battleId,
      state: "SOLO_WAITING",
      competitorAId,
      updatedAt: Date.now(),
    };
    this.emit(entry);
    return entry;
  }

  /** Call when the second competitor enters — triggers the split-screen transition, then auto-advances to VS_REVEAL. */
  competitorBJoins(battleId: string, competitorBId: string): BattleBroadcastEntry {
    const prev = this.entries.get(battleId);
    const entry: BattleBroadcastEntry = {
      battleId,
      state: "OPPONENT_JOINED",
      competitorAId: prev?.competitorAId,
      competitorBId,
      updatedAt: Date.now(),
    };
    this.emit(entry);

    const t = setTimeout(() => this.startVersusReveal(battleId), 1400);
    this.timers.set(battleId, t);
    return entry;
  }

  /** Plays the A VS B / 3-2-1 beat, then auto-locks into BATTLE_LIVE. */
  startVersusReveal(battleId: string): BattleBroadcastEntry | null {
    const prev = this.entries.get(battleId);
    if (!prev) return null;
    const entry: BattleBroadcastEntry = { ...prev, state: "VS_REVEAL", updatedAt: Date.now() };
    this.emit(entry);

    const t = setTimeout(() => this.goLive(battleId), VS_REVEAL_DURATION_MS);
    this.timers.set(battleId, t);
    return entry;
  }

  /** Locks the tile into the persistent split-screen audience view. */
  goLive(battleId: string): BattleBroadcastEntry | null {
    const prev = this.entries.get(battleId);
    if (!prev) return null;
    const entry: BattleBroadcastEntry = { ...prev, state: "BATTLE_LIVE", updatedAt: Date.now() };
    this.emit(entry);
    return entry;
  }

  startRoundBreak(battleId: string): BattleBroadcastEntry | null {
    const prev = this.entries.get(battleId);
    if (!prev) return null;
    const entry: BattleBroadcastEntry = { ...prev, state: "ROUND_BREAK", updatedAt: Date.now() };
    this.emit(entry);
    return entry;
  }

  resumeFromRoundBreak(battleId: string): BattleBroadcastEntry | null {
    return this.goLive(battleId);
  }

  revealWinner(battleId: string, winnerId: string): BattleBroadcastEntry | null {
    const prev = this.entries.get(battleId);
    if (!prev) return null;
    const t = this.timers.get(battleId);
    if (t) clearTimeout(t);
    const entry: BattleBroadcastEntry = { ...prev, state: "WINNER_REVEAL", winnerId, updatedAt: Date.now() };
    this.emit(entry);
    return entry;
  }

  getState(battleId: string): BattleBroadcastEntry | null {
    return this.entries.get(battleId) ?? null;
  }

  subscribe(battleId: string, listener: Listener): () => void {
    if (!this.listeners.has(battleId)) this.listeners.set(battleId, new Set());
    this.listeners.get(battleId)!.add(listener);
    const current = this.entries.get(battleId);
    if (current) listener(current);
    return () => this.listeners.get(battleId)?.delete(listener);
  }
}

export const battleBroadcastStateMachine = new BattleBroadcastStateMachineImpl();

/**
 * Fallback inference for tiles whose battle was never explicitly driven through the
 * machine (e.g. seeded/demo rooms) — Rule 14 No Empty Surface: a tile must always
 * resolve to a sensible state, never an undefined/blank one.
 */
export function inferBattleBroadcastState(input: {
  hasCompetitorB: boolean;
  isLive: boolean;
  winnerId?: string;
}): BattleBroadcastState {
  if (input.winnerId) return "WINNER_REVEAL";
  if (input.isLive && input.hasCompetitorB) return "BATTLE_LIVE";
  if (input.hasCompetitorB) return "VS_REVEAL";
  return "SOLO_WAITING";
}
