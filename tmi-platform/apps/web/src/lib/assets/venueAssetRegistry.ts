// ─── Canonical Venue Asset Registry ─────────────────────────────────────────
// Image paths: /assets/generated/venues/[slug]-[variant].jpg
// Use generated venue visuals — stages, crowd zones, lighting rigs, neon walls.
// Slugs MUST match VenueTicketResolver.ts VENUE_TICKET_PROFILES entries.
// Do not reference PDF assets or internal blueprint images.

import type { RuntimeAssetEntry } from "./RuntimeAssetEntry";

export const venueAssetRegistry: RuntimeAssetEntry[] = [
  // ── Active ticket routing venues (aligned to VenueTicketResolver) ────────
  {
    id: "venue-the-underground",
    slug: "the-underground",
    tileImage: "/assets/generated/venues/the-underground-tile.jpg",
    profileImage: "/assets/generated/venues/the-underground-profile.jpg",
    fallbackTheme: "underground-neon",
    replacementRoute: "/venues/the-underground",
  },
  {
    id: "venue-jakarta-arena",
    slug: "jakarta-arena",
    tileImage: "/assets/generated/venues/jakarta-arena-tile.jpg",
    profileImage: "/assets/generated/venues/jakarta-arena-profile.jpg",
    fallbackTheme: "arena-pulse",
    replacementRoute: "/venues/jakarta-arena",
  },
  {
    id: "venue-test-venue",
    slug: "test-venue",
    tileImage: "/assets/generated/venues/test-venue-tile.jpg",
    profileImage: "/assets/generated/venues/test-venue-profile.jpg",
    fallbackTheme: "neutral-stage",
    replacementRoute: "/venues/test-venue",
  },
  // ── Extended venue roster ─────────────────────────────────────────────────
  {
    id: "venue-rnb-basement",
    slug: "rnb-basement",
    tileImage: "/assets/generated/venues/rnb-basement-tile.jpg",
    profileImage: "/assets/generated/venues/rnb-basement-profile.jpg",
    fallbackTheme: "rnb-basement",
    replacementRoute: "/venues/rnb-basement",
  },
  {
    id: "venue-neon-pit",
    slug: "neon-pit",
    tileImage: "/assets/generated/venues/neon-pit-tile.jpg",
    profileImage: "/assets/generated/venues/neon-pit-profile.jpg",
    fallbackTheme: "electric-blue",
    replacementRoute: "/venues/neon-pit",
  },
  {
    id: "venue-crown-duel-stage",
    slug: "crown-duel-stage",
    tileImage: "/assets/generated/venues/crown-duel-stage-tile.jpg",
    profileImage: "/assets/generated/venues/crown-duel-stage-profile.jpg",
    fallbackTheme: "crown-night",
    replacementRoute: "/venues/crown-duel-stage",
  },
  {
    id: "venue-cypher-dome",
    slug: "cypher-dome",
    tileImage: "/assets/generated/venues/cypher-dome-tile.jpg",
    profileImage: "/assets/generated/venues/cypher-dome-profile.jpg",
    fallbackTheme: "dome-violet",
    replacementRoute: "/venues/cypher-dome",
  },
  {
    id: "venue-battle-amphitheater",
    slug: "battle-amphitheater",
    tileImage: "/assets/generated/venues/battle-amphitheater-tile.jpg",
    profileImage: "/assets/generated/venues/battle-amphitheater-profile.jpg",
    fallbackTheme: "amphitheater-gold",
    replacementRoute: "/venues/battle-amphitheater",
  },
];

// ─── Lookup helpers ───────────────────────────────────────────────────────────

const _byId = new Map(venueAssetRegistry.map((e) => [e.id, e]));
const _bySlug = new Map(venueAssetRegistry.map((e) => [e.slug, e]));

export function resolveVenueAsset(id: string): RuntimeAssetEntry | undefined {
  return _byId.get(id);
}

export function resolveVenueAssetBySlug(slug: string): RuntimeAssetEntry | undefined {
  return _bySlug.get(slug);
}
