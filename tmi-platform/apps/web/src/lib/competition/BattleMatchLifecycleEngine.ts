/**
 * BattleMatchLifecycleEngine
 * 18-minute lifecycle for battle/game windows.
 */

import {
  BattleFormatType,
  EventCollaborationMode,
  EventEliminationStyle,
  EventRoundConfig,
  EventScoringModel,
  EventTeamConfig,
  battleFormatRulesEngine,
} from "@/lib/competition/BattleFormatRulesEngine";

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
  teamConfig: EventTeamConfig;
  roundPlan: EventRoundConfig[];
  scoringModels: EventScoringModel[];
  eliminationStyles: EventEliminationStyle[];
  collaborationMode: EventCollaborationMode;
  currentRoundKey: string | null;
  completedRoundKeys: string[];
  status: BattleLifecycleStatus;
  createdAt: number;
  windowSeconds: number;
  endsAt: number;
  leaderboardLocked: boolean;
  winnerId?: string;
}

export class BattleMatchLifecycleEngine {
  private matches: Map<string, BattleMatchLifecycle> = new Map();

  createMatch(
    battleId: string,
    format: BattleFormatType,
    typeLabel: string,
    config?: {
      teamConfig?: EventTeamConfig;
      roundPlan?: EventRoundConfig[];
      scoringModels?: EventScoringModel[];
      eliminationStyles?: EventEliminationStyle[];
      collaborationMode?: EventCollaborationMode;
    },
  ): BattleMatchLifecycle {
    const now = Date.now();
    const rule = battleFormatRulesEngine.getRule(format);
    const teamConfig = config?.teamConfig ?? rule.teamConfig;
    const roundPlan = config?.roundPlan ?? rule.roundPlan;
    const scoringModels = config?.scoringModels ?? rule.scoringModels;
    const eliminationStyles = config?.eliminationStyles ?? rule.eliminationStyles;
    const collaborationMode = config?.collaborationMode ?? rule.collaborationMode;

    const match: BattleMatchLifecycle = {
      battleId,
      format,
      typeLabel,
      teamConfig,
      roundPlan,
      scoringModels,
      eliminationStyles,
      collaborationMode,
      currentRoundKey: roundPlan[0]?.key ?? null,
      completedRoundKeys: [],
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
    if (match.status === "live" && !match.currentRoundKey) {
      match.currentRoundKey = match.roundPlan[0]?.key ?? null;
    }
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
    if (match.currentRoundKey && !match.completedRoundKeys.includes(match.currentRoundKey)) {
      match.completedRoundKeys.push(match.currentRoundKey);
    }
    match.currentRoundKey = null;
    return match;
  }

  advanceRound(battleId: string): BattleMatchLifecycle | null {
    const match = this.matches.get(battleId);
    if (!match) return null;
    if (match.roundPlan.length === 0) return match;

    const currentIndex = match.currentRoundKey
      ? match.roundPlan.findIndex((round) => round.key === match.currentRoundKey)
      : -1;

    if (currentIndex >= 0 && match.currentRoundKey && !match.completedRoundKeys.includes(match.currentRoundKey)) {
      match.completedRoundKeys.push(match.currentRoundKey);
    }

    const nextIndex = currentIndex + 1;
    match.currentRoundKey = match.roundPlan[nextIndex]?.key ?? null;

    return match;
  }

  getRuntimeConfig(battleId: string): {
    teamConfig: EventTeamConfig;
    roundPlan: EventRoundConfig[];
    scoringModels: EventScoringModel[];
    eliminationStyles: EventEliminationStyle[];
    collaborationMode: EventCollaborationMode;
    currentRoundKey: string | null;
    completedRoundKeys: string[];
  } | null {
    const match = this.matches.get(battleId);
    if (!match) return null;
    return {
      teamConfig: match.teamConfig,
      roundPlan: match.roundPlan,
      scoringModels: match.scoringModels,
      eliminationStyles: match.eliminationStyles,
      collaborationMode: match.collaborationMode,
      currentRoundKey: match.currentRoundKey,
      completedRoundKeys: [...match.completedRoundKeys],
    };
  }

  getRemainingSeconds(battleId: string): number {
    const match = this.matches.get(battleId);
    if (!match) return 0;
    return Math.max(0, Math.floor((match.endsAt - Date.now()) / 1000));
  }
}

export const battleMatchLifecycleEngine = new BattleMatchLifecycleEngine();
