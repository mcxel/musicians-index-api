/**
 * Unified venue / promoter professional account — one identity, capability flags.
 * Stored on UserProfile.socialLinks.
 */
import { prisma } from "@/lib/prisma";

export type VenueProfessionalCapability = "VENUE_OPERATOR" | "PROMOTER";

export const VENUE_PROFESSIONAL_LABELS: Record<VenueProfessionalCapability, string> = {
  VENUE_OPERATOR: "Operate a venue (space, capacity, ticketing)",
  PROMOTER: "Promote & sell events (shows, tours, ticket sales)",
};

export type VenueProfessionalProfile = {
  venueName?: string;
  address?: string;
  city?: string;
  state?: string;
  capacity?: string;
  venueType?: string;
  ticketingSales?: string;
  eventSchedule?: string;
  bookingContact?: string;
  payoutPreference?: string;
  /** Promoter-only fields when PROMOTER capability selected */
  promoterCompany?: string;
  promoterFocus?: string;
  capabilities: VenueProfessionalCapability[];
  updatedAt?: string;
};

const SOCIAL_KEY = "venueProfessional";

export function rolesFromVenueCapabilities(
  capabilities: VenueProfessionalCapability[],
): ("VENUE" | "PROMOTER")[] {
  const roles = new Set<"VENUE" | "PROMOTER">();
  if (capabilities.includes("VENUE_OPERATOR")) roles.add("VENUE");
  if (capabilities.includes("PROMOTER")) roles.add("PROMOTER");
  if (roles.size === 0) roles.add("VENUE");
  return [...roles];
}

export function primaryVenueHubRoute(capabilities: VenueProfessionalCapability[]): string {
  if (capabilities.includes("VENUE_OPERATOR")) return "/hub/venue";
  return "/hub/promoter";
}

export async function getVenueProfessionalProfile(userId: string): Promise<VenueProfessionalProfile | null> {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { socialLinks: true },
  });
  if (!profile?.socialLinks || typeof profile.socialLinks !== "object") return null;
  const raw = (profile.socialLinks as Record<string, unknown>)[SOCIAL_KEY];
  if (!raw || typeof raw !== "object") return null;
  return raw as VenueProfessionalProfile;
}

export async function saveVenueProfessionalProfile(
  userId: string,
  data: VenueProfessionalProfile,
): Promise<VenueProfessionalProfile> {
  const existing = await prisma.userProfile.findUnique({
    where: { userId },
    select: { socialLinks: true, displayName: true, city: true, state: true },
  });
  const links = (existing?.socialLinks as Record<string, unknown>) ?? {};
  const payload: VenueProfessionalProfile = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  await prisma.userProfile.upsert({
    where: { userId },
    create: {
      userId,
      displayName: data.venueName ?? data.promoterCompany ?? existing?.displayName,
      city: data.city,
      state: data.state,
      socialLinks: { ...links, [SOCIAL_KEY]: payload },
    },
    update: {
      displayName: data.venueName ?? data.promoterCompany ?? existing?.displayName,
      city: data.city ?? existing?.city,
      state: data.state ?? existing?.state,
      socialLinks: { ...links, [SOCIAL_KEY]: payload },
    },
  });
  return payload;
}
