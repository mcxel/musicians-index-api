/**
 * Platform age verification status for messaging / policy gates.
 * Derived from account DOB (server-side). Self-declared DOB for eligibility —
 * YouthSocialGuard still owns private teen/adult cross-band rules.
 */

import {
  ageYearsFromDateOfBirth,
  ageYearsFromDateOfBirthIso,
} from "@/lib/trustSafety/YouthSocialGuard";

export const AGE_VERIFICATION_STATUSES = [
  "UNVERIFIED",
  "VERIFIED_16_17",
  "VERIFIED_18_20",
  "VERIFIED_21_PLUS",
  "REJECTED_UNDERAGE",
] as const;

export type AgeVerificationStatus = (typeof AGE_VERIFICATION_STATUSES)[number];

export const PLATFORM_MIN_AGE = 16;

export type AgeVerificationResult = {
  status: AgeVerificationStatus;
  ageYears: number | null;
  eligibleForMessagingAge: boolean;
  rejected: boolean;
};

export function ageVerificationStatusFromAgeYears(
  ageYears: number | null | undefined,
): AgeVerificationStatus {
  if (ageYears == null || !Number.isFinite(ageYears)) return "UNVERIFIED";
  const age = Math.floor(ageYears);
  if (age < PLATFORM_MIN_AGE) return "REJECTED_UNDERAGE";
  if (age <= 17) return "VERIFIED_16_17";
  if (age <= 20) return "VERIFIED_18_20";
  return "VERIFIED_21_PLUS";
}

export function evaluateAgeVerification(input: {
  dateOfBirth?: Date | string | null;
  ageYears?: number | null;
}): AgeVerificationResult {
  let ageYears: number | null = null;
  if (typeof input.ageYears === "number" && Number.isFinite(input.ageYears) && input.ageYears > 0) {
    ageYears = Math.floor(input.ageYears);
  } else if (input.dateOfBirth instanceof Date) {
    ageYears = ageYearsFromDateOfBirth(input.dateOfBirth);
  } else if (typeof input.dateOfBirth === "string" && input.dateOfBirth.trim()) {
    ageYears = ageYearsFromDateOfBirthIso(input.dateOfBirth);
  }

  const status = ageVerificationStatusFromAgeYears(ageYears);
  return {
    status,
    ageYears,
    eligibleForMessagingAge:
      status === "VERIFIED_16_17" ||
      status === "VERIFIED_18_20" ||
      status === "VERIFIED_21_PLUS",
    rejected: status === "REJECTED_UNDERAGE",
  };
}

export function parseDateOfBirthInput(raw: string): Date | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}
