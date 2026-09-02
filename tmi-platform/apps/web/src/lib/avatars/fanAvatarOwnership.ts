/**
 * Rule 26 — avatar ownership / customization is FAN-only.
 * Performers/Bands keep real photo/video/live identity. QA (ADMIN/STAFF) may
 * hit ownership APIs; they are not a second avatar product.
 */

export const FAN_AVATAR_OWNERSHIP_ROLES = ["FAN", "USER", "ADMIN", "STAFF"] as const;

export const PERFORMER_IDENTITY_ROLES = [
  "PERFORMER",
  "BAND",
  "ARTIST",
  "VENUE",
  "PROMOTER",
  "SPONSOR",
  "ADVERTISER",
  "WRITER",
  "JUDGE",
] as const;

export type FanAvatarOwnershipRole = (typeof FAN_AVATAR_OWNERSHIP_ROLES)[number];
export type PerformerIdentityRole = (typeof PERFORMER_IDENTITY_ROLES)[number];

function normalizeRole(role: string | null | undefined): string {
  return (role ?? "").trim().toUpperCase();
}

export function isFanAvatarOwnershipRole(role: string | null | undefined): boolean {
  const r = normalizeRole(role);
  return (FAN_AVATAR_OWNERSHIP_ROLES as readonly string[]).includes(r);
}

export function isPerformerIdentityRole(role: string | null | undefined): boolean {
  const r = normalizeRole(role);
  return (PERFORMER_IDENTITY_ROLES as readonly string[]).includes(r);
}
