/**
 * MessagingEligibility — server-side gate for DMs.
 * States: NOT_ELIGIBLE | AGE_VERIFICATION_REQUIRED | POLICY_ACCEPTANCE_REQUIRED | ELIGIBLE | RESTRICTED | SUSPENDED
 */

import prisma from "@/lib/prisma";
import { evaluateAgeVerification, type AgeVerificationStatus } from "./AgeVerification";
import { hasRequiredPolicyAcceptances, type PolicyDefinition } from "./PolicyAcceptance";

export const MESSAGING_ELIGIBILITY_STATES = [
  "NOT_ELIGIBLE",
  "AGE_VERIFICATION_REQUIRED",
  "POLICY_ACCEPTANCE_REQUIRED",
  "ELIGIBLE",
  "RESTRICTED",
  "SUSPENDED",
] as const;

export type MessagingEligibilityState = (typeof MESSAGING_ELIGIBILITY_STATES)[number];

export type MessagingEligibility = {
  userId: string;
  state: MessagingEligibilityState;
  ageStatus: AgeVerificationStatus;
  ageYears: number | null;
  missingPolicies: PolicyDefinition[];
  reason?: string;
};

export async function getMessagingEligibility(userId: string): Promise<MessagingEligibility> {
  const id = userId.trim();
  if (!id) {
    return {
      userId: "",
      state: "NOT_ELIGIBLE",
      ageStatus: "UNVERIFIED",
      ageYears: null,
      missingPolicies: [],
      reason: "Missing user id",
    };
  }

  let row: {
    id: string;
    age: number | null;
    dateOfBirth: Date | null;
    accountStatus: string;
    termsAccepted: boolean;
  } | null = null;

  try {
    row = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        age: true,
        dateOfBirth: true,
        accountStatus: true,
        termsAccepted: true,
      },
    });
  } catch {
    row = null;
  }

  if (!row) {
    return {
      userId: id,
      state: "NOT_ELIGIBLE",
      ageStatus: "UNVERIFIED",
      ageYears: null,
      missingPolicies: [],
      reason: "Account not found",
    };
  }

  const status = (row.accountStatus ?? "active").toLowerCase();
  if (status === "banned" || status === "suspended") {
    return {
      userId: id,
      state: status === "banned" ? "RESTRICTED" : "SUSPENDED",
      ageStatus: evaluateAgeVerification({
        dateOfBirth: row.dateOfBirth,
        ageYears: row.age,
      }).status,
      ageYears: row.age,
      missingPolicies: [],
      reason: status === "banned" ? "Account restricted" : "Account suspended",
    };
  }

  const age = evaluateAgeVerification({
    dateOfBirth: row.dateOfBirth,
    ageYears: row.age,
  });

  if (age.rejected) {
    return {
      userId: id,
      state: "RESTRICTED",
      ageStatus: age.status,
      ageYears: age.ageYears,
      missingPolicies: [],
      reason: "Under platform minimum age",
    };
  }

  if (!age.eligibleForMessagingAge) {
    return {
      userId: id,
      state: "AGE_VERIFICATION_REQUIRED",
      ageStatus: age.status,
      ageYears: age.ageYears,
      missingPolicies: [],
      reason: "Age verification required before messaging",
    };
  }

  const policies = await hasRequiredPolicyAcceptances(id);
  if (!policies.complete) {
    // Legacy accounts may have termsAccepted=true from signup without versioned records.
    // Still require versioned PolicyAcceptanceRecord for messaging.
    return {
      userId: id,
      state: "POLICY_ACCEPTANCE_REQUIRED",
      ageStatus: age.status,
      ageYears: age.ageYears,
      missingPolicies: policies.missing,
      reason: "Policy acceptance required before messaging",
    };
  }

  return {
    userId: id,
    state: "ELIGIBLE",
    ageStatus: age.status,
    ageYears: age.ageYears,
    missingPolicies: [],
  };
}

/** True when age and/or versioned policy acceptance must be completed before messaging. */
export function needsAgeOrPolicyGate(state: MessagingEligibilityState): boolean {
  return (
    state === "AGE_VERIFICATION_REQUIRED" ||
    state === "POLICY_ACCEPTANCE_REQUIRED"
  );
}
