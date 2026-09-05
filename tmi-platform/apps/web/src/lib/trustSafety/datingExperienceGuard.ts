/**
 * Server-only dating join/list/invite/create guard.
 * Prisma age/DOB is SELF_DECLARED — never VERIFIED_ADULT.
 * Fail closed on missing user, missing age, or DB errors.
 */

import prisma from "@/lib/prisma";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { ageYearsFromDateOfBirth } from "./YouthSocialGuard";
import {
  canAccessDatingExperience,
  canJoinDatingExperience,
  datingAccessPayload,
  DATING_EXPERIENCE_MANIFEST,
  DatingExperienceBlockedError,
  filterDatingExperiencesForDecision,
  isDatingExperience,
  isDatingExperienceBlockedError,
  type DatingAccessDecision,
  type DatingAccountSafetyState,
  type DatingExperienceRef,
  type DatingExperienceSubject,
} from "./DatingExperiencePolicy";

const USER_DATING_SELECT = {
  id: true,
  age: true,
  dateOfBirth: true,
  isMinor: true,
  accountStatus: true,
  accountStatusExpiresAt: true,
} as const;

function ageYearsFromRow(row: { age: number | null; dateOfBirth: Date | null }): number | null {
  if (typeof row.age === "number" && Number.isFinite(row.age) && row.age > 0) {
    return Math.floor(row.age);
  }
  if (row.dateOfBirth) return ageYearsFromDateOfBirth(row.dateOfBirth);
  return null;
}

function safetyFromAccountStatus(
  accountStatus: string | null | undefined,
  expiresAt: Date | null | undefined,
): DatingAccountSafetyState {
  const status = (accountStatus ?? "").trim().toLowerCase();
  if (status === "suspended" && expiresAt && expiresAt < new Date()) return "active";
  if (status === "active") return "active";
  if (status === "suspended") return "suspended";
  if (status === "banned") return "banned";
  if (status === "restricted") return "restricted";
  return "unknown";
}

export function unknownDatingSubject(userId: string): DatingExperienceSubject {
  return {
    userId,
    ageYears: null,
    band: "UNKNOWN",
    ageAssurance: "UNVERIFIED",
    accountSafetyState: "unknown",
    isMinor: null,
  };
}

export async function resolveDatingExperienceSubject(userId: string): Promise<DatingExperienceSubject> {
  const id = userId.trim();
  if (!id) return unknownDatingSubject("");

  try {
    const row = await prisma.user.findUnique({
      where: { id },
      select: USER_DATING_SELECT,
    });
    if (!row) return unknownDatingSubject(id);
    const ageYears = ageYearsFromRow(row);
    return {
      userId: row.id,
      ageYears,
      ageAssurance: ageYears != null ? "SELF_DECLARED" : "UNVERIFIED",
      accountSafetyState: safetyFromAccountStatus(row.accountStatus, row.accountStatusExpiresAt),
      isMinor: row.isMinor,
    };
  } catch {
    return unknownDatingSubject(id);
  }
}

export async function evaluateDatingExperienceForUserId(userId: string): Promise<DatingAccessDecision> {
  const subject = await resolveDatingExperienceSubject(userId);
  return canAccessDatingExperience(subject);
}

export async function evaluateDatingJoinForUserId(
  userId: string,
  ref: DatingExperienceRef | string | null | undefined,
): Promise<DatingAccessDecision> {
  if (!isDatingExperience(ref)) {
    return canJoinDatingExperience(null, ref);
  }
  const subject = await resolveDatingExperienceSubject(userId);
  return canJoinDatingExperience(subject, ref);
}

export async function assertDatingExperienceForUserId(userId: string): Promise<DatingAccessDecision> {
  const decision = await evaluateDatingExperienceForUserId(userId);
  if (!decision.allowed) {
    throw new DatingExperienceBlockedError(decision.reason, decision);
  }
  return decision;
}

export async function assertDatingJoinForUserId(
  userId: string,
  ref: DatingExperienceRef | string,
): Promise<DatingAccessDecision> {
  const decision = await evaluateDatingJoinForUserId(userId, ref);
  if (!decision.allowed) {
    throw new DatingExperienceBlockedError(decision.reason, decision);
  }
  return decision;
}

export async function filterDatingExperiencesForUserId<T>(
  userId: string | null | undefined,
  items: T[],
  getRef: (item: T) => DatingExperienceRef | string | null | undefined,
): Promise<T[]> {
  const hasDating = items.some((item) => isDatingExperience(getRef(item)));
  if (!hasDating) return items;
  if (!userId?.trim()) {
    return filterDatingExperiencesForDecision(items, getRef, null);
  }
  const decision = await evaluateDatingExperienceForUserId(userId);
  return filterDatingExperiencesForDecision(items, getRef, decision);
}

export function datingBlockPayload(err: unknown): ReturnType<typeof datingAccessPayload> | null {
  if (!isDatingExperienceBlockedError(err)) return null;
  if (err.decision) return datingAccessPayload(err.decision);
  return datingAccessPayload(canAccessDatingExperience(unknownDatingSubject("")));
}

export async function datingDecisionForSessionUser(
  ref?: DatingExperienceRef | string | null,
): Promise<{ userId: string | null; decision: DatingAccessDecision }> {
  const auth = await getTmiAuth();
  const userId = auth?.user?.id ?? null;
  if (!userId) {
    const closedRef = ref ?? DATING_EXPERIENCE_MANIFEST;
    return {
      userId: null,
      decision: canJoinDatingExperience(unknownDatingSubject(""), closedRef),
    };
  }
  if (ref == null) {
    return { userId, decision: await evaluateDatingExperienceForUserId(userId) };
  }
  return { userId, decision: await evaluateDatingJoinForUserId(userId, ref) };
}
