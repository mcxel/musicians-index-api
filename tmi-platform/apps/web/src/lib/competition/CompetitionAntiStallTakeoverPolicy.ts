/**
 * Active-turn anti-stall + takeover evaluation.
 *
 * Proposed thresholds are OWNER_APPROVAL_PENDING — evaluators exist so HUD/lifecycle
 * can bind, but enforcement must not go live until owner approval + physical cert.
 *
 * Silence alone ≠ stall. Distinguish artistic rest, refusal, abandonment,
 * muted input, and transport failure.
 *
 * Regular Go Live: competitiveTakeoverAllowed must be false.
 */

export const DUPLICATE_ANTI_STALL_ENGINE = 0 as const;

export type StallSignalKind =
  | "ARTISTIC_REST"
  | "SUSPECTED_NONPARTICIPATION"
  | "MUTED_INPUT"
  | "TRANSPORT_FAILURE"
  | "REFUSAL"
  | "ABANDONED_TURN";

export type StallPhase =
  | "ACTIVE_OK"
  | "DETECTING"
  | "PRIVATE_WARNING"
  | "TAKEOVER_COUNTDOWN"
  | "TAKEOVER_AUTHORIZED"
  | "TRANSPORT_GRACE"
  | "BLOCKED_REGULAR_LIVE"
  | "DISABLED_PENDING_APPROVAL";

export const ANTI_STALL_POLICY = {
  /**
   * Thresholds (3/5/8s) accepted as official TMI competition timing policy.
   * Live forced takeover stays OFF until SFU handoff physical certification.
   */
  policyStatus: "OWNER_APPROVED_THRESHOLDS" as
    | "OWNER_APPROVAL_PENDING"
    | "OWNER_APPROVED_THRESHOLDS"
    | "OWNER_APPROVED",
  /** Enforcement stays off until owner release + live SFU handoff cert. */
  enforcementActivated: false as boolean,
  detectWindowMs: 3000,
  privateWarningAtMs: 3000,
  takeoverCountdownAtMs: 5000,
  takeoverAuthorizeAtMs: 8000,
  transportGraceMs: 8000,
  /** Musical silence without other nonparticipation signals never advances stall. */
  silenceAloneIsNotStall: true as const,
  regularGoLiveForcedTakeoverForbidden: true as const,
} as const;

export function isAntiStallEnforcementActive(): boolean {
  return (
    ANTI_STALL_POLICY.policyStatus === "OWNER_APPROVED" &&
    ANTI_STALL_POLICY.enforcementActivated === true
  );
}

export type StallEvaluationInput = {
  competitiveTakeoverAllowed: boolean;
  /** Verified nonparticipation ms (not mere silence). */
  verifiedNonparticipationMs: number;
  signal: StallSignalKind;
  transportHealthy: boolean;
  nowMs?: number;
};

export type StallEvaluation = {
  phase: StallPhase;
  privateWarning: boolean;
  publicCountdown: boolean;
  authorizeTakeover: boolean;
  reason: string;
  /** Safe musical boundary required before media handoff */
  requireSafeMusicalBoundary: true;
  hideBackstageChallengerIdentity: true;
};

export function evaluateAntiStall(input: StallEvaluationInput): StallEvaluation {
  const base = {
    requireSafeMusicalBoundary: true as const,
    hideBackstageChallengerIdentity: true as const,
  };

  if (!input.competitiveTakeoverAllowed) {
    return {
      ...base,
      phase: "BLOCKED_REGULAR_LIVE",
      privateWarning: false,
      publicCountdown: false,
      authorizeTakeover: false,
      reason: "Regular Go Live / non-competitive mode — forced takeover forbidden",
    };
  }

  if (!isAntiStallEnforcementActive()) {
    return {
      ...base,
      phase: "DISABLED_PENDING_APPROVAL",
      privateWarning: false,
      publicCountdown: false,
      authorizeTakeover: false,
      reason:
        ANTI_STALL_POLICY.policyStatus === "OWNER_APPROVED_THRESHOLDS"
          ? "3/5/8 thresholds OWNER_APPROVED; enforcement OFF pending SFU handoff cert"
          : "Anti-stall thresholds configured; enforcement OWNER_APPROVAL_PENDING",
    };
  }

  if (!input.transportHealthy || input.signal === "TRANSPORT_FAILURE") {
    return {
      ...base,
      phase: "TRANSPORT_GRACE",
      privateWarning: false,
      publicCountdown: false,
      authorizeTakeover: false,
      reason: "Transport failure — reconnect grace, not competitive forfeit",
    };
  }

  if (input.signal === "ARTISTIC_REST") {
    return {
      ...base,
      phase: "ACTIVE_OK",
      privateWarning: false,
      publicCountdown: false,
      authorizeTakeover: false,
      reason: "Artistic rest / musical pause — not a stall",
    };
  }

  const ms = Math.max(0, input.verifiedNonparticipationMs);

  if (ms < ANTI_STALL_POLICY.privateWarningAtMs) {
    return {
      ...base,
      phase: ms > 0 ? "DETECTING" : "ACTIVE_OK",
      privateWarning: false,
      publicCountdown: false,
      authorizeTakeover: false,
      reason: "Within detection window",
    };
  }

  if (ms < ANTI_STALL_POLICY.takeoverCountdownAtMs) {
    return {
      ...base,
      phase: "PRIVATE_WARNING",
      privateWarning: true,
      publicCountdown: false,
      authorizeTakeover: false,
      reason: "Private inactivity warning",
    };
  }

  if (ms < ANTI_STALL_POLICY.takeoverAuthorizeAtMs) {
    return {
      ...base,
      phase: "TAKEOVER_COUNTDOWN",
      privateWarning: true,
      publicCountdown: true,
      authorizeTakeover: false,
      reason: "Public takeover countdown",
    };
  }

  return {
    ...base,
    phase: "TAKEOVER_AUTHORIZED",
    privateWarning: true,
    publicCountdown: true,
    authorizeTakeover: true,
    reason: "Authorized takeover at next safe musical boundary",
  };
}

export type TakeoverPlan = {
  ok: boolean;
  reason: string;
  finalizeOutgoingTurn: boolean;
  applyForfeitIfRulesAuthorize: boolean;
  releaseOutgoingSlot: boolean;
  revokeOutgoingStagePublication: boolean;
  reserveNextEligibleAtomically: boolean;
  authorizeIncomingStageMedia: boolean;
  triggerEntranceCue: boolean;
  revealIncomingAtAuthorizedBoundary: boolean;
  preserveAudienceSession: boolean;
  championMayVetoEligibleChallenger: false;
};

export function planAuthorizedTakeover(input: {
  stall: StallEvaluation;
  nextEligibleParticipantId: string | null;
  competitionRulesAuthorizeForfeit: boolean;
}): TakeoverPlan {
  if (!input.stall.authorizeTakeover) {
    return {
      ok: false,
      reason: input.stall.reason,
      finalizeOutgoingTurn: false,
      applyForfeitIfRulesAuthorize: false,
      releaseOutgoingSlot: false,
      revokeOutgoingStagePublication: false,
      reserveNextEligibleAtomically: false,
      authorizeIncomingStageMedia: false,
      triggerEntranceCue: false,
      revealIncomingAtAuthorizedBoundary: false,
      preserveAudienceSession: true,
      championMayVetoEligibleChallenger: false,
    };
  }
  if (!input.nextEligibleParticipantId) {
    return {
      ok: false,
      reason: "No eligible next participant — do not fabricate challenger",
      finalizeOutgoingTurn: true,
      applyForfeitIfRulesAuthorize: input.competitionRulesAuthorizeForfeit,
      releaseOutgoingSlot: true,
      revokeOutgoingStagePublication: true,
      reserveNextEligibleAtomically: false,
      authorizeIncomingStageMedia: false,
      triggerEntranceCue: false,
      revealIncomingAtAuthorizedBoundary: false,
      preserveAudienceSession: true,
      championMayVetoEligibleChallenger: false,
    };
  }
  return {
    ok: true,
    reason: "Takeover authorized",
    finalizeOutgoingTurn: true,
    applyForfeitIfRulesAuthorize: input.competitionRulesAuthorizeForfeit,
    releaseOutgoingSlot: true,
    revokeOutgoingStagePublication: true,
    reserveNextEligibleAtomically: true,
    authorizeIncomingStageMedia: true,
    triggerEntranceCue: true,
    revealIncomingAtAuthorizedBoundary: true,
    preserveAudienceSession: true,
    championMayVetoEligibleChallenger: false,
  };
}
