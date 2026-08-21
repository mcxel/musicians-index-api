/**
 * Hub / dashboard Instant Go Live — stay in the current TMI shell.
 * ONE TAP: camera → Monitor A, venue → Monitor B, publish LiveSession.
 * Never router.push('/live/rooms/…') or '/live/lobby' for the broadcaster.
 */

"use client";

import { executeInstantGoLive, type InstantGoLiveResult } from "@/lib/dock/executeInstantGoLive";
import { launchDockStore } from "@/lib/dock/launchDockStore";
import { useGoLiveTransition } from "@/lib/live/goLiveTransitionStore";
import { requestHubCameraPreview, useLivePrivacyState } from "@/lib/live/livePrivacyState";
import type { LivePrivacy } from "@/lib/live/LiveDestinationRouter";
import {
  DEFAULT_MONITOR_A,
  defaultPersonalMediaRouter,
  registerAndAdaptParticipant,
  type MonitorTarget,
} from "@/lib/personal-media";

function paramFromHref(href: string | undefined, key: string, fallback: string): string {
  if (!href) return fallback;
  try {
    return new URL(href, "https://themusiciansindex.local").searchParams.get(key) ?? fallback;
  } catch {
    return fallback;
  }
}

/** Command Center / hub shells — broadcaster stays on this surface. */
export function shouldPresentGoLiveInPlace(pathname: string | null | undefined): boolean {
  const p = pathname ?? "";
  return (
    p === "/hub" ||
    p.startsWith("/hub/") ||
    p.startsWith("/dashboard") ||
    p.startsWith("/performer") ||
    p.startsWith("/command-center") ||
    p.includes("/hq")
  );
}

function bindMonitorSession(opts: {
  roomId: string;
  href?: string;
  category?: string;
  privacy?: string;
  monitor: MonitorTarget;
}) {
  const identity = registerAndAdaptParticipant({
    participantId: opts.roomId,
    canonicalIdentityId: opts.roomId,
    roomId: opts.roomId,
    displayName: "Live Stage",
  });
  defaultPersonalMediaRouter.assignToMonitor(identity.participantId, opts.monitor);

  useGoLiveTransition.getState().bindInPlace(
    {
      roomId: opts.roomId,
      category: opts.category ?? "live",
      privacy: opts.privacy ?? "public",
      href: opts.href ?? `/live/rooms/${encodeURIComponent(opts.roomId)}`,
    },
    opts.monitor,
  );
  // Broadcaster: no Welcome / Wave / starfield warp takeover
  useGoLiveTransition.getState().clearWarp();
}

/**
 * One-tap in-place GO LIVE.
 * T+0 camera, immediate Monitor A/B bind, parallel registry publish — no route change.
 */
export async function presentInstantGoLiveInPlace(opts?: {
  role?: string;
  privacy?: LivePrivacy;
  preferredExperience?: string;
  monitor?: MonitorTarget;
  /** Reuse room already on monitors / strip. */
  roomId?: string;
  /**
   * Default true for one-tap GO LIVE (publish-first for fan discovery).
   * Pass false only for silent stage-prepare without listing.
   */
  publishSession?: boolean;
}): Promise<InstantGoLiveResult> {
  const monitor = opts?.monitor ?? DEFAULT_MONITOR_A;
  const role = (opts?.role ?? "PERFORMER").toUpperCase();
  const publishSession = opts?.publishSession !== false;
  launchDockStore.setRole(role);

  const existing = useGoLiveTransition.getState().inPlace;
  const privacyState = useLivePrivacyState.getState();
  const roomId =
    opts?.roomId?.trim() ||
    existing?.roomId ||
    privacyState.publishedRoomId ||
    `room-hub-${Date.now()}`;

  // T+0 — getUserMedia immediately (parallel with session mint/publish)
  const camPromise = requestHubCameraPreview();

  // T+immediate — stop idle MNS/Kiara rotation; bind Monitor A camera + Monitor B venue
  bindMonitorSession({
    roomId,
    href: existing?.href,
    category: existing?.category,
    privacy: existing?.privacy ?? opts?.privacy ?? "public",
    monitor,
  });

  if (existing?.roomId && existing.roomId === roomId && privacyState.isLivePublished) {
    const cam = await camPromise;
    return {
      ok: true,
      href: existing.href,
      roomId: existing.roomId,
      error: cam.ok ? undefined : cam.error,
    };
  }

  const result = await executeInstantGoLive({
    role,
    privacy: opts?.privacy,
    preferredExperience: opts?.preferredExperience ?? "live",
    deferMedia: true,
    publishSession,
    roomId,
  });

  if (!result.ok || !result.roomId) {
    useGoLiveTransition.getState().clearWarp();
    return {
      ok: false,
      error: result.error ?? "Stage room did not mint. Staying in this shell — no kick-out.",
    };
  }

  bindMonitorSession({
    roomId: result.roomId,
    href: result.href,
    category: paramFromHref(result.href, "category", "live"),
    privacy: paramFromHref(result.href, "privacy", "public"),
    monitor,
  });

  if (publishSession) {
    useLivePrivacyState.getState().markLivePublished(result.roomId);
  }

  const cam = await camPromise;
  if (!cam.ok && !useLivePrivacyState.getState().previewStream) {
    return {
      ok: true,
      href: result.href,
      roomId: result.roomId,
      error: cam.error ?? "Broadcasting without local camera.",
    };
  }

  return result;
}
