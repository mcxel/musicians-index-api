/**
 * Unified business partner account — durable profile persistence.
 * SERVER-ONLY (Prisma). Client signup UI must import BusinessPartnerCapabilitiesCore.
 */
import "server-only";
import { prisma } from "@/lib/prisma";
import type { BusinessPartnerProfile } from "@/lib/auth/BusinessPartnerCapabilitiesCore";

export type {
  BusinessPartnerCapability,
  BusinessPartnerProfile,
} from "@/lib/auth/BusinessPartnerCapabilitiesCore";
export {
  BUSINESS_PARTNER_CAPABILITY_LABELS,
  rolesFromBusinessCapabilities,
  primaryBusinessHubRoute,
} from "@/lib/auth/BusinessPartnerCapabilitiesCore";

const SOCIAL_KEY = "businessPartner";

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
