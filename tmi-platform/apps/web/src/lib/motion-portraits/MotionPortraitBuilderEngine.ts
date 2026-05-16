import {
  clampPortraitDuration,
  motionPortraitEngine,
  type MotionPortraitAsset,
} from "./MotionPortraitEngine";

export interface MotionPortraitBuildInput {
  entityId: string;
  uploadedVideoUrl?: string;
  uploadedPhotoUrls?: string[];
  liveClipUrls?: string[];
  explicitPosterFrameUrl?: string;
  profileImageUrl?: string;
  fallbackImageUrl?: string;
  preferredDurationMs?: number;
  liveFeedUrl?: string;
  tags?: string[];
}

export interface MotionPortraitBuildResult {
  asset: MotionPortraitAsset;
  strategy: "video-loop" | "live-clip-loop" | "photo-stack" | "fallback-image";
  warnings: string[];
}

export function buildMotionPortrait(input: MotionPortraitBuildInput): MotionPortraitBuildResult {
  const warnings: string[] = [];
  const loopUrl = input.uploadedVideoUrl ?? input.liveClipUrls?.[0];
  const posterFrameUrl =
    input.explicitPosterFrameUrl ??
    input.uploadedPhotoUrls?.[0] ??
    input.profileImageUrl ??
    input.fallbackImageUrl;

  let strategy: MotionPortraitBuildResult["strategy"] = "fallback-image";
  if (input.uploadedVideoUrl) strategy = "video-loop";
  else if (input.liveClipUrls?.length) strategy = "live-clip-loop";
  else if (input.uploadedPhotoUrls?.length) strategy = "photo-stack";

  if (!loopUrl) {
    warnings.push("No motion clip available; using poster/profile fallback.");
  }

  if (!posterFrameUrl) {
    warnings.push("No poster frame supplied; downstream surfaces will fall back to silhouette media.");
  }

  const asset = motionPortraitEngine.register({
    entityId: input.entityId,
    loopUrl,
    posterFrameUrl,
    profileImageUrl: input.profileImageUrl,
    fallbackImageUrl: input.fallbackImageUrl,
    liveFeedUrl: input.liveFeedUrl,
    durationMs: clampPortraitDuration(input.preferredDurationMs),
    liveOverride: Boolean(input.liveFeedUrl),
    tags: input.tags ?? [],
    updatedAt: new Date().toISOString(),
  });

  return { asset, strategy, warnings };
}