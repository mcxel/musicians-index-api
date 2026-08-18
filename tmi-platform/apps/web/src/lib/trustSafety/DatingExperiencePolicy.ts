/**
 * DatingExperiencePolicy — HARD TMI product rule (not legal advice).
 *
 * Ordinary private-access policy treats 18+ as adults (YouthSocialGuard).
 * Dating is a separate stricter gate: 21+ AND accepted age assurance.
 * Do not merge this into YouthSocialGuard 1:1 band math.
 *
 * Prisma stores age / dateOfBirth only. resolveYouthSocialSubject maps those
 * to SELF_DECLARED. Dating does not treat a typed birthday as verified.
 * Accepted assurance for dating is VERIFIED_ADULT only. This is not an
 * Ofcom-grade assurance claim — TMI has no age-verification vendor wired.
 */

import {
  resolveAgeAssuranceState,
  resolveYouthSocialBand,
  type AgeAssuranceState,
  type YouthSocialSubject,
} from "./YouthSocialGuard";

export const DATING_MINIMUM_AGE = 21;

export const DATING_EXPERIENCE_CLASS = "DATING" as const;

export type DatingExperienceClass = typeof DATING_EXPERIENCE_CLASS;

/**
 * Locked room / experience manifest. A dating room may not launch without these values.
 * Copy onto every dating registry entry and create/join payload.
 */
export const DATING_EXPERIENCE_MANIFEST = {
  minimumAge: DATING_MINIMUM_AGE,
  ageVerificationRequired: true,
  experienceClass: DATING_EXPERIENCE_CLASS,
} as const;

export type DatingExperienceManifest = {
  minimumAge: typeof DATING_MINIMUM_AGE;
  ageVerificationRequired: true;
  experienceClass: DatingExperienceClass;
};

export type DatingAccountSafetyState =
  | "active"
  | "suspended"
  | "banned"
  | "restricted"
  | "unknown";

export type DatingAccessDenyCode =
  | "UNKNOWN_AGE"
  | "ASSURANCE_REQUIRED"
  | "UNDER_DATING_AGE"
  | "CONTRADICTORY_AGE"
  | "ACCOUNT_RESTRICTED"
  | "MANIFEST_INCOMPLETE"
  | "NO_SUBJECT";

export type DatingAccessAllowCode = "DATING_ELIGIBLE" | "NOT_DATING";

export type DatingAccessDecision = {
  allowed: boolean;
  blocked: boolean;
  gated: boolean;
  reason: string;
  code: DatingAccessDenyCode | DatingAccessAllowCode;
  ageYears: number | null;
  ageKnown: boolean;
  ageAssurance: AgeAssuranceState;
  accountSafetyState: DatingAccountSafetyState;
  minimumAge: number;
  verificationRequired: boolean;
  experienceClass: DatingExperienceClass | null;
};

export type DatingExperienceSubject = Pick<
  YouthSocialSubject,
  "userId" | "ageYears" | "band" | "ageAssurance"
> & {
  accountSafetyState?: DatingAccountSafetyState | null;
  /** Prisma isMinor — contradictory with 21+ eligibility. */
  isMinor?: boolean | null;
};

export type DatingExperienceRef = {
  id?: string | null;
  slug?: string | null;
  roomId?: string | null;
  name?: string | null;
  title?: string | null;
  type?: string | null;
  roomType?: string | null;
  category?: string | null;
  experienceClass?: string | null;
  minimumAge?: number | null;
  ageVerificationRequired?: boolean | null;
  tags?: string[] | null;
  mode?: string | null;
};

const DATING_TOKEN_RE =
  /(^|[^a-z0-9])(dating|date[-_ ]?lounge|datelounge|datinglounge|dating[-_ ]?lounge|date[-_ ]?match|romantic[-_ ]?matchmaking|dating[-_ ]?matchmaking)([^a-z0-9]|$)/i;

export class DatingExperienceBlockedError extends Error {
  readonly code = "DATING_EXPERIENCE_BLOCKED";
  readonly allowed = false as const;
  readonly blocked = true as const;

  constructor(message: string, readonly decision?: DatingAccessDecision) {
    super(message);
    this.name = "DatingExperienceBlockedError";
  }
}

export function isDatingExperienceBlockedError(err: unknown): err is DatingExperienceBlockedError {
  if (err instanceof DatingExperienceBlockedError) return true;
  if (!err || typeof err !== "object") return false;
  const rec = err as { name?: unknown; code?: unknown };
  return rec.name === "DatingExperienceBlockedError" || rec.code === "DATING_EXPERIENCE_BLOCKED";
}

function normalizeToken(value: string | null | undefined): string {
  return (value ?? "").trim().toUpperCase().replace(/[\s-]+/g, "_");
}

function textLooksLikeDating(value: string | null | undefined): boolean {
  const raw = (value ?? "").trim();
  if (!raw) return false;
  return DATING_TOKEN_RE.test(raw);
}

function tagsLookLikeDating(tags: string[] | null | undefined): boolean {
  if (!tags || tags.length === 0) return false;
  return tags.some((tag) => {
    const n = normalizeToken(tag);
    return (
      n === "DATING" ||
      n === "DATE_LOUNGE" ||
      n === "DATING_LOUNGE" ||
      n === "DATELOUNGE" ||
      n === "DATINGLOUNGE" ||
      n === "ROMANTIC_MATCHMAKING" ||
      n === "DATING_MATCHMAKING"
    );
  });
}

/** True only for dating / date-lounge / romantic matchmaking — not battle or sponsor matchmaking. */
export function isDatingExperience(ref: DatingExperienceRef | string | null | undefined): boolean {
  if (ref == null) return false;
  if (typeof ref === "string") {
    const n = normalizeToken(ref);
    if (n === "DATING" || n === "DATE_LOUNGE" || n === "DATING_LOUNGE") return true;
    return textLooksLikeDating(ref);
  }

  const classNorm = normalizeToken(ref.experienceClass);
  if (classNorm === DATING_EXPERIENCE_CLASS) return true;

  const typeNorm = normalizeToken(ref.type ?? ref.roomType ?? ref.category ?? ref.mode);
  if (typeNorm === DATING_EXPERIENCE_CLASS || typeNorm === "DATE_LOUNGE" || typeNorm === "DATING_LOUNGE") {
    return true;
  }

  if (tagsLookLikeDating(ref.tags)) return true;

  return (
    textLooksLikeDating(ref.id) ||
    textLooksLikeDating(ref.slug) ||
    textLooksLikeDating(ref.roomId) ||
    textLooksLikeDating(ref.name) ||
    textLooksLikeDating(ref.title)
  );
}

export function datingManifestIsComplete(ref: DatingExperienceRef): boolean {
  return (
    normalizeToken(ref.experienceClass) === DATING_EXPERIENCE_CLASS &&
    ref.minimumAge === DATING_MINIMUM_AGE &&
    ref.ageVerificationRequired === true
  );
}

function resolveSafety(state: DatingAccountSafetyState | null | undefined): DatingAccountSafetyState {
  if (
    state === "active" ||
    state === "suspended" ||
    state === "banned" ||
    state === "restricted" ||
    state === "unknown"
  ) {
    return state;
  }
  return "unknown";
}

function deny(
  code: DatingAccessDenyCode,
  reason: string,
  subject: DatingExperienceSubject | null,
  extras?: Partial<DatingAccessDecision>,
): DatingAccessDecision {
  const ageYears =
    subject?.ageYears != null && Number.isFinite(subject.ageYears) ? Math.floor(subject.ageYears) : null;
  return {
    allowed: false,
    blocked: true,
    gated: true,
    reason,
    code,
    ageYears,
    ageKnown: ageYears != null,
    ageAssurance: subject ? resolveAgeAssuranceState(subject) : "UNVERIFIED",
    accountSafetyState: resolveSafety(subject?.accountSafetyState),
    minimumAge: DATING_MINIMUM_AGE,
    verificationRequired: true,
    experienceClass: DATING_EXPERIENCE_CLASS,
    ...extras,
  };
}

function allow(
  code: DatingAccessAllowCode,
  reason: string,
  subject: DatingExperienceSubject | null,
  extras?: Partial<DatingAccessDecision>,
): DatingAccessDecision {
  const ageYears =
    subject?.ageYears != null && Number.isFinite(subject.ageYears) ? Math.floor(subject.ageYears) : null;
  return {
    allowed: true,
    blocked: false,
    gated: code !== "NOT_DATING",
    reason,
    code,
    ageYears,
    ageKnown: ageYears != null,
    ageAssurance: subject ? resolveAgeAssuranceState(subject) : "UNVERIFIED",
    accountSafetyState: resolveSafety(subject?.accountSafetyState),
    minimumAge: DATING_MINIMUM_AGE,
    verificationRequired: true,
    experienceClass: code === "NOT_DATING" ? null : DATING_EXPERIENCE_CLASS,
    ...extras,
  };
}

function assuranceAcceptedForDating(state: AgeAssuranceState): boolean {
  return state === "VERIFIED_ADULT";
}

/**
 * Canonical dating eligibility.
 * SELF_DECLARED birthday is not verified. Unknown / contradictory age fails closed.
 */
export function canAccessDatingExperience(user: DatingExperienceSubject | null | undefined): DatingAccessDecision {
  if (!user || !(user.userId ?? "").trim()) {
    return deny(
      "NO_SUBJECT",
      "blocked: dating access requires a signed-in account",
      user ?? null,
    );
  }

  const safety = resolveSafety(user.accountSafetyState);
  if (safety !== "active") {
    return deny(
      "ACCOUNT_RESTRICTED",
      "blocked: this account cannot use dating right now",
      user,
    );
  }

  const assurance = resolveAgeAssuranceState(user);
  const ageYears =
    user.ageYears != null && Number.isFinite(user.ageYears) ? Math.floor(user.ageYears) : null;
  const band = resolveYouthSocialBand(user);

  if (user.isMinor === true && (ageYears == null || ageYears >= DATING_MINIMUM_AGE)) {
    return deny(
      "CONTRADICTORY_AGE",
      "blocked: age unknown or contradictory — dating access denied until age is verified",
      user,
    );
  }

  if (ageYears != null && ageYears >= DATING_MINIMUM_AGE && assurance === "VERIFIED_TEEN") {
    return deny(
      "CONTRADICTORY_AGE",
      "blocked: age unknown or contradictory — dating access denied until age is verified",
      user,
    );
  }

  if (ageYears != null && ageYears < 18 && assurance === "VERIFIED_ADULT") {
    return deny(
      "CONTRADICTORY_AGE",
      "blocked: age unknown or contradictory — dating access denied until age is verified",
      user,
    );
  }

  if (ageYears == null || band === "UNKNOWN" || assurance === "UNVERIFIED") {
    return deny(
      "UNKNOWN_AGE",
      "blocked: age unknown — dating access denied until age is verified",
      user,
    );
  }

  if (ageYears < DATING_MINIMUM_AGE || user.isMinor === true) {
    return deny(
      "UNDER_DATING_AGE",
      "blocked: dating is 21+ only",
      user,
    );
  }

  if (!assuranceAcceptedForDating(assurance)) {
    return deny(
      "ASSURANCE_REQUIRED",
      "blocked: dating requires accepted age verification — a typed birthday is not enough",
      user,
    );
  }

  return allow("DATING_ELIGIBLE", "allowed: dating eligibility (21+ verified)", user);
}

export function datingExperienceMayLaunch(ref: DatingExperienceRef): DatingAccessDecision {
  if (!isDatingExperience(ref)) {
    return allow("NOT_DATING", "allowed: not a dating experience", null, {
      gated: false,
      verificationRequired: false,
      experienceClass: null,
    });
  }
  if (!datingManifestIsComplete(ref)) {
    return deny(
      "MANIFEST_INCOMPLETE",
      "blocked: a dating room cannot launch without minimumAge 21, ageVerificationRequired, and experienceClass DATING",
      null,
    );
  }
  return allow("DATING_ELIGIBLE", "allowed: dating manifest is complete", null);
}

export function assertDatingExperienceMayLaunch(ref: DatingExperienceRef): DatingAccessDecision {
  const decision = datingExperienceMayLaunch(ref);
  if (!decision.allowed) {
    throw new DatingExperienceBlockedError(decision.reason, decision);
  }
  return decision;
}

/**
 * Join / list / invite / match guard.
 * Non-dating surfaces pass through. Dating surfaces require canAccessDatingExperience.
 * Launch completeness is enforced separately by datingExperienceMayLaunch on create.
 */
export function canJoinDatingExperience(
  user: DatingExperienceSubject | null | undefined,
  ref: DatingExperienceRef | string | null | undefined,
): DatingAccessDecision {
  const descriptor: DatingExperienceRef = typeof ref === "string" ? { slug: ref, id: ref, roomId: ref } : ref ?? {};
  if (!isDatingExperience(descriptor)) {
    return allow("NOT_DATING", "allowed: not a dating experience", user ?? null, {
      gated: false,
      verificationRequired: false,
      experienceClass: null,
    });
  }
  return canAccessDatingExperience(user);
}

export function requireDatingExperienceAccess(user: DatingExperienceSubject): DatingAccessDecision {
  const decision = canAccessDatingExperience(user);
  if (!decision.allowed) {
    throw new DatingExperienceBlockedError(decision.reason, decision);
  }
  return decision;
}

export function requireDatingJoin(
  user: DatingExperienceSubject,
  ref: DatingExperienceRef | string,
): DatingAccessDecision {
  const decision = canJoinDatingExperience(user, ref);
  if (!decision.allowed) {
    throw new DatingExperienceBlockedError(decision.reason, decision);
  }
  return decision;
}

export function filterDatingExperiencesForDecision<T>(
  items: T[],
  getRef: (item: T) => DatingExperienceRef | string | null | undefined,
  decision: DatingAccessDecision | null,
): T[] {
  return items.filter((item) => {
    if (!isDatingExperience(getRef(item))) return true;
    return Boolean(decision?.allowed && decision.code === "DATING_ELIGIBLE");
  });
}

export function datingAccessPayload(decision: DatingAccessDecision): {
  allowed: boolean;
  blocked: boolean;
  gated: boolean;
  reason: string;
  code: string;
  error?: string;
  minimumAge: number;
  verificationRequired: boolean;
  experienceClass: DatingExperienceClass | null;
} {
  return {
    allowed: decision.allowed,
    blocked: decision.blocked,
    gated: decision.gated,
    reason: decision.reason,
    code: decision.code,
    error: decision.allowed ? undefined : decision.reason,
    minimumAge: decision.minimumAge,
    verificationRequired: decision.verificationRequired,
    experienceClass: decision.experienceClass,
  };
}
