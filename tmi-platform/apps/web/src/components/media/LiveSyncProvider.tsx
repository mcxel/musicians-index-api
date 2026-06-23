"use client";

import { usePathname } from "next/navigation";
import { useLiveSync } from "@/lib/media/useLiveSync";
import { useSceneVisible } from "@/components/magazine/MagazinePageFlipRuntime";

const LIVE_SYNC_ROUTE_PATTERNS = [
  /^\/home\/3(?:\/|$)/,
  /^\/live(?:\/|$)/,
  /^\/go-live(?:\/|$)/,
  /^\/performer\/studio(?:\/|$)/,
  /^\/hub\/fan(?:\/|$)/,
  /^\/fan\/dashboard(?:\/|$)/,
  /^\/admin\/observatory(?:\/|$)/,
];

function ActiveLiveSync() {
  const isVisible = useSceneVisible();
  useLiveSync({ enabled: isVisible });
  return null;
}

/**
 * LiveSyncProvider — invisible background component.
 * Polls /api/live every 4s and keeps LiveStateRegistry current
 * so any TMILiveMediaWidget on the page reflects accurate live state.
 *
 * Respects SceneVisibilityContext — polling pauses when its scene
 * is not the active magazine scene (saves bandwidth + CPU).
 */
export default function LiveSyncProvider() {
  const pathname = usePathname();
  const path = pathname ?? "";
  const shouldPoll = LIVE_SYNC_ROUTE_PATTERNS.some((pattern) => pattern.test(path));

  return shouldPoll ? <ActiveLiveSync /> : null;
}
