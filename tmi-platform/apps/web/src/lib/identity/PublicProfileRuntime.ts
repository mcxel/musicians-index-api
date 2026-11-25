/**
 * PublicProfileRuntime — canonical public presence routing (assembly layer).
 * Converges fan/performer/artist public URLs onto /p/[username] without a third profile system.
 */

import { getPerformerBySlug, PERFORMER_REGISTRY } from "@/lib/performers/PerformerRegistry";
import type { PublicPageProfileKind } from "@/lib/publicPage/publicPageDocument";

export type PublicProfileKind = "fan" | "performer" | "artist" | "writer" | "member";

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
    kind === "performer" || kind === "artist" ? "ART" : kind === "fan" ? "FAN" : kind === "writer" ? "WRI" : "MEM";
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

/**
 * Owner's published address. Performer pages prefer the artist slug. Personal pages prefer the username.
 *
 * When neither username nor artistSlug has been chosen, falls back to the account's own id — the one
 * identifier every account already has that is guaranteed unique and stable. displayName is deliberately
 * NOT used as a fallback: it is not unique (two accounts can share one) and resolveDbUser's displayName
 * match would make that ambiguous. The server's /p/[username] resolver already accepts `id: { startsWith }`,
 * so this id fallback round-trips through the exact same lookup the username/artistSlug cases use.
 */
export function resolveOwnerPublicSlug(
  profileKind: "FAN" | "PERFORMER" | "WRITER_PORTFOLIO",
  identity: { username?: string | null; artistSlug?: string | null; id?: string | null },
): string | null {
  const username = identity.username?.trim() || "";
  const artistSlug = identity.artistSlug?.trim() || "";
  const id = identity.id?.trim() || "";
  const chosen = profileKind === "PERFORMER" ? artistSlug || username || id : username || artistSlug || id;
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
    case "writer":
      return `/profile/writer/${encodeURIComponent(slug)}`;
    default:
      return `/profile/${encodeURIComponent(input.userId ?? slug)}`;
  }
}

export function publicKindFromDbRole(role: string): PublicProfileKind {
  const r = role.toUpperCase();
  if (r === "FAN" || r === "MEMBER" || r === "USER") return "fan";
  if (PERFORMER_ROLES.has(r)) return "performer";
  if (r === "WRITER") return "writer";
  return "member";
}

/** One persona → one public-page document kind. Writer is never Fan or Performer. */
export function profileKindForActivePersona(role: string): PublicPageProfileKind | null {
  const kind = publicKindFromDbRole(role);
  if (kind === "fan") return "FAN";
  if (kind === "performer" || kind === "artist") return "PERFORMER";
  if (kind === "writer") return "WRITER_PORTFOLIO";
  return null;
}

export interface ViewMyPageResolution {
  persona: PublicProfileKind;
  profileKind: PublicPageProfileKind | null;
  publicPath: string;
  editorPath: string;
  articlesPath: string | null;
  interviewLabPath: string | null;
}

/**
 * VIEW MY PAGE / GPS / QC / magazine byline / search destination.
 * Every public-page entry must call this — never hardcode Fan or Performer for a Writer.
 */
export function resolveViewMyPage(input: {
  role: string;
  userId?: string | null;
  username?: string | null;
  artistSlug?: string | null;
}): ViewMyPageResolution {
  const persona = publicKindFromDbRole(input.role);
  const profileKind = profileKindForActivePersona(input.role);
  const publicPath = selfPublicPath({
    userId: input.userId ?? "",
    role: input.role,
    username: input.username,
    artistSlug: input.artistSlug,
  });
  if (persona === "writer") {
    return {
      persona,
      profileKind,
      publicPath,
      editorPath: "/hub/writer?editPage=1",
      articlesPath: "/hub/writer/articles",
      interviewLabPath: "/hub/writer/interview",
    };
  }
  if (persona === "performer" || persona === "artist") {
    return {
      persona,
      profileKind,
      publicPath,
      editorPath: "/hub/performer",
      articlesPath: null,
      interviewLabPath: null,
    };
  }
  return {
    persona,
    profileKind,
    publicPath,
    editorPath: "/hub/fan",
    articlesPath: null,
    interviewLabPath: null,
  };
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
