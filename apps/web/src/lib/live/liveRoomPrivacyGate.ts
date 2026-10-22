/**
 * Live room join privacy gate — maps Launch Dock privacy modes onto registry
 * visibility + join decisions. No fake friends/invite passes.
 */

import type { LivePrivacy } from "@/lib/live/LiveDestinationRouter";
import type { LiveSession } from "@/lib/broadcast/globalLiveSessionStore";
import { FriendAcceptanceEngine } from "@/lib/social/FriendAcceptanceEngine";
import { SHOWS_RELEASE_FEED_TYPE } from "@/lib/events/ScheduledEventRegistry";
import { dbHasIssuedTicketForEventOwner } from "@/lib/tickets/DigitalTicketPersistence";

export type RegistryLivePrivacy = LiveSession["privacy"];

export type LiveRoomJoinDecision = {
  allowed: boolean;
  reason: string;
  privacy: LivePrivacy;
  registryPrivacy: RegistryLivePrivacy;
};

/**
 * Resolve join privacy from a registry session.
 * Prefer stored `audiencePrivacyMode` (fine-grained). Never invent "friends"
 * from INVITE_ONLY alone — without mode detail, fail closed as private.
 */
export function resolveAudiencePrivacyFromSession(session: {
  privacy?: RegistryLivePrivacy | string | null;
  audiencePrivacyMode?: LivePrivacy | string | null;
} | null | undefined): LivePrivacy {
  if (!session) return "public";
  if (session.audiencePrivacyMode != null && String(session.audiencePrivacyMode).trim() !== "") {
    return normalizeLivePrivacyMode(String(session.audiencePrivacyMode));
  }
  const reg = String(session.privacy ?? "PUBLIC").toUpperCase();
  if (reg === "PUBLIC") return "public";
  // SECURITY NOTE (2026-09-23): this collapses PAID_ENTRY to "public" for the
  // friends/invite/private mode this function's callers actually branch on —
  // it is NOT a statement that a paid room is open access. Real ticket
  // ownership is a separate, mandatory check — see `hasValidTicketForRoom`
  // below — that every real entry point (page render AND the audience-entry
  // API) must also run for any session whose *raw* `.privacy` is
  // "PAID_ENTRY". Do not treat this function's "public" return alone as
  // sufficient authorization for a paid room.
  if (reg === "PAID_ENTRY") return "public";
  // INVITE_ONLY without fine-grained mode → private (host-only). Honest deny > fake friends pass.
  return "private";
}

/**
 * Resolve the real, durable Event.id backing a live room, without trusting
 * any client-supplied eventId. LiveSession itself carries no eventId field,
 * so this looks up the ShowsReleaseRecord that was written alongside the
 * session at creation time (api/events/shows-releases/route.ts) — `entityId`
 * on that FeedItem row IS the real `event.id`. Returns null (fail closed for
 * ticket checks) if no such record exists for this roomId.
 */
export async function resolveEventIdForRoom(roomId: string): Promise<string | null> {
  if (!roomId) return null;
  const p = await getPrisma();
    const record = await p.feedItem.findFirst({
    where: {
      type: SHOWS_RELEASE_FEED_TYPE,
      data: { path: ["roomId"], equals: roomId },
    },
    select: { entityId: true },
  });
  return record?.entityId ?? null;
}

/**
 * SECURITY (2026-09-23): the real ticket-entitlement check a PAID_ENTRY room
 * must pass. Previously PAID_ENTRY was silently treated as public everywhere
 * (see resolveAudiencePrivacyFromSession above) — a real ticket price could
 * be set and paid, but the room itself never checked for it. Fails closed:
 * no resolvable event, no authenticated viewer, or no issued ticket for that
 * (event, viewer) pair all deny.
 */
async function getPrisma() {
  const mod = await import("@/lib/prisma");
  return mod.prisma || mod.default;
}

export async function hasValidTicketForRoom(
  viewerUserId: string | null | undefined,
  roomId: string,
): Promise<boolean> {
  const viewer = (viewerUserId ?? "").trim();
  if (!viewer || !roomId) return false;
  const eventId = await resolveEventIdForRoom(roomId);
  if (!eventId) return false;
  return dbHasIssuedTicketForEventOwner(eventId, viewer);
}

/** Map dock/UI privacy onto GlobalLiveSessionRegistry privacy enum. */
export function mapLivePrivacyToRegistry(privacy: LivePrivacy | string | undefined | null): RegistryLivePrivacy {
  const raw = String(privacy ?? "public").trim();
  const upper = raw.toUpperCase();
  if (upper === "PAID_ENTRY" || upper === "PAID") return "PAID_ENTRY";
  if (
    upper === "INVITE_ONLY" ||
    upper === "INVITE" ||
    upper === "PRIVATE" ||
    upper === "FRIENDS" ||
    upper === "FRIENDS_ONLY"
  ) {
    return "INVITE_ONLY";
  }
  if (upper === "PUBLIC") return "PUBLIC";

  const lower = raw.toLowerCase();
  if (lower === "friends" || lower === "invite" || lower === "private") return "INVITE_ONLY";
  return "PUBLIC";
}

export function normalizeLivePrivacyMode(raw: string | undefined | null): LivePrivacy {
  const v = String(raw ?? "public").toLowerCase().trim();
  if (v === "friends" || v === "invite" || v === "private" || v === "public") return v;
  if (v === "invite_only" || v === "friends_only") return v.startsWith("friend") ? "friends" : "invite";
  return "public";
}

/**
 * Decide whether a viewer may enter a live room under the chosen privacy mode.
 * Hosts always pass. Friends mode requires a real accepted friendship — otherwise honest deny.
 */
export async function evaluateLiveRoomJoinAccess(input: {
  viewerUserId: string | null | undefined;
  hostUserId: string | null | undefined;
  privacy: LivePrivacy | string;
  isHost?: boolean;
  invitedUserIds?: string[];
}): Promise<LiveRoomJoinDecision> {
  const privacy = normalizeLivePrivacyMode(String(input.privacy));
  const registryPrivacy = mapLivePrivacyToRegistry(privacy);

  if (input.isHost) {
    return {
      allowed: true,
      reason: "Host access granted.",
      privacy,
      registryPrivacy,
    };
  }

  if (privacy === "public") {
    return {
      allowed: true,
      reason: "Public live room.",
      privacy,
      registryPrivacy,
    };
  }

  const viewer = (input.viewerUserId ?? "").trim();
  if (!viewer) {
    return {
      allowed: false,
      reason: "Sign in required for friends / invite / private rooms.",
      privacy,
      registryPrivacy,
    };
  }

  const host = (input.hostUserId ?? "").trim();
  if (host && viewer === host) {
    return {
      allowed: true,
      reason: "Host access granted.",
      privacy,
      registryPrivacy,
    };
  }

  if (privacy === "private") {
    return {
      allowed: false,
      reason: "Private rehearsal — only the host can enter this room.",
      privacy,
      registryPrivacy,
    };
  }

  if (privacy === "invite") {
    const invited = input.invitedUserIds ?? [];
    if (invited.includes(viewer)) {
      return {
        allowed: true,
        reason: "Invite membership verified.",
        privacy,
        registryPrivacy,
      };
    }
    return {
      allowed: false,
      reason:
        "Invite-only room — you are not on the invite list. Ask the host for an invite (no fake pass).",
      privacy,
      registryPrivacy,
    };
  }

  // friends
  if (!host) {
    return {
      allowed: false,
      reason:
        "Friends-only room — host identity is unavailable, so friendship cannot be verified.",
      privacy,
      registryPrivacy,
    };
  }

  const friends = await FriendAcceptanceEngine.areFriends(viewer, host);
  if (friends) {
    return {
      allowed: true,
      reason: "Friends relationship verified.",
      privacy,
      registryPrivacy,
    };
  }

  return {
    allowed: false,
    reason:
      "Friends-only room — you are not friends with the host. No unverified friendship pass.",
    privacy,
    registryPrivacy,
  };
}
