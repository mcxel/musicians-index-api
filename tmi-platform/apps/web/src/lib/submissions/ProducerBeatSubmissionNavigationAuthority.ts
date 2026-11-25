/**
 * Canonical producer beat-submission entry (owner correction 2026-11-17):
 *
 *   STATS & ANALYTICS DRAWER → SUBMISSIONS → SUBMIT BEAT
 *
 * Do not invent a second global submission drawer or upload system.
 * Reuses: SubmissionsCanister / PerformerSubmissionCanister / BeatLockerClient /
 * BeatSubmissionRouter / SubmissionEngine entitlements.
 */

export const DUPLICATE_BEAT_SUBMISSION_SYSTEM = 0 as const;
export const PRODUCER_BEAT_REWARD_ACTIVATION = "DISABLED_PENDING_OWNER_APPROVAL" as const;

export const PRODUCER_BEAT_SUBMISSION_NAV = {
  operatingCenterId: "analytics",
  statsAnalyticsLabel: "ANALYTICS CENTER",
  childModuleId: "submissions",
  submitBeatActionId: "SUBMIT_BEAT",
  canister: "PerformerSubmissionCanister",
  beatAssetAuthority: "BeatLockerClient / Beat Locker",
  mediaPlayerRemountForbidden: true as const,
} as const;

export type ProducerBeatSubmissionNavResolution = {
  ok: true;
  path: readonly ["analytics", "submissions", "SUBMIT_BEAT"];
  operatingCenterId: "analytics";
  openModuleId: "submissions";
  submitBeatActionId: "SUBMIT_BEAT";
  initialCanisterTab: "beat_locker";
  duplicateSystemForbidden: true;
  rewardsActivated: false;
};

/** Resolve drawer navigation for Submit Beat from Stats & Analytics. */
export function resolveProducerBeatSubmissionNav(): ProducerBeatSubmissionNavResolution {
  return {
    ok: true,
    path: ["analytics", "submissions", "SUBMIT_BEAT"],
    operatingCenterId: "analytics",
    openModuleId: "submissions",
    submitBeatActionId: "SUBMIT_BEAT",
    initialCanisterTab: "beat_locker",
    duplicateSystemForbidden: true,
    rewardsActivated: false,
  };
}

export function isProducerBeatSubmissionPath(moduleIds: readonly string[]): boolean {
  return moduleIds.includes("analytics") && moduleIds.includes("submissions");
}
