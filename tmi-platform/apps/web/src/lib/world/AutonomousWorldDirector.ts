/**
 * AutonomousWorldDirector — conductor between LiveSession and venue generators.
 *
 * Flow (locked architecture):
 *   USER ACTION / GO LIVE → Canonical LiveSession → AutonomousWorldDirector
 *     → generator registry → WorldScenePlan → UniversalVenueRenderer → Monitor B
 *
 * Context-driven, NOT prompt-dependent. No manual prompt UI for normal GO LIVE.
 * Status: CODE WIRED / PHYSICAL CERT OPEN (WORLD_DIRECTOR_CERT_STATUS = "OPEN").
 * Not CERTIFIED until PC+phone physical run order PASSes — see LAUNCH_CERTIFICATION_LEDGER.md.
 */

import type { VenueEnvironmentKind } from "@/lib/venues/EventVenueEnvironment";
import type { CanonicalWorldZone } from "@/lib/live/canonicalWorldViewport";
import {
  runAnimationGenerator,
  runEnvironmentGenerator,
  runLightingGenerator,
  runLodGenerator,
  runMaterialGenerator,
  runMotionGenerator,
  runSceneGenerator,
  runSeatingGenerator,
  runSpatialMapGenerator,
  runVenueProfileGenerator,
  runViewModeGenerator,
  resolveCanonicalZone,
  type WorldGeneratorContext,
} from "@/lib/world/WorldGeneratorRegistry";
import {
  WORLD_DIRECTOR_CERT_STATUS,
  type WorldScenePlan,
  type WorldScenePlanSource,
  type WorldViewMode,
} from "@/lib/world/WorldScenePlan";
import { formatTestOccupancyLabel } from "@/lib/venues/VenuePreviewCertification";

export interface LiveSessionWorldContext {
  roomId: string;
  eventType?: string;
  category?: string | null;
  genre?: string | null;
  environment?: VenueEnvironmentKind | null;
  venueSkinId?: string | null;
  performerTier?: string;
  canonicalZone?: CanonicalWorldZone;
  source?: WorldScenePlanSource;
  /** /venue/preview — TEST occupancy only, never published as real viewers. */
  isPreview?: boolean;
  testOccupancyRatio?: number | null;
  testCapacity?: number;
  /** Preview/test override only — GO LIVE selects via runViewModeGenerator. */
  viewMode?: WorldViewMode | null;
}

let planSeq = 0;

function normalizeEventType(ctx: LiveSessionWorldContext): string {
  if (ctx.eventType?.trim()) return ctx.eventType.trim().toLowerCase();
  const cat = (ctx.category ?? "live").toLowerCase();
  if (cat === "battle") return "battle";
  if (cat === "cypher") return "cypher";
  if (cat === "challenge") return "challenge";
  if (cat === "concert" || cat === "release-party") return "concert";
  if (cat === "dance-party" || cat === "world-dance-party") return "world-dance-party";
  if (cat.includes("slow-jam")) return "slow-jams";
  if (cat === "lounge") return "lounge";
  return "live-show";
}

/**
 * Build a deterministic WorldScenePlan from live context.
 * Same inputs → same plan shape (planId varies by timestamp for traceability).
 */
export function buildWorldScenePlan(ctx: LiveSessionWorldContext): WorldScenePlan {
  const eventType = normalizeEventType(ctx);
  const generatorCtx: WorldGeneratorContext = {
    roomId: ctx.roomId,
    eventType,
    category: ctx.category,
    genre: ctx.genre ?? null,
    environment: ctx.environment,
    venueSkinId: ctx.venueSkinId,
    performerTier: ctx.performerTier,
    canonicalZone: ctx.canonicalZone,
    isPreview: ctx.isPreview,
    viewMode: ctx.viewMode,
  };

  const scene = runSceneGenerator(generatorCtx);
  const env = runEnvironmentGenerator(generatorCtx);
  const venueProfile = runVenueProfileGenerator(generatorCtx, env);
  const seatLayout = runSeatingGenerator(generatorCtx, env, venueProfile);
  const materialProfile = runMaterialGenerator(generatorCtx);
  const lightingProfile = runLightingGenerator(generatorCtx, env);
  const animationPolicy = runAnimationGenerator(env);
  const motionPolicy = runMotionGenerator(generatorCtx);
  const lodPolicy = runLodGenerator();
  const viewMode = runViewModeGenerator(generatorCtx, env, venueProfile);
  const spatialMap = runSpatialMapGenerator(venueProfile, seatLayout, env);

  const isPreview = Boolean(ctx.isPreview);
  const testRatio = isPreview ? (ctx.testOccupancyRatio ?? 0) : null;
  const testCap = isPreview ? (ctx.testCapacity ?? seatLayout.capacity) : null;
  const testLabel =
    isPreview && testRatio != null && testCap != null
      ? formatTestOccupancyLabel(Math.round(testCap * testRatio), testCap)
      : null;

  return {
    planId: `wsp-${ctx.roomId}-${++planSeq}`,
    roomId: ctx.roomId,
    eventType,
    genre: ctx.genre ?? null,
    environment: env.environment,
    capacity: seatLayout.capacity,
    venueProfile,
    seatLayout,
    materialProfile,
    lightingProfile,
    crowdPolicy: {
      allowBotFill: false,
      maxBotFillRatio: 0,
      progressiveStadiumFill: false,
      testOccupancy: isPreview,
      testOccupancyRatio: testRatio,
      testCapacity: testCap,
      testLabel,
      fanAvatarsOnly: true,
    },
    animationPolicy,
    motionPolicy,
    lodPolicy,
    viewMode,
    spatialMap,
    canonicalZone: resolveCanonicalZone(generatorCtx),
    sceneInstanceId: scene.sceneInstanceId,
    certification: WORLD_DIRECTOR_CERT_STATUS,
    source: ctx.source ?? (isPreview ? "preview" : "go-live"),
    builtAt: Date.now(),
  };
}

/** Alias for assembly call sites that reference WorldDirector by shorter name. */
export const WorldDirector = {
  buildScenePlan: buildWorldScenePlan,
  certStatus: WORLD_DIRECTOR_CERT_STATUS,
};
