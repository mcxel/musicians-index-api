/**
 * BattleChallengeRequestEngine
 * Orchestrates challenge request states and cross-engine updates.
 */

import {
  CHALLENGE_ENTRY_FEE_POINTS,
  battleChallengeEconomyEngine,
} from "@/lib/competition/BattleChallengeEconomyEngine";
import { BattleActor, battleEligibilityEngine } from "@/lib/competition/BattleEligibilityEngine";
import {
  BattleFormatType,
  battleFormatRulesEngine,
} from "@/lib/competition/BattleFormatRulesEngine";
import {
  UNIVERSAL_BATTLE_WINDOW_SECONDS,
  battleMatchLifecycleEngine,
} from "@/lib/competition/BattleMatchLifecycleEngine";
import {
  BattleContentArtifacts,
  battleBillboardLobbyWallEngine,
} from "@/lib/competition/BattleBillboardLobbyWallEngine";
import { battlePredictionEngine } from "@/lib/competition/BattlePredictionEngine";

export type BattleChallengeStatus =
  | "pending-challenge"
  | "accepted"
  | "declined"
  | "expired"
  | "live"
  | "completed";

export interface BattleChallengeRequest {
  challengeId: string;
  battleId?: string;
  challenger: BattleActor;
  target: BattleActor;
  format: BattleFormatType;
  status: BattleChallengeStatus;
  createdAt: number;
  expiresAt: number;
  countdownSeconds: number;
  entryFeePoints: number;
  directChallenge: boolean;
  artifacts?: BattleContentArtifacts;
}

export type BattlePromptAction = "accept" | "decline" | "counter" | "auto-match";

export class BattleChallengeRequestEngine {
  private requests: Map<string, BattleChallengeRequest> = new Map();

  submitRequest(input: {
    challenger: BattleActor;
    target: BattleActor;
    format: BattleFormatType;
    teamSize?: number;
    directChallenge?: boolean;
  }): { ok: boolean; request?: BattleChallengeRequest; reason?: string } {
    const now = Date.now();
    const teamSize = input.teamSize ?? 1;

    if (!battleFormatRulesEngine.validateTeamSize(input.format, teamSize)) {
      return { ok: false, reason: "team-size-invalid" };
    }

    const eligibility = battleEligibilityEngine.checkChallengeEligibility(
      input.challenger,
      input.target,
    );
    if (!eligibility.eligible) {
      return { ok: false, reason: eligibility.reason };
    }

    const directChallenge = Boolean(input.directChallenge);
    if (directChallenge && !battleEligibilityEngine.canDirectChallenge(input.challenger.tier)) {
      return { ok: false, reason: "direct-challenge-requires-gold-plus" };
    }

    const challengeId = `challenge-${now}-${Math.random().toString(36).slice(2, 8)}`;
    const reservation = battleChallengeEconomyEngine.reserveChallengeEntry(
      challengeId,
      input.challenger.userId,
    );
    if (!reservation.ok) {
      return { ok: false, reason: reservation.reason ?? "entry-fee-reservation-failed" };
    }

    const request: BattleChallengeRequest = {
      challengeId,
      challenger: input.challenger,
      target: input.target,
      format: input.format,
      status: "pending-challenge",
      createdAt: now,
      expiresAt: now + UNIVERSAL_BATTLE_WINDOW_SECONDS * 1000,
      countdownSeconds: UNIVERSAL_BATTLE_WINDOW_SECONDS,
      entryFeePoints: CHALLENGE_ENTRY_FEE_POINTS,
      directChallenge,
    };

    this.requests.set(challengeId, request);
    return { ok: true, request };
  }

  acceptRequest(challengeId: string): { ok: boolean; request?: BattleChallengeRequest; reason?: string } {
    const request = this.requests.get(challengeId);
    if (!request) return { ok: false, reason: "challenge-not-found" };
    if (request.status !== "pending-challenge") return { ok: false, reason: "challenge-not-pending" };
    if (Date.now() > request.expiresAt) return this.expireRequest(challengeId);

    const charged = battleChallengeEconomyEngine.chargeReservedEntry(challengeId);
    if (!charged.ok) return { ok: false, reason: "entry-fee-charge-failed" };

    const battleId = `battle-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const formatLabel = battleFormatRulesEngine.getRule(request.format).label;

    const match = battleMatchLifecycleEngine.createMatch(battleId, request.format, formatLabel);
    battleMatchLifecycleEngine.setStatus(battleId, "countdown");
    battleMatchLifecycleEngine.advanceStatus(battleId);
    battleMatchLifecycleEngine.advanceStatus(battleId);
    battlePredictionEngine.startPredictionWindow(battleId, Date.now());

    battleBillboardLobbyWallEngine.publishAcceptedToWall({
      challengeId,
      battleId,
      challengerName: request.challenger.displayName,
      targetName: request.target.displayName,
      formatLabel,
      endsAt: match.endsAt,
    });

    const artifacts = battleBillboardLobbyWallEngine.createContentArtifacts({
      challengeId,
      battleId,
      challengerName: request.challenger.displayName,
      targetName: request.target.displayName,
    });

    request.status = "accepted";
    request.battleId = battleId;
    request.artifacts = artifacts;

    battleBillboardLobbyWallEngine.setLive(battleId);
    request.status = "live";

    this.requests.set(challengeId, request);
    return { ok: true, request };
  }

  declineRequest(challengeId: string): { ok: boolean; request?: BattleChallengeRequest; reason?: string } {
    const request = this.requests.get(challengeId);
    if (!request) return { ok: false, reason: "challenge-not-found" };
    if (request.status !== "pending-challenge") return { ok: false, reason: "challenge-not-pending" };

    battleChallengeEconomyEngine.refundReservedEntry(challengeId);
    battleEligibilityEngine.markDeclined(request.challenger.userId, request.target.userId);

    request.status = "declined";
    this.requests.set(challengeId, request);
    return { ok: true, request };
  }

  expireRequest(challengeId: string): { ok: boolean; request?: BattleChallengeRequest; reason?: string } {
    const request = this.requests.get(challengeId);
    if (!request) return { ok: false, reason: "challenge-not-found" };
    if (request.status !== "pending-challenge") return { ok: false, reason: "challenge-not-pending" };

    battleChallengeEconomyEngine.refundReservedEntry(challengeId);
    request.status = "expired";
    this.requests.set(challengeId, request);
    return { ok: true, request };
  }

  completeRequest(challengeId: string): { ok: boolean; request?: BattleChallengeRequest; reason?: string } {
    const request = this.requests.get(challengeId);
    if (!request) return { ok: false, reason: "challenge-not-found" };
    if (request.status !== "live") return { ok: false, reason: "challenge-not-live" };

    request.status = "completed";
    this.requests.set(challengeId, request);
    return { ok: true, request };
  }

  getRequest(challengeId: string): BattleChallengeRequest | null {
    return this.requests.get(challengeId) ?? null;
  }

  listRequests(): BattleChallengeRequest[] {
    return [...this.requests.values()].sort((a, b) => b.createdAt - a.createdAt);
  }

  listActiveRequests(): BattleChallengeRequest[] {
    const now = Date.now();
    return this.listRequests().filter(
      (r) => (r.status === "pending-challenge" || r.status === "accepted" || r.status === "live") && r.expiresAt >= now,
    );
  }

  respondToChallengePrompt(
    challengeId: string,
    action: BattlePromptAction,
  ): { ok: boolean; request?: BattleChallengeRequest; reason?: string } {
    if (action === "accept" || action === "auto-match") {
      return this.acceptRequest(challengeId);
    }
    if (action === "decline") {
      return this.declineRequest(challengeId);
    }
    if (action === "counter") {
      const request = this.requests.get(challengeId);
      if (!request) return { ok: false, reason: "challenge-not-found" };
      if (request.status !== "pending-challenge") return { ok: false, reason: "challenge-not-pending" };
      request.expiresAt = Date.now() + UNIVERSAL_BATTLE_WINDOW_SECONDS * 1000;
      this.requests.set(challengeId, request);
      return { ok: true, request };
    }
    return { ok: false, reason: "unknown-action" };
  }
}

export const battleChallengeRequestEngine = new BattleChallengeRequestEngine();
