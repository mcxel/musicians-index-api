"use client";

/**
 * LiveLobbyWallHost — unified lobby wall surface: category tabs, WebRTC mosaic,
 * optional Fan Avatar Lobby search (Rule 26), mobile free-roam pan.
 * Wires LiveLobbyWallGrid + DiscoveryBus — no second discovery mill.
 */

import { useCallback, useMemo, useState } from "react";
import RoleGate from "@/components/auth/RoleGate";
import LiveLobbyWallGrid, { type LobbyRoom } from "@/components/live/LiveLobbyWallGrid";
import LobbyCategoryPillRow from "@/components/lobby/LobbyCategoryPillRow";
import { LobbyEntryFlow } from "@/components/room/UniversalLobbyEntry";
import { useDiscoveryBus } from "@/lib/discovery/useDiscoveryBus";
import { discoveryToLobbyRoom } from "@/lib/discovery/discoveryToLobbyRoom";
import { resolveInstantJoin } from "@/lib/discovery/InstantJoinRuntime";
import type { LiveDiscoveryRecord } from "@/lib/discovery/LiveDiscoveryRecord";
import { resolveLobbyDestination } from "@/lib/lobby/DestinationResolver";
import {
  LOBBY_WALL_CORE_CATEGORY_TABS,
  GENRE_LOBBY_WALL_GENRE_PILLS,
  GENRE_LOBBY_WALL_SIDE_TABS,
  advanceLobbyWallCategory,
  canSearchFanAvatarLobbies,
  filterDiscoveryByGenreId,
  filterDiscoveryByGenreLobbySide,
  filterDiscoveryByWallCategory,
  filterFanAvatarLobbySearch,
  type GenreLobbyWallSide,
  type LobbyWallCoreCategoryId,
} from "@/lib/lobby/liveLobbyWallLaw";
import type { CanonicalGenreId } from "@/lib/live/CanonicalGenreRegistry";
import { useAuth } from "@/lib/hooks/useAuth";

export type LiveLobbyWallHostProps = {
  accentColor?: string;
  title?: string;
  typeLabel?: string;
  variant?: "page" | "embedded" | "quick";
  viewerUserId?: string | null;
  /** Override session role when host already resolved auth upstream. */
  viewerRole?: string | null;
  onRoomJoin?: (room: LobbyRoom) => void;
  /** Initial category tab. */
  defaultCategory?: LobbyWallCoreCategoryId;
  /** Show fan avatar lobby search (still gated by RoleGate + canSearchFanAvatarLobbies). */
  showFanLobbySearch?: boolean;
  /** Fan | Performer genre lobby tabs — 30-room baseline from CanonicalGenreRegistry. */
  showGenreLobbyTabs?: boolean;
  /** Touch pan on mosaic surface (phone free-roam). */
  enableMobileRoam?: boolean;
};

export default function LiveLobbyWallHost({
  accentColor = "#00FFFF",
  title = "Live Lobby Wall",
  typeLabel = "LIVE",
  variant = "embedded",
  viewerUserId = null,
  viewerRole: viewerRoleProp,
  onRoomJoin,
  defaultCategory = "lives",
  showFanLobbySearch = true,
  showGenreLobbyTabs = false,
  enableMobileRoam = true,
}: LiveLobbyWallHostProps) {
  const { role: sessionRole } = useAuth();
  const viewerRole = viewerRoleProp ?? sessionRole;
  const records = useDiscoveryBus(viewerUserId);

  const [activeCategory, setActiveCategory] = useState<LobbyWallCoreCategoryId>(defaultCategory);
  const [genreLobbySide, setGenreLobbySide] = useState<GenreLobbyWallSide>("FAN");
  const [selectedGenreId, setSelectedGenreId] = useState<CanonicalGenreId | "all">("all");
  const [fanSearchQuery, setFanSearchQuery] = useState("");
  const [joinDecision, setJoinDecision] = useState<ReturnType<typeof resolveInstantJoin> | null>(null);

  const categoryRecords = useMemo(() => {
    if (showGenreLobbyTabs) {
      const sideRecords = filterDiscoveryByGenreLobbySide(records, genreLobbySide);
      return filterDiscoveryByGenreId(sideRecords, selectedGenreId);
    }
    return filterDiscoveryByWallCategory(records, activeCategory);
  }, [records, activeCategory, showGenreLobbyTabs, genreLobbySide, selectedGenreId]);

  const fanSearchResults = useMemo(() => {
    if (!showFanLobbySearch || !canSearchFanAvatarLobbies(viewerRole)) return [];
    if (!fanSearchQuery.trim()) return [];
    return filterFanAvatarLobbySearch(records, fanSearchQuery);
  }, [records, fanSearchQuery, showFanLobbySearch, viewerRole]);

  const displayRecords = fanSearchResults.length > 0 ? fanSearchResults : categoryRecords;

  const rooms = useMemo(
    () => displayRecords.map(discoveryToLobbyRoom),
    [displayRecords],
  );

  const handleRoomJoin = useCallback(
    (room: LobbyRoom) => {
      if (onRoomJoin) {
        onRoomJoin(room);
        return;
      }
      const record =
        displayRecords.find((r) => r.roomId === room.id || r.id === room.id) ?? null;
      if (record) {
        setJoinDecision(resolveInstantJoin(record, { role: viewerRole }));
        return;
      }
      const dest = resolveLobbyDestination({
        roomId: room.id,
        kind:
          room.type === "battle" || room.type === "cypher" || room.type === "challenge"
            ? room.type
            :           room.type === "lounge"
              ? "lounge"
              : room.type === "performer-lobby"
                ? "performer-lobby"
                : "live",
        href: room.href,
      });
      setJoinDecision({
        instant: true,
        gateReason: "none",
        href: dest.href,
        room: {
          id: room.id,
          title: room.name,
          hostName: room.performerName,
          genre: room.genre,
          viewers: room.viewerCount,
          status: room.status === "live" ? "live" : "starting-soon",
          access: "free",
          accentColor,
          roomRoute: dest.href,
          venueIndex: 0,
        },
      });
    },
    [onRoomJoin, displayRecords, viewerRole, accentColor],
  );

  const advanceCategory = useCallback(
    (direction: "next" | "prev") => {
      setActiveCategory((cur) => advanceLobbyWallCategory(cur, direction));
      setFanSearchQuery("");
    },
    [],
  );

  const fanSearchActive = fanSearchQuery.trim().length > 0;

  const sideTabPills = showGenreLobbyTabs && !fanSearchActive
    ? {
        items: [...GENRE_LOBBY_WALL_SIDE_TABS],
        activeId: genreLobbySide,
        onSelect: (id: string) => setGenreLobbySide(id as GenreLobbyWallSide),
      }
    : undefined;

  const genrePills = showGenreLobbyTabs && !fanSearchActive
    ? {
        items: [...GENRE_LOBBY_WALL_GENRE_PILLS],
        activeId: selectedGenreId,
        onSelect: (id: string) => setSelectedGenreId(id as CanonicalGenreId | "all"),
      }
    : undefined;

  const categoryPills = fanSearchActive
    ? undefined
    : showGenreLobbyTabs
      ? genrePills
      : {
          items: [...LOBBY_WALL_CORE_CATEGORY_TABS],
          activeId: activeCategory,
          onSelect: (id: string) => setActiveCategory(id as LobbyWallCoreCategoryId),
          onAdvance: advanceCategory,
        };

  return (
    <>
      {showGenreLobbyTabs && sideTabPills && !fanSearchActive && (
        <LobbyCategoryPillRow
          items={sideTabPills.items}
          activeId={sideTabPills.activeId}
          onSelect={sideTabPills.onSelect}
        />
      )}

      {showFanLobbySearch && !showGenreLobbyTabs && (
        <RoleGate allow={["FAN", "BAND", "USER"]}>
          <div style={{ padding: variant === "quick" ? "0 4px 8px" : "0 0 10px" }}>
            <label
              htmlFor="fan-avatar-lobby-search"
              style={{
                display: "block",
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: "0.14em",
                color: "#00FFFF",
                marginBottom: 6,
              }}
            >
              FAN AVATAR LOBBY SEARCH
            </label>
            <input
              id="fan-avatar-lobby-search"
              type="search"
              value={fanSearchQuery}
              onChange={(e) => setFanSearchQuery(e.target.value)}
              placeholder="Search avatar fan lobbies…"
              autoComplete="off"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid rgba(0,255,255,0.35)",
                background: "rgba(0,255,255,0.06)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 600,
              }}
            />
            {fanSearchActive && (
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
                {fanSearchResults.length === 0
                  ? "No matching Fan Avatar Lobbies (lounge side rooms excluded)."
                  : `${fanSearchResults.length} avatar lobby${fanSearchResults.length === 1 ? "" : "ies"} · tap to join`}
              </div>
            )}
          </div>
        </RoleGate>
      )}

      <LiveLobbyWallGrid
        rooms={rooms}
        title={
          fanSearchActive
            ? "Fan Avatar Lobby Results"
            : showGenreLobbyTabs
              ? `${genreLobbySide === "FAN" ? "Fan Avatar" : "Performer"} Genre Lobbies`
              : title
        }
        accentColor={accentColor}
        typeLabel={typeLabel}
        variant={variant}
        onRoomJoin={handleRoomJoin}
        enableMobileRoam={enableMobileRoam && variant !== "quick"}
        categoryPills={categoryPills}
      />

      {joinDecision && !onRoomJoin ? (
        <LobbyEntryFlow
          room={joinDecision.room}
          instant={joinDecision.instant}
          onClose={() => setJoinDecision(null)}
        />
      ) : null}
    </>
  );
}

/** Exported for tests / role matrix documentation. */
export function fanLobbySearchRoleMatrix(): Record<string, boolean> {
  return {
    FAN: canSearchFanAvatarLobbies("FAN"),
    BAND: canSearchFanAvatarLobbies("BAND"),
    USER: canSearchFanAvatarLobbies("USER"),
    PERFORMER: canSearchFanAvatarLobbies("PERFORMER"),
    ARTIST: canSearchFanAvatarLobbies("ARTIST"),
    VENUE: canSearchFanAvatarLobbies("VENUE"),
    SPONSOR: canSearchFanAvatarLobbies("SPONSOR"),
    ADVERTISER: canSearchFanAvatarLobbies("ADVERTISER"),
    PROMOTER: canSearchFanAvatarLobbies("PROMOTER"),
    ADMIN: canSearchFanAvatarLobbies("ADMIN"),
  };
}

export type { LiveDiscoveryRecord };
