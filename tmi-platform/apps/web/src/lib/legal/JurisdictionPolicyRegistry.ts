/**
 * JurisdictionPolicyRegistry — versioned stub policies.
 * Text is counsel-reviewed placeholder language. AI must not invent law.
 */

import type { JurisdictionPolicy, LegalDataCategory } from "./types";

const PLACEHOLDER =
  "Counsel-reviewed placeholder policy text. This registry does not constitute legal advice. " +
  "Actual production policy text must be supplied and versioned by qualified counsel before " +
  "any live disclosure decision relies on it.";

const ALL_CATS: LegalDataCategory[] = [
  "ACCOUNT",
  "AUTH",
  "LIVE",
  "COMM",
  "MEDIA",
  "COMPETITION",
  "COMMERCE",
  "AUDIT",
];

const POLICIES: JurisdictionPolicy[] = [
  {
    policyId: "JP-US-FED-01",
    version: "1.0.0-stub",
    jurisdictionCode: "US-FED",
    title: "United States Federal Process (Stub)",
    summary: PLACEHOLDER,
    counselReviewedPlaceholder: true,
    effectiveAt: "2026-08-01T00:00:00.000Z",
    allowedCategoriesDefault: ["ACCOUNT", "AUTH", "AUDIT", "COMMERCE"],
    requiresCounselReview: true,
    emergencyOverrideAllowed: false,
  },
  {
    policyId: "JP-US-CA-01",
    version: "1.0.0-stub",
    jurisdictionCode: "US-CA",
    title: "California / CCPA Alignment (Stub)",
    summary: PLACEHOLDER,
    counselReviewedPlaceholder: true,
    effectiveAt: "2026-08-01T00:00:00.000Z",
    allowedCategoriesDefault: ["ACCOUNT", "COMMERCE", "MEDIA", "AUDIT"],
    requiresCounselReview: true,
    emergencyOverrideAllowed: false,
  },
  {
    policyId: "JP-EU-GDPR-01",
    version: "1.0.0-stub",
    jurisdictionCode: "EU-GDPR",
    title: "EU GDPR Alignment (Stub)",
    summary: PLACEHOLDER,
    counselReviewedPlaceholder: true,
    effectiveAt: "2026-08-01T00:00:00.000Z",
    allowedCategoriesDefault: ["ACCOUNT", "AUTH", "AUDIT"],
    requiresCounselReview: true,
    emergencyOverrideAllowed: false,
  },
  {
    policyId: "JP-GLOBAL-DEFAULT-01",
    version: "1.0.0-stub",
    jurisdictionCode: "GLOBAL-DEFAULT",
    title: "Global Default Least-Privilege (Stub)",
    summary: PLACEHOLDER,
    counselReviewedPlaceholder: true,
    effectiveAt: "2026-08-01T00:00:00.000Z",
    allowedCategoriesDefault: ["ACCOUNT", "AUDIT"],
    requiresCounselReview: true,
    emergencyOverrideAllowed: false,
  },
];

export function listJurisdictionPolicies(): JurisdictionPolicy[] {
  return POLICIES.map((p) => ({ ...p }));
}

export function getJurisdictionPolicy(
  jurisdictionCode: string,
): JurisdictionPolicy | null {
  const code = jurisdictionCode.trim().toUpperCase();
  const hit =
    POLICIES.find((p) => p.jurisdictionCode === code) ??
    POLICIES.find((p) => p.jurisdictionCode === "GLOBAL-DEFAULT");
  return hit ? { ...hit } : null;
}

export function scopeCategoriesByPolicy(
  jurisdictionCode: string,
  requested: LegalDataCategory[],
): {
  policy: JurisdictionPolicy;
  allowed: LegalDataCategory[];
  denied: LegalDataCategory[];
} {
  const policy = getJurisdictionPolicy(jurisdictionCode) ?? POLICIES[3]!;
  const allowedSet = new Set(policy.allowedCategoriesDefault);
  const allowed = requested.filter((c) => allowedSet.has(c));
  const denied = requested.filter((c) => !allowedSet.has(c));
  return { policy, allowed, denied };
}

export function knownLegalDataCategories(): LegalDataCategory[] {
  return [...ALL_CATS];
}
