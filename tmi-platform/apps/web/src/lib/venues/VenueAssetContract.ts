// VenueAssetContract — geometry contract schema for production 3D venues.
//
// A venue is CERTIFIED only when every GLB ref is { status: "PRODUCTION" },
// all anchor arrays are populated, and the 18-step physical gate passes.
//
// Until then every venue stays DRAFT and preflight is expected to fail.
// DO NOT flip hasCanonical3DWorld in VenueAssetRegistry until CERTIFIED.

import type { VenueType } from "./VenueAssetRegistry";

// ─── Primitive geometry types ────────────────────────────────────────────────

export interface Vec3 { x: number; y: number; z: number; }
export interface Quat { x: number; y: number; z: number; w: number; }

// ─── GLB asset reference (discriminated — no ambiguity between dev and prod) ─

export type GlbAssetRef =
  | { status: "MISSING" }
  | { status: "DEV_FIXTURE_DO_NOT_CERTIFY"; path: string }
  | { status: "PRODUCTION"; path: string; sha256: string };

// ─── Anchor types ─────────────────────────────────────────────────────────────

export interface SpawnAnchor {
  id: string;
  role: "fan" | "performer" | "host" | "backstage";
  position: Vec3;
  facing: Quat;
}

export interface SeatAnchor {
  id: string;
  tier: "front-row" | "vip" | "main" | "back";
  position: Vec3;
  facing: Quat;
}

export interface CameraAnchor {
  id: string;
  role: "audience-pov" | "performer-pov" | "director" | "overhead";
  position: Vec3;
  target: Vec3;
  fovDeg: number;
}

// screenAnchors bind to canRenderOnAmbientSurface / canRenderOnWorldScreen helpers
export interface ScreenAnchor {
  id: string;
  role: "led-wall" | "monitor" | "billboard" | "sponsor-panel";
  videoRole: "AMBIENT_SURFACE" | "IN_WORLD_SCREEN";
  position: Vec3;
  normalDir: Vec3;
  widthMeters: number;
  heightMeters: number;
}

export interface InteractionZone {
  id: string;
  label: string;
  type: "stage" | "audience-floor" | "backstage" | "vip" | "entrance";
  boundingBox: { min: Vec3; max: Vec3 };
}

// ─── Contract ─────────────────────────────────────────────────────────────────

export type CertificationStatus = "DRAFT" | "PENDING_REVIEW" | "CERTIFIED";

export interface VenueAssetContract {
  venueId: VenueType;
  version: number;

  // Geometry assets — null until real files exist
  visualGlb: GlbAssetRef | null;
  collisionGlb: GlbAssetRef | null;
  navmeshGlb: GlbAssetRef | null;

  // 1.0 = meter-based GLB (standard). Document the source tool's export scale here.
  worldScaleMeters: number;

  spawnAnchors: SpawnAnchor[];
  seatAnchors: SeatAnchor[];
  cameraAnchors: CameraAnchor[];
  screenAnchors: ScreenAnchor[];
  interactionZones: InteractionZone[];

  certificationStatus: CertificationStatus;
}

// ─── Registry ─────────────────────────────────────────────────────────────────
// Add an entry here when a venue enters the production pipeline.
// Preflight iterates this map; certify targets a single entry by venueId.

export const VENUE_CONTRACT_REGISTRY = new Map<VenueType, VenueAssetContract>();

// Monday Night Stage — first venue to certify. All geometry missing: expected.
VENUE_CONTRACT_REGISTRY.set("monday-night-stage", {
  venueId: "monday-night-stage",
  version: 1,
  visualGlb: { status: "DEV_FIXTURE_DO_NOT_CERTIFY", path: "../../../../packages/assets/fixtures/dev-avatar-placeholder.glb" },
  collisionGlb: { status: "DEV_FIXTURE_DO_NOT_CERTIFY", path: "../../../../packages/assets/fixtures/dev-avatar-placeholder.glb" },
  navmeshGlb: { status: "DEV_FIXTURE_DO_NOT_CERTIFY", path: "../../../../packages/assets/fixtures/dev-avatar-placeholder.glb" },
  worldScaleMeters: 1,
  spawnAnchors: [],
  seatAnchors: [],
  cameraAnchors: [],
  screenAnchors: [],
  interactionZones: [],
  certificationStatus: "DRAFT",
});

// ─── Preflight result types (shared by venuePreflight.ts script) ──────────────

export type PreflightCode =
  | "MISSING_VISUAL_GLB"
  | "MISSING_COLLISION_GLB"
  | "MISSING_NAVMESH"
  | "DEV_FIXTURE_VISUAL_GLB"
  | "DEV_FIXTURE_COLLISION_GLB"
  | "DEV_FIXTURE_NAVMESH"
  | "MISSING_SPAWN_ANCHORS"
  | "MISSING_SEAT_ANCHORS"
  | "MISSING_CAMERA_ANCHORS"
  | "MISSING_SCREEN_ANCHORS"
  | "MISSING_INTERACTION_ZONES"
  | "NOT_CERTIFIED";

export interface PreflightIssue {
  code: PreflightCode;
  venueId: VenueType;
  message: string;
  /** DRAFT failures are expected and do not block the build. */
  severity: "EXPECTED_DRAFT" | "BLOCKING";
}

export function runContractPreflight(contract: VenueAssetContract): PreflightIssue[] {
  const issues: PreflightIssue[] = [];
  const v = contract.venueId;
  const isDraft = contract.certificationStatus === "DRAFT";
  const sev = isDraft ? "EXPECTED_DRAFT" : "BLOCKING";

  const checkGlb = (
    ref: GlbAssetRef | null,
    missing: PreflightCode,
    dev: PreflightCode,
    label: string,
  ) => {
    if (!ref || ref.status === "MISSING") {
      issues.push({ code: missing, venueId: v, message: `${label} not provided`, severity: sev });
    } else if (ref.status === "DEV_FIXTURE_DO_NOT_CERTIFY") {
      // BLOCKING only on non-DRAFT venues — DRAFT dev fixtures are expected placeholders
      issues.push({ code: dev, venueId: v, message: `${label} is a dev fixture — not certifiable`, severity: sev });
    }
  };

  checkGlb(contract.visualGlb,   "MISSING_VISUAL_GLB",    "DEV_FIXTURE_VISUAL_GLB",    "visualGlb");
  checkGlb(contract.collisionGlb, "MISSING_COLLISION_GLB", "DEV_FIXTURE_COLLISION_GLB", "collisionGlb");
  checkGlb(contract.navmeshGlb,   "MISSING_NAVMESH",       "DEV_FIXTURE_NAVMESH",       "navmeshGlb");

  if (contract.spawnAnchors.length === 0)
    issues.push({ code: "MISSING_SPAWN_ANCHORS",      venueId: v, message: "No spawn anchors defined", severity: sev });
  if (contract.seatAnchors.length === 0)
    issues.push({ code: "MISSING_SEAT_ANCHORS",       venueId: v, message: "No seat anchors defined", severity: sev });
  if (contract.cameraAnchors.length === 0)
    issues.push({ code: "MISSING_CAMERA_ANCHORS",     venueId: v, message: "No camera anchors defined", severity: sev });
  if (contract.screenAnchors.length === 0)
    issues.push({ code: "MISSING_SCREEN_ANCHORS",     venueId: v, message: "No screen anchors (LED walls, monitors)", severity: sev });
  if (contract.interactionZones.length === 0)
    issues.push({ code: "MISSING_INTERACTION_ZONES",  venueId: v, message: "No interaction zones (stage, audience, etc.)", severity: sev });

  if (contract.certificationStatus !== "CERTIFIED")
    issues.push({ code: "NOT_CERTIFIED", venueId: v, message: `Status is ${contract.certificationStatus}`, severity: sev });

  return issues;
}
