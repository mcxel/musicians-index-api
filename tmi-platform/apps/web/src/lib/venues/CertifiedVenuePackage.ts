/**
 * CertifiedVenuePackage — Step 4 Slice 2 bind layer.
 *
 * selectedVenueId → VenueAssetRegistry → package → UniversalVenueRenderer
 *
 * NOT a second VenueAssetRegistry. Reuses VenueType / VenueAsset / GlbAssetRef.
 * Capability flags are evidence-only (Rule 20). No silent venue substitution.
 *
 * Audit 2026-09-10: zero production venue GLBs in tree. Herser reference packs
 * under Venue Skins Plus Seating / game show and venue skins / Dasboard and venues
 * are JPG/PNG/HTML concept art only — PLACEHOLDER / LEGACY, not runtime meshes.
 */

import type { GlbAssetRef } from "@/lib/venues/VenueAssetContract";
import { VENUE_CONTRACT_REGISTRY } from "@/lib/venues/VenueAssetContract";
import {
  getVenueAsset,
  getAllVenueTypes,
  slugToVenueType,
  type VenueAsset,
  type VenueType,
  type VenueVideoRole,
} from "@/lib/venues/VenueAssetRegistry";
import { SCENE_FACTORY_AUDIT } from "@/lib/venues/VenueSceneFactory";

/** A–E classification from Marcel Slice 2 directive. */
export type VenueGeometryClass =
  | "A_REAL_MESH"
  | "B_VIDEO_ONLY"
  | "C_MISSING_ASSET"
  | "D_DUPLICATE"
  | "E_LEGACY";

export type VenueRenderMode =
  | "CERTIFIED_GEOMETRY"
  | "DEGRADED_VIDEO"
  | "UNAVAILABLE";

export type VenueCapabilityFlag =
  | "HAS_REAL_GEOMETRY"
  | "HAS_SEATING"
  | "HAS_FREE_ROAM"
  | "HAS_COLLISION"
  | "HAS_JUMBOTRON"
  | "HAS_STAGE_ANCHOR"
  | "VR_READY"
  | "MOBILE_SAFE";

export type VenueCapabilityFlags = Record<VenueCapabilityFlag, boolean>;

/**
 * Ambient loops verified on disk under public/assets/videos/rooms/ (2026-09-10).
 * Paths declared in registry but absent here must not be treated as GREEN.
 */
export const VERIFIED_ROOM_AMBIENT_VIDEOS: ReadonlySet<string> = new Set([
  "/assets/videos/rooms/battle.mp4",
  "/assets/videos/rooms/challenge.mp4",
  "/assets/videos/rooms/cypher.mp4",
  "/assets/videos/rooms/deal-or-feud.mp4",
  "/assets/videos/rooms/fan-lobby.mp4",
  "/assets/videos/rooms/lounge.mp4",
  "/assets/videos/rooms/monday-night-stage.mp4",
  "/assets/videos/rooms/world-dance-party.mp4",
]);

/**
 * Selectable Regular Go Live venue IDs (VenueAssetRegistry keys).
 * InstantGoLive maps category → these via arenaEventTypeToVenueType / slug maps.
 */
export const REGULAR_GO_LIVE_VENUE_IDS: readonly VenueType[] = [
  "concert",
  "battle",
  "cypher",
  "challenge",
  "world-dance-party",
  "listening-party",
  "lounge",
  "monday-night-stage",
  "deal-or-feud",
  "fan-lobby",
  "world-concert",
  "mini-concert",
  "release-party",
  "world-release",
  "mini-release",
  "slow-jams",
] as const;

/** Production venue GLB count in public/ + packages (audit). Avatar GLBs do not count. */
export const PRODUCTION_VENUE_GLB_COUNT = SCENE_FACTORY_AUDIT.productionGlbCount;

export interface CertifiedVenuePackage {
  /** Canonical selected id (VenueType string or explicit request id). */
  venueId: string;
  venueType: VenueType | null;
  displayName: string;
  classification: VenueGeometryClass;
  renderMode: VenueRenderMode;
  /** Never PRODUCTION until a real venue GLB is bound. */
  geometryAsset: GlbAssetRef;
  ambientVideoUrl: string | null;
  ambientVideoRole: VenueVideoRole | null;
  ambientVideoVerified: boolean;
  /** Logical performer media surface — not a measured Vec3 stage anchor. */
  stageMount: {
    kind: "LOGICAL_MEDIA_SURFACE";
    surfaceId: string;
    note: string;
  } | null;
  seatingLayoutId: string | null;
  jumbotronMount: {
    mountId: string;
    declaredBy: "VenueAssetRegistry.geometry.ledWalls";
    ledWalls: VenueAsset["geometry"]["ledWalls"];
  } | null;
  collisionAssetId: null;
  navmeshId: null;
  venueIndex: 0 | 1 | 2 | 3 | 4 | 5 | null;
  capabilities: VenueCapabilityFlags;
  evidence: string[];
  registrySource: "VenueAssetRegistry";
  /** Opaque asset snapshot for renderer — never invent occupancy/tickets. */
  asset: VenueAsset | null;
}

const EMPTY_CAPS: VenueCapabilityFlags = {
  HAS_REAL_GEOMETRY: false,
  HAS_SEATING: false,
  HAS_FREE_ROAM: false,
  HAS_COLLISION: false,
  HAS_JUMBOTRON: false,
  HAS_STAGE_ANCHOR: false,
  VR_READY: false,
  MOBILE_SAFE: false,
};

function unavailablePackage(
  venueId: string,
  reason: string,
  extras?: Partial<CertifiedVenuePackage>,
): CertifiedVenuePackage {
  return {
    venueId,
    venueType: null,
    displayName: "Venue unavailable",
    classification: "C_MISSING_ASSET",
    renderMode: "UNAVAILABLE",
    geometryAsset: { status: "MISSING" },
    ambientVideoUrl: null,
    ambientVideoRole: null,
    ambientVideoVerified: false,
    stageMount: null,
    seatingLayoutId: null,
    jumbotronMount: null,
    collisionAssetId: null,
    navmeshId: null,
    venueIndex: null,
    capabilities: { ...EMPTY_CAPS },
    evidence: [reason, `productionVenueGlbCount=${PRODUCTION_VENUE_GLB_COUNT}`],
    registrySource: "VenueAssetRegistry",
    asset: null,
    ...extras,
  };
}

/** Exact VenueType match only — never fuzzy-default unknown ids to concert. */
export function parseExactVenueType(id: string): VenueType | null {
  const key = id.trim().toLowerCase();
  if (!key) return null;
  return (getAllVenueTypes() as string[]).includes(key) ? (key as VenueType) : null;
}

/**
 * Map Instant Go Live category / arena event label → exact VenueType.
 * Unknown labels return null (caller must show UNAVAILABLE — no silent concert).
 */
/** Known InstantGoLive / ArenaEventShell labels → VenueType (no unknown→concert). */
const GO_LIVE_EVENT_TO_VENUE: Record<string, VenueType> = {
  concert: "concert",
  battle: "battle",
  cypher: "cypher",
  challenge: "challenge",
  "song-challenge": "challenge",
  "live-show": "concert",
  live: "concert",
  "monday-stage": "monday-night-stage",
  "monday-night-stage": "monday-night-stage",
  "deal-or-feud": "deal-or-feud",
  lounge: "lounge",
  "world-dance-party": "world-dance-party",
  "dance-party": "world-dance-party",
  "slow-jams": "slow-jams",
  "slow-jam": "slow-jams",
  listening: "listening-party",
  "listening-party": "listening-party",
  "fan-lobby": "fan-lobby",
  "world-concert": "world-concert",
  "mini-concert": "mini-concert",
  "release-party": "release-party",
  "world-release": "world-release",
  "mini-release": "mini-release",
};

export function mapGoLiveCategoryToVenueType(
  categoryOrEvent: string | null | undefined,
): VenueType | null {
  const raw = String(categoryOrEvent ?? "").trim().toLowerCase();
  if (!raw) return null;

  const exact = parseExactVenueType(raw);
  if (exact) return exact;

  if (GO_LIVE_EVENT_TO_VENUE[raw]) return GO_LIVE_EVENT_TO_VENUE[raw];

  // Do NOT call arenaEventTypeToVenueType / slugToVenueType — both default unknown → concert.
  return null;
}

function buildCapabilities(input: {
  hasVerifiedAmbient: boolean;
  ledWallCount: number;
  contractSeats: number;
  contractCollision: GlbAssetRef | null | undefined;
  contractNav: GlbAssetRef | null | undefined;
  contractVisual: GlbAssetRef | null | undefined;
}): VenueCapabilityFlags {
  const visualProd = input.contractVisual?.status === "PRODUCTION";
  const collisionProd = input.contractCollision?.status === "PRODUCTION";
  const navProd = input.contractNav?.status === "PRODUCTION";
  return {
    HAS_REAL_GEOMETRY: visualProd,
    HAS_SEATING: input.contractSeats > 0,
    HAS_FREE_ROAM: false, // no walkable navmesh evidence
    HAS_COLLISION: collisionProd,
    HAS_JUMBOTRON: input.ledWallCount > 0, // registry-declared virtual LED only
    HAS_STAGE_ANCHOR: false, // no measured Vec3 spawn/stage anchors
    VR_READY: false,
    // Ambient MP4 + CSS shell is mobile-safe; GLB venue worlds are not present.
    MOBILE_SAFE: input.hasVerifiedAmbient || !visualProd,
  };
}

/**
 * Resolve a certified (or honestly degraded / unavailable) package.
 * Never substitutes a different venueId when the requested one cannot bind.
 */
export function resolveCertifiedVenuePackage(
  selectedVenueId: string,
): CertifiedVenuePackage {
  const id = selectedVenueId.trim();
  if (!id) {
    return unavailablePackage("", "empty_venue_id");
  }

  const venueType = parseExactVenueType(id);
  if (!venueType) {
    return unavailablePackage(id, `unresolved_venue_id:${id}`);
  }

  const asset = getVenueAsset(venueType);
  const contract = VENUE_CONTRACT_REGISTRY.get(venueType);
  const declaredAmbient = asset.ambientVideoUrl?.trim() || null;
  const ambientVerified = Boolean(
    declaredAmbient && VERIFIED_ROOM_AMBIENT_VIDEOS.has(declaredAmbient),
  );

  const visualGlb: GlbAssetRef =
    contract?.visualGlb?.status === "PRODUCTION"
      ? contract.visualGlb
      : contract?.visualGlb?.status === "DEV_FIXTURE_DO_NOT_CERTIFY"
        ? contract.visualGlb
        : { status: "MISSING" };

  // Dev fixtures must never certify as real geometry.
  const hasRealGeometry = visualGlb.status === "PRODUCTION";
  const ledWalls = asset.geometry?.ledWalls ?? [];
  const caps = buildCapabilities({
    hasVerifiedAmbient: ambientVerified,
    ledWallCount: ledWalls.length,
    contractSeats: contract?.seatAnchors?.length ?? 0,
    contractCollision: contract?.collisionGlb ?? null,
    contractNav: contract?.navmeshGlb ?? null,
    contractVisual: visualGlb,
  });

  const evidence: string[] = [
    `registry=VenueAssetRegistry`,
    `venueType=${venueType}`,
    `hasCanonical3DWorld=${Boolean(asset.hasCanonical3DWorld)}`,
    `productionVenueGlbCount=${PRODUCTION_VENUE_GLB_COUNT}`,
    `ambientDeclared=${declaredAmbient ?? "none"}`,
    `ambientVerified=${ambientVerified}`,
    `visualGlbStatus=${visualGlb.status}`,
    `ledWalls=${ledWalls.join(",") || "none"}`,
    `seatAnchors=${contract?.seatAnchors?.length ?? 0}`,
    `SCENE_FACTORY_AUDIT.emitsGlbGltf=${SCENE_FACTORY_AUDIT.emitsGlbGltf}`,
  ];

  let classification: VenueGeometryClass = "B_VIDEO_ONLY";
  let renderMode: VenueRenderMode = "DEGRADED_VIDEO";

  if (hasRealGeometry) {
    classification = "A_REAL_MESH";
    renderMode = "CERTIFIED_GEOMETRY";
  } else if (visualGlb.status === "DEV_FIXTURE_DO_NOT_CERTIFY") {
    classification = "E_LEGACY";
    renderMode = ambientVerified ? "DEGRADED_VIDEO" : "UNAVAILABLE";
    evidence.push("dev_fixture_glb_rejected_for_certification");
  } else if (!ambientVerified) {
    classification = "C_MISSING_ASSET";
    renderMode = "DEGRADED_VIDEO"; // venue id still correct — no unrelated substitute
    evidence.push("ambient_video_missing_or_unverified");
  }

  const jumbotronMount =
    caps.HAS_JUMBOTRON
      ? {
          mountId: `jt-${venueType}-led`,
          declaredBy: "VenueAssetRegistry.geometry.ledWalls" as const,
          ledWalls,
        }
      : null;

  return {
    venueId: venueType,
    venueType,
    displayName: asset.label,
    classification,
    renderMode,
    geometryAsset: visualGlb,
    ambientVideoUrl: ambientVerified ? declaredAmbient : null,
    ambientVideoRole: asset.ambientVideoRole ?? "FALLBACK_PREVIEW",
    ambientVideoVerified: ambientVerified,
    stageMount: {
      kind: "LOGICAL_MEDIA_SURFACE",
      surfaceId: `stage-media-${venueType}`,
      note:
        "Logical performer media surface inside UniversalVenueRenderer — not a measured GLB stage anchor.",
    },
    seatingLayoutId: null,
    jumbotronMount,
    collisionAssetId: null,
    navmeshId: null,
    venueIndex: asset.venueIndex,
    capabilities: caps,
    evidence,
    registrySource: "VenueAssetRegistry",
    asset,
  };
}

/**
 * Go Live bind helper: prefer explicit venueId, else category/event map.
 * Does not use slugToVenueType fuzzy default for unknown rooms.
 */
export function resolveGoLiveCertifiedVenuePackage(input: {
  venueId?: string | null;
  category?: string | null;
  eventType?: string | null;
}): CertifiedVenuePackage {
  const explicit = input.venueId?.trim();
  if (explicit) {
    const exact = parseExactVenueType(explicit);
    if (exact) return resolveCertifiedVenuePackage(exact);
    // Explicit unknown id — refuse silent substitute.
    return unavailablePackage(explicit, `explicit_unresolved_venue_id:${explicit}`);
  }

  const fromCategory = mapGoLiveCategoryToVenueType(input.category ?? input.eventType);
  if (fromCategory) return resolveCertifiedVenuePackage(fromCategory);

  return unavailablePackage(
    String(input.category ?? input.eventType ?? ""),
    "no_golive_venue_mapping",
  );
}

/** True when package may drive RoomEnvironmentLayer / UVR visuals. */
export function isVenuePackageRenderable(pkg: CertifiedVenuePackage): boolean {
  return pkg.renderMode !== "UNAVAILABLE" && pkg.venueType !== null;
}

/**
 * Diagnostic: slugToVenueType defaults unknown → concert (legacy helper).
 * Go Live binding must NOT use that path for unresolved ids.
 */
export function legacySlugDefaultsToConcert(slug: string): boolean {
  return slugToVenueType(slug) === "concert" && parseExactVenueType(slug) === null;
}

export function listRegularGoLivePackages(): CertifiedVenuePackage[] {
  return REGULAR_GO_LIVE_VENUE_IDS.map((id) => resolveCertifiedVenuePackage(id));
}
