"use client";

/**
 * Typed client for /api/live/backstage — the server-authoritative replacement
 * for the in-memory GuestAdmissionAuthority calls in the Performer HUD GUESTS
 * tray. Identity is the session cookie; nothing here sends a userId for the caller.
 */

import type { BackstageError, BackstageInviteView } from "./BackstageTransportService";

export type { BackstageError, BackstageInviteView };

export type BackstageClientResult<T> = ({ ok: true } & T) | { ok: false; error: BackstageError | string };

async function call<T>(body: Record<string, unknown>): Promise<BackstageClientResult<T>> {
  try {
    const res = await fetch("/api/live/backstage", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return (await res.json()) as BackstageClientResult<T>;
  } catch {
    return { ok: false, error: "NETWORK" };
  }
}

export const backstageClient = {
  async list(roomId: string): Promise<BackstageClientResult<{ isHost: boolean; invites: BackstageInviteView[] }>> {
    try {
      const res = await fetch(`/api/live/backstage?roomId=${encodeURIComponent(roomId)}`, { credentials: "include" });
      return await res.json();
    } catch {
      return { ok: false, error: "NETWORK" };
    }
  },
  invite: (roomId: string, guestUserId: string, instantOnAccept: boolean) =>
    call<BackstageInviteView>({ action: "invite", roomId, guestUserId, instantOnAccept }),
  cancel: (inviteId: string) => call<{ inviteId: string; status: string }>({ action: "cancel", inviteId }),
  bringIn: (inviteId: string) =>
    call<{ inviteId: string; status: "live"; entranceCue: "REGULAR_GUEST" }>({ action: "bringIn", inviteId }),
  returnBackstage: (inviteId: string) => call<{ inviteId: string; status: string }>({ action: "returnBackstage", inviteId }),
  remove: (inviteId: string) => call<{ inviteId: string; status: string }>({ action: "remove", inviteId }),
  accept: (inviteId: string, consentToBroadcast: boolean) =>
    call<{ inviteId: string; status: "backstage" | "live"; instant: boolean }>({
      action: "accept",
      inviteId,
      consentToBroadcast,
    }),
  decline: (inviteId: string) => call<{ inviteId: string; status: string }>({ action: "decline", inviteId }),
  leave: (inviteId: string) => call<{ inviteId: string; status: string }>({ action: "leave", inviteId }),
  stageToken: (roomId: string) =>
    call<{ kind: "stage"; roomName: string; roomUrl: string; token: string }>({ action: "mediaToken", roomId, kind: "stage" }),
};
