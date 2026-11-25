/**
 * Unified venue / promoter professional account — durable profile persistence.
 * SERVER-ONLY (Prisma). Client signup UI must import VenueProfessionalCapabilitiesCore.
 */
import "server-only";
import { prisma } from "@/lib/prisma";
import type { VenueProfessionalProfile } from "@/lib/auth/VenueProfessionalCapabilitiesCore";

export type {
  VenueProfessionalCapability,
  VenueProfessionalProfile,
} from "@/lib/auth/VenueProfessionalCapabilitiesCore";
export {
  VENUE_PROFESSIONAL_LABELS,
  rolesFromVenueCapabilities,
  primaryVenueHubRoute,
} from "@/lib/auth/VenueProfessionalCapabilitiesCore";

const SOCIAL_KEY = "venueProfessional";

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
