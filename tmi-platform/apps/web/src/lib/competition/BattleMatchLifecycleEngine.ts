/**
 * BattleMatchLifecycleEngine
 * 18-minute lifecycle for battle/game windows.
 */

import { BattleFormatType } from "@/lib/competition/BattleFormatRulesEngine";

export const UNIVERSAL_BATTLE_WINDOW_SECONDS = 18 * 60;

export type BattleLifecycleStatus =
  | "queued"
  | "countdown"
  | "open"
  | "live"
  | "completed"
  | "rewarded"
  | "archived";

export interface BattleMatchLifecycle {
  battleId: string;
  format: BattleFormatType;
  typeLabel: string;
  status: BattleLifecycleStatus;
  createdAt: number;
  windowSeconds: number;
  endsAt: number;
  leaderboardLocked: boolean;
  winnerId?: string;
}

export class BattleMatchLifecycleEngine {
  private matches: Map<string, BattleMatchLifecycle> = new Map();

  createMatch(battleId: string, format: BattleFormatType, typeLabel: string): BattleMatchLifecycle {
    const now = Date.now();
    const match: BattleMatchLifecycle = {
      battleId,
      format,
      typeLabel,
      status: "queued",
      createdAt: now,
      windowSeconds: UNIVERSAL_BATTLE_WINDOW_SECONDS,
      endsAt: now + UNIVERSAL_BATTLE_WINDOW_SECONDS * 1000,
      leaderboardLocked: false,
    };
    this.matches.set(battleId, match);
    return match;
  }

  getMatch(battleId: string): BattleMatchLifecycle | null {
    return this.matches.get(battleId) ?? null;
  }

  setStatus(battleId: string, status: BattleLifecycleStatus): BattleMatchLifecycle | null {
    const match = this.matches.get(battleId);
    if (!match) return null;
    match.status = status;
    return match;
  }

  advanceStatus(battleId: string): BattleMatchLifecycle | null {
    const match = this.matches.get(battleId);
    if (!match) return null;

    const transitions: Record<BattleLifecycleStatus, BattleLifecycleStatus> = {
      queued: "countdown",
      countdown: "open",
      open: "live",
      live: "completed",
      completed: "rewarded",
      rewarded: "archived",
      archived: "archived",
    };

    match.status = transitions[match.status];
    if (match.status === "completed") {
      match.leaderboardLocked = true;
    }
    return match;
  }

  markCompleted(battleId: string, winnerId: string): BattleMatchLifecycle | null {
    const match = this.matches.get(battleId);
    if (!match) return null;
    match.status = "completed";
    match.winnerId = winnerId;
    match.leaderboardLocked = true;
    return match;
  }

  getRemainingSeconds(battleId: string): number {
    const match = this.matches.get(battleId);
    if (!match) return 0;
    return Math.max(0, Math.floor((match.endsAt - Date.now()) / 1000));
  }
}

export const battleMatchLifecycleEngine = new BattleMatchLifecycleEngine();
