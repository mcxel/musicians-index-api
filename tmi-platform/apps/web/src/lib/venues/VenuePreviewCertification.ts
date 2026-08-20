/**
 * Venue Preview & Certification Runtime — assembly glue over the ONE Venue Runtime.
 *
 * Preview Mode renders the same path as GO LIVE:
 *   Venue definition → UniversalVenueRenderer → lighting/materials →
 *   collision + seating map → real Venue HUD → TEST occupancy → responsive HUD
 *
 * Rule 20: TEST occupancy is never published as real viewers.
 * Rule 21: no parallel DesktopVenue / MobileVenue / VenuePreviewV2 engines.
 */

import { createSeatingMesh, type SeatingMeshState } from "@/lib/seats/SeatingMeshEngine";
import { listVenueSkins, type VenueSkin } from "@/lib/venue/venueSkinEngine";
import type { VenueEnvironmentKind, EventVenueKind } from "@/lib/venues/EventVenueEnvironment";

/** Mirrors ArenaEventShell event types without importing the client shell. */
export type VenuePreviewEventType =
  | "concert"
  | "battle"
  | "cypher"
  | "challenge"
  | "song-challenge"
  | "live-show"
  | "monday-stage"
  | "deal-or-feud"
  | "lounge"
  | "world-dance-party"
  | "slow-jams";

export type VenueCertStatus = "DRAFT" | "PREVIEW" | "CERTIFIED" | "PRODUCTION";

export type TestOccupancyLevel =
  | "EMPTY"
  | "LIGHT"
  | "MEDIUM"
  | "BUSY"
  | "NEAR_CAPACITY"
  | "FULL";

/** One viewport system for preview + broadcast. Prefer FREE_ROAM_3D for modeled venues. */
export type VenuePreviewViewMode =
  | "FREE_ROAM_3D"
  | "PANORAMA_180"
  | "PANORAMA_360"
  | "SPHERICAL_360";

export const TEST_OCCUPANCY_RATIOS: Record<TestOccupancyLevel, number> = {
  EMPTY: 0,
  LIGHT: 0.1,
  MEDIUM: 0.35,
  BUSY: 0.65,
  NEAR_CAPACITY: 0.9,
  FULL: 1,
};

export const TEST_OCCUPANCY_LABELS: Record<TestOccupancyLevel, string> = {
  EMPTY: "EMPTY 0%",
  LIGHT: "LIGHT 10%",
  MEDIUM: "MEDIUM 35%",
  BUSY: "BUSY 65%",
  NEAR_CAPACITY: "NEAR CAPACITY 90%",
  FULL: "FULL 100%",
};

export const VENUE_CERT_GATES = [
  { id: "geometry", label: "Geometry / skin assets present" },
  { id: "collisions", label: "Collision boundaries wired" },
  { id: "seating", label: "Seating / occupancy points spatial" },
  { id: "sightlines", label: "Sightlines acceptable from seats" },
  { id: "occupancy_scale", label: "TEST occupancy scales correctly" },
  { id: "hud", label: "Venue HUD overlays (mic/cam/chat/reactions)" },
  { id: "reactions", label: "Reactions / emojis fire in preview" },
  { id: "mic_cam", label: "Mic + camera controls respond" },
  { id: "responsive", label: "PC + 360/390/430 phone layouts" },
  { id: "performance", label: "Performance acceptable under FULL fill" },
] as const;

export type VenueCertGateId = (typeof VENUE_CERT_GATES)[number]["id"];

export interface VenuePreviewSessionFlags {
  isPreview: true;
  isCertification: boolean;
  /** Never publish preview rooms to live discovery / lobby wall. */
  publishToDiscovery: false;
}

export interface VenueCertRecord {
  skinId: string;
  status: VenueCertStatus;
  checkedGates: Partial<Record<VenueCertGateId, boolean>>;
  updatedAt: number;
  notes?: string;
  /** Honest geometry provenance — MISSING until measured GLB/navmesh exists. */
  geometryStatus: "PRESENT" | "MISSING" | "PARTIAL";
}

/** In-memory cert store (session). Persists across soft nav; not a DB. */
const certStore = new Map<string, VenueCertRecord>();

const DEFAULT_PREVIEW_CAPACITY = 1000;

export function createPreviewSessionFlags(
  isCertification = false,
): VenuePreviewSessionFlags {
  return {
    isPreview: true,
    isCertification,
    publishToDiscovery: false,
  };
}

export function isPreviewRoomId(roomId: string): boolean {
  return roomId.startsWith("preview-") || roomId.startsWith("venue-test-");
}

/**
 * Shareable room id so PC + phone open the same preview session URL.
 * Deterministic from skin + optional shared token (no random on refresh).
 */
export function buildPreviewRoomId(opts: {
  skinId: string;
  sessionKey?: string;
}): string {
  const key = (opts.sessionKey || "shared").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 24);
  const skin = opts.skinId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32);
  return `preview-${skin}-${key || "shared"}`;
}

export function previewRouteHref(opts: {
  roomId?: string;
  skinId?: string;
  environment?: VenueEnvironmentKind;
  eventType?: VenuePreviewEventType;
  occupancy?: TestOccupancyLevel;
  viewMode?: VenuePreviewViewMode;
  cert?: boolean;
  sessionKey?: string;
}): string {
  const params = new URLSearchParams();
  const skinId = opts.skinId ?? "red-theater";
  const roomId =
    opts.roomId ??
    buildPreviewRoomId({ skinId, sessionKey: opts.sessionKey });
  params.set("roomId", roomId);
  params.set("skin", skinId);
  if (opts.environment) params.set("env", opts.environment);
  if (opts.eventType) params.set("event", opts.eventType);
  if (opts.occupancy) params.set("occ", opts.occupancy);
  if (opts.viewMode) params.set("view", opts.viewMode);
  if (opts.cert) params.set("cert", "1");
  return `/venue/preview?${params.toString()}`;
}

export function parseTestOccupancyLevel(
  raw: string | null | undefined,
): TestOccupancyLevel {
  const u = (raw ?? "").toUpperCase().replace(/-/g, "_");
  if (u in TEST_OCCUPANCY_RATIOS) return u as TestOccupancyLevel;
  return "EMPTY";
}

export function parsePreviewViewMode(
  raw: string | null | undefined,
): VenuePreviewViewMode {
  const u = (raw ?? "").toUpperCase().replace(/-/g, "_");
  if (
    u === "FREE_ROAM_3D" ||
    u === "PANORAMA_180" ||
    u === "PANORAMA_360" ||
    u === "SPHERICAL_360"
  ) {
    return u;
  }
  return "FREE_ROAM_3D";
}

export function occupancyRatioForLevel(level: TestOccupancyLevel): number {
  return TEST_OCCUPANCY_RATIOS[level];
}

export function testOccupiedCount(
  level: TestOccupancyLevel,
  capacity = DEFAULT_PREVIEW_CAPACITY,
): number {
  return Math.round(capacity * TEST_OCCUPANCY_RATIOS[level]);
}

/** Rule 20 — always labeled TEST, never "watching" / fan count. */
export function formatTestOccupancyLabel(
  occupied: number,
  capacity: number,
): string {
  return `TEST: ${occupied.toLocaleString()} / ${capacity.toLocaleString()} OCCUPANCY`;
}

/**
 * Fill order: front/preferred → additional seating → standing/dance zones.
 * Uses SeatingMeshEngine row order (row 0 = front). Does not invent GLB coords.
 */
export function buildTestOccupancyMesh(opts: {
  roomId: string;
  level: TestOccupancyLevel;
  rows?: number;
  cols?: number;
  /** outdoor / festival: fewer seated rows, more standing zone fill via ratio only */
  layout?: "theater" | "standing" | "festival" | "lawn";
}): {
  mesh: SeatingMeshState;
  occupied: number;
  capacity: number;
  ratio: number;
  fillOrder: string[];
  labeledOccupants: Array<{ seatId: string; label: string; zone: string }>;
} {
  const rows =
    opts.rows ??
    (opts.layout === "standing" || opts.layout === "festival"
      ? 4
      : opts.layout === "lawn"
        ? 3
        : 10);
  const cols = opts.cols ?? 12;
  const mesh = createSeatingMesh(opts.roomId, `test-${opts.roomId}`, rows, cols);
  const capacity = rows * cols;
  const ratio = occupancyRatioForLevel(opts.level);
  const target = Math.round(capacity * ratio);

  // Prefer front rows first (BotCrowdFillEngine / Rule 15 progressive pattern).
  const ordered = Object.values(mesh.seats).sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    return a.col - b.col;
  });

  const fillOrder: string[] = [];
  const labeledOccupants: Array<{ seatId: string; label: string; zone: string }> = [];

  for (let i = 0; i < target && i < ordered.length; i++) {
    const seat = ordered[i]!;
    const zone =
      seat.row <= 1
        ? "front"
        : seat.row <= Math.floor(rows * 0.55)
          ? "seating"
          : opts.layout === "festival" || opts.layout === "standing"
            ? "standing-dance"
            : "rear";
    seat.status = "claimed";
    seat.occupantFanId = `test-occ-${i}`;
    seat.occupantAvatarUrl = null;
    seat.claimedAt = Date.now();
    mesh.fanSeatIndex[`test-occ-${i}`] = seat.seatId;
    fillOrder.push(seat.seatId);
    labeledOccupants.push({
      seatId: seat.seatId,
      label: `[TEST] Occupant ${i + 1}`,
      zone,
    });
  }

  return {
    mesh,
    occupied: target,
    capacity,
    ratio,
    fillOrder,
    labeledOccupants,
  };
}

export function crowdLayoutForEnvironment(
  environment: VenueEnvironmentKind | null,
  eventKind?: EventVenueKind | string | null,
): "theater" | "standing" | "festival" | "lawn" {
  const kind = (eventKind ?? "").toLowerCase();
  if (kind.includes("slow-jam")) return "lawn";
  if (kind.includes("dance") || kind.includes("festival")) return "festival";
  if (environment === "outdoor") return "festival";
  return "theater";
}

export function getCertRecord(skinId: string): VenueCertRecord {
  const existing = certStore.get(skinId);
  if (existing) return existing;
  const skin = listVenueSkins().find((s) => s.id === skinId);
  const record: VenueCertRecord = {
    skinId,
    status: skin?.certificationStatus ?? "DRAFT",
    checkedGates: {},
    updatedAt: Date.now(),
    geometryStatus: skin?.backgroundImage ? "PARTIAL" : "MISSING",
  };
  certStore.set(skinId, record);
  return record;
}

export function setCertGate(
  skinId: string,
  gateId: VenueCertGateId,
  checked: boolean,
): VenueCertRecord {
  const rec = getCertRecord(skinId);
  rec.checkedGates[gateId] = checked;
  rec.updatedAt = Date.now();
  certStore.set(skinId, rec);
  return rec;
}

export function setCertStatus(
  skinId: string,
  status: VenueCertStatus,
): VenueCertRecord {
  const rec = getCertRecord(skinId);
  // PRODUCTION requires all gates + CERTIFIED first
  if (status === "PRODUCTION") {
    const allPass = VENUE_CERT_GATES.every((g) => rec.checkedGates[g.id] === true);
    if (!allPass || rec.status === "DRAFT") {
      return rec;
    }
  }
  if (status === "CERTIFIED") {
    const allPass = VENUE_CERT_GATES.every((g) => rec.checkedGates[g.id] === true);
    if (!allPass) return rec;
  }
  rec.status = status;
  rec.updatedAt = Date.now();
  certStore.set(skinId, rec);
  return rec;
}

export function certGateProgress(skinId: string): {
  checked: number;
  total: number;
  canCertify: boolean;
} {
  const rec = getCertRecord(skinId);
  const checked = VENUE_CERT_GATES.filter((g) => rec.checkedGates[g.id]).length;
  return {
    checked,
    total: VENUE_CERT_GATES.length,
    canCertify: checked === VENUE_CERT_GATES.length,
  };
}

/** Skins eligible for preview picker — existing registry only. */
export function listPreviewableSkins(): VenueSkin[] {
  return listVenueSkins();
}

export function eventTypeFromPreviewQuery(
  raw: string | null | undefined,
): VenuePreviewEventType {
  const s = (raw ?? "live-show").toLowerCase();
  const allowed: VenuePreviewEventType[] = [
    "concert",
    "battle",
    "cypher",
    "challenge",
    "song-challenge",
    "live-show",
    "monday-stage",
    "deal-or-feud",
    "lounge",
    "world-dance-party",
    "slow-jams",
  ];
  return allowed.find((a) => a === s) ?? "live-show";
}

export { DEFAULT_PREVIEW_CAPACITY };
