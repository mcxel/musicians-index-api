"use client";

/**
 * LiveLobbyWallHost — unified lobby wall surface: category tabs, WebRTC mosaic,
 * optional Fan Avatar Lobby search (Rule 26), mobile free-roam pan.
 * Wires LiveLobbyWallGrid + DiscoveryBus — no second discovery mill.
 * Shows & Releases tab merges catalog cards (scheduled) with live concert discovery.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import RoleGate from "@/components/auth/RoleGate";
import LiveLobbyWallGrid, { type LobbyRoom } from "@/components/live/LiveLobbyWallGrid";
import { LobbyEntryFlow } from "@/components/room/UniversalLobbyEntry";
import { useDiscoveryBus } from "@/lib/discovery/useDiscoveryBus";
import { discoveryToLobbyRoom } from "@/lib/discovery/discoveryToLobbyRoom";
import { resolveInstantJoin } from "@/lib/discovery/InstantJoinRuntime";
import type { LiveDiscoveryRecord } from "@/lib/discovery/LiveDiscoveryRecord";
import { resolveLobbyDestination } from "@/lib/lobby/DestinationResolver";
import {
  LOBBY_WALL_CORE_CATEGORY_TABS,
  advanceLobbyWallCategory,
  attachLobbyBoostFlags,
  canSearchFanAvatarLobbies,
  filterDiscoveryByWallCategory,
  filterFanAvatarLobbySearch,
  sortLobbyTilesByViewRank,
  type LobbyWallCoreCategoryId,
} from "@/lib/lobby/liveLobbyWallLaw";
import { resolveParticipationEntry } from "@/lib/live/ParticipationStateMachine";
import type { ShowsReleasePublicCard } from "@/lib/events/ScheduledEventRegistry";
import { getWorldDancePartySchedule, getSlowJamsSchedule } from "@/lib/events/ScheduledEventRegistry";
import { useAuth } from "@/lib/hooks/useAuth";
import { SLOW_JAM_MOTION } from "@/lib/live/ExperiencePersonality";

function catalogCardToLobbyRoom(card: ShowsReleasePublicCard): LobbyRoom {
  return {
    id: card.roomId,
    name: card.title,
    performerName: card.performerName,
    hostUserId: card.performerId,
    type: "concert",
    href: card.joinHref,
    viewerCount: 0,
    status: card.phase === "LIVE" ? "live" : card.phase === "POSTSHOW" ? "ended" : "starting",
    genre: card.publicTypeLabel,
    previewUrl: card.previewUrl,
    overlayLine: card.phase === "LIVE" ? `LIVE · ${card.publicTypeLabel}` : `STARTING SOON · ${card.publicTypeLabel}`,
  };
}

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
  defaultCategory = "challenges",
  showFanLobbySearch = true,
  enableMobileRoam = true,
}: LiveLobbyWallHostProps) {
  const { role: sessionRole } = useAuth();
  const viewerRole = viewerRoleProp ?? sessionRole;
  const records = useDiscoveryBus(viewerUserId);

  const [activeCategory, setActiveCategory] = useState<LobbyWallCoreCategoryId>(defaultCategory);
  const [fanSearchQuery, setFanSearchQuery] = useState("");
  const [joinDecision, setJoinDecision] = useState<ReturnType<typeof resolveInstantJoin> | null>(null);
  const [showCatalog, setShowCatalog] = useState<ShowsReleasePublicCard[]>([]);
  const [boostMap, setBoostMap] = useState<Map<string, { expiresAtMs: number; kind: "lobby_wall" | "wdp_submission" }>>(
    () => new Map(),
  );

  useEffect(() => {
    let cancelled = false;
    const loadBoosts = async () => {
      try {
        const res = await fetch("/api/lobby-wall/boosts", { cache: "no-store" });
        const data = (await res.json()) as {
          boosts?: Array<{ roomId: string; expiresAtMs: number; kind: "lobby_wall" | "wdp_submission" }>;
        };
        if (cancelled) return;
        const next = new Map<string, { expiresAtMs: number; kind: "lobby_wall" | "wdp_submission" }>();
        for (const b of data.boosts ?? []) {
          next.set(b.roomId, { expiresAtMs: b.expiresAtMs, kind: b.kind });
        }
        setBoostMap(next);
      } catch {
        if (!cancelled) setBoostMap(new Map());
      }
    };
    void loadBoosts();
    const t = setInterval(loadBoosts, 12_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  useEffect(() => {
    if (activeCategory !== "shows_and_releases") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/events/shows-releases", { cache: "no-store" });
        const data = (await res.json()) as { events?: ShowsReleasePublicCard[] };
        if (!cancelled) setShowCatalog(Array.isArray(data.events) ? data.events : []);
      } catch {
        if (!cancelled) setShowCatalog([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeCategory]);

  const categoryRecords = useMemo(
    () => filterDiscoveryByWallCategory(records, activeCategory),
    [records, activeCategory],
  );

  const fanSearchResults = useMemo(() => {
    if (!showFanLobbySearch || !canSearchFanAvatarLobbies(viewerRole)) return [];
    if (!fanSearchQuery.trim()) return [];
    return filterFanAvatarLobbySearch(records, fanSearchQuery);
  }, [records, fanSearchQuery, showFanLobbySearch, viewerRole]);

  const displayRecords = fanSearchResults.length > 0 ? fanSearchResults : categoryRecords;

  const rooms = useMemo(() => {
    let base: LobbyRoom[];
    if (activeCategory === "shows_and_releases" && fanSearchResults.length === 0) {
      const liveRooms = displayRecords.map(discoveryToLobbyRoom);
      const liveIds = new Set(liveRooms.map((r) => r.id));
      const catalogRooms = showCatalog
        .filter((c) => c.publishStatus === "PUBLISHED")
        .map(catalogCardToLobbyRoom)
        .filter((r) => !liveIds.has(r.id));
      base = [...liveRooms, ...catalogRooms];
    } else {
      const mapped = displayRecords.map(discoveryToLobbyRoom);
      if (activeCategory === "world_dance_party" && fanSearchResults.length === 0) {
        const wdp = getWorldDancePartySchedule();
        const pinned: LobbyRoom = {
          id: "world-dance-party",
          name: wdp.phase === "LIVE" ? "🌍 WORLD Dance Party" : "🌍 WORLD Dance Party — Friday",
          performerName: "DJ Record Ralph",
          hostUserId: "record-ralph",
          type: "dance",
          href: "/rooms/world-dance-party",
          viewerCount: 0,
          status: wdp.phase === "LIVE" ? "live" : wdp.phase === "SUBMIT_OPEN" ? "starting" : "recruiting",
          genre: "Official · All-day Friday ET",
          overlayLine: wdp.label,
        };
        base = mapped.some((r) => r.id === pinned.id) ? mapped : [pinned, ...mapped];
      } else if (activeCategory === "lounges" && fanSearchResults.length === 0) {
        const sj = getSlowJamsSchedule();
        const pinned: LobbyRoom = {
          id: "slow-jams",
          name:
            sj.phase === "LIVE"
              ? "🌙 Sunday Slow Jams"
              : sj.phase === "SUBMIT_OPEN"
                ? "🌙 Slow Jams — recruiting"
                : "🌙 Slow Jams — next Sunday",
          performerName: "Wave.Cast",
          hostUserId: "bot-dj-2",
          type: "lounge",
          href: "/rooms/slow-jams",
          viewerCount: 0,
          status:
            sj.phase === "LIVE"
              ? "live"
              : sj.phase === "SUBMIT_OPEN"
                ? "starting"
                : "recruiting",
          genre: "Official · All-day Sunday ET",
          overlayLine:
            sj.phase === "LIVE"
              ? SLOW_JAM_MOTION.copyLive
              : sj.phase === "SUBMIT_OPEN"
                ? sj.label
                : SLOW_JAM_MOTION.copyClosed,
        };
        base = mapped.some((r) => r.id === pinned.id) ? mapped : [pinned, ...mapped];
      } else {
        base = mapped;
      }
    }
    return sortLobbyTilesByViewRank(attachLobbyBoostFlags(base, boostMap));
  }, [activeCategory, displayRecords, showCatalog, fanSearchResults.length, boostMap]);

  const handleRoomJoin = useCallback(
    (room: LobbyRoom) => {
      if (onRoomJoin) {
        onRoomJoin(room);
        return;
      }
      const record =
        displayRecords.find((r) => r.roomId === room.id || r.id === room.id) ?? null;
      if (record) {
        setJoinDecision(resolveInstantJoin(record, { role: viewerRole, selectedStyle: room.selectedCallout }));
        return;
      }
      const catalog = showCatalog.find((c) => c.roomId === room.id || c.eventId === room.id);
      if (catalog) {
        const ticketed = catalog.ticketRequested && catalog.phase !== "POSTSHOW";
        setJoinDecision({
          instant: !ticketed && catalog.phase === "LIVE",
          gateReason: ticketed ? "ticket" : "none",
          href: catalog.joinHref,
          entryMode: "SPECTATOR",
          roomKind: "show_release",
          initialState: "SPECTATOR",
          claimFanSeat: true,
          room: {
            id: catalog.roomId,
            title: catalog.title,
            hostName: catalog.performerName,
            genre: catalog.publicTypeLabel,
            viewers: 0,
            status: catalog.phase === "LIVE" ? "live" : "upcoming",
            access: ticketed ? "paid" : "free",
            entryPriceUsd: catalog.requestedPriceUsd ?? undefined,
            eventId: catalog.eventId,
            accentColor: "#FFD700",
            roomRoute: catalog.joinHref,
            venueIndex: 0,
            thumbnailUrl: catalog.artworkUrl ?? undefined,
            participationEntryMode: "SPECTATOR",
            participationRoomKind: "show_release",
            claimFanSeat: true,
          },
        });
        return;
      }
      const dest = resolveLobbyDestination({
        roomId: room.id,
        kind:
          room.type === "battle" || room.type === "cypher" || room.type === "challenge"
            ? room.type
            : room.type === "lounge"
              ? "lounge"
              : room.type === "performer-lobby"
                ? "performer-lobby"
                : "live",
        href: room.href,
      });
      const fallbackKind =
        room.type === "battle"
          ? "battle"
          : room.type === "cypher"
            ? "cypher"
            : room.type === "challenge"
              ? "challenge"
              : room.type === "lounge"
                ? "lounge"
                : room.type === "performer-lobby"
                  ? "performer_lobby"
                  : "live";
      const resolution = resolveParticipationEntry({
        role: viewerRole,
        roomKind: fallbackKind,
      });
      setJoinDecision({
        instant: true,
        gateReason: "none",
        href: dest.href,
        entryMode: resolution.entryMode,
        roomKind: resolution.roomKind,
        initialState: resolution.initialState,
        claimFanSeat: resolution.claimFanSeat,
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
          participationEntryMode: resolution.entryMode,
          participationRoomKind: resolution.roomKind,
          claimFanSeat: resolution.claimFanSeat,
        },
      });
    },
    [onRoomJoin, displayRecords, viewerRole, accentColor, showCatalog],
  );

  const advanceCategory = useCallback((direction: "next" | "prev") => {
    setActiveCategory((cur) => advanceLobbyWallCategory(cur, direction));
    setFanSearchQuery("");
  }, []);

  const fanSearchActive = fanSearchQuery.trim().length > 0;

  const categoryPills = fanSearchActive
    ? undefined
    : {
        items: [...LOBBY_WALL_CORE_CATEGORY_TABS],
        activeId: activeCategory,
        onSelect: (id: string) => setActiveCategory(id as LobbyWallCoreCategoryId),
        onAdvance: advanceCategory,
      };

  const wallTitle =
    fanSearchActive
      ? "Fan Avatar Lobby Results"
      : activeCategory === "shows_and_releases"
        ? "Shows & Releases"
        : title;

  return (
    <>
      {showFanLobbySearch && (
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
        title={wallTitle}
        accentColor={activeCategory === "shows_and_releases" ? "#FFD700" : accentColor}
        typeLabel={activeCategory === "shows_and_releases" ? "SHOWS" : typeLabel}
        variant={variant}
        onRoomJoin={handleRoomJoin}
        enableMobileRoam={enableMobileRoam && variant !== "quick"}
        categoryPills={categoryPills}
      />

      {joinDecision ? (
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
