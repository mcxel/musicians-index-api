import { getTop10, type ArtistRankEntry } from "@/packages/magazine-engine/dataAdapters";
import { resolveArtistMedia, type ArtistMediaResolution } from "./ArtistMediaResolver";
import { resolveArtistCountryInfo } from "./OrbitArtistPayloadEngine";
import {
  getOrbitalTopSlots,
  type RankSlot,
} from "@/lib/rankings/UniversalRankingSnapshot";

export interface CrownRankRuntimeEntry {
  artistId: string;
  name: string;
  rank: number;
  genre: string;
  score: number;
  delta: number;
  movement: "rising" | "falling" | "holding";
  badge: string;
  route: string;
  articleRoute: string;
  voteRoute: string;
  countryCode: string;
  flagEmoji: string;
  media: ArtistMediaResolution;
}

function toSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function toMovement(delta: number): CrownRankRuntimeEntry["movement"] {
  if (delta > 0) return "rising";
  if (delta < 0) return "falling";
  return "holding";
}

function toRuntimeEntry(entry: ArtistRankEntry): CrownRankRuntimeEntry | null {
  const artistId = toSlug(entry.name);
  const media = resolveArtistMedia({ artistId, artistName: entry.name });
  const country = resolveArtistCountryInfo(artistId);
  if (!media.canRender) return null;

  return {
    artistId,
    name: entry.name,
    rank: entry.rank,
    genre: entry.genre,
    score: entry.score,
    delta: entry.delta,
    movement: toMovement(entry.delta),
    badge: entry.badge,
    route: media.route,
    articleRoute: media.articleRoute,
    voteRoute: `/vote/${artistId}`,
    countryCode: country.countryCode,
    flagEmoji: country.flagEmoji,
    media,
  };
}

function slotToCrownEntry(slot: RankSlot): CrownRankRuntimeEntry | null {
  const media = resolveArtistMedia({
    artistId: slot.slug,
    artistName: slot.displayName,
    heroImage: slot.avatarUrl,
    preferredRoute: slot.profileRoute,
  });
  const country = resolveArtistCountryInfo(slot.slug);
  const route = slot.profileRoute || media.route;

  return {
    artistId: slot.slug,
    name: slot.displayName,
    rank: slot.rank,
    genre: slot.genre ?? (slot.kind === "bot" ? "Bot Seat" : "All Genres"),
    score: slot.points,
    delta: 0,
    movement: "holding",
    badge: slot.kind === "bot" ? "[BOT]" : slot.rank === 1 ? "CROWN" : "RANKED",
    route,
    articleRoute: media.articleRoute || `/articles/performer/${slot.slug}`,
    voteRoute: `/vote/${slot.slug}`,
    countryCode: country.countryCode,
    flagEmoji: country.flagEmoji,
    media: {
      ...media,
      route,
      canRender: true,
      posterFrameUrl: slot.avatarUrl || media.posterFrameUrl,
    },
  };
}

/**
 * Home 1 / 1-2 crown + double-spread consumer.
 * Prefers Universal Ranking snapshot (MJ Rule); falls back to magazine top10 adapter.
 * Read-only — callers publish via publishUniversalRankingSnapshot when refreshing.
 */
export function getCrownRankRuntime(limit = 10): CrownRankRuntimeEntry[] {
  const fromSnapshot = getOrbitalTopSlots(limit)
    .map(slotToCrownEntry)
    .filter((entry): entry is CrownRankRuntimeEntry => Boolean(entry));

  if (fromSnapshot.length > 0) return fromSnapshot.slice(0, limit);

  return getTop10()
    .map(toRuntimeEntry)
    .filter((entry): entry is CrownRankRuntimeEntry => Boolean(entry))
    .slice(0, limit);
}

export function getTopCrownRuntime(): CrownRankRuntimeEntry | null {
  return getCrownRankRuntime(1)[0] ?? null;
}