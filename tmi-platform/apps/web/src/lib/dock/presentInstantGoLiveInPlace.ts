/**
 * Hub / dashboard Instant Go Live — stay in the current TMI shell.
 * ONE TAP: camera → Monitor A, venue → Monitor B, publish LiveSession.
 * Never router.push('/live/rooms/…') or '/live/lobby' for the broadcaster.
 */

"use client";

import { executeInstantGoLive, type InstantGoLiveResult } from "@/lib/dock/executeInstantGoLive";
import { launchDockStore } from "@/lib/dock/launchDockStore";
import { useGoLiveTransition } from "@/lib/live/goLiveTransitionStore";
import {
  mediaErrorToBootstrapCode,
  useGoLiveBootstrapStore,
} from "@/lib/live/goLiveBootstrapStore";
import { requestHubCameraPreview, useLivePrivacyState } from "@/lib/live/livePrivacyState";
import { openCurtainForInstantGoLive } from "@/lib/live/StageLifecycleEngine";
import { useMediaTransitionDirector } from "@/lib/live/MediaTransitionDirector";
import { TRANSITION_CODES } from "@/lib/live/mediaTransitionHealthCodes";
import type { LivePrivacy } from "@/lib/live/LiveDestinationRouter";
import { admitGoLive } from "@/lib/live/goLiveAdmitGate";
import {
  DEFAULT_MONITOR_A,
  defaultPersonalMediaRouter,
  registerAndAdaptParticipant,
  type MonitorTarget,
} from "@/lib/personal-media";
import { useWorldScenePlanStore } from "@/lib/world/worldScenePlanStore";
import { useCanonicalMediaPlayerRuntime } from "@/lib/media/canonicalMediaPlayerRuntime";
import { recordFunctionInvocation } from "@/registries/shell/FunctionHealthRegistry";

function paramFromHref(href: string | undefined, key: string, fallback: string): string {
  if (!href) return fallback;
  try {
    return new URL(href, "https://themusiciansindex.local").searchParams.get(key) ?? fallback;
  } catch {
    return fallback;
  }
}

/** Session flag: off-hub GO LIVE taps route to hub then fire in-place once. */
export const PENDING_GO_LIVE_KEY = "tmi_pending_golive";

/** Command Center / hub shells — broadcaster stays on this surface. */
export function shouldPresentGoLiveInPlace(pathname: string | null | undefined): boolean {
  const p = pathname ?? "";
  return (
    p === "/hub" ||
    p.startsWith("/hub/") ||
    p.startsWith("/dashboard") ||
    p.startsWith("/performer") ||
    p.startsWith("/performers/") ||
    p.startsWith("/command-center") ||
    p.includes("/hq")
  );
}

/** Parse roomId from mini-event join URLs (/live/rooms/{id}…). */
export function extractRoomIdFromJoinUrl(joinUrl: string): string | null {
  const trimmed = joinUrl.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/\/live\/rooms\/([^/?#]+)/i);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function hubPathForRole(role: string): string {
  return role === "FAN" ? "/hub/fan" : "/hub/performer";
}

/**
 * Canonical GO LIVE for any surface — in-place on hub/dashboard shells;
 * otherwise one redirect to hub + automatic in-place launch (no /live/rooms hop).
 */
export async function triggerCanonicalGoLive(opts?: {
  role?: string;
  privacy?: LivePrivacy;
  preferredExperience?: string;
  monitor?: MonitorTarget;
  roomId?: string;
  publishSession?: boolean;
}): Promise<InstantGoLiveResult> {
  const role = (opts?.role ?? "PERFORMER").toUpperCase();
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";

  if (shouldPresentGoLiveInPlace(pathname)) {
    return presentInstantGoLiveInPlace({ ...opts, role });
  }

  try {
    sessionStorage.setItem(
      PENDING_GO_LIVE_KEY,
      JSON.stringify({
        role,
        privacy: opts?.privacy,
        preferredExperience: opts?.preferredExperience ?? "live",
        roomId: opts?.roomId,
        publishSession: opts?.publishSession ?? true,
      }),
    );
  } catch {
    /* sessionStorage blocked — hub query fallback */
  }

  const hub = hubPathForRole(role);
  window.location.replace(`${hub}?golive=1`);
  return { ok: true };
}

/** Mini events (battle/cypher/challenge/concert) — bind in-place when roomId is known. */
export async function presentMiniEventInPlace(opts: {
  joinUrl: string;
  preferredExperience: string;
  role?: string;
  roomId?: string;
  publishSession?: boolean;
}): Promise<InstantGoLiveResult> {
  const roomId =
    opts.roomId?.trim() ||
    extractRoomIdFromJoinUrl(opts.joinUrl) ||
    undefined;

  if (!roomId) {
    return triggerCanonicalGoLive({
      role: opts.role ?? "PERFORMER",
      preferredExperience: opts.preferredExperience,
      publishSession: opts.publishSession,
    });
  }

  return triggerCanonicalGoLive({
    role: opts.role ?? "PERFORMER",
    preferredExperience: opts.preferredExperience,
    roomId,
    publishSession: opts.publishSession ?? true,
  });
}

function bindMonitorSession(opts: {
  roomId: string;
  href?: string;
  category?: string;
  privacy?: string;
  monitor: MonitorTarget;
  roomUrl?: string | null;
  venueEnvironment?: "indoor" | "outdoor" | null;
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
      roomUrl: opts.roomUrl ?? null,
      venueEnvironment: opts.venueEnvironment ?? "indoor",
    },
    opts.monitor,
  );
  // Broadcaster: no Welcome / Wave / starfield warp takeover
  useGoLiveTransition.getState().clearWarp();
}

/** Wire Canonical Media Bus (constitution #8) — frame layout only; does not rewrite WebRTC. */
function bindCanonicalMediaBus(roomId: string) {
  const media = useCanonicalMediaPlayerRuntime.getState();
  media.setRoomId(roomId);
  media.assignSource("a", "SELF_CAMERA");
  media.assignSource("b", "VENUE_VIEW");
  media.setLayout("SPLIT_2");
  media.setPrimaryAudio("a");
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
  const privacy = opts?.privacy ?? "public";
  launchDockStore.setRole(role);
  const boot = useGoLiveBootstrapStore.getState();

  const admit = admitGoLive({
    authenticated: true,
    role,
    privacy,
    listed: publishSession && privacy === "public",
  });
  if (!admit.allowed) {
    useMediaTransitionDirector.getState().cancelStarburst(
      TRANSITION_CODES.UNAUTHORIZED,
      admit.reason ?? "GO LIVE not authorized.",
    );
    recordFunctionInvocation("presentInstantGoLiveInPlace", false);
    return {
      ok: false,
      error: admit.reason,
    };
  }

  useMediaTransitionDirector.getState().reset();
  useMediaTransitionDirector.getState().markAuthorized();

  const existing = useGoLiveTransition.getState().inPlace;
  const privacyState = useLivePrivacyState.getState();
  const roomId =
    opts?.roomId?.trim() ||
    existing?.roomId ||
    privacyState.publishedRoomId ||
    `room-hub-${Date.now()}`;

  // Bootstrap: IDLE → REQUESTING_MEDIA (self preview ASAP when track exists)
  boot.begin(roomId);

  const mediaDirector = useMediaTransitionDirector.getState();

  // T+0 — getUserMedia immediately (parallel with session mint/publish)
  const camPromise = requestHubCameraPreview().then((cam) => {
    if (cam.ok) {
      useGoLiveBootstrapStore.getState().markSelfPreview(true);
    }
    return cam;
  });

  // Do NOT bind monitors or starburst until room mint succeeds (below).
  bindCanonicalMediaBus(roomId);

  if (existing?.roomId && existing.roomId === roomId && privacyState.isLivePublished) {
    mediaDirector.resolveRoom(roomId);
    bindMonitorSession({
      roomId,
      href: existing.href,
      category: existing.category,
      privacy: existing.privacy,
      monitor,
    });
    boot.setPhase("VENUE_LOADING");
    mediaDirector.markMediaTransitionReady();
    mediaDirector.requestStarburst();
    useWorldScenePlanStore.getState().buildAndStore({
      roomId,
      category: existing.category,
      source: "session-resume",
    });
    boot.setPhase("HUD_MOUNTING");
    const cam = await camPromise;
    if (cam.ok) boot.markSelfPreview(true);
    boot.markVenueReady(true);
    boot.markHudReady(true);
    boot.ready();
    mediaDirector.completeStarburst();
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    openCurtainForInstantGoLive({ reducedMotion });
    recordFunctionInvocation("presentInstantGoLiveInPlace", true);
    return {
      ok: true,
      href: existing.href,
      roomId: existing.roomId,
      error: cam.ok ? undefined : cam.error,
    };
  }

  boot.setPhase("SESSION_CREATED");
  boot.setSession(roomId);

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
    mediaDirector.failLaunch(result.error ?? "Stage room did not mint.");
    boot.fail("SESSION_MINT_FAILED", result.error ?? "Stage room did not mint.");
    recordFunctionInvocation("presentInstantGoLiveInPlace", false);
    return {
      ok: false,
      error: result.error ?? "Stage room did not mint. Staying in this shell — no kick-out.",
    };
  }

  boot.setPhase("VENUE_RESOLVING");
  const category = paramFromHref(result.href, "category", "live");
  const roomUrl = paramFromHref(result.href, "roomUrl", "") || null;

  mediaDirector.resolveRoom(result.roomId);
  bindMonitorSession({
    roomId: result.roomId,
    href: result.href,
    category,
    privacy: paramFromHref(result.href, "privacy", "public"),
    monitor,
    roomUrl,
    venueEnvironment: "indoor",
  });

  bindCanonicalMediaBus(result.roomId);
  boot.setSession(result.roomId);
  boot.setPhase("VENUE_LOADING");
  mediaDirector.markMediaTransitionReady();
  mediaDirector.requestStarburst();

  useWorldScenePlanStore.getState().buildAndStore({
    roomId: result.roomId,
    category,
    eventType: opts?.preferredExperience ?? "live-show",
    environment: "indoor",
    source: "go-live",
  });

  // Curtain open deferred until READY below — do not open early
  boot.setPhase("HUD_MOUNTING");

  if (publishSession) {
    useLivePrivacyState.getState().markLivePublished(result.roomId);
  }

  const cam = await camPromise;
  if (cam.ok) {
    boot.markSelfPreview(true);
    useLivePrivacyState.getState().syncPreviewTracks();
  } else if (!useLivePrivacyState.getState().previewStream) {
    boot.markSelfPreview(false);
    // Session still READY — honest media warning, not hard fail of live
    boot.markVenueReady(true);
    boot.markHudReady(true);
    boot.ready();
    mediaDirector.completeStarburst();
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    openCurtainForInstantGoLive({ reducedMotion });
    recordFunctionInvocation("presentInstantGoLiveInPlace", true);
    return {
      ok: true,
      href: result.href,
      roomId: result.roomId,
      error: cam.error ?? "Broadcasting without local camera.",
    };
  }

  if (!cam.ok && cam.error) {
    // Soft warn — do not flip whole session to ERROR if stream already present
    void mediaErrorToBootstrapCode(cam.error);
  }

  boot.markVenueReady(true);
  boot.markHudReady(true);
  boot.ready();
  mediaDirector.completeStarburst();
  {
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    openCurtainForInstantGoLive({ reducedMotion });
  }
  recordFunctionInvocation("presentInstantGoLiveInPlace", true);
  return result;
}
