/**
 * YouthSocialGuard — canonical private-interaction age overlay (product safety, not legal advice).
 *
 * TMI is 16+. Public entertainment is not private access:
 *   PROTECTED_TEEN = 16–17
 *   ADULT          = 18+
 * Do not bucket 16/17/18 into one unrestricted private lane.
 *
 * Unknown adult ↔ 16–17, and 18+ ↔ 16–17, are denied unless a verified
 * FamilyAccount relationship exists. Self-declared DOB does not unlock
 * private teen access. Family links are never inferred.
 *
 * Public audience watch (live rooms, Live Lobby Wall, stage broadcast) is
 * not private and must not be emptied by this guard.
 */

import { hasVerifiedFamilyRelationship } from "./FamilyRelationshipPolicy";

/** Platform minimum age. Below this is BELOW_PLATFORM. */
export const YOUTH_BAND_MIN_AGE = 16;
/** Inclusive max for protected teens (16–17). 18+ is adult for private auth. */
export const YOUTH_BAND_MAX_AGE = 17;
export const PROTECTED_TEEN_MIN_AGE = 16;
export const PROTECTED_TEEN_MAX_AGE = 17;
export const ADULT_BAND_MIN_AGE = 18;

export type YouthBand = "YOUTH" | "ADULT";
export type YouthSocialBand = YouthBand | "UNKNOWN" | "BELOW_PLATFORM";

export const AGE_ASSURANCE_STATES = [
  "UNVERIFIED",
  "SELF_DECLARED",
  "AGE_ESTIMATED",
  "VERIFIED_TEEN",
  "VERIFIED_ADULT",
  "VERIFICATION_REQUIRED",
  "VERIFICATION_FAILED",
] as const;

export type AgeAssuranceState = (typeof AGE_ASSURANCE_STATES)[number];

export const PRIVATE_INTERACT_CONTEXTS = [
  "DM",
  "CALL",
  "PRIVATE_VIDEO",
  "BREAKOUT_INVITE",
  "PRIVATE_MONITOR_ROUTE",
  "SCREEN_SHARE",
] as const;

export type PrivateInteractContext = (typeof PRIVATE_INTERACT_CONTEXTS)[number];

export type OneToOneDenyCode =
  | "UNKNOWN_AGE"
  | "BELOW_PLATFORM"
  | "CROSS_BAND"
  | "NO_FAMILY_LINK"
  | "BOT_YOUTH"
  | "NO_TARGET"
  | "ASSURANCE_REQUIRED";

export type OneToOneAllowCode = "YOUTH_PEERS" | "ADULT_PEERS" | "SAME_FAMILY";

export type OneToOneDecision = {
  allowed: boolean;
  blocked: boolean;
  reason: string;
  code: OneToOneDenyCode | OneToOneAllowCode;
  actorBand: YouthSocialBand;
  targetBand: YouthSocialBand;
  context: PrivateInteractContext;
  actorAssurance: AgeAssuranceState;
  targetAssurance: AgeAssuranceState;
};

export type PrivateInteractDecision = OneToOneDecision;

export type YouthSocialSubject = {
  userId: string;
  /** Whole years. Null/undefined = unknown — fail closed. Never invent. */
  ageYears?: number | null;
  /** Explicit band only when a real age is unavailable but a classified band exists. */
  band?: YouthSocialBand;
  /** Real FamilyAccount id from Prisma. Empty/null = no family exception. */
  familyAccountId?: string | null;
  /** Labeled platform bot — must not 1:1 with teens (or unknown-age humans). */
  isBot?: boolean;
  /**
   * Age assurance. Absent + ageYears → SELF_DECLARED. Absent + no age → UNVERIFIED.
   * VERIFIED_* is never inferred from DOB.
   */
  ageAssurance?: AgeAssuranceState;
};

export const ONE_TO_ONE_SOCIAL_CHANNELS = [
  "dm",
  "voice",
  "talkback",
  "video_presence",
  "friend_request",
  "party_invite",
  "private_talk",
  "personal_media_panel",
  "screen_share",
  "breakout_invite",
] as const;

export type OneToOneSocialChannel = (typeof ONE_TO_ONE_SOCIAL_CHANNELS)[number];

const CHANNEL_TO_CONTEXT: Record<OneToOneSocialChannel, PrivateInteractContext> = {
  dm: "DM",
  voice: "CALL",
  talkback: "CALL",
  video_presence: "PRIVATE_VIDEO",
  friend_request: "DM",
  party_invite: "BREAKOUT_INVITE",
  private_talk: "CALL",
  personal_media_panel: "PRIVATE_MONITOR_ROUTE",
  screen_share: "SCREEN_SHARE",
  breakout_invite: "BREAKOUT_INVITE",
};

export class YouthSocialBlockedError extends Error {
  readonly code = "YOUTH_SOCIAL_BLOCKED";
  readonly allowed = false as const;
  readonly blocked = true as const;

  constructor(message: string, readonly decision?: OneToOneDecision) {
    super(message);
    this.name = "YouthSocialBlockedError";
  }
}

export function isYouthSocialBlockedError(err: unknown): err is YouthSocialBlockedError {
  if (err instanceof YouthSocialBlockedError) return true;
  if (!err || typeof err !== "object") return false;
  const rec = err as { name?: unknown; code?: unknown };
  return rec.name === "YouthSocialBlockedError" || rec.code === "YOUTH_SOCIAL_BLOCKED";
}

export function isOneToOneSocialChannel(channel: string): channel is OneToOneSocialChannel {
  return (ONE_TO_ONE_SOCIAL_CHANNELS as readonly string[]).includes(channel);
}

export function isPrivateInteractContext(value: string): value is PrivateInteractContext {
  return (PRIVATE_INTERACT_CONTEXTS as readonly string[]).includes(value);
}

export function privateInteractContextFromChannel(channel: string): PrivateInteractContext {
  if (isOneToOneSocialChannel(channel)) return CHANNEL_TO_CONTEXT[channel];
  if (isPrivateInteractContext(channel)) return channel;
  return "DM";
}

export function ageYearsFromDateOfBirth(dateOfBirth: Date, now = new Date()): number | null {
  if (Number.isNaN(dateOfBirth.getTime())) return null;
  let age = now.getFullYear() - dateOfBirth.getFullYear();
  const monthDelta = now.getMonth() - dateOfBirth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < dateOfBirth.getDate())) {
    age -= 1;
  }
  if (age < 0 || age > 130) return null;
  return age;
}

export function ageYearsFromDateOfBirthIso(iso: string, now = new Date()): number | null {
  const trimmed = iso.trim();
  if (!trimmed) return null;
  const dob = new Date(trimmed);
  return ageYearsFromDateOfBirth(dob, now);
}

export function youthBandFromAgeYears(ageYears: number | null | undefined): YouthSocialBand {
  if (ageYears == null || !Number.isFinite(ageYears)) return "UNKNOWN";
  const age = Math.floor(ageYears);
  if (age < YOUTH_BAND_MIN_AGE) return "BELOW_PLATFORM";
  if (age <= YOUTH_BAND_MAX_AGE) return "YOUTH";
  if (age >= ADULT_BAND_MIN_AGE) return "ADULT";
  return "UNKNOWN";
}

export function resolveYouthSocialBand(subject: YouthSocialSubject): YouthSocialBand {
  if (subject.ageYears != null && Number.isFinite(subject.ageYears)) {
    return youthBandFromAgeYears(subject.ageYears);
  }
  if (subject.band) return subject.band;
  return "UNKNOWN";
}

export function resolveAgeAssuranceState(subject: YouthSocialSubject): AgeAssuranceState {
  if (subject.ageAssurance) return subject.ageAssurance;
  if (subject.ageYears != null && Number.isFinite(subject.ageYears)) return "SELF_DECLARED";
  if (subject.band === "YOUTH" || subject.band === "ADULT" || subject.band === "BELOW_PLATFORM") {
    return "SELF_DECLARED";
  }
  return "UNVERIFIED";
}

function deny(
  code: OneToOneDenyCode,
  reason: string,
  actorBand: YouthSocialBand,
  targetBand: YouthSocialBand,
  context: PrivateInteractContext,
  actorAssurance: AgeAssuranceState,
  targetAssurance: AgeAssuranceState,
): OneToOneDecision {
  return {
    allowed: false,
    blocked: true,
    reason,
    code,
    actorBand,
    targetBand,
    context,
    actorAssurance,
    targetAssurance,
  };
}

function allow(
  code: OneToOneAllowCode,
  reason: string,
  actorBand: YouthSocialBand,
  targetBand: YouthSocialBand,
  context: PrivateInteractContext,
  actorAssurance: AgeAssuranceState,
  targetAssurance: AgeAssuranceState,
): OneToOneDecision {
  return {
    allowed: true,
    blocked: false,
    reason,
    code,
    actorBand,
    targetBand,
    context,
    actorAssurance,
    targetAssurance,
  };
}

function involvesProtectedTeen(actorBand: YouthSocialBand, targetBand: YouthSocialBand): boolean {
  return actorBand === "YOUTH" || targetBand === "YOUTH";
}

function assuranceBlocksTeenPrivate(state: AgeAssuranceState): boolean {
  return (
    state === "VERIFICATION_REQUIRED" ||
    state === "VERIFICATION_FAILED" ||
    state === "AGE_ESTIMATED"
  );
}

/**
 * Canonical private-interaction gate. All DM / call / private-video / breakout /
 * private-monitor / screen-share checks must call this (or canOneToOneSocial,
 * which delegates here with context DM).
 *
 * Self-declared DOB classifies band (16–17 protected teen / 18+ adult) but
 * does not invent a family link. Fail closed on unknown age.
 */
export function canPrivateInteract(
  a: YouthSocialSubject,
  b: YouthSocialSubject,
  context: PrivateInteractContext = "DM",
): PrivateInteractDecision {
  const ctx = isPrivateInteractContext(context) ? context : "DM";
  const actorId = (a.userId ?? "").trim();
  const targetId = (b.userId ?? "").trim();
  const actorAssurance = resolveAgeAssuranceState(a);
  const targetAssurance = resolveAgeAssuranceState(b);

  if (!actorId || !targetId) {
    return deny(
      "NO_TARGET",
      "blocked: private interaction requires two real account identities",
      resolveYouthSocialBand(a),
      resolveYouthSocialBand(b),
      ctx,
      actorAssurance,
      targetAssurance,
    );
  }

  const actorBand = resolveYouthSocialBand(a);
  const targetBand = resolveYouthSocialBand(b);
  const actorBot = Boolean(a.isBot);
  const targetBot = Boolean(b.isBot);

  if (actorBot || targetBot) {
    if (actorBot && targetBot) {
      return allow(
        "ADULT_PEERS",
        "allowed: labeled bots are not teen private contacts",
        actorBand,
        targetBand,
        ctx,
        actorAssurance,
        targetAssurance,
      );
    }
    const humanBand = actorBot ? targetBand : actorBand;
    if (humanBand !== "ADULT") {
      return deny(
        "BOT_YOUTH",
        "blocked: bots cannot have private contact with 16–17 or unknown-age accounts",
        actorBand,
        targetBand,
        ctx,
        actorAssurance,
        targetAssurance,
      );
    }
    return allow(
      "ADULT_PEERS",
      "allowed: labeled bots may privately contact known adults (18+)",
      actorBand,
      targetBand,
      ctx,
      actorAssurance,
      targetAssurance,
    );
  }

  if (actorBand === "UNKNOWN" || targetBand === "UNKNOWN" || actorAssurance === "UNVERIFIED" || targetAssurance === "UNVERIFIED") {
    return deny(
      "UNKNOWN_AGE",
      "blocked: age unknown — private contact denied until age is on the account",
      actorBand,
      targetBand,
      ctx,
      actorAssurance,
      targetAssurance,
    );
  }

  if (actorBand === "BELOW_PLATFORM" || targetBand === "BELOW_PLATFORM") {
    return deny(
      "BELOW_PLATFORM",
      "blocked: under-16 accounts cannot use private contact",
      actorBand,
      targetBand,
      ctx,
      actorAssurance,
      targetAssurance,
    );
  }

  const familyOk = hasVerifiedFamilyRelationship(a, b);

  if (involvesProtectedTeen(actorBand, targetBand) && !familyOk) {
    if (assuranceBlocksTeenPrivate(actorAssurance) || assuranceBlocksTeenPrivate(targetAssurance)) {
      return deny(
        "ASSURANCE_REQUIRED",
        "blocked: age verification required before private contact with a 16–17 account",
        actorBand,
        targetBand,
        ctx,
        actorAssurance,
        targetAssurance,
      );
    }
  }

  if (actorBand === "YOUTH" && targetBand === "YOUTH") {
    return allow(
      "YOUTH_PEERS",
      "allowed: protected-teen peers (16–17)",
      actorBand,
      targetBand,
      ctx,
      actorAssurance,
      targetAssurance,
    );
  }

  if (actorBand === "ADULT" && targetBand === "ADULT") {
    return allow(
      "ADULT_PEERS",
      "allowed: adult peers (18+)",
      actorBand,
      targetBand,
      ctx,
      actorAssurance,
      targetAssurance,
    );
  }

  if (familyOk) {
    return allow(
      "SAME_FAMILY",
      "allowed: verified family account relationship",
      actorBand,
      targetBand,
      ctx,
      actorAssurance,
      targetAssurance,
    );
  }

  return deny(
    "NO_FAMILY_LINK",
    "blocked: 16–17 accounts cannot have private contact with 18+ adults except a verified family relationship",
    actorBand,
    targetBand,
    ctx,
    actorAssurance,
    targetAssurance,
  );
}

/** Existing equivalent name — same authority as canPrivateInteract(..., "DM"). */
export function canOneToOneSocial(a: YouthSocialSubject, b: YouthSocialSubject): OneToOneDecision {
  return canPrivateInteract(a, b, "DM");
}

export function requirePrivateInteract(
  a: YouthSocialSubject,
  b: YouthSocialSubject,
  context: PrivateInteractContext = "DM",
): PrivateInteractDecision {
  const decision = canPrivateInteract(a, b, context);
  if (!decision.allowed) {
    throw new YouthSocialBlockedError(decision.reason, decision);
  }
  return decision;
}

export function requireOneToOneSocial(a: YouthSocialSubject, b: YouthSocialSubject): OneToOneDecision {
  return requirePrivateInteract(a, b, "DM");
}

export type LegacySafetyAgeClass =
  | "minor"
  | "adult"
  | "unknown"
  | "room_public"
  | "test_minor"
  | "test_adult";

/**
 * Map a legacy ageClass onto a subject without inventing a birthday.
 * "minor"/"test_minor" → YOUTH (16–17). "adult"/"test_adult" → ADULT (18+).
 * familyVerified flags are ignored — only familyAccountId counts.
 */
export function subjectFromLegacyAgeClass(
  userId: string,
  ageClass: LegacySafetyAgeClass | undefined,
  extras?: Pick<YouthSocialSubject, "ageYears" | "familyAccountId" | "isBot" | "ageAssurance">,
): YouthSocialSubject {
  let band: YouthSocialBand = "UNKNOWN";
  if (extras?.ageYears != null && Number.isFinite(extras.ageYears)) {
    band = youthBandFromAgeYears(extras.ageYears);
  } else if (ageClass === "minor" || ageClass === "test_minor") {
    band = "YOUTH";
  } else if (ageClass === "adult" || ageClass === "test_adult") {
    band = "ADULT";
  } else {
    band = "UNKNOWN";
  }

  return {
    userId,
    ageYears: extras?.ageYears ?? null,
    band,
    familyAccountId: extras?.familyAccountId ?? null,
    isBot: extras?.isBot,
    ageAssurance: extras?.ageAssurance,
  };
}

export function privateInteractContextFromMessageType(messageType: string | null | undefined): PrivateInteractContext {
  const t = (messageType ?? "").toLowerCase();
  if (t === "video_invite") return "PRIVATE_VIDEO";
  if (t === "call" || t === "voice") return "CALL";
  if (t === "screen_share") return "SCREEN_SHARE";
  return "DM";
}
