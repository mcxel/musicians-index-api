/**
 * ArtistShareIdentity — one permanent, shareable public identity per account.
 *
 * Deliberately not a new database model. `/profile/[slug]/page.tsx` already
 * resolves any user by their permanent `User.id` (see getMemberById there —
 * it does `prisma.user.findUnique({ where: { id } })`), so that route is
 * already the stable, rename-proof canonical profile resolver every account
 * has today. This just derives a display-friendly public code from the same
 * permanent id and builds the one URL every QR (Command Center, YoPho,
 * future posters/merch) should encode. Never derive this from a mutable
 * displayName, stage name, or slug — only from the permanent id.
 */

export interface ArtistShareIdentity {
  /** Permanent account id — never shown directly, only used to build the URL. */
  userId: string;
  /** Cosmetic, human-readable code derived from the id. Display only. */
  publicCode: string;
  /** The one URL every QR for this account encodes. */
  canonicalUrl: string;
  /** Relative path form, for internal <Link> use. */
  canonicalPath: string;
}

function getBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "https://themusiciansindex.com";
}

export function getArtistShareIdentity(
  userId: string,
  role: "performer" | "fan" | string = "fan",
): ArtistShareIdentity {
  const prefix = role === "performer" ? "ART" : "FAN";
  const codeSource = userId.replace(/[^a-zA-Z0-9]/g, "").slice(-8) || userId.slice(-8);
  const publicCode = `${prefix}-${codeSource.toUpperCase()}`;
  const canonicalPath = `/profile/${userId}`;
  return {
    userId,
    publicCode,
    canonicalUrl: `${getBaseUrl()}${canonicalPath}`,
    canonicalPath,
  };
}
