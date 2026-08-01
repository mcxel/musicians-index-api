/**
 * foundingMemberRegistry — Founding Member Role Templates (locked 2026-08-01).
 *
 * Defines the capabilities, permissions, and Living OS workspace configuration
 * for each Founding Member role. This is a ROLE TEMPLATE registry, not a user
 * database. Actual member account records live in the Prisma database.
 *
 * Per Rule 20 (No Fake Data): this file defines WHAT a Founding Beat Creator
 * CAN DO — it does not contain real user IDs, emails, or account records.
 * Account provisioning happens through /api/auth/provision when an admin
 * grants a user the BEAT_CREATOR role.
 *
 * Founding Beat Creator — first holder: Todd Morrissey
 * Registered 2026-08-01 by Marcel Dickens (BernoutGlobal LLC).
 */

import type { ActionId } from "@/lib/os/universalActionRegistry";

// ─── Founding Member Tier ─────────────────────────────────────────────────────

export type FoundingMemberRole =
  | "FOUNDING_BEAT_CREATOR"
  | "FOUNDING_PERFORMER"
  | "FOUNDING_FAN"
  | "FOUNDING_VENUE"
  | "FOUNDING_PROMOTER";

// ─── Role Template ────────────────────────────────────────────────────────────

export interface FoundingMemberRoleTemplate {
  role: FoundingMemberRole;
  /** Human-readable display label. */
  displayName: string;
  /** Badge shown on profile and YoPho card. */
  badge: string;
  /** Official platform tier granted at registration. */
  membershipTier: "DIAMOND";
  /** Whether membership is lifetime (no expiry). */
  lifetimeMembership: true;
  /** Contributor role added to the base account role. */
  contributorRole: string;
  /** Actions unlocked above the base account role. */
  grantedActions: ActionId[];
  /** Operating Center IDs shown in the left rail. */
  operatingCenterIds: string[];
  /** Human-readable description of what this founding role includes. */
  benefits: string[];
}

// ─── Founding Beat Creator Template ──────────────────────────────────────────

export const FOUNDING_BEAT_CREATOR: FoundingMemberRoleTemplate = {
  role: "FOUNDING_BEAT_CREATOR",
  displayName: "Founding Beat Creator",
  badge: "🎧 Official Beat Creator · Lifetime Diamond",
  membershipTier: "DIAMOND",
  lifetimeMembership: true,
  contributorRole: "beat_creator",
  grantedActions: [
    "ACTION_UPLOAD_BEAT",
    "ACTION_EDIT_BEAT",
    "ACTION_REPLACE_BEAT",
    "ACTION_DELETE_BEAT",
    "ACTION_SUBMIT_BEAT_TO_BATTLE",
    "ACTION_SUBMIT_BEAT_TO_CYPHER",
    "ACTION_SUBMIT_BEAT_TO_CHALLENGE",
    "ACTION_VIEW_BEAT_SUBMISSION_STATUS",
    "ACTION_VIEW_BEAT_APPROVAL_STATUS",
    "ACTION_OPEN_BEAT_LOCKER_CENTER",
    "ACTION_OPEN_BEAT_REVENUE_DASHBOARD",
    "ACTION_DOWNLOAD_BEAT_REPORT",
    "ACTION_OPEN_BEAT_LAB",
  ],
  operatingCenterIds: [
    "beat_locker",
    "beat_queue",
    "beat_analytics",
  ],
  benefits: [
    "Lifetime Diamond membership — never expires",
    "Unlimited Beat Locker uploads",
    "Official Beat Creator badge on profile and YoPho card",
    "Priority beat submission processing",
    "Beat Locker Operating Center in the left rail",
    "Competition Queue — submit beats to Battles, Cyphers, and Challenges",
    "Beat Analytics Center — view plays, submission status, and approval status",
    "Beat Revenue Dashboard — royalties and licensing (when available)",
    "Beat Report exports",
    "Featured Creator opportunities",
    "Early access to new Beat Creator tools",
    "Direct collaboration eligibility with producers, artists, judges, and competition hosts",
  ],
};

// ─── Registry Map ─────────────────────────────────────────────────────────────

export const FOUNDING_MEMBER_REGISTRY: Record<
  FoundingMemberRole,
  FoundingMemberRoleTemplate
> = {
  FOUNDING_BEAT_CREATOR: FOUNDING_BEAT_CREATOR,
  // Additional founding roles can be added here as the platform grows.
  // Per Rule 20: only add entries when a real person has been provisioned.
  FOUNDING_PERFORMER: {
    role: "FOUNDING_PERFORMER",
    displayName: "Founding Performer",
    badge: "🎤 Founding Performer · Lifetime Diamond",
    membershipTier: "DIAMOND",
    lifetimeMembership: true,
    contributorRole: "performer",
    grantedActions: [
      "ACTION_START_BROADCAST",
      "ACTION_GO_LIVE",
      "ACTION_OPEN_MEDIA_LOCKER",
      "ACTION_OPEN_ANALYTICS_CENTER",
    ],
    operatingCenterIds: [
      "communication",
      "booking",
      "media",
      "commercial",
      "analytics",
      "yopho",
    ],
    benefits: [
      "Lifetime Diamond membership — never expires",
      "Founding Performer badge",
      "Full performer Operating Center suite",
      "Priority booking visibility",
      "Featured placement opportunities",
      "Early access to new performer tools",
    ],
  },
  FOUNDING_FAN: {
    role: "FOUNDING_FAN",
    displayName: "Founding Fan",
    badge: "⭐ Founding Fan · Lifetime Diamond",
    membershipTier: "DIAMOND",
    lifetimeMembership: true,
    contributorRole: "fan",
    grantedActions: [
      "ACTION_OPEN_AVATAR_CENTER",
      "ACTION_OPEN_MEMORY_CENTER",
      "ACTION_OPEN_REWARDS_CENTER",
    ],
    operatingCenterIds: ["avatar", "memory", "rewards", "yopho", "statistics"],
    benefits: [
      "Lifetime Diamond membership — never expires",
      "Founding Fan badge",
      "Exclusive collectible YoPho editions",
      "Priority event access",
    ],
  },
  FOUNDING_VENUE: {
    role: "FOUNDING_VENUE",
    displayName: "Founding Venue",
    badge: "🏟️ Founding Venue · Lifetime Diamond",
    membershipTier: "DIAMOND",
    lifetimeMembership: true,
    contributorRole: "admin",
    grantedActions: ["ACTION_SELL_TICKET", "ACTION_BOOK_ARTIST"],
    operatingCenterIds: [],
    benefits: [
      "Lifetime Diamond membership — never expires",
      "Founding Venue badge",
      "Priority listing in venue discovery",
      "Reduced booking commission",
    ],
  },
  FOUNDING_PROMOTER: {
    role: "FOUNDING_PROMOTER",
    displayName: "Founding Promoter",
    badge: "📢 Founding Promoter · Lifetime Diamond",
    membershipTier: "DIAMOND",
    lifetimeMembership: true,
    contributorRole: "admin",
    grantedActions: ["ACTION_SELL_TICKET", "ACTION_LAUNCH_CAMPAIGN"],
    operatingCenterIds: [],
    benefits: [
      "Lifetime Diamond membership — never expires",
      "Founding Promoter badge",
      "Priority campaign placement",
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the template for a given founding role. */
export function getFoundingRoleTemplate(
  role: FoundingMemberRole,
): FoundingMemberRoleTemplate | null {
  return FOUNDING_MEMBER_REGISTRY[role] ?? null;
}

/**
 * Provisioning specification for an admin to grant a user the
 * Founding Beat Creator role. Pass this to /api/auth/provision.
 *
 * Usage (Admin Console):
 *   const spec = getBeatCreatorProvisioningSpec();
 *   await fetch("/api/auth/provision", {
 *     method: "POST",
 *     body: JSON.stringify({ userId, ...spec }),
 *   });
 */
export function getBeatCreatorProvisioningSpec() {
  return {
    membershipTier: FOUNDING_BEAT_CREATOR.membershipTier,
    lifetimeMembership: FOUNDING_BEAT_CREATOR.lifetimeMembership,
    contributorRole: FOUNDING_BEAT_CREATOR.contributorRole,
    badge: FOUNDING_BEAT_CREATOR.badge,
    grantedActions: FOUNDING_BEAT_CREATOR.grantedActions,
    operatingCenterIds: FOUNDING_BEAT_CREATOR.operatingCenterIds,
    notes: "Founding Beat Creator — first granted 2026-08-01. SoundCloud recovery pending; will upload original files directly to Beat Locker when available.",
  };
}
