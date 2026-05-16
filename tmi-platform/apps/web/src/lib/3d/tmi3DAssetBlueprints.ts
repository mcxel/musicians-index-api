import type { TmiMaterialId } from "./tmiMaterialLibrary";

export type Tmi3DAssetType =
  | "seat"
  | "stage"
  | "wall"
  | "floor"
  | "billboard"
  | "spotlight"
  | "screen"
  | "booth"
  | "venue"
  | "prop"
  | "avatar"
  | "host"
  | "crowd-section"
  | "trophy"
  | "wheel"
  | "dj-table"
  | "mic"
  | "camera"
  | "ticket-booth";

export type Tmi3DAssetBlueprint = {
  id: string;
  sourceAssetId: string;
  type: Tmi3DAssetType;
  style: "realistic-neon-80s";
  geometry: string;
  materials: TmiMaterialId[];
  animation: string[];
  routeUse: string[];
  adminProof: boolean;
};

export const TMI_3D_ASSET_BLUEPRINTS: Tmi3DAssetBlueprint[] = [
  {
    id: "neon-auditorium-seat",
    sourceAssetId: "asset-seat-001",
    type: "seat",
    style: "realistic-neon-80s",
    geometry: "rounded-cinema-chair",
    materials: ["gloss-black-leather", "chrome-trim", "cyan-edge-glow"],
    animation: ["seat-hover-glow", "occupied-pulse"],
    routeUse: ["/venues/[venueId]", "/room/[roomId]"],
    adminProof: true,
  },
  {
    id: "prime-main-stage",
    sourceAssetId: "asset-stage-001",
    type: "stage",
    style: "realistic-neon-80s",
    geometry: "multi-tier-performance-stage",
    materials: ["stage-matte-carbon", "chrome-trim", "hot-pink-neon"],
    animation: ["bass-reactive-floor", "stage-rim-pulse"],
    routeUse: ["/live", "/concerts", "/shows"],
    adminProof: true,
  },
  {
    id: "city-hub-billboard",
    sourceAssetId: "asset-billboard-001",
    type: "billboard",
    style: "realistic-neon-80s",
    geometry: "ultrawide-curved-screen",
    materials: ["billboard-gloss", "electric-blue-neon", "chrome-trim"],
    animation: ["campaign-crossfade", "edge-light-sweep"],
    routeUse: ["/billboard", "/advertisers", "/sponsors"],
    adminProof: true,
  },
  {
    id: "host-camera-rig",
    sourceAssetId: "asset-camera-001",
    type: "camera",
    style: "realistic-neon-80s",
    geometry: "gimbal-rig",
    materials: ["chrome-trim", "glass-dark", "cyan-edge-glow"],
    animation: ["camera-idle-pan", "recording-indicator-pulse"],
    routeUse: ["/hosts", "/admin/overseer", "/live"],
    adminProof: true,
  },
  {
    id: "ticket-booth-premium",
    sourceAssetId: "asset-ticket-001",
    type: "ticket-booth",
    style: "realistic-neon-80s",
    geometry: "angular-kiosk",
    materials: ["glass-dark", "hot-pink-neon", "chrome-trim"],
    animation: ["ticket-scan-flash", "queue-status-pulse"],
    routeUse: ["/tickets", "/venues/[venueId]/hub", "/booking"],
    adminProof: true,
  },
];

export function getBlueprintByType(type: Tmi3DAssetType): Tmi3DAssetBlueprint[] {
  return TMI_3D_ASSET_BLUEPRINTS.filter((bp) => bp.type === type);
}
