/**
 * ExternalBroadcastDistributor — fan-out to external destinations from the
 * existing TMI live pipeline. Failures never block TMI. Never restarts camera/venue/roomId.
 */

"use client";

import {
  getBroadcastDestination,
  getBroadcastDestinations,
  patchBroadcastDestination,
  replaceBroadcastDestinations,
  setDestinationConnectionStatus,
  ensureBroadcastDestinationSeed,
} from "./BroadcastDestinationRegistry";
import type { BroadcastProvider } from "./BroadcastDestinationTypes";

let activeRoomId: string | null = null;

export function getActiveExternalBroadcastRoomId(): string | null {
  return activeRoomId;
}

export function setActiveExternalBroadcastRoomId(roomId: string | null): void {
  activeRoomId = roomId;
}

/** Hydrate public destination list from API (no secrets). */
export async function hydrateBroadcastDestinations(userId?: string | null): Promise<void> {
  ensureBroadcastDestinationSeed(userId);
  try {
    const res = await fetch("/api/broadcast/destinations", {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return;
    const data = (await res.json()) as { destinations?: ReturnType<typeof getBroadcastDestinations> };
    if (Array.isArray(data.destinations) && data.destinations.length > 0) {
      replaceBroadcastDestinations(data.destinations);
    }
  } catch {
    /* keep seed */
  }
}

/**
 * Start one destination against the current live room.
 * TMI continues regardless of outcome. ● live only when server reports ingestAck.
 */
export async function startExternalDestination(destinationId: string): Promise<void> {
  const dest = getBroadcastDestination(destinationId);
  if (!dest) return;

  if (dest.authState === "unlinked" || dest.connectionStatus === "locked") {
    setDestinationConnectionStatus(destinationId, "locked", "Link account required");
    return;
  }

  patchBroadcastDestination(destinationId, {
    enabled: true,
    connectionStatus: "connecting",
    statusLine: "Connecting…",
    retryState: { attempts: dest.retryState.attempts, nextRetryAt: null },
  });

  try {
    const res = await fetch("/api/broadcast/destinations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        action: "start",
        destinationId,
        roomId: activeRoomId,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      connectionStatus?: string;
      statusLine?: string;
      ingestAck?: boolean;
      latencyMs?: number | null;
      authState?: string;
    };

    if (!res.ok || !data.ok) {
      const locked = data.authState === "unlinked" || data.connectionStatus === "locked";
      setDestinationConnectionStatus(
        destinationId,
        locked ? "locked" : "error",
        data.statusLine ?? (locked ? "Not linked" : "Destination failed — TMI still live"),
      );
      patchBroadcastDestination(destinationId, { enabled: !locked });
      return;
    }

    // Rule 20: ● live ONLY with verified ingest acknowledgement
    if (data.ingestAck === true && data.connectionStatus === "live") {
      patchBroadcastDestination(destinationId, {
        enabled: true,
        connectionStatus: "live",
        health: "ok",
        latencyMs: typeof data.latencyMs === "number" ? data.latencyMs : null,
        statusLine: data.statusLine ?? "Live (ingest confirmed)",
        retryState: { attempts: 0, nextRetryAt: null },
      });
      return;
    }

    setDestinationConnectionStatus(
      destinationId,
      (data.connectionStatus as "connecting" | "retry" | "error" | "locked") || "connecting",
      data.statusLine ?? "Awaiting ingest acknowledgement",
    );
  } catch {
    setDestinationConnectionStatus(
      destinationId,
      "error",
      "Network error — TMI still live",
    );
  }
}

export async function stopExternalDestination(destinationId: string): Promise<void> {
  const dest = getBroadcastDestination(destinationId);
  if (!dest) return;
  try {
    await fetch("/api/broadcast/destinations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "stop", destinationId }),
    });
  } catch {
    /* local state still clears */
  }
  patchBroadcastDestination(destinationId, {
    enabled: false,
    connectionStatus: dest.authState === "linked" ? "selected_off" : "off",
    health: "unknown",
    statusLine: dest.authState === "linked" ? "Off" : "Not linked",
    latencyMs: null,
  });
}

export async function stopAllExternalDestinations(): Promise<void> {
  const ids = getBroadcastDestinations()
    .filter((d) => d.enabled || d.connectionStatus === "live" || d.connectionStatus === "connecting")
    .map((d) => d.destinationId);
  await Promise.all(ids.map((id) => stopExternalDestination(id)));
  activeRoomId = null;
}

/** Toggle while LIVE — no camera/venue/room restart. */
export async function toggleExternalDestination(destinationId: string): Promise<void> {
  const dest = getBroadcastDestination(destinationId);
  if (!dest) return;
  if (dest.authState === "unlinked") {
    setDestinationConnectionStatus(destinationId, "locked", "Link account required");
    return;
  }
  if (dest.enabled || dest.connectionStatus === "live" || dest.connectionStatus === "connecting") {
    await stopExternalDestination(destinationId);
    return;
  }
  await startExternalDestination(destinationId);
}

export async function requestLinkDestination(provider: BroadcastProvider): Promise<{
  ok: boolean;
  oauthUrl?: string;
  reason?: string;
  locked?: boolean;
}> {
  try {
    const res = await fetch("/api/broadcast/destinations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "link", provider }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      oauthUrl?: string;
      reason?: string;
      destination?: ReturnType<typeof getBroadcastDestination>;
      connectionStatus?: string;
    };
    if (data.destination) {
      patchBroadcastDestination(data.destination.destinationId, data.destination);
    }
    if (!res.ok || !data.ok) {
      return {
        ok: false,
        reason: data.reason ?? "oauth_not_configured",
        locked: true,
      };
    }
    return { ok: true, oauthUrl: data.oauthUrl };
  } catch {
    return { ok: false, reason: "network_error", locked: true };
  }
}
