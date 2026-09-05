/**
 * Unified business partner account — one identity, multiple sponsor/advertiser capabilities.
 * Stored on UserProfile.socialLinks (no duplicate SponsorRegistry / AdvertiserRegistry accounts).
 */
import { prisma } from "@/lib/prisma";

export type BusinessPartnerCapability =
  | "ADVERTISER"
  | "SHOW_EVENT_SPONSOR"
  | "ARTIST_SPONSOR"
  | "PRODUCT_PRIZE_SPONSOR";

export const BUSINESS_PARTNER_CAPABILITY_LABELS: Record<BusinessPartnerCapability, string> = {
  ADVERTISER: "Run ad placements & media buys",
  SHOW_EVENT_SPONSOR: "Sponsor shows & official events (TV-style)",
  ARTIST_SPONSOR: "Sponsor performers (overlays & canisters)",
  PRODUCT_PRIZE_SPONSOR: "Sponsor products & prize pools",
};

export type BusinessPartnerProfile = {
  businessName: string;
  legalName?: string;
  username?: string;
  website?: string;
  category?: string;
  contactEmail?: string;
  region?: string;
  capabilities: BusinessPartnerCapability[];
  /** Conditional answers keyed by capability id */
  followUps?: Partial<Record<BusinessPartnerCapability, Record<string, string>>>;
  updatedAt?: string;
};

const SOCIAL_KEY = "businessPartner";

export function rolesFromBusinessCapabilities(
  capabilities: BusinessPartnerCapability[],
): ("SPONSOR" | "ADVERTISER")[] {
  const roles = new Set<"SPONSOR" | "ADVERTISER">();
  if (capabilities.includes("ADVERTISER")) roles.add("ADVERTISER");
  if (
    capabilities.some((c) =>
      c === "SHOW_EVENT_SPONSOR" || c === "ARTIST_SPONSOR" || c === "PRODUCT_PRIZE_SPONSOR",
    )
  ) {
    roles.add("SPONSOR");
  }
  if (roles.size === 0) roles.add("SPONSOR");
  return [...roles];
}

export function primaryBusinessHubRoute(capabilities: BusinessPartnerCapability[]): string {
  const hasSponsor = capabilities.some((c) => c !== "ADVERTISER");
  if (hasSponsor && capabilities.includes("ADVERTISER")) return "/hub/sponsor";
  if (capabilities.includes("ADVERTISER")) return "/hub/advertiser";
  return "/hub/sponsor";
}

export async function getBusinessPartnerProfile(userId: string): Promise<BusinessPartnerProfile | null> {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { socialLinks: true },
  });
  if (!profile?.socialLinks || typeof profile.socialLinks !== "object") return null;
  const raw = (profile.socialLinks as Record<string, unknown>)[SOCIAL_KEY];
  if (!raw || typeof raw !== "object") return null;
  return raw as BusinessPartnerProfile;
}

export async function saveBusinessPartnerProfile(
  userId: string,
  data: BusinessPartnerProfile,
): Promise<BusinessPartnerProfile> {
  const existing = await prisma.userProfile.findUnique({
    where: { userId },
    select: { socialLinks: true, displayName: true, username: true, website: true },
  });
  const links = (existing?.socialLinks as Record<string, unknown>) ?? {};
  const payload: BusinessPartnerProfile = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  await prisma.userProfile.upsert({
    where: { userId },
    create: {
      userId,
      displayName: data.businessName,
      username: data.username ?? undefined,
      website: data.website ?? undefined,
      socialLinks: { ...links, [SOCIAL_KEY]: payload },
    },
    update: {
      displayName: data.businessName || existing?.displayName,
      username: data.username || existing?.username || undefined,
      website: data.website || existing?.website || undefined,
      socialLinks: { ...links, [SOCIAL_KEY]: payload },
    },
  });
  return payload;
}
