/**
 * Artist & Fan Share Identity Engine — Marcel 1-Tap QR / Share Card Protocol.
 *
 * Rules:
 *   1. Scanning or tapping a Fan or Performer QR immediately triggers a 1-tap Follow / Add Friend.
 *   2. For a Fan: lands on their YoPho Public Fan Card / Profile.
 *   3. For a Performer: lands on their Performer Profile, Magazine Article, and Store (Beats/Merch).
 *   4. Identity payload is canonical and permanent — derived from userId + verified slug/username.
 */

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
}): UserShareIdentity {
  const canonicalSlug = (input.slug ?? input.username).toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const isPerformer = input.role === "performer" || input.role === "artist";

  const profileUrl = isPerformer
    ? `/profile/artist/${canonicalSlug}`
    : `/profile/fan/${canonicalSlug}`;

  const yophoCardUrl = `/yopho/card/${canonicalSlug}`;
  const performerArticleUrl = isPerformer ? `/magazine/article/${canonicalSlug}` : undefined;
  const storeUrl = isPerformer ? `/commerce/store/${canonicalSlug}` : undefined;

  const qrPayload = JSON.stringify({
    v: 1,
    action: "follow",
    userId: input.userId,
    role: input.role,
    slug: canonicalSlug,
    yophoCardUrl,
    profileUrl,
  });

  const oneTapActionUrl = `/api/social/follow?targetUserId=${input.userId}&autoFollow=true`;

  return {
    userId: input.userId,
    role: input.role,
    username: input.username,
    displayName: input.displayName,
    avatarUrl: input.avatarUrl ?? null,
    slug: canonicalSlug,
    yophoCardUrl,
    profileUrl,
    performerArticleUrl,
    storeUrl,
    // Fixed from a hardcoded production URL — was pointing every QR
    // generated on preview/localhost at production regardless of where it
    // was actually created.
    qrPayload: `${getShareBaseUrl()}/share/${canonicalSlug}?action=follow&userId=${input.userId}`,
    oneTapActionUrl,
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
