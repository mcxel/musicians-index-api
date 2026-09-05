/**
 * Live room join privacy gate — maps Launch Dock privacy modes onto registry
 * visibility + join decisions. No fake friends/invite passes.
 */

import type { LivePrivacy } from "@/lib/live/LiveDestinationRouter";
import type { LiveSession } from "@/lib/broadcast/globalLiveSessionStore";
import { FriendAcceptanceEngine } from "@/lib/social/FriendAcceptanceEngine";

export type RegistryLivePrivacy = LiveSession["privacy"];

export type LiveRoomJoinDecision = {
  allowed: boolean;
  reason: string;
  privacy: LivePrivacy;
  registryPrivacy: RegistryLivePrivacy;
};

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
