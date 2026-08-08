/**
 * InstantJoinRuntime — wraps existing LobbyEntryFlow / seat join patterns.
 * Tap → instant join unless ticket / invite / age gate requires a step.
 * Does not invent a parallel live engine (assembles 5cd926f0 Instant Go Live paths).
 */

import type { UniversalRoom } from "@/components/room/UniversalLobbyEntry";
import type { LiveDiscoveryRecord } from "./LiveDiscoveryRecord";
import type { LiveSurfaceCard } from "./LiveSurfaceCard";
import { projectDiscoveryRecordToSurfaceCard } from "./LiveSurfaceCard";
import { sanitizeWallHostLabel } from "@/lib/lobby/wallPublicIdentity";

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
    accentColor: record.accentColor,
    thumbnailUrl: record.posterUrl ?? undefined,
    roomRoute: record.joinRoute,
    shape: "cinema",
  };
}

/**
 * Decide instant vs gated join for a discovery card tap.
 * Instant when gate is none; otherwise LobbyEntryFlow runs access step.
 */
export function resolveInstantJoin(
  record: LiveDiscoveryRecord,
  opts?: { role?: string | null },
): InstantJoinDecision {
  const role = normalizeRole(opts?.role);
  const room = discoveryRecordToUniversalRoom(record);

  // Role-aware route nudge: performers joining as audience still use room route;
  // fan-lobby tiles keep fan lobby destination (Rule 26).
  let href = record.joinRoute;
  if (record.category === "fan_lobbies" && !isPerformerLike(role)) {
    href = record.joinRoute.includes("fan-lobby")
      ? record.joinRoute
      : `/rooms/fan-lobby?from=live-lobby-wall&roomId=${encodeURIComponent(record.roomId)}`;
    room.roomRoute = href;
  }

  const gate = record.joinGate;
  if (gate === "none") {
    return { instant: true, gateReason: "none", room, href };
  }

  return {
    instant: false,
    gateReason: gate,
    room,
    href,
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
  // Reuse discovery join semantics via a minimal record bridge when possible
  const room = liveSurfaceCardToUniversalRoom(card);
  const role = normalizeRole(opts?.role);

  let href = card.joinAction.href;
  if (card.runtimeType === "fan_lobby" && !isPerformerLike(role)) {
    href = href.includes("fan-lobby")
      ? href
      : `/rooms/fan-lobby?from=live-lobby-wall&roomId=${encodeURIComponent(card.roomId)}`;
    room.roomRoute = href;
  }

  if (card.joinAction.kind === "gated") {
    return { instant: false, gateReason: "paid", room, href };
  }

  return { instant: true, gateReason: "none", room, href };
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
