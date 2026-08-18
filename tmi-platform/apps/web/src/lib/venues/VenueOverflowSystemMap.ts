/**
 * Dual overflow systems — both real, not merged this session.
 *
 * ElasticRoomOrchestrator uses AnchorRoomRegistry slugs
 * (e.g. battle-thunder-dome → battle-thunder-dome-overflow-N).
 *
 * AnchorRoomNetwork uses its own roomIds
 * (e.g. anchor-thunder-dome-battle → …-ov-N).
 *
 * Audience join prefers Elastic when the posted slug is an AnchorRoomRegistry slug.
 * Network-only rooms (AI challenge, gauntlet) stay on AnchorRoomNetwork until unified.
 */

export const OVERFLOW_SYSTEMS = {
  elastic: {
    id: "ElasticRoomOrchestrator",
    source: "lib/live/ElasticRoomOrchestrator.ts",
    slugStyle: "{anchorSlug}-overflow-{n}",
    shardLifecycle: ["WARMING", "ACTIVE", "DRAINING", "COLLAPSED"] as const,
    collidesAnchors: false,
  },
  network: {
    id: "AnchorRoomNetwork",
    source: "lib/live/AnchorRoomNetwork.ts",
    slugStyle: "{anchorRoomId}-ov-{n}",
    collidesAnchors: false,
    note: "LEGACY sibling. Do not delete until Elastic occupancy is verified on all permanent anchors.",
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

export const NETWORK_ONLY_ROOM_IDS = [
  "anchor-ai-music-challenge",
  "anchor-musical-gauntlet",
] as const;

export function aliasNetworkRoomId(anchorSlug: string): string | null {
  return ANCHOR_SLUG_TO_NETWORK_ROOM_ID[anchorSlug] ?? null;
}
