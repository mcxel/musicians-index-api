// Orbit Artist Payload Engine — D1
// Single source of truth for Home 1 orbit wheel artist data.
// Chain: dataAdapters (ranking) → EDITORIAL_ARTICLES (article meta) → content-image-bank (portrait fallback)
// Orbit nodes and crown center both consume from here. No inline data in the artifact.

import {
  getGlobalRanking,
  getCrownLeader,
  type ArtistRankEntry,
} from "@/packages/magazine-engine/dataAdapters";
import { EDITORIAL_ARTICLES } from "@/lib/editorial/NewsArticleModel";
import { artistImages, imageAt } from "@/components/cards/content-image-bank";
import { resolveArtistMedia } from "./ArtistMediaResolver";

// ─── Genre → accent color fallback ───────────────────────────────────────────

const GENRE_ACCENT: Record<string, string> = {
  "Afrobeat Fusion": "#FFD700",
  "Neo Soul":        "#00FFFF",
  "Trap":            "#AA2DFF",
  "R&B":             "#00CC44",
  "Electronic":      "#c4b5fd",
  "Drill":           "#FF6B35",
  "Dancehall":       "#00FF88",
  "Hip Hop":         "#00FFFF",
  "Alt Pop":         "#FF2DAA",
  "Amapiano":        "#FB923C",
};

// ─── Artist country authority — ISO 2-letter codes, "US" fallback ────────────

const ARTIST_COUNTRY: Record<string, string> = {
  "kova":          "NG",
  "nera-vex":      "US",
  "blaze-cartel":  "US",
  "lila-sun":      "US",
  "drift-sound":   "GB",
  "mack-ferro":    "US",
  "asha-wave":     "JM",
  "terron-b":      "US",
  "solara":        "US",
  "kase-duro":     "ZA",
};

function toFlagEmoji(code: string): string {
  const base = 0x1f1e6 - 65;
  const c = code.toUpperCase();
  return String.fromCodePoint(base + c.charCodeAt(0), base + c.charCodeAt(1));
}

export function resolveArtistCountryInfo(artistId: string): { countryCode: string; flagEmoji: string } {
  const countryCode = ARTIST_COUNTRY[artistId] ?? "US";
  return {
    countryCode,
    flagEmoji: toFlagEmoji(countryCode),
  };
}

// ─── Public types ─────────────────────────────────────────────────────────────

export type StateBadge = "NEW" | "HOT" | "SPONSORED" | "TRENDING";
export type ShapeType  = "circle" | "hex" | "diamond" | "burst" | "capsule";

export type OrbitArtistPayload = {
  artistId:       string;
  name:           string;
  rank:           number;
  movement:       "rising" | "falling" | "holding";
  crownEligible:  boolean;
  portrait:       string;
  accentColor:    string;
  articleSlug:    string;
  articleRoute:   string;
  genre:          string;
  sponsorPayload: string | null;
  stateBadge:     StateBadge | null;
  countryCode:    string;
  flagEmoji:      string;
  shapeType:      ShapeType;
  posterFrameUrl: string;
  liveStatus:     "LIVE" | "READY" | "FALLBACK" | "MISSING";
  mediaSource:    "live-feed" | "motion-portrait" | "profile-image" | "fallback-silhouette" | "missing";
};

// ─── Internals ───────────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function movementFromDelta(delta: number): "rising" | "falling" | "holding" {
  if (delta > 0) return "rising";
  if (delta < 0) return "falling";
  return "holding";
}

function computeStateBadge(entry: ArtistRankEntry, sponsorPayload: string | null): StateBadge | null {
  if (entry.isNew)      return "NEW";
  if (entry.delta > 20) return "HOT";
  if (sponsorPayload)   return "SPONSORED";
  if (entry.badge === "RISING" || entry.delta > 5) return "TRENDING";
  return null;
}

function buildPayload(entry: ArtistRankEntry, imageIndex: number): OrbitArtistPayload {
  const artistId = toSlug(entry.name);
  const article  = EDITORIAL_ARTICLES.find(
    (a) => a.relatedArtistSlug === artistId && a.category === "artist",
  );
  const accentColor    = article?.accentColor ?? GENRE_ACCENT[entry.genre] ?? "#00FFFF";
  const media = resolveArtistMedia({
    artistId,
    artistName: entry.name,
    heroImage: article?.heroImage ?? imageAt(artistImages, imageIndex),
  });
  const portrait       = media.posterFrameUrl;
  const articleSlug    = article?.slug        ?? `${artistId}-tmi-profile`;
  const articleRoute   = media.route;
  const country = resolveArtistCountryInfo(artistId);

  return {
    artistId,
    name:           entry.name,
    rank:           entry.rank,
    movement:       movementFromDelta(entry.delta),
    crownEligible:  entry.rank <= 3,
    portrait,
    accentColor,
    articleSlug,
    articleRoute,
    genre:          entry.genre,
    sponsorPayload: article?.sponsorPlacementIds[0] ?? null,
    stateBadge:     computeStateBadge(entry, article?.sponsorPlacementIds[0] ?? null),
    countryCode:    country.countryCode,
    flagEmoji:      country.flagEmoji,
    shapeType:      "circle",
    posterFrameUrl: media.posterFrameUrl,
    liveStatus:     media.status,
    mediaSource:    media.sourceKind,
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

// Returns ranks 2–10 for the orbit ring (rank 1 is the crown center).
export function getOrbitArtistPayloads(): OrbitArtistPayload[] {
  return getGlobalRanking()
    .filter((e) => e.rank > 1)
    .slice(0, 9)
    .map((e, i) => buildPayload(e, i + 1));
}

// Returns rank 1 — the crown center portrait and route.
export function getCrownArtistPayload(): OrbitArtistPayload {
  return buildPayload(getCrownLeader(), 0);
}
