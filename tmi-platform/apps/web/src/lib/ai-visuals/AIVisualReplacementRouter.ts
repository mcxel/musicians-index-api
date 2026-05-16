/**
 * AIVisualReplacementRouter
 * Routes visual replacement requests to the correct specialist engine.
 * Single entry point — no consumer needs to know which engine handles what.
 */

import { generateAvatarAsset } from "@/lib/ai-visuals/AvatarAssetGenerationEngine";
import { resolveMagazineSlot, registerMagazineSlot } from "@/lib/ai-visuals/DynamicMagazineImageResolver";
import { runVenueReconstruction } from "@/lib/ai-visuals/VenueAssetReconstructionPipeline";
import { resolvePerformerPortrait } from "@/lib/ai-visuals/PerformerMotionPortraitEngine";
import { queueImageForReplacement } from "@/lib/ai-visuals/GlobalImageReplacementEngine";

export type ReplacementEntityType =
  | "avatar"
  | "artist"
  | "performer"
  | "host"
  | "venue"
  | "magazine-slot"
  | "sponsor"
  | "battle-card"
  | "billboard"
  | "homepage-orbit"
  | "lobby-display"
  | "generic";

export interface VisualReplacementRequest {
  entityId: string;
  entityType: ReplacementEntityType;
  displayName: string;
  sourceRoute: string;
  targetSlot: string;
  context?: string;
  meta?: Record<string, string>;
}

export interface VisualReplacementOutcome {
  entityId: string;
  entityType: ReplacementEntityType;
  routed: boolean;
  handler: string;
  jobId: string | null;
  timestamp: number;
}

const AVATAR_TYPES: ReplacementEntityType[] = ["avatar"];
const PERFORMER_TYPES: ReplacementEntityType[] = ["artist", "performer", "host"];
const VENUE_TYPES: ReplacementEntityType[] = ["venue"];
const MAGAZINE_TYPES: ReplacementEntityType[] = ["magazine-slot"];

export function routeVisualReplacement(req: VisualReplacementRequest): VisualReplacementOutcome {
  const timestamp = Date.now();

  if (AVATAR_TYPES.includes(req.entityType)) {
    const result = generateAvatarAsset({
      avatarId: req.entityId,
      displayName: req.displayName,
      targetRoute: req.sourceRoute,
      targetComponent: req.targetSlot,
    });
    return { entityId: req.entityId, entityType: req.entityType, routed: true, handler: "AvatarAssetGenerationEngine", jobId: result.referenceAsset.assetId, timestamp };
  }

  if (PERFORMER_TYPES.includes(req.entityType)) {
    const result = resolvePerformerPortrait({
      performerId: req.entityId,
      displayName: req.displayName,
      kind: req.entityType === "host" ? "host" : "artist",
      genre: req.meta?.genre,
    });
    return { entityId: req.entityId, entityType: req.entityType, routed: true, handler: "PerformerMotionPortraitEngine", jobId: result.performerId, timestamp };
  }

  if (VENUE_TYPES.includes(req.entityType)) {
    const result = runVenueReconstruction({
      venueId: req.entityId,
      venueName: req.displayName,
      venueType: (req.meta?.venueType as "club" | "arena" | "battle-hall" | "lounge") ?? "club",
      aesthetic: req.context,
    });
    return { entityId: req.entityId, entityType: req.entityType, routed: true, handler: "VenueAssetReconstructionPipeline", jobId: result.skinAsset?.assetId ?? null, timestamp };
  }

  if (MAGAZINE_TYPES.includes(req.entityType)) {
    const slotId = `${req.entityId}_${req.targetSlot}`;
    registerMagazineSlot({
      slotId,
      slotType: (req.meta?.slotType as "cover" | "spread" | "article-hero") ?? "article-hero",
      issueId: req.meta?.issueId ?? "issue-1",
      pageNumber: parseInt(req.meta?.pageNumber ?? "1", 10),
      context: req.context ?? req.displayName,
    });
    const resolved = resolveMagazineSlot(slotId);
    return { entityId: req.entityId, entityType: req.entityType, routed: true, handler: "DynamicMagazineImageResolver", jobId: resolved?.asset?.assetId ?? null, timestamp };
  }

  // Generic fallback — queue via GlobalImageReplacementEngine
  const jobId = queueImageForReplacement({
    originalImageId: `placeholder_${req.entityId}`,
    replacementType: "ai-generated",
    sourceRoute: req.sourceRoute,
    targetSlot: req.targetSlot,
    entityId: req.entityId,
    entityType: req.entityType === "generic" ? "generic" : "artist",
  });

  return { entityId: req.entityId, entityType: req.entityType, routed: true, handler: "GlobalImageReplacementEngine", jobId, timestamp };
}

export function bulkRouteReplacements(requests: VisualReplacementRequest[]): VisualReplacementOutcome[] {
  return requests.map(r => routeVisualReplacement(r));
}
