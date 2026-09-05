/**
 * Trust & Safety Runtime contracts.
 * Detection/enforcement lives here. ScamDefenseCenter is an Observatory client —
 * not where detection runs. Verification badges are contract types only (never
 * fake-granted). Internal TrustScore is never exposed on public profiles.
 */

/** Report reasons — scam / impersonation / payment fraud focused (FTC threat context). */
export const TRUST_SAFETY_REPORT_REASONS = [
  "impersonation",
  "stolen_media",
  "fake_endorsement",
  "payment_scam",
  "fake_booking_ticket",
  "medical_claim",
  "investment_scam",
  "phishing",
  "ato",
  "harassment",
  "age_misrepresentation",
  "other",
] as const;

export type TrustSafetyReportReason = (typeof TRUST_SAFETY_REPORT_REASONS)[number];

export const TRUST_SAFETY_REASON_LABELS: Record<TrustSafetyReportReason, string> = {
  impersonation: "Impersonation / fake identity",
  stolen_media: "Stolen media / content theft",
  fake_endorsement: "Fake endorsement",
  payment_scam: "Payment scam",
  fake_booking_ticket: "Fake booking / ticket",
  medical_claim: "Unauthorized medical claim",
  investment_scam: "Investment scam",
  phishing: "Phishing / malicious link",
  ato: "Account takeover (ATO)",
  harassment: "Harassment",
  age_misrepresentation: "Age misrepresentation",
  other: "Other",
};

/** Case status lifecycle */
export type TrustSafetyCaseStatus =
  | "open"
  | "reviewing"
  | "restricted"
  | "resolved"
  | "appealed"
  | "closed";

/**
 * Enforcement ladder (types + Level 1 implemented for reporter path).
 * 0 = none · 1 = friction (hide/block DM/freeze payment-to-reporter) ·
 * 2 = restrict surface · 3 = suspend · 4 = ban (human-only via admin path)
 */
export type EnforcementLevel = 0 | 1 | 2 | 3 | 4;

export const ENFORCEMENT_LEVEL_LABELS: Record<EnforcementLevel, string> = {
  0: "None — logged only",
  1: "Friction — hide for reporter, optional DM block / payment freeze",
  2: "Restrict — remove from surface / rejoin block",
  3: "Suspend — temporary account hold (admin/system)",
  4: "Ban — permanent (human-confirmed only)",
};

/** Moderator authority tiers (types/comments — gate APIs to ADMIN/STAFF). */
export type ModeratorAuthorityLevel =
  | "community"
  | "safety_team"
  | "big_ace_executive";

export const MODERATOR_AUTHORITY_LABELS: Record<ModeratorAuthorityLevel, string> = {
  community: "Community Moderator",
  safety_team: "Safety Team",
  big_ace_executive: "Big Ace Executive",
};

/**
 * Verification badge kinds — contract only.
 * Do NOT grant these from this runtime; issuance is a separate verified workflow.
 */
export type VerificationBadgeKind =
  | "IDENTITY"
  | "BUSINESS"
  | "AUTHORIZED_REPRESENTATIVE"
  | "SPONSOR_RELATIONSHIP"
  | "OFFICIAL_TMI_STAFF";

export type VerificationBadgeContract = {
  kind: VerificationBadgeKind;
  /** Always false until a real verification pipeline issues the badge. */
  granted: false;
  label: string;
};

export const VERIFICATION_BADGE_CONTRACTS: VerificationBadgeContract[] = [
  { kind: "IDENTITY", granted: false, label: "Identity Verified" },
  { kind: "BUSINESS", granted: false, label: "Business Verified" },
  { kind: "AUTHORIZED_REPRESENTATIVE", granted: false, label: "Authorized Representative" },
  { kind: "SPONSOR_RELATIONSHIP", granted: false, label: "Sponsor Relationship" },
  { kind: "OFFICIAL_TMI_STAFF", granted: false, label: "Official TMI Staff" },
];

/**
 * Internal TrustScore — never random, never public profile.
 * Honest placeholder: only account age + verified flags when real data exists.
 */
export type InternalTrustScore = {
  score: number | null;
  basis: string[];
  /** When false, UI must show honest empty — never invent a number. */
  computable: boolean;
};

export type TrustSafetySurface =
  | "fan_lobby"
  | "live_room"
  | "profile"
  | "magazine"
  | "marketplace"
  | "messaging"
  | "dating"
  | "other";

export type EvidenceKind =
  | "content_snapshot"
  | "message_bundle"
  | "screenshot"
  | "presence_frame"
  | "hash_record";

export type EvidenceMessage = {
  id?: string;
  fromUserId: string;
  text: string;
  sentAt?: string;
};

export type SubmitTrustReportInput = {
  reporterId: string;
  accusedId?: string | null;
  reasons: TrustSafetyReportReason[];
  surface: TrustSafetySurface;
  roomId?: string | null;
  detail?: string;
  blockImmediate?: boolean;
  includeMessages?: boolean;
  messages?: EvidenceMessage[];
  screenshotUrl?: string | null;
  contentSnapshot?: string | null;
  /** Optional presence/room snapshot for Fan Lobby */
  presenceSnapshot?: unknown;
};

export type TrustSafetyCaseView = {
  id: string;
  caseId: string;
  reporterId: string;
  accusedId: string | null;
  reasons: TrustSafetyReportReason[];
  surface: string;
  roomId: string | null;
  status: TrustSafetyCaseStatus;
  enforcementLevel: EnforcementLevel;
  outcome: string | null;
  detail: string | null;
  blockImmediate: boolean;
  includeMessages: boolean;
  screenshotUrl: string | null;
  contentHash: string | null;
  evidenceCount: number;
  createdAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
};

export type CaseAction =
  | "start_review"
  | "hide_content"
  | "block_dms"
  | "restrict_rejoin"
  | "remove_from_room"
  | "resolve"
  | "escalate"
  | "close";
