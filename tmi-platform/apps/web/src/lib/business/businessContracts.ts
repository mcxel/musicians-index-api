/**
 * Business Canister type contracts — Pass 1 foundation.
 *
 * These are contracts only. No backend, no Prisma models, no payment logic.
 * Every business relationship must begin as a verified ecosystem connection
 * (invite → signup → profile/assets → admin approval → available), never an
 * uploaded logo. RelationshipService and persistence come in a later pass.
 */

export type BusinessAccountType =
  | "sponsor"
  | "advertiser"
  | "venue"
  | "promoter"
  | "booking-agency";

export type BusinessRelationshipStatus =
  | "PENDING"
  | "ACCEPTED"
  | "ACTIVE"
  | "COMPLETED"
  | "EXPIRED";

export type BusinessCampaignSurface =
  | "live"
  | "battle"
  | "radio"
  | "magazine"
  | "profile";

/** A sponsor placement slot inside a performer's canister (local vs major tiers). */
export interface SponsorSlot {
  id: string;
  tier: "local" | "major";
  /** Populated only when a verified, admin-approved sponsor occupies the slot. */
  sponsorAccountId?: string;
  sponsorName?: string;
  logoUrl?: string;
  mediaUrl?: string;
  campaignTitle?: string;
  status: BusinessRelationshipStatus;
  surfaces: BusinessCampaignSurface[];
}

/** A verified connection between two ecosystem accounts (performer↔sponsor, venue↔promoter, …). */
export interface BusinessRelationship {
  id: string;
  initiatorAccountId: string;
  initiatorRole: string;
  targetAccountId: string;
  targetRole: BusinessAccountType | string;
  kind: "sponsorship" | "advertising" | "booking" | "partnership" | "promotion";
  status: BusinessRelationshipStatus;
  createdAt: number;
  updatedAt: number;
}

/**
 * A marketplace opportunity surfaced inside the magazine flow via the
 * Content Composition Engine. Contract only — nothing registers fake
 * particles; real ones are registered when real opportunities exist.
 */
export interface MarketplaceParticle {
  id: string;
  audience: "performer" | "business" | "fan" | "venue" | "promoter";
  headline: string;
  body: string;
  ctaLabel: string;
  /** Must route to a real page (Rule 14). */
  ctaHref: string;
  monetization: "sponsored" | "editorial";
  createdAt: number;
}
