/**
 * WinnerCeremonyEngine
 * Orchestrates the full end-of-battle ceremony sequence.
 *
 * Sequence:
 *   1. FREEZE     — room locks, no new votes/reactions
 *   2. DECLARE    — winner identity revealed
 *   3. CROWN      — crown transfers to winner
 *   4. CONFETTI   — burst fires
 *   5. REWARDS    — payout splash shown
 *   6. REPLAY     — replay saved to vault
 *   7. ARTICLE    — article draft queued
 *   8. DONE       — ceremony complete, room returns to normal
 *
 * Each phase has a timestamp so UI can animate on schedule.
 */

export type CeremonyPhase =
  | "idle"
  | "freeze"
  | "declare"
  | "crown"
  | "confetti"
  | "rewards"
  | "replay"
  | "article"
  | "done";

export type BattleContext = "battle" | "cypher" | "dirty-dozens" | "contest";

export interface CeremonyParticipant {
  userId: string;
  displayName: string;
  avatarUrl: string;
  score: number;
  voteCount: number;
}

export interface CeremonyResult {
  ceremonyId: string;
  battleId: string;
  context: BattleContext;
  winner: CeremonyParticipant;
  loser?: CeremonyParticipant;
  /** All participants for multi-person events */
  allParticipants: CeremonyParticipant[];
  isUpset: boolean;
  /** Final vote split as percentages */
  votePercentWinner: number;
  votePercentLoser: number;
  rewardPoints: number;
  rewardUsd: number;
  rewardBadge?: string;
  replayRoute: string;
  articleDraftId?: string;
  phases: Record<CeremonyPhase, number>; // phase → timestamp ms
  currentPhase: CeremonyPhase;
  completedAt?: number;
}

/** Milliseconds each phase lasts */
const PHASE_DURATIONS: Record<CeremonyPhase, number> = {
  idle:     0,
  freeze:   800,
  declare:  2000,
  crown:    2500,
  confetti: 3000,
  rewards:  4000,
  replay:   1500,
  article:  1000,
  done:     0,
};

const PHASE_ORDER: CeremonyPhase[] = [
  "freeze", "declare", "crown", "confetti", "rewards", "replay", "article", "done",
];

let cerSeq = 0;

class WinnerCeremonyEngine {
  private ceremonies = new Map<string, CeremonyResult>();
  /** battleId → ceremonyId */
  private battleIndex = new Map<string, string>();
  /** Optional external callbacks per phase */
  private phaseCallbacks = new Map<string, Map<CeremonyPhase, (() => void)[]>>();

  /**
   * Trigger ceremony for a concluded battle.
   * Returns the ceremony with all phase timestamps pre-calculated.
   */
  trigger(params: {
    battleId: string;
    context: BattleContext;
    winner: CeremonyParticipant;
    loser?: CeremonyParticipant;
    allParticipants?: CeremonyParticipant[];
    isUpset?: boolean;
    totalVotes?: number;
    rewardPoints?: number;
    rewardUsd?: number;
    rewardBadge?: string;
    replayRoute?: string;
  }): CeremonyResult {
    const ceremonyId = `ceremony-${Date.now()}-${++cerSeq}`;
    const now = Date.now();

    // Pre-calculate all phase start times
    const phases = {} as Record<CeremonyPhase, number>;
    let cursor = now;
    for (const phase of PHASE_ORDER) {
      phases[phase] = cursor;
      cursor += PHASE_DURATIONS[phase];
    }
    phases["idle"] = 0;

    const totalVotes = params.totalVotes ?? (params.winner.voteCount + (params.loser?.voteCount ?? 0));
    const votePercentWinner = totalVotes > 0
      ? Math.round((params.winner.voteCount / totalVotes) * 100)
      : 100;
    const votePercentLoser = 100 - votePercentWinner;

    const ceremony: CeremonyResult = {
      ceremonyId,
      battleId: params.battleId,
      context: params.context,
      winner: params.winner,
      loser: params.loser,
      allParticipants: params.allParticipants ?? [params.winner, ...(params.loser ? [params.loser] : [])],
      isUpset: params.isUpset ?? false,
      votePercentWinner,
      votePercentLoser,
      rewardPoints: params.rewardPoints ?? 35,
      rewardUsd: params.rewardUsd ?? 0,
      rewardBadge: params.rewardBadge,
      replayRoute: params.replayRoute ?? `/battles/replay/${params.battleId}`,
      phases,
      currentPhase: "freeze",
    };

    this.ceremonies.set(ceremonyId, ceremony);
    this.battleIndex.set(params.battleId, ceremonyId);

    // Auto-advance phases
    this.schedulePhases(ceremony);

    return ceremony;
  }

  private schedulePhases(ceremony: CeremonyResult) {
    const now = Date.now();
    for (const phase of PHASE_ORDER) {
      const delay = ceremony.phases[phase] - now;
      if (delay <= 0) continue;
      setTimeout(() => {
        ceremony.currentPhase = phase;
        if (phase === "done") {
          ceremony.completedAt = Date.now();
        }
        const callbacks = this.phaseCallbacks.get(ceremony.ceremonyId)?.get(phase);
        callbacks?.forEach((cb) => cb());
      }, delay);
    }
  }

  /**
   * Register a callback to fire when a specific phase is reached.
   */
  onPhase(ceremonyId: string, phase: CeremonyPhase, callback: () => void): void {
    if (!this.phaseCallbacks.has(ceremonyId)) {
      this.phaseCallbacks.set(ceremonyId, new Map());
    }
    const map = this.phaseCallbacks.get(ceremonyId)!;
    const existing = map.get(phase) ?? [];
    existing.push(callback);
    map.set(phase, existing);
  }

  getCeremony(ceremonyId: string): CeremonyResult | undefined {
    return this.ceremonies.get(ceremonyId);
  }

  getCeremonyForBattle(battleId: string): CeremonyResult | undefined {
    const id = this.battleIndex.get(battleId);
    return id ? this.ceremonies.get(id) : undefined;
  }

  isActive(battleId: string): boolean {
    const c = this.getCeremonyForBattle(battleId);
    return !!c && c.currentPhase !== "done";
  }

  /** Total duration of a ceremony in ms */
  getTotalDurationMs(): number {
    return PHASE_ORDER.reduce((sum, p) => sum + PHASE_DURATIONS[p], 0);
  }

  getRecentCeremonies(limit = 10): CeremonyResult[] {
    return [...this.ceremonies.values()]
      .filter((c) => c.completedAt)
      .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
      .slice(0, limit);
  }
}

export const winnerCeremonyEngine = new WinnerCeremonyEngine();
export { PHASE_DURATIONS, PHASE_ORDER };
