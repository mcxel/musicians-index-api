"use client";

import { useLiveSync } from "@/lib/media/useLiveSync";
import { useSceneVisible } from "@/components/magazine/MagazinePageFlipRuntime";

/**
 * LiveSyncProvider — invisible background component.
 * Polls /api/live every 4s and keeps LiveStateRegistry current
 * so any TMILiveMediaWidget on the page reflects accurate live state.
 *
 * Respects SceneVisibilityContext — polling pauses when its scene
 * is not the active magazine scene (saves bandwidth + CPU).
 */
export default function LiveSyncProvider() {
  const isVisible = useSceneVisible();
  useLiveSync({ enabled: isVisible });
  return null;
}
