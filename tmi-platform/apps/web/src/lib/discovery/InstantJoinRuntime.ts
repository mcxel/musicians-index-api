/**
 * InstantJoinRuntime — wraps existing LobbyEntryFlow / seat join patterns.
 * Tap → instant join unless ticket / invite / age gate requires a step.
 * Does not invent a parallel live engine (assembles 5cd926f0 Instant Go Live paths).
 *
 * Participation Law: role × room type → QUEUE | SPECTATOR | FAN_SEAT (etc).
 */

import type { UniversalRoom } from "@/components/room/UniversalLobbyEntry";
import type { LiveDiscoveryRecord } from "./LiveDiscoveryRecord";
import type { LiveSurfaceCard } from "./LiveSurfaceCard";
import { projectDiscoveryRecordToSurfaceCard } from "./LiveSurfaceCard";
import { sanitizeWallHostLabel } from "@/lib/lobby/wallPublicIdentity";
import { fanAvatarLobbyEntryHref } from "@/lib/live/canonicalWorldViewport";
import {
  isPlaylistLoungeDiscovery,
  isPublicPerformerLobbyDiscovery,
  resolvePerformerLobbyJoinHref,
  resolvePlaylistLoungeJoinHref,
} from "@/lib/venue-hud/loungeContainer";
import {
  resolveOwnershipModel,
  resolveParticipationEntry,
  resolveRoomKindFromDiscovery,
  type ParticipationEntryMode,
  type ParticipationRoomKind,
  type ParticipationState,
} from "@/lib/live/ParticipationStateMachine";

export type InstantJoinRole =
  | "FAN"
  | "PERFORMER"
  | "BAND"
  | "ADMIN"
  | "SUPERADMIN"
  | string;

export interface InstantJoinDecision {
  /** true → LobbyEntryFlow instant={true} (skip preview/landing) */
  instant: boolean;
  /** Why a second step is required (honest gate) */
  gateReason: "none" | "ticket" | "invite" | "age" | "paid" | "full";
  room: UniversalRoom;
  /** Final navigation target if bypassing overlay (rare) */
  href: string;
  /** Participation Law resolution */
  entryMode: ParticipationEntryMode;
  roomKind: ParticipationRoomKind;
  initialState: ParticipationState;
  claimFanSeat: boolean;
}

function normalizeRole(role?: string | null): InstantJoinRole {
  const r = (role ?? "FAN").trim().toUpperCase();
  return r || "FAN";
}

function isPerformerLike(role: InstantJoinRole): boolean {
  return (
    role === "PERFORMER" ||
    role === "BAND" ||
    role === "ARTIST" ||
    role === "ADMIN" ||
    role === "SUPERADMIN" ||
    role === "VENUE"
  );
}

/**
 * Map a discovery tile → UniversalRoom for LobbyEntryFlow.
 * viewers = humanViewerCount only (Rule 20).
 */
export function discoveryRecordToUniversalRoom(
  record: LiveDiscoveryRecord,
  participation?: {
    entryMode: ParticipationEntryMode;
    roomKind: ParticipationRoomKind;
    claimFanSeat: boolean;
  },
): UniversalRoom {
  const status: UniversalRoom["status"] =
    record.joinGate === "paid" || record.joinGate === "ticket"
      ? "vip"
      : record.isLive
        ? "live"
        : "upcoming";

  const access: UniversalRoom["access"] =
    record.joinGate === "paid" || record.joinGate === "ticket"
      ? "paid"
      : record.visibility === "invite" || record.visibility === "private"
        ? "vip"
        : "free";

  const hostLabel = sanitizeWallHostLabel(record.hostName, { hostUserId: record.hostUserId });

  return {
    id: record.roomId,
    title: record.title,
    subtitle: hostLabel,
    hostName: hostLabel,
    genre: record.category,
    viewers: record.humanViewerCount,
    status,
    access,
    entryPriceUsd: record.entryPriceUsd ?? undefined,
    eventId: record.experienceId,
    accentColor: record.accentColor,
    thumbnailUrl: record.posterUrl ?? undefined,
    roomRoute: record.joinRoute,
    shape: "cinema",
    participationEntryMode: participation?.entryMode,
    participationRoomKind: participation?.roomKind,
    claimFanSeat: participation?.claimFanSeat,
  };
}

/**
 * Decide instant vs gated join for a discovery card tap.
 * Instant when gate is none; otherwise LobbyEntryFlow runs access step.
 * Competition performers → QUEUE path (no fan seat claim).
 */
export function resolveInstantJoin(
  record: LiveDiscoveryRecord,
  opts?: { role?: string | null; isRoomOwner?: boolean },
): InstantJoinDecision {
  const role = normalizeRole(opts?.role);
  const roomKind = resolveRoomKindFromDiscovery(record);
  const ownership = resolveOwnershipModel(record);
  const resolution = resolveParticipationEntry({
    role,
    roomKind,
    ownership,
    isRoomOwner: opts?.isRoomOwner,
    queueEngineAvailable: true,
    hostControlsAvailable: ownership === "human_owned" || Boolean(opts?.isRoomOwner),
  });

  const room = discoveryRecordToUniversalRoom(record, {
    entryMode: resolution.entryMode,
    roomKind: resolution.roomKind,
    claimFanSeat: resolution.claimFanSeat,
  });

  // Playlist / mixed-genre listening → LOUNGE_SIDE_ROOM (video panels, no avatars).
  // Competition QUEUE path keeps competition joinRoute (do not force fan avatar lobby).
  let href = record.joinRoute;
  if (resolution.entryMode === "QUEUE") {
    href = record.joinRoute;
    room.roomRoute = href;
  } else if (isPlaylistLoungeDiscovery(record) || resolution.entryMode === "LOUNGE_PANEL") {
    href = resolvePlaylistLoungeJoinHref(record.roomId, { from: "live-lobby-wall" });
    room.roomRoute = href;
  } else if (
    (isPublicPerformerLobbyDiscovery(record) || resolution.entryMode === "PERFORMER_LOBBY") &&
    isPerformerLike(role)
  ) {
    href = resolvePerformerLobbyJoinHref(record.roomId, { from: "live-lobby-wall" });
    room.roomRoute = href;
  } else if (resolution.entryMode === "FAN_AVATAR_LOBBY" || !isPerformerLike(role)) {
    href = fanAvatarLobbyEntryHref(record.roomId, { from: "live-lobby-wall" });
    room.roomRoute = href;
  }

  // Append participation query hints for room shells (honest mode, not fake state)
  const sep = href.includes("?") ? "&" : "?";
  href = `${href}${sep}entryMode=${encodeURIComponent(resolution.entryMode)}&roomKind=${encodeURIComponent(resolution.roomKind)}`;
  room.roomRoute = href;

  const gate = record.joinGate;
  if (gate === "none") {
    return {
      instant: true,
      gateReason: "none",
      room,
      href,
      entryMode: resolution.entryMode,
      roomKind: resolution.roomKind,
      initialState: resolution.initialState,
      claimFanSeat: resolution.claimFanSeat,
    };
  }

  return {
    instant: false,
    gateReason: gate,
    room,
    href,
    entryMode: resolution.entryMode,
    roomKind: resolution.roomKind,
    initialState: resolution.initialState,
    claimFanSeat: resolution.claimFanSeat,
  };
}

/** True when the overlay should open LobbyEntryFlow instead of a landing page. */
export function shouldUseLobbyEntryFlow(_record: LiveDiscoveryRecord): boolean {
  return true;
}

/**
 * Map LiveSurfaceCard → UniversalRoom for LobbyEntryFlow.
 * audienceCount is honest humans only when projected from DiscoveryPublisher.
 */
export function liveSurfaceCardToUniversalRoom(card: LiveSurfaceCard): UniversalRoom {
  const status: UniversalRoom["status"] =
    card.joinAction.kind === "gated"
      ? "vip"
      : card.state === "live" || card.state === "intermission"
        ? "live"
        : card.state === "starting" || card.state === "pre_show"
          ? "starting-soon"
          : "upcoming";

  const access: UniversalRoom["access"] =
    card.joinAction.kind === "gated" ? "paid" : "free";

  return {
    id: card.roomId,
    title: card.title,
    subtitle: card.subtitle,
    hostName: card.subtitle,
    genre: card.runtimeType,
    viewers: card.audienceCount,
    status,
    access,
    accentColor: card.accentColor ?? "#00FFFF",
    thumbnailUrl: card.previewMediaUrl ?? undefined,
    roomRoute: card.joinAction.href,
    shape: "cinema",
  };
}

/** Resolve InstantJoin from a LiveSurfaceCard (projection-layer path). */
export function resolveInstantJoinFromSurface(
  card: LiveSurfaceCard,
  opts?: { role?: string | null },
): InstantJoinDecision {
  const room = liveSurfaceCardToUniversalRoom(card);
  const role = normalizeRole(opts?.role);
  const roomKind = resolveRoomKindFromDiscovery({
    category: (card.runtimeType as LiveDiscoveryRecord["category"]) || "live_now",
    categories: [],
    roomId: card.roomId,
  });
  const resolution = resolveParticipationEntry({
    role,
    roomKind,
    ownership: "platform",
  });

  room.participationEntryMode = resolution.entryMode;
  room.participationRoomKind = resolution.roomKind;
  room.claimFanSeat = resolution.claimFanSeat;

  let href = card.joinAction.href;
  if (resolution.entryMode === "QUEUE") {
    // keep competition href
  } else if (!isPerformerLike(role)) {
    href = fanAvatarLobbyEntryHref(card.roomId, { from: "live-lobby-wall" });
    room.roomRoute = href;
  }

  const sep = href.includes("?") ? "&" : "?";
  href = `${href}${sep}entryMode=${encodeURIComponent(resolution.entryMode)}&roomKind=${encodeURIComponent(resolution.roomKind)}`;
  room.roomRoute = href;

  if (card.joinAction.kind === "gated") {
    return {
      instant: false,
      gateReason: "paid",
      room,
      href,
      entryMode: resolution.entryMode,
      roomKind: resolution.roomKind,
      initialState: resolution.initialState,
      claimFanSeat: resolution.claimFanSeat,
    };
  }

  return {
    instant: true,
    gateReason: "none",
    room,
    href,
    entryMode: resolution.entryMode,
    roomKind: resolution.roomKind,
    initialState: resolution.initialState,
    claimFanSeat: resolution.claimFanSeat,
  };
}

/** Bridge: discovery record → surface → instant join (same LobbyEntryFlow path). */
export function resolveInstantJoinViaSurface(
  record: LiveDiscoveryRecord,
  opts?: { role?: string | null },
): InstantJoinDecision {
  const card = projectDiscoveryRecordToSurfaceCard(record);
  if (!card) return resolveInstantJoin(record, opts);
  return resolveInstantJoinFromSurface(card, opts);
}
