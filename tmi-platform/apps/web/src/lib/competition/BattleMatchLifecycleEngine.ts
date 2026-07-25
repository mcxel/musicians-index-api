/**
 * BattleMatchLifecycleEngine
 * 18-minute lifecycle for battle/game windows.
 *
 * Client-safe by design: pure in-memory state, no server-only imports. It's
 * imported directly by client components (e.g. Home5BattleCypherSurface.tsx)
 * for getRemainingSeconds()/getMatch(). DB-touching finalization used to live
 * here as finalizeWithIntegrity() - that pulled CompetitionIntegrityEngine
 * (and transitively the real `pg` Postgres driver) into the client bundle,
 * which fails to build (`pg` needs Node-only fs/net/tls/dns). That logic now
 * lives inline in the one real caller, apps/web/src/app/api/competition/
 * match/route.ts (a server-only API route) - see finalizeMatchWithIntegrity
 * there for the equivalent server-side helper.
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
