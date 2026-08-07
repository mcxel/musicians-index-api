/**
 * PerformerChallengePolicy — who may press CHALLENGE THIS PERFORMANCE.
 * Minimal glue over BattleEligibilityEngine / challenge request path.
 */

export type ChallengeContentType =
  | "song"
  | "beat"
  | "guitar"
  | "vocal"
  | "dance"
  | "comedy"
  | "freestyle"
  | "instrumental";

export type PerformerChallengeAccess =
  | "OPEN"
  | "FOLLOWERS"
  | "GOLD_PLUS"
  | "INVITE"
  | "CLOSED";

export type PerformerChallengePolicy = {
  performerId: string;
  access: PerformerChallengeAccess;
  allowedContentTypes: ChallengeContentType[];
  inviteAllowlist?: string[];
};

const DEFAULT_ALLOWED: ChallengeContentType[] = [
  "song",
  "beat",
  "guitar",
  "vocal",
  "dance",
  "comedy",
  "freestyle",
  "instrumental",
];

/** In-memory policy store — real persistence can replace later. */
const policies = new Map<string, PerformerChallengePolicy>();

export function getPerformerChallengePolicy(performerId: string): PerformerChallengePolicy {
  return (
    policies.get(performerId) ?? {
      performerId,
      access: "OPEN",
      allowedContentTypes: DEFAULT_ALLOWED,
    }
  );
}

export function setPerformerChallengePolicy(policy: PerformerChallengePolicy): void {
  policies.set(policy.performerId, policy);
}

export type ChallengeGateActor = {
  userId: string;
  tier?: string;
  followsPerformer?: boolean;
  invited?: boolean;
};

export function canChallengeThisPerformance(input: {
  performerId: string;
  contentType: ChallengeContentType;
  actor: ChallengeGateActor;
}): { ok: boolean; reason?: string } {
  const policy = getPerformerChallengePolicy(input.performerId);
  if (policy.access === "CLOSED") return { ok: false, reason: "challenges-closed" };
  if (!policy.allowedContentTypes.includes(input.contentType)) {
    return { ok: false, reason: "content-type-not-challengeable" };
  }
  if (input.actor.userId === input.performerId) {
    return { ok: false, reason: "self-challenge-forbidden" };
  }
  switch (policy.access) {
    case "OPEN":
      return { ok: true };
    case "FOLLOWERS":
      return input.actor.followsPerformer
        ? { ok: true }
        : { ok: false, reason: "followers-only" };
    case "GOLD_PLUS": {
      const t = (input.actor.tier ?? "").toLowerCase();
      const ok = t === "gold" || t === "platinum" || t === "diamond";
      return ok ? { ok: true } : { ok: false, reason: "gold-plus-required" };
    }
    case "INVITE": {
      const list = policy.inviteAllowlist ?? [];
      if (input.actor.invited || list.includes(input.actor.userId)) return { ok: true };
      return { ok: false, reason: "invite-only" };
    }
    default:
      return { ok: false, reason: "unknown-policy" };
  }
}
