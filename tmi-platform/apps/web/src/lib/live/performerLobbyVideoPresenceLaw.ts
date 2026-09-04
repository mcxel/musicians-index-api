/**
 * Performer lobby video-presence law — panel position, collision envelope, proximity.
 * NO avatar mesh. Reuses loungeVideoPresenceLaw + SpatialVideoPresenceDirector patterns.
 * Skin ≠ stream. Chassis change never restarts WebRTC.
 */

import {
  calculateLodQuality,
  registerSpatialPanel,
  unregisterSpatialPanel,
  updatePanelTransformWithoutReconnect,
  resolveDualCollisions,
  type CollisionBounds,
  type SpatialVideoPanel,
} from "@/lib/venue-hud/SpatialVideoPresenceDirector";
import { PERSONAL_MEDIA_LAW } from "@/lib/personal-media/types";
import {
  CANONICAL_WORLD_ZONE,
  type CanonicalWorldGate3Status,
} from "./canonicalWorldViewport";
import {
  DEFAULT_PERFORMER_PANEL_SKIN,
  type PerformerPanelSkinId,
} from "./PerformerLobbyPersonality";

export type PerformerPanelChassis = "monitor" | "floating" | "stage_speaker" | "glass";

export const PERFORMER_LOBBY_VIDEO_PRESENCE_LAW = {
  loungeAllowsAvatars: false,
  freeRoam: true,
  locomotionSource: "PerformerVideoPresenceFloor floor-tap without avatar meshes",
  collisionMeshCertified: false,
  photorealMesh: false,
  gate3PhysicalWorld: "OPEN" as CanonicalWorldGate3Status,
  joinCreatesPanel: true,
  leaveRemovesPanelAndUnsubscribes: true,
  nearLargerPanelStrongerVoice: true,
  farSmallerPanel: true,
  personalSpaceCollision: true,
  chassisSkinDoesNotRestartWebrtc: true,
  personalMediaRouterLaw: PERSONAL_MEDIA_LAW,
  defaultPanelSkin: DEFAULT_PERFORMER_PANEL_SKIN,
} as const;

export interface PerformerSpatialProp {
  id: string;
  kind: "amp_rack" | "mixing_desk" | "rehearsal_couch" | "mic_stand";
  xPct: number;
  yPct: number;
  wPct: number;
  hPct: number;
  collision: CollisionBounds;
}

/** Rehearsal/backroom furniture — CSS props, collision OPEN. */
export const PERFORMER_LOBBY_PROPS: readonly PerformerSpatialProp[] = [
  {
    id: "mixing-desk",
    kind: "mixing_desk",
    xPct: 50,
    yPct: 72,
    wPct: 28,
    hPct: 8,
    collision: { minX: -1.4, maxX: 1.4, minY: 0, maxY: 0.5, minZ: 1.8, maxZ: 2.8 },
  },
  {
    id: "amp-rack-west",
    kind: "amp_rack",
    xPct: 10,
    yPct: 48,
    wPct: 8,
    hPct: 22,
    collision: { minX: -3.8, maxX: -2.8, minY: 0, maxY: 1.2, minZ: -0.6, maxZ: 1.2 },
  },
  {
    id: "rehearsal-couch",
    kind: "rehearsal_couch",
    xPct: 78,
    yPct: 62,
    wPct: 18,
    hPct: 10,
    collision: { minX: 2.2, maxX: 3.6, minY: 0, maxY: 0.8, minZ: 0.4, maxZ: 1.6 },
  },
  {
    id: "mic-stand-center",
    kind: "mic_stand",
    xPct: 50,
    yPct: 38,
    wPct: 4,
    hPct: 14,
    collision: { minX: -0.2, maxX: 0.2, minY: 0, maxY: 0.6, minZ: -0.2, maxZ: 0.4 },
  },
] as const;

export interface PerformerPanelJoinInput {
  userId: string;
  streamId: string;
  panelSkinId?: PerformerPanelSkinId;
  chassis?: PerformerPanelChassis;
  positionXyz?: [number, number, number];
}

function chassisFromSkin(skin: PerformerPanelSkinId): PerformerPanelChassis {
  if (skin === "STAGE_SPEAKER") return "stage_speaker";
  if (skin === "GLASS_LUXURY") return "glass";
  if (skin === "RETRO_CRT") return "monitor";
  return "floating";
}

export function joinPerformerVideoPanel(input: PerformerPanelJoinInput): SpatialVideoPanel {
  const skin = input.panelSkinId ?? DEFAULT_PERFORMER_PANEL_SKIN;
  return registerSpatialPanel({
    panelId: `performer-panel-${input.userId}`,
    userId: input.userId,
    streamId: input.streamId,
    chassisSkinId: input.chassis ?? chassisFromSkin(skin),
    positionXyz: input.positionXyz,
  });
}

export function leavePerformerVideoPanel(userId: string): { removed: boolean; unsubscribed: true } {
  const panelId = `performer-panel-${userId}`;
  const removed = unregisterSpatialPanel(panelId);
  return { removed, unsubscribed: true };
}

export function applyPerformerPanelSkin(
  panelId: string,
  panelSkinId: PerformerPanelSkinId,
): { streamReconnected: false; panel: SpatialVideoPanel | null } {
  const result = updatePanelTransformWithoutReconnect(panelId, {
    chassisSkinId: chassisFromSkin(panelSkinId),
  });
  return { streamReconnected: false, panel: result.panel };
}

export function applyPerformerProximity(
  panelId: string,
  distanceMeters: number,
): { scale: number; voiceGain: number; lod: SpatialVideoPanel["lodQuality"]; streamReconnected: false } {
  const lod = calculateLodQuality(distanceMeters);
  const scale = Math.max(0.4, Math.min(1.75, 1.4 - distanceMeters * 0.04));
  const voiceGain = Math.max(0, Math.min(1, 1 - distanceMeters / 16));
  updatePanelTransformWithoutReconnect(panelId, { scale });
  return { scale, voiceGain, lod, streamReconnected: false };
}

export function collidePerformerMove(
  panelId: string,
  proposed: [number, number, number],
): [number, number, number] {
  const obstacles = PERFORMER_LOBBY_PROPS.map((p) => p.collision);
  return resolveDualCollisions(panelId, proposed, obstacles);
}

/** Navmesh / floor bounds — honest OPEN until photoreal mesh certified. */
export const PERFORMER_LOBBY_FLOOR_BOUNDS = {
  minX: -3.8,
  maxX: 3.8,
  minZ: -3.2,
  maxZ: 3.2,
} as const;

export function movePerformerPanel(
  userId: string,
  proposed: [number, number, number],
): { position: [number, number, number]; streamReconnected: false } {
  const panelId = `performer-panel-${userId}`;
  const clamped: [number, number, number] = [
    Math.max(PERFORMER_LOBBY_FLOOR_BOUNDS.minX, Math.min(PERFORMER_LOBBY_FLOOR_BOUNDS.maxX, proposed[0])),
    proposed[1],
    Math.max(PERFORMER_LOBBY_FLOOR_BOUNDS.minZ, Math.min(PERFORMER_LOBBY_FLOOR_BOUNDS.maxZ, proposed[2])),
  ];
  const resolved = collidePerformerMove(panelId, clamped);
  updatePanelTransformWithoutReconnect(panelId, { positionXyz: resolved });
  return { position: resolved, streamReconnected: false };
}

export const PERFORMER_LOBBY_WORLD_ZONE = CANONICAL_WORLD_ZONE.PERFORMER_LOBBY;
