"use client";

import type { AgeAssuranceState } from "./YouthSocialGuard";
import {
  DATING_EXPERIENCE_CLASS,
  DATING_MINIMUM_AGE,
  type DatingAccessDecision,
  type DatingAccountSafetyState,
  type DatingExperienceClass,
} from "./DatingExperiencePolicy";

const FAIL_CLOSED: DatingAccessDecision = {
  allowed: false,
  blocked: true,
  gated: true,
  reason: "blocked: age unknown — dating access denied until age is verified",
  code: "UNKNOWN_AGE",
  ageYears: null,
  ageKnown: false,
  ageAssurance: "UNVERIFIED",
  accountSafetyState: "unknown",
  minimumAge: DATING_MINIMUM_AGE,
  verificationRequired: true,
  experienceClass: DATING_EXPERIENCE_CLASS,
};

function asAssurance(value: unknown): AgeAssuranceState {
  if (
    value === "UNVERIFIED" ||
    value === "SELF_DECLARED" ||
    value === "AGE_ESTIMATED" ||
    value === "VERIFIED_TEEN" ||
    value === "VERIFIED_ADULT" ||
    value === "VERIFICATION_REQUIRED" ||
    value === "VERIFICATION_FAILED"
  ) {
    return value;
  }
  return "UNVERIFIED";
}

function asSafety(value: unknown): DatingAccountSafetyState {
  if (
    value === "active" ||
    value === "suspended" ||
    value === "banned" ||
    value === "restricted" ||
    value === "unknown"
  ) {
    return value;
  }
  return "unknown";
}

function asDecision(raw: unknown): DatingAccessDecision {
  if (!raw || typeof raw !== "object") return FAIL_CLOSED;
  const rec = raw as Record<string, unknown>;
  const allowed = rec.allowed === true;
  const reason =
    typeof rec.reason === "string" && rec.reason.trim() ? rec.reason : FAIL_CLOSED.reason;
  const experienceClass: DatingExperienceClass | null =
    rec.experienceClass === DATING_EXPERIENCE_CLASS ? DATING_EXPERIENCE_CLASS : null;
  return {
    allowed,
    blocked: !allowed,
    gated: rec.gated === true || (!allowed && rec.code !== "NOT_DATING"),
    reason,
    code: (typeof rec.code === "string" ? rec.code : allowed ? "DATING_ELIGIBLE" : "UNKNOWN_AGE") as DatingAccessDecision["code"],
    ageYears: typeof rec.ageYears === "number" && Number.isFinite(rec.ageYears) ? Math.floor(rec.ageYears) : null,
    ageKnown: rec.ageKnown === true,
    ageAssurance: asAssurance(rec.ageAssurance),
    accountSafetyState: asSafety(rec.accountSafetyState),
    minimumAge: DATING_MINIMUM_AGE,
    verificationRequired: rec.verificationRequired !== false,
    experienceClass,
  };
}

/** Client entry: server re-reads Prisma age/status. Fail closed on network/auth errors. */
export async function requestDatingExperienceAccess(room?: {
  id?: string;
  slug?: string;
  roomId?: string;
  type?: string;
  experienceClass?: string;
}): Promise<DatingAccessDecision> {
  try {
    const res = await fetch("/api/trustSafety/dating-access", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(room ?? {}),
    });
    const data: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      const rec = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
      const parsed = asDecision(data);
      return {
        ...FAIL_CLOSED,
        ...parsed,
        allowed: false,
        blocked: true,
        reason: typeof rec.reason === "string" ? rec.reason : parsed.reason,
        code: (typeof rec.code === "string" ? rec.code : parsed.code) as DatingAccessDecision["code"],
      };
    }
    return asDecision(data);
  } catch {
    return FAIL_CLOSED;
  }
}
