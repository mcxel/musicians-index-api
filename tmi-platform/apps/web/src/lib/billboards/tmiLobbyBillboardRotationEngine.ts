export type LobbyBillboardLane =
  | "artist-rankings"
  | "track-rankings"
  | "participation"
  | "contest-winners"
  | "live-winners"
  | "sponsors"
  | "venues"
  | "live-feeds";

export type LobbyBillboardRotationState = {
  lane: LobbyBillboardLane;
  index: number;
  durationMs: number;
  nextLane: LobbyBillboardLane;
};

export const LOBBY_BILLBOARD_ROTATION_MS = 120000;

const ORDER: LobbyBillboardLane[] = [
  "artist-rankings",
  "track-rankings",
  "participation",
  "contest-winners",
  "live-winners",
  "sponsors",
  "venues",
  "live-feeds",
];

export function getLobbyBillboardLaneOrder() {
  return ORDER;
}

export function getLobbyBillboardRotationState(tick: number): LobbyBillboardRotationState {
  const index = ((tick % ORDER.length) + ORDER.length) % ORDER.length;
  const lane = ORDER[index];
  const nextLane = ORDER[(index + 1) % ORDER.length];

  return {
    lane,
    index,
    durationMs: LOBBY_BILLBOARD_ROTATION_MS,
    nextLane,
  };
}
