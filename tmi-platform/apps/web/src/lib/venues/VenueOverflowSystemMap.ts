/**
 * Overflow system map + orchestra authority lock.
 *
 * LOCK (2026-09-12): One room-orchestra authority for shard lifecycle.
 *   CANONICAL = ElasticRoomOrchestrator (+ VenueSceneFactory for scene instances)
 *   LEGACY    = AnchorRoomNetwork overflow mint (network-only roomIds only)
 *
 * ElasticRoomOrchestrator uses AnchorRoomRegistry slugs
 * (e.g. battle-thunder-dome → battle-thunder-dome-overflow-N).
 *
 * AnchorRoomNetwork uses its own roomIds
 * (e.g. anchor-thunder-dome-battle → …-ov-N).
 *
 * Mapped network roomIds MUST resolve to Elastic slugs — never spawn a second
 * overflow runtime for the same anchor family.
 * Network-only rooms (AI challenge, gauntlet) stay on AnchorRoomNetwork until unified.
 */

export const ORCHESTRA_AUTHORITY_LOCK = {
  locked: true as const,
  lockedAt: "2026-09-12",
  roomOrchestra: "ElasticRoomOrchestrator",
  sceneFactory: "VenueSceneFactory",
  showAuthority: "GlobalShowAuthority",
  parallelOrchestraForbidden: true,
  parallelSceneGeneratorForbidden: true,
  queueLaw:
    "One queue authority per experience family (battle ≠ cypher ≠ challenge). Elastic owns room instances; BeatQueueEngine owns catalog eligibility — do not mint ad-hoc genre rooms.",
  note: "Mapped AnchorRoomNetwork IDs alias into Elastic. Network overflow spawn is LEGACY for NETWORK_ONLY_ROOM_IDS only.",
} as const;

export const OVERFLOW_SYSTEMS = {
  elastic: {
    id: "ElasticRoomOrchestrator",
    source: "lib/live/ElasticRoomOrchestrator.ts",
    slugStyle: "{anchorSlug}-overflow-{n}",
    shardLifecycle: ["WARMING", "ACTIVE", "DRAINING", "COLLAPSED"] as const,
    collidesAnchors: false,
    authority: "CANONICAL" as const,
  },
  network: {
    id: "AnchorRoomNetwork",
    source: "lib/live/AnchorRoomNetwork.ts",
    slugStyle: "{anchorRoomId}-ov-{n}",
    collidesAnchors: false,
    authority: "LEGACY" as const,
    note: "LEGACY sibling. Overflow spawn only for NETWORK_ONLY_ROOM_IDS. Do not delete until Elastic covers those anchors.",
  },
} as const;

/** Registry slug → network roomId where titles correspond. Unmapped network IDs stay LEGACY. */
export const ANCHOR_SLUG_TO_NETWORK_ROOM_ID: Record<string, string> = {
  "fan-lobby-global": "anchor-global-fan-lobby",
  "fan-lobby-chill": "anchor-chill-fan-lobby",
  "battle-thunder-dome": "anchor-thunder-dome-battle",
  "battle-open-genre": "anchor-open-genre-battle",
  "cypher-freestyle": "anchor-freestyle-cypher",
  "cypher-rotating-genre": "anchor-rotating-genre-cypher",
  "challenge-song-lab": "anchor-song-challenge-lab",
  "challenge-rotating": "anchor-rotating-creative-challenge",
  "lounge-playlist": "anchor-playlist-listening-lounge",
  "lounge-conversation": "anchor-chill-conversation-lounge",
  "world-dance-party": "anchor-world-dance-room",
  "game-show-deal-or-feud": "anchor-deal-or-feud-variety",
};

/** Reverse alias — network roomId → Elastic AnchorRoomRegistry slug. */
export const NETWORK_ROOM_ID_TO_ANCHOR_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(ANCHOR_SLUG_TO_NETWORK_ROOM_ID).map(([slug, networkId]) => [networkId, slug]),
);

export const NETWORK_ONLY_ROOM_IDS = [
  "anchor-ai-music-challenge",
  "anchor-musical-gauntlet",
] as const;

export type NetworkOnlyRoomId = (typeof NETWORK_ONLY_ROOM_IDS)[number];

export function aliasNetworkRoomId(anchorSlug: string): string | null {
  return ANCHOR_SLUG_TO_NETWORK_ROOM_ID[anchorSlug] ?? null;
}

/** Map AnchorRoomNetwork roomId → Elastic slug when a mapping exists. */
export function aliasElasticSlugFromNetworkId(networkRoomId: string): string | null {
  return NETWORK_ROOM_ID_TO_ANCHOR_SLUG[networkRoomId] ?? null;
}

export function isNetworkOnlyRoomId(roomId: string): boolean {
  return (NETWORK_ONLY_ROOM_IDS as readonly string[]).includes(roomId);
}

/**
 * Resolve which overflow orchestra may mutate shard lifecycle for this id.
 * Mapped network IDs return Elastic (canonical). Network-only → LEGACY network.
 */
export function resolveOrchestraAuthority(roomId: string): {
  authority: "elastic" | "network_legacy" | "none";
  elasticSlug: string | null;
  allowNetworkOverflowSpawn: boolean;
} {
  const elasticFromNetwork = aliasElasticSlugFromNetworkId(roomId);
  if (elasticFromNetwork) {
    return {
      authority: "elastic",
      elasticSlug: elasticFromNetwork,
      allowNetworkOverflowSpawn: false,
    };
  }
  if (ANCHOR_SLUG_TO_NETWORK_ROOM_ID[roomId]) {
    return {
      authority: "elastic",
      elasticSlug: roomId,
      allowNetworkOverflowSpawn: false,
    };
  }
  if (isNetworkOnlyRoomId(roomId)) {
    return {
      authority: "network_legacy",
      elasticSlug: null,
      allowNetworkOverflowSpawn: true,
    };
  }
  return {
    authority: "none",
    elasticSlug: null,
    allowNetworkOverflowSpawn: false,
  };
}
