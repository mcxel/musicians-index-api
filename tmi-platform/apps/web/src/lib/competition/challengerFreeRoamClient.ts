"use client";

/**
 * Client bridge for Spectate / Jump Out / Jump Back In / Leave / Rejoin.
 *
 * FINAL QUEUE WITHDRAWAL LAW:
 * - Leave Queue → forfeit immediately once server confirms (never restore prior seat).
 * - Spectate / Jump Out → keep membership; Jump Back In resumes that membership.
 * - Rejoin after leave/elimination → new tail entry only.
 *
 * Attempts Claude's durable `/api/live/challenger-queue` when present.
 * Never fabricates a server-confirmed position.
 */

import {
  FREE_ROAM_EXPLORE_DESTINATIONS,
  mayJumpBackIn,
  resolveFreeRoamQueueEffect,
  type FreeRoamAction,
  type FreeRoamPresenceMode,
  type QueueMembershipState,
} from "@/lib/competition/PerformerSpectatorFreeRoamPolicy";
import { registerReturnPath } from "@/lib/routing/ReturnPathResolver";

export type FreeRoamPresenceSnapshot = {
  roomId: string;
  performerId: string;
  mode: FreeRoamPresenceMode;
  /**
   * Last *server-confirmed* 0-based index while still an active/away member.
   * Cleared on Leave Queue forfeit. Never shown as confirmed without serverConfirmed.
   */
  preservedPosition: number | null;
  /** True only after durable API confirmed the current membership/position. */
  serverConfirmed: boolean;
  durablePending: boolean;
  /** Set when Leave Queue succeeded on server — blocks Jump Back In forever for that seat. */
  forfeited: boolean;
  updatedAt: string;
};

const STORAGE_KEY = "tmi.challenger.freeRoam.v1";

function storageKey(roomId: string, performerId: string) {
  return `${STORAGE_KEY}:${roomId}:${performerId}`;
}

export function membershipFromPresence(
  snap: FreeRoamPresenceSnapshot | null,
): QueueMembershipState {
  if (!snap) return "NONE";
  if (snap.forfeited || snap.mode === "WITHDRAWN") return "FORFEITED";
  if (snap.mode === "LEAVE_PENDING") return "ACTIVE_MEMBER"; // still a member until server confirms leave
  if (
    snap.mode === "BROWSING" ||
    snap.mode === "SPECTATING_OTHER" ||
    snap.mode === "SPECTATING_CURRENT" ||
    snap.mode === "CALLED_WHILE_AWAY"
  ) {
    return "AWAY_MEMBER";
  }
  if (
    snap.mode === "GREEN_ROOM" ||
    snap.mode === "ON_STAGE" ||
    snap.mode === "PASSED_NOT_READY" ||
    snap.mode === "READY_AGAIN"
  ) {
    return "ACTIVE_MEMBER";
  }
  return "NONE";
}

export function readFreeRoamPresence(
  roomId: string,
  performerId: string,
): FreeRoamPresenceSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(storageKey(roomId, performerId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FreeRoamPresenceSnapshot;
    return {
      ...parsed,
      forfeited: Boolean(parsed.forfeited),
      // Forfeited seats never carry a restorable confirmed position.
      preservedPosition: parsed.forfeited ? null : parsed.preservedPosition ?? null,
      serverConfirmed: parsed.forfeited ? false : Boolean(parsed.serverConfirmed),
    };
  } catch {
    return null;
  }
}

export function writeFreeRoamPresence(snap: FreeRoamPresenceSnapshot): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(storageKey(snap.roomId, snap.performerId), JSON.stringify(snap));
  window.dispatchEvent(new CustomEvent("tmi:challenger-free-roam", { detail: snap }));
}

/** Map HUD actions to Claude durable API verbs. */
function durableActionName(action: FreeRoamAction): string {
  switch (action) {
    case "SPECTATE_CURRENT":
    case "SPECTATE_OTHER":
      return "SPECTATE";
    case "JUMP_OUT":
      return "JUMP_OUT";
    case "JUMP_BACK_IN":
      return "RESUME";
    case "LEAVE_QUEUE":
      return "LEAVE";
    case "REJOIN_QUEUE":
      return "REJOIN";
    case "RETURN_TO_STAGE":
      return "CALL_UP_ACK";
    case "PASS":
      return "PASS";
    case "IM_READY":
      return "IM_READY";
  }
}

async function tryDurableQueueAction(body: Record<string, unknown>): Promise<{
  ok: boolean;
  position?: number;
  error?: string;
  durable: boolean;
}> {
  try {
    const res = await fetch("/api/live/challenger-queue", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.status === 404) {
      return { ok: false, durable: false, error: "DURABLE_QUEUE_PENDING_CLAUDE" };
    }
    const data = (await res.json()) as {
      ok?: boolean;
      position?: number;
      error?: string;
    };
    if (res.status === 503 || data.error === "MIGRATION_NOT_APPLIED") {
      return { ok: false, durable: false, error: "MIGRATION_NOT_APPLIED" };
    }
    if (!res.ok || !data.ok) {
      return {
        ok: false,
        durable: true,
        error: data.error ?? `HTTP_${res.status}`,
      };
    }
    return { ok: true, durable: true, position: data.position };
  } catch {
    return { ok: false, durable: false, error: "NETWORK_OR_UNAVAILABLE" };
  }
}

export type FreeRoamCommandResult = {
  ok: boolean;
  action: FreeRoamAction;
  effect: ReturnType<typeof resolveFreeRoamQueueEffect>;
  presence: FreeRoamPresenceSnapshot;
  navigateTo?: string;
  message: string;
};

function basePresence(
  roomId: string,
  performerId: string,
  prev: FreeRoamPresenceSnapshot | null,
): FreeRoamPresenceSnapshot {
  return (
    prev ?? {
      roomId,
      performerId,
      mode: "GREEN_ROOM",
      preservedPosition: null,
      serverConfirmed: false,
      durablePending: true,
      forfeited: false,
      updatedAt: new Date().toISOString(),
    }
  );
}

export async function executeFreeRoamAction(input: {
  action: FreeRoamAction;
  roomId: string;
  performerId: string;
  liveSessionId?: string;
  /** Hint only — never treated as server-confirmed by itself. */
  knownPositionHint?: number | null;
  exploreHref?: string;
}): Promise<FreeRoamCommandResult> {
  const effect = resolveFreeRoamQueueEffect(input.action);
  const prev = readFreeRoamPresence(input.roomId, input.performerId);
  let presence = basePresence(input.roomId, input.performerId, prev);
  const membership = membershipFromPresence(presence);

  // Jump Back In must not revive a forfeited seat.
  if (input.action === "JUMP_BACK_IN") {
    const gate = mayJumpBackIn(membership);
    if (!gate.allowed) {
      const blocked: FreeRoamPresenceSnapshot = {
        ...presence,
        updatedAt: new Date().toISOString(),
      };
      return {
        ok: false,
        action: input.action,
        effect,
        presence: blocked,
        message: gate.reason,
      };
    }
  }

  const durable = await tryDurableQueueAction({
    action: durableActionName(input.action),
    hudAction: input.action,
    roomId: input.roomId,
    liveSessionId: input.liveSessionId,
  });

  let navigateTo: string | undefined;
  let message = effect.reason;
  let commandOk = true;

  switch (input.action) {
    case "SPECTATE_CURRENT":
      presence = {
        ...presence,
        mode: "SPECTATING_CURRENT",
        // Keep last server-confirmed seat if we had one; do not invent confirmation.
        preservedPosition: presence.serverConfirmed
          ? presence.preservedPosition
          : typeof durable.position === "number"
            ? durable.position
            : presence.preservedPosition,
        serverConfirmed:
          durable.ok && typeof durable.position === "number"
            ? true
            : presence.serverConfirmed && !presence.forfeited,
        durablePending: !durable.durable || !durable.ok,
        updatedAt: new Date().toISOString(),
      };
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("tmi:workspace-mode", { detail: { mode: "WATCH", roomId: input.roomId } }),
        );
        window.dispatchEvent(
          new CustomEvent("tmi:open-workspace", {
            detail: { workspaceId: "live-program", surface: "MONITOR", roomId: input.roomId },
          }),
        );
      }
      message = durable.ok
        ? "Spectating — queue membership confirmed by server"
        : "Spectating — keep-queue intent recorded; waiting for server position confirm";
      break;

    case "SPECTATE_OTHER":
    case "JUMP_OUT": {
      const dest =
        input.exploreHref ??
        (input.action === "SPECTATE_OTHER"
          ? FREE_ROAM_EXPLORE_DESTINATIONS.lobbyWall
          : FREE_ROAM_EXPLORE_DESTINATIONS.liveHome);
      const returnTo = `/live/rooms/${encodeURIComponent(input.roomId)}?freeRoam=back`;
      registerReturnPath({
        fromRoute: dest.split("?")[0],
        toRoute: returnTo,
        label: "Jump Back In — Green Room",
        preserveQuery: true,
      });
      navigateTo = `${dest}${dest.includes("?") ? "&" : "?"}returnTo=${encodeURIComponent(returnTo)}&queuePreserve=1`;
      presence = {
        ...presence,
        mode: input.action === "SPECTATE_OTHER" ? "SPECTATING_OTHER" : "BROWSING",
        serverConfirmed:
          durable.ok && typeof durable.position === "number"
            ? true
            : presence.serverConfirmed && !presence.forfeited,
        preservedPosition:
          durable.ok && typeof durable.position === "number"
            ? durable.position
            : presence.preservedPosition,
        durablePending: !durable.durable || !durable.ok,
        updatedAt: new Date().toISOString(),
      };
      message = durable.ok
        ? "Left Green Room — still in line (server)"
        : "Left Green Room — still in line (intent); server confirm pending";
      break;
    }

    case "JUMP_BACK_IN": {
      const alreadyHere =
        typeof window !== "undefined" &&
        window.location.pathname.includes(`/live/rooms/${input.roomId}`);
      const confirmedPos =
        durable.ok && typeof durable.position === "number"
          ? durable.position
          : presence.serverConfirmed
            ? presence.preservedPosition
            : null;
      presence = {
        ...presence,
        mode: "GREEN_ROOM",
        preservedPosition: confirmedPos,
        serverConfirmed: durable.ok && typeof durable.position === "number",
        durablePending: !durable.durable || !durable.ok,
        forfeited: false,
        updatedAt: new Date().toISOString(),
      };
      if (!alreadyHere) {
        navigateTo = `/live/rooms/${encodeURIComponent(input.roomId)}?freeRoam=back`;
      }
      message = presence.serverConfirmed
        ? `Back in Green Room — position #${(presence.preservedPosition ?? 0) + 1}`
        : "Back in Green Room — awaiting server-confirmed position (not claiming a seat yet)";
      break;
    }

    case "LEAVE_QUEUE": {
      if (durable.ok) {
        // Server confirmed forfeiture — seat gone; remaining waiters advance.
        presence = {
          ...presence,
          mode: "WITHDRAWN",
          preservedPosition: null,
          serverConfirmed: true,
          durablePending: false,
          forfeited: true,
          updatedAt: new Date().toISOString(),
        };
        message = "Left the line — position forfeited. Rejoin goes to the back.";
      } else {
        // Do not display Leave Queue as completed without server confirm.
        commandOk = false;
        presence = {
          ...presence,
          mode: "LEAVE_PENDING",
          durablePending: true,
          forfeited: false,
          updatedAt: new Date().toISOString(),
        };
        message =
          durable.error === "DURABLE_QUEUE_PENDING_CLAUDE"
            ? "Leave Queue requested — waiting for server withdrawal confirm (Claude durable queue)"
            : `Leave Queue not confirmed: ${durable.error ?? "unavailable"}`;
      }
      break;
    }

    case "REJOIN_QUEUE": {
      if (durable.ok && typeof durable.position === "number") {
        presence = {
          ...presence,
          mode: "GREEN_ROOM",
          preservedPosition: durable.position,
          serverConfirmed: true,
          durablePending: false,
          forfeited: false,
          updatedAt: new Date().toISOString(),
        };
        message = `Rejoined at back — position #${durable.position + 1}`;
      } else {
        commandOk = false;
        presence = {
          ...presence,
          mode: presence.forfeited || presence.mode === "WITHDRAWN" ? "WITHDRAWN" : presence.mode,
          preservedPosition: null,
          serverConfirmed: false,
          durablePending: true,
          updatedAt: new Date().toISOString(),
        };
        message =
          "REJOIN QUEUE requested — will append at current tail when server confirms (no seat claimed yet)";
      }
      break;
    }

    case "RETURN_TO_STAGE":
      presence = {
        ...presence,
        mode: "CALLED_WHILE_AWAY",
        durablePending: !durable.durable || !durable.ok,
        updatedAt: new Date().toISOString(),
      };
      navigateTo = `/live/rooms/${encodeURIComponent(input.roomId)}?callUp=1`;
      message = "Return to stage — wait for server admission";
      break;

    case "PASS": {
      if (durable.ok && typeof durable.position === "number") {
        presence = {
          ...presence,
          mode: "PASSED_NOT_READY",
          preservedPosition: durable.position,
          serverConfirmed: true,
          durablePending: false,
          forfeited: false,
          updatedAt: new Date().toISOString(),
        };
        message = `PASS confirmed — moved to back (#${durable.position + 1}); still enrolled`;
      } else {
        commandOk = false;
        presence = {
          ...presence,
          mode: presence.mode === "CALLED_WHILE_AWAY" ? "PASSED_NOT_READY" : presence.mode,
          durablePending: true,
          updatedAt: new Date().toISOString(),
        };
        message =
          durable.error === "DURABLE_QUEUE_PENDING_CLAUDE"
            ? "PASS requested — waiting for server PASS-to-tail confirm (Claude durable queue)"
            : `PASS not confirmed: ${durable.error ?? "unavailable"}`;
      }
      break;
    }

    case "IM_READY": {
      if (durable.ok) {
        presence = {
          ...presence,
          mode: "READY_AGAIN",
          preservedPosition:
            typeof durable.position === "number"
              ? durable.position
              : presence.preservedPosition,
          serverConfirmed:
            typeof durable.position === "number" ? true : presence.serverConfirmed,
          durablePending: false,
          forfeited: false,
          updatedAt: new Date().toISOString(),
        };
        message =
          typeof durable.position === "number"
            ? `I'M READY — eligible at #${durable.position + 1} for next fair call-up`
            : "I'M READY — eligible for next fair server call-up (no forced stage)";
      } else {
        commandOk = false;
        presence = {
          ...presence,
          durablePending: true,
          updatedAt: new Date().toISOString(),
        };
        message =
          durable.error === "DURABLE_QUEUE_PENDING_CLAUDE"
            ? "I'M READY requested — waiting for server confirm"
            : `I'M READY not confirmed: ${durable.error ?? "unavailable"}`;
      }
      break;
    }
  }

  writeFreeRoamPresence(presence);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("tmi:challenger-free-roam-action", {
        detail: {
          action: input.action,
          roomId: input.roomId,
          performerId: input.performerId,
          effect,
          durable,
          presence,
        },
      }),
    );
  }

  return {
    ok: commandOk,
    action: input.action,
    effect,
    presence,
    navigateTo,
    message,
  };
}

/** Listen for Claude/server call-up while browsing (display only — server is authority). */
export function subscribeChallengerCallUp(
  handler: (detail: {
    roomId: string;
    performerId: string;
    position: number;
    entranceWindowMs: number;
  }) => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;
  const fn = (e: Event) => {
    const d = (e as CustomEvent).detail;
    if (d?.roomId && d?.performerId) handler(d);
  };
  window.addEventListener("tmi:challenger-call-up", fn);
  return () => window.removeEventListener("tmi:challenger-call-up", fn);
}
