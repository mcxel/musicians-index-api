/**
 * Artist & Fan Share Identity — one member, one public page, one identity card.
 *
 * The QR encodes the identity card URL. It does not follow, friend, or open the Hub.
 * FAN THEM is an explicit action on that card and uses the existing Follow record.
 * Friendship stays a separate mutual request. Do not merge them here.
 */

import { canonicalIdentityCardPath, canonicalPublicPath } from "@/lib/identity/PublicProfileRuntime";
import { magazineReaderArticleUrl } from "@/lib/magazine/MagazineReaderRoutes";

export function getShareBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "https://themusiciansindex.com";
}

export interface UserShareIdentity {
  userId: string;
  role: "fan" | "performer" | "artist";
  username: string;
  displayName: string;
  avatarUrl: string | null;
  slug: string;
  yophoCardUrl: string;
  profileUrl: string;
  cardUrl: string;
  performerArticleUrl?: string;
  storeUrl?: string;
  qrPayload: string;
  oneTapActionUrl: string;
}

export function buildUserShareIdentity(input: {
  userId: string;
  role: "fan" | "performer" | "artist";
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  slug?: string | null;
  /** Real magazine article slug. Never the performer slug. */
  articleSlug?: string | null;
}): UserShareIdentity {
  const canonicalSlug = (input.slug ?? input.username).toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const isPerformer = input.role === "performer" || input.role === "artist";

  const profileUrl = canonicalPublicPath(canonicalSlug);
  const cardUrl = canonicalIdentityCardPath(canonicalSlug);
  const yophoCardUrl = `/yopho/card/${canonicalSlug}`;
  const articleSlug = input.articleSlug?.trim();
  const performerArticleUrl = isPerformer && articleSlug ? magazineReaderArticleUrl(articleSlug) : undefined;
  const storeUrl = isPerformer ? `/commerce/store/${canonicalSlug}` : undefined;
  const cardAbsolute = `${getShareBaseUrl()}${cardUrl}`;

  return {
    userId: input.userId,
    role: input.role,
    username: input.username,
    displayName: input.displayName,
    avatarUrl: input.avatarUrl ?? null,
    slug: canonicalSlug,
    yophoCardUrl,
    profileUrl,
    cardUrl,
    performerArticleUrl,
    storeUrl,
    qrPayload: cardAbsolute,
    oneTapActionUrl: cardUrl,
  };
}

export function getArtistShareIdentity(input: {
  userId: string;
  role: "fan" | "performer" | "artist";
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  slug?: string | null;
}): UserShareIdentity {
  return buildUserShareIdentity(input);
}
