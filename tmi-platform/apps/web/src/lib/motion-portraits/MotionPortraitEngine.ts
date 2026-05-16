export type MotionPortraitSourceKind =
  | "live-feed"
  | "motion-portrait"
  | "profile-image"
  | "fallback-silhouette"
  | "missing";

export interface MotionPortraitAsset {
  entityId: string;
  loopUrl?: string;
  posterFrameUrl?: string;
  profileImageUrl?: string;
  fallbackImageUrl?: string;
  liveFeedUrl?: string;
  durationMs: number;
  liveOverride: boolean;
  tags: string[];
  updatedAt: string;
}

export interface MotionPortraitResolution {
  entityId: string;
  sourceKind: MotionPortraitSourceKind;
  mediaUrl: string;
  posterFrameUrl: string;
  durationMs: number;
  status: "live" | "ready" | "fallback" | "missing";
  canRender: boolean;
}

const MIN_PORTRAIT_DURATION_MS = 3000;
const MAX_PORTRAIT_DURATION_MS = 6000;

export function clampPortraitDuration(durationMs = 4000): number {
  return Math.max(MIN_PORTRAIT_DURATION_MS, Math.min(MAX_PORTRAIT_DURATION_MS, durationMs));
}

class MotionPortraitEngine {
  private registry = new Map<string, MotionPortraitAsset>();

  register(asset: MotionPortraitAsset): MotionPortraitAsset {
    const normalized: MotionPortraitAsset = {
      ...asset,
      durationMs: clampPortraitDuration(asset.durationMs),
      updatedAt: asset.updatedAt || new Date().toISOString(),
      tags: asset.tags ?? [],
    };
    this.registry.set(normalized.entityId, normalized);
    return normalized;
  }

  get(entityId: string): MotionPortraitAsset | null {
    return this.registry.get(entityId) ?? null;
  }

  resolve(
    entityId: string,
    options: {
      liveFeedUrl?: string;
      profileImageUrl?: string;
      fallbackImageUrl?: string;
    } = {},
  ): MotionPortraitResolution {
    const asset = this.registry.get(entityId);
    const fallbackImageUrl =
      options.fallbackImageUrl ??
      asset?.fallbackImageUrl ??
      "/tmi-curated/host-main.png";
    const profileImageUrl = options.profileImageUrl ?? asset?.profileImageUrl ?? fallbackImageUrl;
    const posterFrameUrl = asset?.posterFrameUrl ?? profileImageUrl ?? fallbackImageUrl;

    if (options.liveFeedUrl || (asset?.liveOverride && asset.liveFeedUrl)) {
      const mediaUrl = options.liveFeedUrl ?? asset?.liveFeedUrl ?? "";
      return {
        entityId,
        sourceKind: mediaUrl ? "live-feed" : "missing",
        mediaUrl,
        posterFrameUrl,
        durationMs: clampPortraitDuration(asset?.durationMs),
        status: mediaUrl ? "live" : "missing",
        canRender: Boolean(mediaUrl && posterFrameUrl),
      };
    }

    if (asset?.loopUrl) {
      return {
        entityId,
        sourceKind: "motion-portrait",
        mediaUrl: asset.loopUrl,
        posterFrameUrl,
        durationMs: clampPortraitDuration(asset.durationMs),
        status: "ready",
        canRender: Boolean(asset.loopUrl && posterFrameUrl),
      };
    }

    if (profileImageUrl) {
      return {
        entityId,
        sourceKind: asset?.profileImageUrl || options.profileImageUrl ? "profile-image" : "fallback-silhouette",
        mediaUrl: profileImageUrl,
        posterFrameUrl: profileImageUrl,
        durationMs: clampPortraitDuration(asset?.durationMs),
        status: asset?.profileImageUrl || options.profileImageUrl ? "ready" : "fallback",
        canRender: true,
      };
    }

    return {
      entityId,
      sourceKind: "missing",
      mediaUrl: "",
      posterFrameUrl: "",
      durationMs: clampPortraitDuration(asset?.durationMs),
      status: "missing",
      canRender: false,
    };
  }
}

export const motionPortraitEngine = new MotionPortraitEngine();