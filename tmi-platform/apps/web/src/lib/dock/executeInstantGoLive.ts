/**
 * executeInstantGoLive — shared launch path for Launch Dock + QuickLiveButton + /live/go.
 * Venue/registry first when deferMedia; cam/mic runs on InstantGoLiveStage.
 * Never waits on audience data before routing to empty stage.
 */

"use client";

import {
  materializeLiveRoute,
  resolveLiveDestination,
  normalizeRole,
  toLiveParticipantRole,
  type LivePrivacy,
} from "@/lib/live/LiveDestinationRouter";
import { resolveRoleEntry, type RoleEntry } from "@/lib/live/RoleEntryMap";
import { roomIdFromJoinRoute } from "@/lib/live/canonicalWorldViewport";
import { mapLivePrivacyToRegistry } from "@/lib/live/liveRoomPrivacyGate";
import { launchDockStore } from "@/lib/dock/launchDockStore";
import { publishLiveRoom, unpublishLiveRoom, liveSessionToDiscoveryRecord } from "@/lib/discovery/DiscoveryPublisher";
import { DiscoveryBus } from "@/lib/discovery/DiscoveryBus";
import { recordFunctionInvocation } from "@/registries/shell/FunctionHealthRegistry";
import { TelemetryTransportGovernor } from "@/lib/analytics/TelemetryTransportGovernor";

export interface InstantGoLiveResult {
  ok: boolean;
  href?: string;
  roomId?: string;
  error?: string;
  /** True only after POST /api/live/go succeeded (or private unlisted path accepted). */
  published?: boolean;
  /** Canonical role entry for this session — same roomId/liveSessionId as every other role. */
  roleEntry?: RoleEntry;
}

async function resolveDisplayName(fallback: string): Promise<{
  name: string;
  role: string;
  userId?: string;
  authenticated: boolean;
}> {
  try {
    const sess = await fetch("/api/auth/session", {
      credentials: "include",
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!sess.ok) return { name: fallback, role: "FAN", authenticated: false };
    const data = (await sess.json()) as {
      authenticated?: boolean;
      user?: { id?: string; name?: string; email?: string; role?: string };
    };
    if (!data.authenticated || !data.user?.id) {
      return { name: fallback, role: "FAN", authenticated: false };
    }
    const name =
      data.user?.name ??
      (data.user?.email ? data.user.email.split("@")[0] : undefined) ??
      fallback;
    const role = (data.user?.role ?? "FAN").toUpperCase();
    return { name, role, userId: data.user.id, authenticated: true };
  } catch {
    return { name: fallback, role: "FAN", authenticated: false };
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
  // Free sockets before session/cam/publish work begins.
  TelemetryTransportGovernor.pause(25000);

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

  // Hard-block only when we are not publishing and have no session.
  // For publishSession, POST /api/live/go is the authoritative auth check —
  // client session polls often time out under hub telemetry load while cookies
  // are still valid (browser cert: page session OK, then GO LIVE probe fails).
  if ((!identity.authenticated || !identity.userId) && !publishSession) {
    launchDockStore.setPhase("idle");
    recordFunctionInvocation("executeInstantGoLive", false);
    return {
      ok: false,
      published: false,
      error: "Authentication required to go live. Sign in with a real Performer session.",
    };
  }

  const effectiveIdentity = {
    name: identity.name || opts?.displayName || "Performer",
    role: identity.role || role,
    userId: identity.userId || "cookie-session",
    authenticated: identity.authenticated,
  };

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
    const staticRoomId = roomIdFromJoinRoute(destination.route);
    const roleEntry = staticRoomId
      ? resolveRoleEntry(
          toLiveParticipantRole(normalizeRole(role)),
          staticRoomId,
          staticRoomId,
          privacy !== "public",
        )
      : undefined;
    return {
      ok: true,
      published: false,
      href: destination.route,
      roomId: staticRoomId ?? undefined,
      roleEntry,
    };
  }

  // Performer stage — mint Daily room when available, register; callers decide navigate vs in-place
  let resolvedRoomId =
    opts?.roomId?.trim() ||
    `room-${effectiveIdentity.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
  let dailyRoomUrl: string | null = null;
  let dailyToken: string | null = null;

  // Hub in-place prepare (deferMedia) must not block on Daily — and PUBLIC
  // publish must not wait on Daily either: registry POST is the product gate.
  // Daily mint remains for non-deferred (navigate) launches only.
  if (!deferMedia) {
    try {
      const roomRes = await fetch("/api/video/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: effectiveIdentity.name }),
        credentials: "include",
        signal: AbortSignal.timeout(8000),
      });
      if (roomRes.ok) {
        const rd = (await roomRes.json()) as { roomId: string; roomUrl: string; token: string };
        // Prefer Daily room id only when we did not already bind a hub roomId
        if (!opts?.roomId?.trim()) {
          resolvedRoomId = rd.roomId;
        }
        dailyRoomUrl = rd.roomUrl;
        dailyToken = rd.token;
      }
    } catch {
      /* registry-only / local camera still works — honest without Daily */
    }
  }

  // Publication to GlobalLiveSessionRegistry — ONLY when publishSession is true (explicit GO LIVE).
  // isLivePublished / DiscoveryBus listing require a real POST /api/live/go success — no fake green light.
  let published = false;
  if (publishSession) {
    if (!destination.flags.restrictedAudience) {
      const hubRole = role === "FAN" ? "fan" : "performer";
      const discoveryInput = {
        roomId: resolvedRoomId,
        title: `${effectiveIdentity.name} — Live`,
        hostName: effectiveIdentity.name,
        hostUserId: effectiveIdentity.userId,
        category: destination.category,
        experienceId:
          role === "FAN"
            ? "fan-social-live"
            : preferredExperience ?? destination.category ?? "live",
        accentColor: opts?.accentColor ?? (role === "FAN" ? "#00FF88" : "#FF2DAA"),
        joinRoute: `/hub/${hubRole}?watch=${encodeURIComponent(resolvedRoomId)}&from=live-lobby-wall`,
      };
      try {
        // Free HTTP/1.1 sockets — hub telemetry/session polls otherwise starve publish.
        TelemetryTransportGovernor.pause(20000);
        const res = await fetch("/api/live/go", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName: effectiveIdentity.name,
            genre: destination.label,
            category: destination.category,
            eventType: `LIVE_${destination.category.toUpperCase().replace(/-/g, "_")}`,
            roomId: resolvedRoomId,
            accentColor: opts?.accentColor ?? "#FF2DAA",
            privacy: mapLivePrivacyToRegistry(privacy),
            audiencePrivacy: privacy,
            venueEnvironment: "indoor",
            ...(dailyRoomUrl ? { roomUrl: dailyRoomUrl, previewUrl: dailyRoomUrl } : {}),
          }),
          credentials: "include",
          signal: AbortSignal.timeout(45000),
          // Chromium: prefer this request when connection pool is contested
          ...({ priority: "high" } as RequestInit),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: string;
            message?: string;
            code?: string;
          };
          launchDockStore.setPhase("idle");
          recordFunctionInvocation("executeInstantGoLive", false);
          const authFail = res.status === 401 || /auth/i.test(body.code || "") || /auth/i.test(body.error || "");
          return {
            ok: false,
            published: false,
            roomId: resolvedRoomId,
            error: authFail
              ? "Authentication required to go live. Sign in with a real Performer session."
              : `Publish failed (${res.status}${body.code ? ` ${body.code}` : ""}): ${body.error ?? body.message ?? "Unauthorized or registry reject"}`,
          };
        }
        const data = (await res.json().catch(() => ({}))) as {
          session?: import("@/lib/broadcast/globalLiveSessionStore").LiveSession;
        };
        published = true;
        if (data.session) {
          const rec = liveSessionToDiscoveryRecord(data.session);
          if (rec) DiscoveryBus.upsert(rec);
          else publishLiveRoom(discoveryInput);
        } else {
          publishLiveRoom(discoveryInput);
        }
      } catch (err) {
        launchDockStore.setPhase("idle");
        recordFunctionInvocation("executeInstantGoLive", false);
        return {
          ok: false,
          published: false,
          roomId: resolvedRoomId,
          error:
            err instanceof Error
              ? `Network error publishing live session: ${err.message}`
              : "Network error publishing live session.",
        };
      }
    } else {
      try {
        const res = await fetch("/api/live/go", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName: effectiveIdentity.name,
            genre: destination.label,
            category: destination.category,
            eventType: `LIVE_${destination.category.toUpperCase().replace(/-/g, "_")}`,
            roomId: resolvedRoomId,
            accentColor: opts?.accentColor ?? "#AA2DFF",
            privacy: mapLivePrivacyToRegistry(privacy),
            audiencePrivacy: privacy,
            listed: false,
            venueEnvironment: "indoor",
            ...(dailyRoomUrl ? { roomUrl: dailyRoomUrl, previewUrl: dailyRoomUrl } : {}),
          }),
          credentials: "include",
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: string;
            message?: string;
            code?: string;
          };
          launchDockStore.setPhase("idle");
          recordFunctionInvocation("executeInstantGoLive", false);
          return {
            ok: false,
            published: false,
            roomId: resolvedRoomId,
            error: `Private stage publish failed (${res.status}${body.code ? ` ${body.code}` : ""}): ${body.error ?? body.message ?? "registry"}`,
          };
        }
        published = true;
      } catch (err) {
        launchDockStore.setPhase("idle");
        recordFunctionInvocation("executeInstantGoLive", false);
        return {
          ok: false,
          published: false,
          roomId: resolvedRoomId,
          error:
            err instanceof Error
              ? `Network error publishing private stage: ${err.message}`
              : "Network error publishing private stage.",
        };
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

  const roleEntry = resolveRoleEntry(
    toLiveParticipantRole(normalizeRole(role)),
    resolvedRoomId,
    resolvedRoomId,
    privacy !== "public",
  );

  launchDockStore.setPhase("idle");
  launchDockStore.close();
  recordFunctionInvocation("executeInstantGoLive", true);
  return { ok: true, published, href, roomId: resolvedRoomId, roleEntry };
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
  if (!identity.authenticated || !identity.userId) {
    return {
      ok: false,
      published: false,
      error: "Authentication required to publish live session.",
    };
  }
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
        venueEnvironment: "indoor",
      }),
      credentials: "include",
      signal: AbortSignal.timeout(90000),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string; code?: string };
      return {
        ok: false,
        published: false,
        error: `Publish failed (${res.status}${body.code ? ` ${body.code}` : ""}): ${body.error ?? body.message ?? "registry"}`,
      };
    }
    const data = (await res.json().catch(() => ({}))) as {
      session?: import("@/lib/broadcast/globalLiveSessionStore").LiveSession;
    };
    if (data.session) {
      const rec = liveSessionToDiscoveryRecord(data.session);
      if (rec) DiscoveryBus.upsert(rec);
    } else if (!destination.flags.restrictedAudience) {
      publishLiveRoom({
        roomId: opts.roomId,
        title: `${identity.name} — Live`,
        hostName: identity.name,
        hostUserId: identity.userId,
        category: destination.category,
        accentColor: opts.accentColor ?? "#FF2DAA",
        joinRoute: `/hub/${(opts.role ?? "PERFORMER").toUpperCase() === "FAN" ? "fan" : "performer"}?watch=${encodeURIComponent(opts.roomId)}&from=live-lobby-wall`,
      });
    }
    return { ok: true, published: true, roomId: opts.roomId, href: `/live/rooms/${encodeURIComponent(opts.roomId)}` };
  } catch (err) {
    return {
      ok: false,
      published: false,
      error: err instanceof Error ? `Network error publishing live session: ${err.message}` : "Network error publishing live session.",
    };
  }
}

/** End LiveSession → registry DELETE + DiscoveryBus unpublish (Lobby Wall / Home LIVE NOW). */
export async function endInstantGoLiveSession(roomId?: string | null): Promise<void> {
  const { useLivePrivacyState } = await import("@/lib/live/livePrivacyState");
  const rid = roomId?.trim() || useLivePrivacyState.getState().publishedRoomId;
  try {
    await fetch("/api/live/go", { method: "DELETE", credentials: "include", cache: "no-store" });
  } catch {
    /* local unpublish still required */
  }
  if (rid) unpublishLiveRoom(rid);
  useLivePrivacyState.getState().clearLivePublished();
  // Regular GO LIVE fabric canary teardown (no-op when flag off / no active canary).
  try {
    const { teardownRegularGoLiveCanary } = await import(
      "@/lib/live/canary/regularGoLiveFabricCanary"
    );
    teardownRegularGoLiveCanary({ reason: "end-live" });
  } catch {
    /* canary optional */
  }
  recordFunctionInvocation("endInstantGoLiveSession", true);
  try {
    const { stopAllExternalDestinations } = await import(
      "@/lib/broadcast/ExternalBroadcastDistributor"
    );
    void stopAllExternalDestinations();
  } catch {
    /* distributor optional at boot */
  }
}
