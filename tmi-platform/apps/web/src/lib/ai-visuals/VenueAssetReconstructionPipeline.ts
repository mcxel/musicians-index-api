/**
 * VenueAssetReconstructionPipeline
 * Reconstructs venue visual assets from metadata, scene composition, and AI generation.
 * Integrates VenueSceneEngine + AiVisualCreatorEngine into a single pipeline run.
 */

import { composeVenueScene, type VenueSceneType, type VenueSceneRecord } from "@/lib/ai-visuals/VenueSceneEngine";
import { createAiVisual } from "@/lib/ai-visuals/AiVisualCreatorEngine";
import type { AiGeneratedAssetRecord } from "@/lib/ai-visuals/AiGeneratedAssetRegistry";

export interface VenueReconstructionInput {
  venueId: string;
  venueName: string;
  venueType: VenueSceneType;
  capacity?: number;
  aesthetic?: string;
}

export type VenuePipelineStatus = "pending" | "scene_composed" | "assets_generated" | "complete" | "failed";

export interface VenueReconstructionResult {
  venueId: string;
  status: VenuePipelineStatus;
  scene: VenueSceneRecord | null;
  skinAsset: AiGeneratedAssetRecord | null;
  stageAsset: AiGeneratedAssetRecord | null;
  billlboardAsset: AiGeneratedAssetRecord | null;
  startedAt: number;
  completedAt: number | null;
}

const pipelineStore = new Map<string, VenueReconstructionResult>();

function venueAesthetic(input: VenueReconstructionInput): string {
  const defaults: Record<VenueSceneType, string> = {
    club:         "intimate neon-lit underground club, dark walls, cyan light bars",
    arena:        "massive stadium-scale arena, pyrotechnics, 20,000 crowd",
    "battle-hall": "battle ring with spotlights, TMI branding, aggressive red/gold palette",
    lounge:       "upscale lounge with warm amber lights, VIP seating, jazz fusion",
  };
  return input.aesthetic ?? defaults[input.venueType];
}

export function runVenueReconstruction(input: VenueReconstructionInput): VenueReconstructionResult {
  const existing = pipelineStore.get(input.venueId);
  if (existing?.status === "complete") return existing;

  const result: VenueReconstructionResult = {
    venueId: input.venueId,
    status: "pending",
    scene: null,
    skinAsset: null,
    stageAsset: null,
    billlboardAsset: null,
    startedAt: Date.now(),
    completedAt: null,
  };

  pipelineStore.set(input.venueId, result);

  // Step 1: Compose scene
  const scene = composeVenueScene({
    sceneId: `scene_${input.venueId}`,
    venueId: input.venueId,
    sceneType: input.venueType,
    lightingProfile: input.venueType === "club" ? "neon-low" : input.venueType === "arena" ? "stage-wash" : "warm-ambient",
    stagePreset: `${input.venueType}-default`,
    crowdDensity: input.capacity ? Math.min(1.0, input.capacity / 20000) : 0.6,
    assetSlots: ["skin", "stage-backdrop", "billboard", "floor"],
  });
  result.scene = scene;
  result.status = "scene_composed";

  const aesthetic = venueAesthetic(input);

  // Step 2: Generate visual assets
  result.skinAsset = createAiVisual({
    assetType: "venue-skin",
    subject: `${input.venueName}: ${aesthetic}`,
    ownerSystem: "venue-reconstruction",
    targetRoute: `/venues/${input.venueId}`,
    targetComponent: "VenueBackground",
    style: "tmi-venue-immersive",
    references: [input.venueId],
  });

  result.stageAsset = createAiVisual({
    assetType: "stage-scene",
    subject: `${input.venueName} stage: ${aesthetic}, performance-ready`,
    ownerSystem: "venue-reconstruction",
    targetRoute: `/venues/${input.venueId}`,
    targetComponent: "VenueStage",
    style: "tmi-stage-production",
    references: [input.venueId],
  });

  result.billlboardAsset = createAiVisual({
    assetType: "billboard-scene",
    subject: `${input.venueName} billboard: ${aesthetic}, TMI branding`,
    ownerSystem: "venue-reconstruction",
    targetRoute: `/venues/${input.venueId}`,
    targetComponent: "VenueBillboard",
    style: "tmi-billboard",
    references: [input.venueId],
  });

  result.status = "complete";
  result.completedAt = Date.now();
  pipelineStore.set(input.venueId, result);
  return result;
}

export function getVenueReconstructionResult(venueId: string): VenueReconstructionResult | null {
  return pipelineStore.get(venueId) ?? null;
}

export function getAllVenueReconstructionResults(): VenueReconstructionResult[] {
  return [...pipelineStore.values()];
}
