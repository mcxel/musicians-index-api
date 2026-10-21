/**
 * PublicProfileRuntime — canonical public presence routing (assembly layer).
 * Converges fan/performer/artist public URLs onto /p/[username] without a third profile system.
 */

import { getPerformerBySlug, PERFORMER_REGISTRY } from "@/lib/performers/PerformerRegistry";

export type PublicProfileKind = "fan" | "performer" | "artist" | "member";

export interface PublicProfileTarget {
  kind: PublicProfileKind;
  /** Canonical share slug used in /p/[username] */
  username: string;
  /** Role-specific legacy route (existing profile pages) */
  legacyPath: string;
  displayName: string;
  userId?: string;
}

const PERFORMER_ROLES = new Set(["PERFORMER", "ARTIST", "BAND"]);

export function formatPublicMemberId(kind: PublicProfileKind, userId: string): string {
  const prefix =
    kind === "performer" || kind === "artist" ? "ART" : kind === "fan" ? "FAN" : "MEM";
  const tail = userId.replace(/[^a-zA-Z0-9]/g, "").slice(-8).toUpperCase();
  return `${prefix}-${tail || "TMI"}`;
}

/** Canonical public URL — prefer /p/[username] for sharing and discovery. */
export function canonicalPublicPath(username: string): string {
  const slug = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return `/p/${encodeURIComponent(slug || username)}`;
}

/**
 * Stable public identity card. The QR encodes this path, not today's link list.
 * A username change still breaks a printed /card/[username] code.
 * There is no slug-alias or immutable public-token column. Adding one
 * needs an authorized schema change. Do not invent that token here.
 */
export function canonicalIdentityCardPath(username: string): string {
  const slug = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return `/card/${encodeURIComponent(slug || username)}`;
}

/** Owner's published address. Performer pages prefer the artist slug. Personal pages prefer the username. */
export function resolveOwnerPublicSlug(
  profileKind: "FAN" | "PERFORMER" | "WRITER_PORTFOLIO",
  identity: { username?: string | null; artistSlug?: string | null },
): string | null {
  const username = identity.username?.trim() || "";
  const artistSlug = identity.artistSlug?.trim() || "";
  const chosen = profileKind === "PERFORMER" ? artistSlug || username : username || artistSlug;
  return chosen || null;
}

export function resolvePerformerPublicTarget(slug: string): PublicProfileTarget | null {
  const performer = getPerformerBySlug(slug);
  if (!performer) return null;
  return {
    kind: "performer",
    username: performer.slug,
    legacyPath: `/profile/performer/${performer.slug}`,
    displayName: performer.name,
  };
}

export function resolveRegistryPerformerByUsername(username: string): PublicProfileTarget | null {
  const normalized = username.trim().toLowerCase();
  const performer = PERFORMER_REGISTRY.find(
    (p) => p.slug.toLowerCase() === normalized || p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === normalized,
  );
  if (!performer) return null;
  return resolvePerformerPublicTarget(performer.slug);
}

export function legacyPathForRole(input: {
  kind: PublicProfileKind;
  username: string;
  artistSlug?: string | null;
  userId?: string;
}): string {
  const slug = input.artistSlug ?? input.username ?? input.userId ?? "";
  switch (input.kind) {
    case "performer":
    case "artist":
      return `/profile/performer/${encodeURIComponent(slug)}`;
    case "fan":
      return `/profile/fan/${encodeURIComponent(slug)}`;
    default:
      return `/profile/${encodeURIComponent(input.userId ?? slug)}`;
  }
}

export function publicKindFromDbRole(role: string): PublicProfileKind {
  const r = role.toUpperCase();
  if (r === "FAN" || r === "MEMBER" || r === "USER") return "fan";
  if (PERFORMER_ROLES.has(r)) return "performer";
  return "member";
}

export function selfPublicPath(input: {
  userId: string;
  role: string;
  username?: string | null;
  artistSlug?: string | null;
}): string {
  const kind = publicKindFromDbRole(input.role);
  const slug =
    input.username?.trim() ||
    input.artistSlug?.trim() ||
    (kind === "fan" ? input.userId.slice(0, 8) : input.userId);
  return canonicalPublicPath(slug);
}
