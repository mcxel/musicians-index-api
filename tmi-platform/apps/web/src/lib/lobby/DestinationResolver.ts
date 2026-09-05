/**
 * DestinationResolver — lobby wall tile click → THAT exact room (no generic list detour).
 */

import { fanAvatarLobbyEntryHref, performerLobbyEntryHref } from "@/lib/live/canonicalWorldViewport";

export type LobbyWallKind =
  | "battle"
  | "cypher"
  | "challenge"
  | "lounge"
  | "performer-lobby"
  | "fan-avatar"
  | "dance"
  | "concert"
  | "gauntlet"
  | "game"
  | "live";

export type DestinationInput = {
  roomId: string;
  kind: LobbyWallKind;
  /** Prefer explicit href when already known (exact room). */
  href?: string;
  roomClass?: "PERSISTENT_GAUNTLET" | "TEMPORARY_BATTLE" | "PERMANENT_ANCHOR";
};

export type ResolvedDestination = {
  roomId: string;
  href: string;
  kind: LobbyWallKind;
  via: "explicit-href" | "kind-route" | "live-fallback";
};

export function resolveLobbyDestination(input: DestinationInput): ResolvedDestination {
  if (input.href && input.href.startsWith("/") && !input.href.includes("/lobby-wall")) {
    return {
      roomId: input.roomId,
      href: input.href,
      kind: input.kind,
      via: "explicit-href",
    };
  }

  if (input.kind === "gauntlet" || input.roomClass === "PERSISTENT_GAUNTLET") {
    return {
      roomId: input.roomId,
      href: `/rooms/battle/gauntlet/${encodeURIComponent(input.roomId)}`,
      kind: "gauntlet",
      via: "kind-route",
    };
  }

  const kindRoutes: Partial<Record<LobbyWallKind, string>> = {
    battle: `/rooms/battle/${encodeURIComponent(input.roomId)}`,
    cypher: `/live/rooms/${encodeURIComponent(input.roomId)}?mode=cypher`,
    challenge: `/live/rooms/${encodeURIComponent(input.roomId)}?mode=challenge`,
    dance: `/live/rooms/${encodeURIComponent(input.roomId)}?mode=dance`,
    concert: `/live/rooms/${encodeURIComponent(input.roomId)}?mode=concert`,
    lounge: `/live/rooms/${encodeURIComponent(input.roomId)}?mode=lounge&zone=LOUNGE_SIDE_ROOM&from=live-lobby`,
    "performer-lobby": performerLobbyEntryHref(input.roomId, { from: "performer-lobby-wall" }),
    "fan-avatar": fanAvatarLobbyEntryHref(input.roomId, { from: "lobby-wall" }),
    game: `/live/rooms/${encodeURIComponent(input.roomId)}?mode=game`,
    live: `/live/rooms/${encodeURIComponent(input.roomId)}`,
  };

  const href = kindRoutes[input.kind] ?? `/live/rooms/${encodeURIComponent(input.roomId)}`;
  return {
    roomId: input.roomId,
    href,
    kind: input.kind,
    via: kindRoutes[input.kind] ? "kind-route" : "live-fallback",
  };
}
