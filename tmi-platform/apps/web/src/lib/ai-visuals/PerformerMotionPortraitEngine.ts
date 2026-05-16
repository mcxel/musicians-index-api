/**
 * PerformerMotionPortraitEngine
 * Coordinator for resolving motion portraits for any performer entity.
 * Wraps lib/motion-portraits/MotionPortraitEngine with performer-specific logic.
 */

import { motionPortraitEngine, type MotionPortraitResolution } from "@/lib/motion-portraits";
import { createAiVisual } from "@/lib/ai-visuals/AiVisualCreatorEngine";

export type PerformerKind = "artist" | "host" | "avatar" | "dj" | "mc" | "battle-contestant";

export interface PerformerPortraitRequest {
  performerId: string;
  displayName: string;
  kind: PerformerKind;
  genre?: string;
  loopUrl?: string;
  posterFrameUrl?: string;
  profileImageUrl?: string;
}

export interface PerformerPortraitResult {
  performerId: string;
  kind: PerformerKind;
  resolution: MotionPortraitResolution;
  generatedFallback: boolean;
}

const portraitCache = new Map<string, PerformerPortraitResult>();

export function resolvePerformerPortrait(req: PerformerPortraitRequest): PerformerPortraitResult {
  const cached = portraitCache.get(req.performerId);
  if (cached) return cached;

  // Register with motion portrait engine if we have source material
  if (req.loopUrl || req.posterFrameUrl || req.profileImageUrl) {
    motionPortraitEngine.register({
      entityId: req.performerId,
      loopUrl: req.loopUrl,
      posterFrameUrl: req.posterFrameUrl,
      profileImageUrl: req.profileImageUrl,
      fallbackImageUrl: undefined,
      liveFeedUrl: undefined,
      durationMs: 4000,
      liveOverride: false,
      tags: [req.kind, req.genre ?? "unknown", "performer"],
      updatedAt: new Date().toISOString(),
    });
  }

  const resolution = motionPortraitEngine.resolve(req.performerId);
  let generatedFallback = false;

  // If no source material, generate AI fallback
  if (resolution.status === "missing") {
    const subject = `${req.displayName}, ${req.kind}${req.genre ? `, ${req.genre}` : ""}, TMI performer portrait`;
    createAiVisual({
      assetType: "poster",
      subject,
      ownerSystem: "performer-motion-portrait",
      targetRoute: `/performers/${req.performerId}`,
      targetComponent: "PerformerPortrait",
      style: "tmi-motion-portrait",
      references: [req.performerId],
    });
    generatedFallback = true;
  }

  const result: PerformerPortraitResult = { performerId: req.performerId, kind: req.kind, resolution, generatedFallback };
  portraitCache.set(req.performerId, result);
  return result;
}

export function bulkResolvePerformerPortraits(requests: PerformerPortraitRequest[]): PerformerPortraitResult[] {
  return requests.map(r => resolvePerformerPortrait(r));
}

export function invalidatePortraitCache(performerId: string): void {
  portraitCache.delete(performerId);
}

export function getPortraitCoverageStats(): { total: number; live: number; ready: number; fallback: number; missing: number } {
  let live = 0, ready = 0, fallback = 0, missing = 0;
  for (const r of portraitCache.values()) {
    const s = r.resolution.status;
    if (s === "live") live++;
    else if (s === "ready") ready++;
    else if (s === "fallback") fallback++;
    else missing++;
  }
  return { total: portraitCache.size, live, ready, fallback, missing };
}
