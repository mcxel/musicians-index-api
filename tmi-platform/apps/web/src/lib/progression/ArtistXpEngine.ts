/**
 * ArtistXpEngine
 * XP source tracking for artists and performers.
 */

export type ArtistXpSource =
  | "sponsor-acquired"
  | "local-sponsor-activated"
  | "major-sponsor-activated"
  | "merchant-conversion"
  | "ticket-sale"
  | "beat-sale"
  | "booking-confirmed"
  | "article-published"
  | "magazine-feature"
  | "cypher-participation"
  | "battle-win"
  | "fan-engagement"
  | "vote-received";

export type ArtistXpEvent = {
  xpEventId: string;
  artistId: string;
  source: ArtistXpSource;
  xpAwarded: number;
  createdAtMs: number;
  metadata?: Record<string, string | number | boolean>;
};

const XP_VALUES: Record<ArtistXpSource, number> = {
  "sponsor-acquired": 120,
  "local-sponsor-activated": 80,
  "major-sponsor-activated": 150,
  "merchant-conversion": 90,
  "ticket-sale": 5,
  "beat-sale": 20,
  "booking-confirmed": 180,
  "article-published": 70,
  "magazine-feature": 110,
  "cypher-participation": 35,
  "battle-win": 130,
  "fan-engagement": 15,
  "vote-received": 8,
};

const xpEvents: ArtistXpEvent[] = [];
let xpCounter = 0;

export function awardArtistXp(input: {
  artistId: string;
  source: ArtistXpSource;
  quantity?: number;
  metadata?: Record<string, string | number | boolean>;
}): ArtistXpEvent {
  const quantity = input.quantity ?? 1;
  const xpAwarded = XP_VALUES[input.source] * quantity;
  const event: ArtistXpEvent = {
    xpEventId: `artist-xp-${++xpCounter}`,
    artistId: input.artistId,
    source: input.source,
    xpAwarded,
    createdAtMs: Date.now(),
    metadata: input.metadata,
  };

  xpEvents.unshift(event);
  return event;
}

export function listArtistXpEvents(artistId?: string): ArtistXpEvent[] {
  if (!artistId) return [...xpEvents];
  return xpEvents.filter((event) => event.artistId === artistId);
}

export function getArtistXpTotal(artistId: string): number {
  return listArtistXpEvents(artistId).reduce((sum, event) => sum + event.xpAwarded, 0);
}

export function getArtistXpBreakdown(artistId: string): Record<ArtistXpSource, number> {
  return listArtistXpEvents(artistId).reduce((acc, event) => {
    acc[event.source] += event.xpAwarded;
    return acc;
  }, { ...XP_VALUES, "sponsor-acquired": 0, "local-sponsor-activated": 0, "major-sponsor-activated": 0, "merchant-conversion": 0, "ticket-sale": 0, "beat-sale": 0, "booking-confirmed": 0, "article-published": 0, "magazine-feature": 0, "cypher-participation": 0, "battle-win": 0, "fan-engagement": 0, "vote-received": 0 });
}
