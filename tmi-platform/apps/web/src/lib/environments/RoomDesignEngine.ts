/**
 * RoomDesignEngine.ts
 * Core data model and design contract for every show/game room.
 * All bots read from and write to RoomDesign instances.
 */

export type RoomId =
  | "monthly-idol"
  | "monday-night-stage"
  | "deal-or-feud"
  | "name-that-tune"
  | "circle-squares"
  | "cypher"
  | "lobbies";

export type StageShape = "proscenium" | "thrust" | "arena" | "catwalk" | "island" | "flat";

export type ZoneKind =
  | "stage"
  | "audience"
  | "host-table"
  | "host-zone"
  | "camera"
  | "lighting"
  | "sponsor"
  | "performance-video"
  | "reaction"
  | "winner-celebration"
  | "route-target"
  | "controller-focus";

export type RoomZone = {
  id: string;
  kind: ZoneKind;
  label: string;
  /** Normalized 0–1 relative to room canvas */
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
};

export type RoomDesign = {
  roomId: RoomId;
  stageShape: StageShape;
  zones: RoomZone[];
  /** Design token: max props on screen simultaneously */
  maxPropsOnScreen: number;
  /** Design token: max sponsor slots visible at once */
  maxSponsorSlots: number;
  /** Whether the room clutter guard has approved this design */
  clutterApproved: boolean;
  /** ISO timestamp of last design change */
  lastUpdatedAt: string;
  /** Active theme key */
  themeKey: string;
};

const DEFAULT_ZONES: Omit<RoomZone, "id">[] = [
  { kind: "stage",               label: "Main Stage",         x: 0.15, y: 0.1,  width: 0.7,  height: 0.45, zIndex: 1 },
  { kind: "audience",            label: "Audience Bank",      x: 0.05, y: 0.58, width: 0.9,  height: 0.3,  zIndex: 1 },
  { kind: "host-zone",           label: "Host Zone",          x: 0.02, y: 0.15, width: 0.12, height: 0.3,  zIndex: 2 },
  { kind: "camera",              label: "Camera A",           x: 0.0,  y: 0.0,  width: 0.1,  height: 0.1,  zIndex: 3 },
  { kind: "camera",              label: "Camera B",           x: 0.9,  y: 0.0,  width: 0.1,  height: 0.1,  zIndex: 3 },
  { kind: "lighting",            label: "Front Lighting Rig", x: 0.1,  y: 0.0,  width: 0.8,  height: 0.05, zIndex: 4 },
  { kind: "sponsor",             label: "Sponsor Left",       x: 0.0,  y: 0.45, width: 0.12, height: 0.12, zIndex: 2 },
  { kind: "sponsor",             label: "Sponsor Right",      x: 0.88, y: 0.45, width: 0.12, height: 0.12, zIndex: 2 },
  { kind: "performance-video",   label: "Perf Panel",         x: 0.2,  y: 0.12, width: 0.6,  height: 0.38, zIndex: 2 },
  { kind: "reaction",            label: "Reaction Rail",      x: 0.05, y: 0.88, width: 0.9,  height: 0.1,  zIndex: 5 },
  { kind: "winner-celebration",  label: "Winner Burst",       x: 0.25, y: 0.05, width: 0.5,  height: 0.5,  zIndex: 6 },
  { kind: "controller-focus",    label: "Controller Zone",    x: 0.35, y: 0.9,  width: 0.3,  height: 0.09, zIndex: 7 },
];

export function buildDefaultRoomDesign(roomId: RoomId, themeKey: string): RoomDesign {
  const zones: RoomZone[] = DEFAULT_ZONES.map((z, i) => ({
    ...z,
    id: `${roomId}-zone-${i}`,
  }));

  return {
    roomId,
    stageShape: "proscenium",
    zones,
    maxPropsOnScreen: 6,
    maxSponsorSlots: 4,
    clutterApproved: false,
    lastUpdatedAt: new Date().toISOString(),
    themeKey,
  };
}

export function getRoomZonesByKind(design: RoomDesign, kind: ZoneKind): RoomZone[] {
  return design.zones.filter((z) => z.kind === kind);
}
