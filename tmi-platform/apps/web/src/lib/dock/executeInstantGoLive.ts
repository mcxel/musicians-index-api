/**
 * executeInstantGoLive — shared launch path for Launch Dock + QuickLiveButton + /live/go.
 * Venue/registry first when deferMedia; cam/mic runs on InstantGoLiveStage.
 * Never waits on audience data before routing to empty stage.
 */

"use client";

import {
  materializeLiveRoute,
  resolveLiveDestination,
  type LivePrivacy,
} from "@/lib/live/LiveDestinationRouter";
import { mapLivePrivacyToRegistry } from "@/lib/live/liveRoomPrivacyGate";
import { launchDockStore } from "@/lib/dock/launchDockStore";
import { publishLiveRoom } from "@/lib/discovery/DiscoveryPublisher";

export interface InstantGoLiveResult {
  ok: boolean;
  href?: string;
  roomId?: string;
  error?: string;
}

async function resolveDisplayName(fallback: string): Promise<{ name: string; role: string; userId?: string }> {
  try {
    const sess = await fetch("/api/auth/session", {
      credentials: "include",
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!sess.ok) return { name: fallback, role: "FAN" };
    const data = (await sess.json()) as {
      authenticated?: boolean;
      user?: { id?: string; name?: string; email?: string; role?: string };
    };
    const name =
      data.user?.name ??
      (data.user?.email ? data.user.email.split("@")[0] : undefined) ??
      fallback;
    const role = (data.user?.role ?? "FAN").toUpperCase();
    return { name, role, userId: data.user?.id };
  } catch {
    return { name: fallback, role: "FAN" };
  }
}

export async function executeInstantGoLive(opts?: {
  role?: string;
  privacy?: LivePrivacy;
  preferredExperience?: string;
  displayName?: string;
  accentColor?: string;
  /**
   * When true (default for /live/go), skip getUserMedia here so the venue
   * route paints immediately. Media init runs on InstantGoLiveStage.
   * Dock/QuickLive may pass false to pre-warm devices before navigate.
   */
  deferMedia?: boolean;
  /**
   * When false (hub in-place STAGE / prepare), mint room only — do NOT POST
   * /api/live/go or list on the lobby wall until explicit GO LIVE publish.
   */
  publishSession?: boolean;
  /** Reuse a room already bound on Command Center monitors (one-tap in-place). */
  roomId?: string;
}): Promise<InstantGoLiveResult> {
  launchDockStore.setPhase("launching");

  const dock = launchDockStore.getState();
  const privacy = opts?.privacy ?? dock.privacy;
  const preferredExperience = opts?.preferredExperience ?? dock.preferredExperience;
  const deferMedia = opts?.deferMedia !== false;
  const publishSession = opts?.publishSession !== false;

  // Optional pre-warm only — never block venue open on permission dialog
  if (!deferMedia) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      launchDockStore.setCamReady(true);
      launchDockStore.setMicReady(true);
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      launchDockStore.setCamReady(false);
      launchDockStore.setMicReady(false);
    }
  }

  const identity = await resolveDisplayName(opts?.displayName ?? "Performer");
  const role = (opts?.role ?? dock.role ?? identity.role).toUpperCase();
  launchDockStore.setRole(role);

  const destination = resolveLiveDestination({
    role,
    privacy,
    preferredExperience,
  });

  // Fan / private rehearsal — navigate immediately, no stage room mint required
  if (!destination.route.includes("{roomId}")) {
    launchDockStore.setPhase("idle");
    launchDockStore.close();
    return { ok: true, href: destination.route };
  }

  // Performer stage — mint Daily room when available, register; callers decide navigate vs in-place
  let resolvedRoomId =
    opts?.roomId?.trim() ||
    `room-${identity.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
  let dailyRoomUrl: string | null = null;
  let dailyToken: string | null = null;

  // Hub in-place prepare (deferMedia) must not block on Daily — cert/headless and
  // slow /api/video/rooms were leaving the strip stuck on GOING LIVE with no POST.
  if (!deferMedia) {
    try {
      const roomRes = await fetch("/api/video/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: identity.name }),
        credentials: "include",
        signal: AbortSignal.timeout(8000),
      });
      if (roomRes.ok) {
        const rd = (await roomRes.json()) as { roomId: string; roomUrl: string; token: string };
        resolvedRoomId = rd.roomId;
        dailyRoomUrl = rd.roomUrl;
        dailyToken = rd.token;
      }
    } catch {
      /* registry-only */
    }
  }

  // Publication to GlobalLiveSessionRegistry — ONLY when publishSession is true (explicit GO LIVE).
  if (publishSession) {
    if (!destination.flags.restrictedAudience) {
      try {
        const res = await fetch("/api/live/go", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName: identity.name,
            genre: destination.label,
            category: destination.category,
            eventType: `LIVE_${destination.category.toUpperCase().replace(/-/g, "_")}`,
            roomId: resolvedRoomId,
            accentColor: opts?.accentColor ?? "#FF2DAA",
            privacy: mapLivePrivacyToRegistry(privacy),
            audiencePrivacy: privacy,
            ...(dailyRoomUrl ? { roomUrl: dailyRoomUrl } : {}),
          }),
          credentials: "include",
        });
        if (!res.ok) {
          publishLiveRoom({
            roomId: resolvedRoomId,
            title: `${identity.name} — Live`,
            hostName: identity.name,
            hostUserId: identity.userId ?? "performer-1",
            category: destination.category,
            accentColor: opts?.accentColor ?? "#FF2DAA",
            joinRoute: `/live/rooms/${encodeURIComponent(resolvedRoomId)}?from=live-lobby-wall`,
          });
        }
      } catch {
        publishLiveRoom({
          roomId: resolvedRoomId,
          title: `${identity.name} — Live`,
          hostName: identity.name,
          hostUserId: identity.userId ?? "performer-1",
          category: destination.category,
          accentColor: opts?.accentColor ?? "#FF2DAA",
          joinRoute: `/live/rooms/${encodeURIComponent(resolvedRoomId)}?from=live-lobby-wall`,
        });
      }
    } else {
      try {
        await fetch("/api/live/go", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName: identity.name,
            genre: destination.label,
            category: destination.category,
            eventType: `LIVE_${destination.category.toUpperCase().replace(/-/g, "_")}`,
            roomId: resolvedRoomId,
            accentColor: opts?.accentColor ?? "#AA2DFF",
            privacy: mapLivePrivacyToRegistry(privacy),
            audiencePrivacy: privacy,
            listed: false,
            ...(dailyRoomUrl ? { roomUrl: dailyRoomUrl } : {}),
          }),
          credentials: "include",
        });
      } catch {
        /* private stage still opens */
      }
    }
  }

  const params = new URLSearchParams();
  if (dailyRoomUrl) params.set("roomUrl", dailyRoomUrl);
  if (dailyToken) params.set("token", dailyToken);
  // Signal stage to run parallel media init
  params.set("media", "init");

  let href = materializeLiveRoute(destination, resolvedRoomId);
  if ([...params.keys()].length > 0) {
    href += (href.includes("?") ? "&" : "?") + params.toString();
  }

  launchDockStore.setPhase("idle");
  launchDockStore.close();
  return { ok: true, href, roomId: resolvedRoomId };
}

/** Registry publish only — call after hub stage is bound (explicit GO LIVE). */
export async function publishInstantGoLiveSession(opts: {
  roomId: string;
  role?: string;
  privacy?: LivePrivacy;
  preferredExperience?: string;
  displayName?: string;
  accentColor?: string;
}): Promise<InstantGoLiveResult> {
  const identity = await resolveDisplayName(opts.displayName ?? "Performer");
  const role = (opts.role ?? "PERFORMER").toUpperCase();
  const privacy = opts.privacy ?? launchDockStore.getState().privacy ?? "public";
  const destination = resolveLiveDestination({
    role,
    privacy,
    preferredExperience: opts.preferredExperience ?? "live",
  });

  try {
    const registryPrivacy = mapLivePrivacyToRegistry(privacy);
    const res = await fetch("/api/live/go", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: identity.name,
        genre: destination.label,
        category: destination.category,
        eventType: `LIVE_${destination.category.toUpperCase().replace(/-/g, "_")}`,
        roomId: opts.roomId,
        accentColor: opts.accentColor ?? "#FF2DAA",
        privacy: registryPrivacy,
        audiencePrivacy: privacy,
        listed: !destination.flags.restrictedAudience && registryPrivacy === "PUBLIC",
      }),
      credentials: "include",
      signal: AbortSignal.timeout(90000),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string; code?: string };
      return {
        ok: false,
        error: `Publish failed (${res.status}${body.code ? ` ${body.code}` : ""}): ${body.error ?? body.message ?? "registry"}`,
      };
    }
    return { ok: true, roomId: opts.roomId, href: `/live/rooms/${encodeURIComponent(opts.roomId)}` };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? `Network error publishing live session: ${err.message}` : "Network error publishing live session.",
    };
  }
}
