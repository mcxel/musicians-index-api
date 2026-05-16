import { getTop10, type ArtistRankEntry } from "@/packages/magazine-engine/dataAdapters";
import { resolveArtistMedia, type ArtistMediaResolution } from "./ArtistMediaResolver";
import { resolveArtistCountryInfo } from "./OrbitArtistPayloadEngine";

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

export function getCrownRankRuntime(limit = 10): CrownRankRuntimeEntry[] {
  return getTop10()
    .map(toRuntimeEntry)
    .filter((entry): entry is CrownRankRuntimeEntry => Boolean(entry))
    .slice(0, limit);
}

export function getTopCrownRuntime(): CrownRankRuntimeEntry | null {
  return getCrownRankRuntime(1)[0] ?? null;
}