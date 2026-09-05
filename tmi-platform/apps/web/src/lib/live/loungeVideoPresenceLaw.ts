/**
 * Lounge video-presence + in-world ad chassis law.
 *
 * Lounges: no avatars (settled). Free-roam + movable WebRTC panels.
 * Ads: in-world objects (TV / mirror / video panel / glass), not flat wall posters.
 * Creative from existing getAdSlotForZone / SponsorRegistry / Rule 12.
 * Do not invent a second ad mill or infinite ad-AI.
 * Skin ≠ stream. Chassis change never restarts WebRTC.
 * Gate 3 remains OPEN. Collision mesh not live-certified.
 */

import {
  getAdSlotForZone,
  type AdSlotDescriptor,
  type AdSlotType,
} from "@/lib/commerce/SponsorRegistry";
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

export type LoungeParticipantChassis = "tv" | "phone" | "playlist";

/** In-world ad objects — same chassis idea as participant WebRTC panels. */
export type LoungeAdChassis = "TV" | "MIRROR" | "VIDEO_PANEL" | "GLASS_DISPLAY";

export const LOUNGE_AD_CHASSIS_TYPES: readonly LoungeAdChassis[] = [
  "TV",
  "MIRROR",
  "VIDEO_PANEL",
  "GLASS_DISPLAY",
] as const;

export const LOUNGE_PARTICIPANT_CHASSIS: readonly LoungeParticipantChassis[] = [
  "tv",
  "phone",
  "playlist",
] as const;

export const LOUNGE_VIDEO_PRESENCE_LAW = {
  loungeAllowsAvatars: false,
  freeRoam: true,
  locomotionSource: "FanLobbyVenue floor-tap without avatar meshes",
  collisionMeshCertified: false,
  photorealMesh: false,
  gate3PhysicalWorld: "OPEN" as CanonicalWorldGate3Status,
  joinCreatesPanel: true,
  leaveRemovesPanelAndUnsubscribes: true,
  nearLargerPanelStrongerVoice: true,
  farSmallerPanel: true,
  personalSpaceCollision: true,
  playlistChassisDoesNotRestartStream: true,
  chassisSkinDoesNotRestartWebrtc: true,
  personalMediaRouterLaw: PERSONAL_MEDIA_LAW,
  adsEngine: "SponsorRegistry.getAdSlotForZone",
  adsenseFlushAgainstPlayBuyWatch: false,
  preferredAdFill: "TMI_DIRECT_SPONSOR / house / Rule 12",
  vipStageLoader: "OPEN_NOT_FOLDED",
} as const;

export interface LoungeAdAnchor {
  id: string;
  chassis: LoungeAdChassis;
  label: string;
  /** Floor % — honest 2D dressing until photoreal GLB exists. */
  xPct: number;
  yPct: number;
  zoneKey: string;
  /** Interactive media CTAs must not sit flush on this chassis. */
  exclusion: readonly ["PLAY", "BUY", "WATCH"];
}

/**
 * Named lounge wall/board anchors. FanLobbySkinDressing has chairs + couches
 * as ambient icons, not TV/mirror meshes — these typed anchors are the bind
 * points for getAdSlotForZone until kit meshes exist.
 */
export const LOUNGE_AD_ANCHORS: readonly LoungeAdAnchor[] = [
  {
    id: "lounge-wall-tv-north",
    chassis: "TV",
    label: "Wall TV",
    xPct: 50,
    yPct: 10,
    zoneKey: "lounge-wall-tv-north",
    exclusion: ["PLAY", "BUY", "WATCH"],
  },
  {
    id: "lounge-bar-mirror",
    chassis: "MIRROR",
    label: "Bar mirror screen",
    xPct: 12,
    yPct: 38,
    zoneKey: "lounge-bar-mirror",
    exclusion: ["PLAY", "BUY", "WATCH"],
  },
  {
    id: "lounge-video-panel-east",
    chassis: "VIDEO_PANEL",
    label: "Video panel",
    xPct: 88,
    yPct: 42,
    zoneKey: "lounge-video-panel-east",
    exclusion: ["PLAY", "BUY", "WATCH"],
  },
  {
    id: "lounge-glass-display-south",
    chassis: "GLASS_DISPLAY",
    label: "Retro glass display",
    xPct: 72,
    yPct: 78,
    zoneKey: "lounge-glass-display-south",
    exclusion: ["PLAY", "BUY", "WATCH"],
  },
] as const;

export interface LoungeFurnitureProp {
  id: string;
  kind: "couch" | "table" | "bar";
  xPct: number;
  yPct: number;
  wPct: number;
  hPct: number;
  collision: CollisionBounds;
}

/** Existing lounge furniture as CSS props — not photoreal, collision OPEN. */
export const LOUNGE_FURNITURE_PROPS: readonly LoungeFurnitureProp[] = [
  {
    id: "couch-center",
    kind: "couch",
    xPct: 38,
    yPct: 58,
    wPct: 24,
    hPct: 10,
    collision: { minX: -1.2, maxX: 1.2, minY: 0, maxY: 0.8, minZ: 0.4, maxZ: 1.6 },
  },
  {
    id: "table-center",
    kind: "table",
    xPct: 46,
    yPct: 52,
    wPct: 10,
    hPct: 6,
    collision: { minX: -0.5, maxX: 0.5, minY: 0, maxY: 0.4, minZ: 0.2, maxZ: 0.8 },
  },
  {
    id: "bar-west",
    kind: "bar",
    xPct: 6,
    yPct: 30,
    wPct: 10,
    hPct: 28,
    collision: { minX: -4, maxX: -2.6, minY: 0, maxY: 1.2, minZ: -1.4, maxZ: 1.4 },
  },
] as const;

export type LoungeAdFillKind = "TMI_DIRECT_SPONSOR" | "HOUSE_PLATFORM" | "ADVERTISE_CTA";

export interface LoungeAdSurface {
  anchor: LoungeAdAnchor;
  chassis: LoungeAdChassis;
  zone: string;
  slot: AdSlotDescriptor;
  fill: LoungeAdFillKind;
  adsenseAllowed: false;
  engine: "SponsorRegistry.getAdSlotForZone";
  emptyBox: false;
}

const PLAY_BUY_WATCH = /^(play|buy|watch)$/i;

export function isPlayBuyWatchCta(label?: string | null): boolean {
  const t = (label ?? "").trim();
  return PLAY_BUY_WATCH.test(t);
}

function coerceLoungeAdSlot(zone: string): { slot: AdSlotDescriptor; fill: LoungeAdFillKind } {
  const slot = getAdSlotForZone(zone);
  if (slot.type === "paid" && slot.sponsor) {
    return { slot, fill: "TMI_DIRECT_SPONSOR" };
  }
  if (slot.type === "adnetwork") {
    const house = getAdSlotForZone(`house-${zone}`);
    const coerced: AdSlotDescriptor =
      house.type === "platform" && house.platformPromo
        ? house
        : {
            type: "platform",
            platformPromo: {
              headline: "SPONSOR THIS LOUNGE",
              body: "In-world TV and glass — TMI direct / house fill. Never an empty box.",
              ctaLabel: "ADVERTISE HERE",
              ctaHref: "/sponsors/advertise",
              accentColor: "#FFD700",
            },
          };
    return { slot: coerced, fill: coerced.type === "advertise-cta" ? "ADVERTISE_CTA" : "HOUSE_PLATFORM" };
  }
  if (slot.type === "platform" && slot.platformPromo) {
    return { slot, fill: "HOUSE_PLATFORM" };
  }
  return { slot: { type: "advertise-cta" }, fill: "ADVERTISE_CTA" };
}

/** Rule 12 on named lounge chassis. Never AdSense flush against PLAY/BUY/WATCH. */
export function resolveLoungeAdSurface(anchorId: string): LoungeAdSurface | null {
  const anchor = LOUNGE_AD_ANCHORS.find((a) => a.id === anchorId);
  if (!anchor) return null;
  const { slot, fill } = coerceLoungeAdSlot(anchor.zoneKey);
  return {
    anchor,
    chassis: anchor.chassis,
    zone: anchor.zoneKey,
    slot,
    fill,
    adsenseAllowed: false,
    engine: "SponsorRegistry.getAdSlotForZone",
    emptyBox: false,
  };
}

export function listLoungeAdSurfaces(): LoungeAdSurface[] {
  return LOUNGE_AD_ANCHORS.map((a) => resolveLoungeAdSurface(a.id)!);
}

export function loungeAdSlotTypeIsDirectOrHouse(type: AdSlotType): boolean {
  return type === "paid" || type === "platform" || type === "advertise-cta";
}

export interface LoungePanelJoinInput {
  userId: string;
  streamId: string;
  chassisSkinId?: LoungeParticipantChassis;
  positionXyz?: [number, number, number];
}

export function joinLoungeVideoPanel(input: LoungePanelJoinInput): SpatialVideoPanel {
  return registerSpatialPanel({
    panelId: `lounge-panel-${input.userId}`,
    userId: input.userId,
    streamId: input.streamId,
    chassisSkinId: input.chassisSkinId ?? "tv",
    positionXyz: input.positionXyz,
  });
}

export function leaveLoungeVideoPanel(userId: string): { removed: boolean; unsubscribed: true } {
  const panelId = `lounge-panel-${userId}`;
  const removed = unregisterSpatialPanel(panelId);
  return { removed, unsubscribed: true };
}

export function applyLoungeChassisSkin(
  panelId: string,
  chassisSkinId: LoungeParticipantChassis,
): { streamReconnected: false; panel: SpatialVideoPanel | null } {
  const result = updatePanelTransformWithoutReconnect(panelId, { chassisSkinId });
  return { streamReconnected: false, panel: result.panel };
}

export function applyLoungeProximity(
  panelId: string,
  distanceMeters: number,
): { scale: number; voiceGain: number; lod: SpatialVideoPanel["lodQuality"]; streamReconnected: false } {
  const lod = calculateLodQuality(distanceMeters);
  const scale = Math.max(0.35, Math.min(1.6, 1.35 - distanceMeters * 0.045));
  const voiceGain = Math.max(0, Math.min(1, 1 - distanceMeters / 18));
  updatePanelTransformWithoutReconnect(panelId, { scale });
  return { scale, voiceGain, lod, streamReconnected: false };
}

export function collideLoungeMove(
  panelId: string,
  proposed: [number, number, number],
): [number, number, number] {
  const obstacles = LOUNGE_FURNITURE_PROPS.map((p) => p.collision);
  return resolveDualCollisions(panelId, proposed, obstacles);
}

/** Navmesh / floor bounds — honest OPEN until photoreal mesh certified. */
export const LOUNGE_FLOOR_BOUNDS = {
  minX: -3.6,
  maxX: 3.6,
  minZ: -3.0,
  maxZ: 3.0,
} as const;

export function moveLoungePanel(
  userId: string,
  proposed: [number, number, number],
): { position: [number, number, number]; streamReconnected: false } {
  const panelId = `lounge-panel-${userId}`;
  const clamped: [number, number, number] = [
    Math.max(LOUNGE_FLOOR_BOUNDS.minX, Math.min(LOUNGE_FLOOR_BOUNDS.maxX, proposed[0])),
    proposed[1],
    Math.max(LOUNGE_FLOOR_BOUNDS.minZ, Math.min(LOUNGE_FLOOR_BOUNDS.maxZ, proposed[2])),
  ];
  const resolved = collideLoungeMove(panelId, clamped);
  updatePanelTransformWithoutReconnect(panelId, { positionXyz: resolved });
  return { position: resolved, streamReconnected: false };
}

export const LOUNGE_WORLD_ZONE = CANONICAL_WORLD_ZONE.LOUNGE_SIDE_ROOM;
