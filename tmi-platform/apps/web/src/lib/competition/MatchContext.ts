/**
 * MatchContext.ts — Universal Geographic Rivalry & Competition Context Filter.
 * Wraps any competition runtime (BATTLE, CYPHER, CHALLENGE, CONCERT, DANCE_PARTY, PLAYLIST, RADIO, SHUFFLE)
 * with geographic rivalry context (World, Country, State, Region, City, Crew, Team).
 * Powers state flags, state rankings, state crowd migration, and regional sponsor targeting.
 */

export type GeographicScope = "WORLD" | "CONTINENT" | "COUNTRY" | "REGION" | "STATE" | "CITY" | "CREW" | "INDIVIDUAL";

export interface RegionIdentity {
  id: string;
  name: string;
  code: string; // e.g., 'CA', 'TX', 'NY', 'US', 'GB'
  flagEmoji: string; // e.g., '🇺🇸', '🇬🇧', '🏛️'
  accentColor: string;
  battleRating: number;
  winsCount: number;
}

export interface MatchContext {
  contextId: string;
  competitionType: "BATTLE" | "CYPHER" | "CHALLENGE" | "CONCERT" | "DANCE_PARTY" | "PLAYLIST" | "RADIO" | "SHUFFLE";
  scope: GeographicScope;
  regionA?: RegionIdentity;
  regionB?: RegionIdentity;
  title: string; // e.g., 'California vs Texas — State Showdown'
  sponsorTagline?: string;
  liveStateScoreA?: number;
  liveStateScoreB?: number;
}

export function buildGeographicMatchContext(
  type: MatchContext["competitionType"],
  scope: GeographicScope,
  regionA?: Partial<RegionIdentity>,
  regionB?: Partial<RegionIdentity>,
): MatchContext {
  const defaultA: RegionIdentity = {
    id: regionA?.id ?? "region-ca",
    name: regionA?.name ?? "California",
    code: regionA?.code ?? "CA",
    flagEmoji: regionA?.flagEmoji ?? "🏛️",
    accentColor: regionA?.accentColor ?? "#00FFFF",
    battleRating: regionA?.battleRating ?? 145220,
    winsCount: regionA?.winsCount ?? 1283,
  };

  const defaultB: RegionIdentity = {
    id: regionB?.id ?? "region-tx",
    name: regionB?.name ?? "Texas",
    code: regionB?.code ?? "TX",
    flagEmoji: regionB?.flagEmoji ?? "⭐",
    accentColor: regionB?.accentColor ?? "#FF2DAA",
    battleRating: regionB?.battleRating ?? 144910,
    winsCount: regionB?.winsCount ?? 1247,
  };

  return {
    contextId: `ctx-${type.toLowerCase()}-${Date.now()}`,
    competitionType: type,
    scope,
    regionA: defaultA,
    regionB: defaultB,
    title: scope === "STATE" ? `${defaultA.name} vs ${defaultB.name} — State Showdown` : `${type} Event`,
    sponsorTagline: `${defaultA.name} vs ${defaultB.name} presented by Nike`,
    liveStateScoreA: 0,
    liveStateScoreB: 0,
  };
}
