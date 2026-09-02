/**
 * ACGBR Laws — Autonomous Cinematic & Generative Broadcast Runtime
 *
 * Ratified architecture contract (Marcel Dickens). Generation does NOT write live truth.
 * Live path uses certified templates + deterministic seeds + HOT fallbacks.
 * Never stub fake neural lip-sync / unconstrained live AI generation.
 */

/** Fields ACGBR is forbidden from writing on Challenge (or any live experience truth). */
export const ACGBR_FORBIDDEN_CHALLENGE_WRITES = [
  "winner",
  "winnerId",
  "score",
  "challengerScore",
  "challengedScore",
  "attemptResult",
  "participantIdentity",
  "eligibleVoter",
  "stake",
  "realStakeOrReward",
  "settlement",
  "settlementStatus",
  "settlementReference",
  "sponsorAuthorization",
] as const;

export type AcgbrForbiddenChallengeWrite =
  (typeof ACGBR_FORBIDDEN_CHALLENGE_WRITES)[number];

export type IntroPackageMode =
  | "FULL"
  | "FAST"
  | "RECONNECT"
  | "REDUCED_MOTION"
  | "LOW_DEVICE";

export type AcgbrPacingMode = IntroPackageMode;

/** Generation Foundry may only emit certified procedural templates — never live blockers. */
export type GenerationFoundryMode =
  | "CERTIFIED_TEMPLATE"
  | "DETERMINISTIC_SEED"
  | "HOT_FALLBACK";

export const ACGBR_CONTRACT_VERSION = "2026.09.02.1" as const;

export class AcgbrBoundaryViolation extends Error {
  readonly code = "ACGBR_ONE_WAY_BOUNDARY";
  constructor(
    public readonly field: string,
    message?: string
  ) {
    super(
      message ??
        `ACGBR cannot write live Challenge truth field "${field}". Generation reads snapshots only.`
    );
    this.name = "AcgbrBoundaryViolation";
  }
}

/** Runtime guard — throws if a presentation layer attempts a forbidden write key. */
export function assertAcgbrCannotWriteChallengeTruth(
  attemptedWriteKeys: readonly string[]
): void {
  for (const key of attemptedWriteKeys) {
    const normalized = key.trim();
    if (
      (ACGBR_FORBIDDEN_CHALLENGE_WRITES as readonly string[]).includes(normalized)
    ) {
      throw new AcgbrBoundaryViolation(normalized);
    }
  }
}

/** Type-level + runtime list of forbidden writes for cert suites. */
export function listAcgbrForbiddenChallengeWrites(): readonly AcgbrForbiddenChallengeWrite[] {
  return ACGBR_FORBIDDEN_CHALLENGE_WRITES;
}
