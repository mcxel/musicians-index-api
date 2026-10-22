/**
 * HomeLiveLobbyWall — homepage DiscoveryBus surface for Live Lobby Walls.
 * Controlled-chaos Home mosaic: independent 13–20s clocks per surface.
 * Consumes PromotionalMosaicFabric + LiveMosaicPromotionDirector.
 * SELECT ≠ WATCH ≠ JOIN. MUTED by default (no parallel program audio).
 * Honest empty states — never duplicate sessions to fill slots (Rule 20).
 */

"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import LobbyDiscoveryCard from "@/components/discovery/LobbyDiscoveryCard";
import { LobbyEntryFlow } from "@/components/room/UniversalLobbyEntry";
import { useDiscoveryBus } from "@/lib/discovery/useDiscoveryBus";
import {
  filterForHomepageSurface,
  HOMEPAGE_SURFACE_COPY,
  type HomepageDiscoverySurface,
} from "@/lib/discovery/homepageDiscoveryFilters";
import { resolveInstantJoin } from "@/lib/discovery/InstantJoinRuntime";
import type { LiveDiscoveryRecord } from "@/lib/discovery/LiveDiscoveryRecord";
import { useLiveDiscoveryOverlay } from "@/lib/discovery/liveDiscoveryOverlayStore";
import {
  LIVE_LOBBY_WALL_CONTRACT_ID,
  useAdaptiveWorldRuntime,
} from "@/lib/adaptiveWorldRuntime";
import {
  reconcileHomePanelAssignments,
  rotateHomePanelAssignment,
  startHomePanelRotationClock,
} from "@/lib/discovery/homePanelRotationClock";
import {
  MOSAIC_AUDIO,
  MOSAIC_LAYOUT,
  filterPromotionalEligibleRecords,
  mosaicCreatesRoomMembershipOnVisibility,
  recordToMosaicCandidate,
  uniqueSessionsForMosaic,
} from "@/lib/discovery/PromotionalMosaicFabric";

const RIM_KEYFRAMES = `
@keyframes tmiLobbyRimSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

function ensureRimKeyframes() {
  if (typeof document === "undefined") return;
  const id = "tmi-lobby-rim-keyframes";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = RIM_KEYFRAMES;
  document.head.appendChild(style);
}

function HomePanelClock({
  panelIndex,
  onRotate,
  children,
}: {
  panelIndex: number;
  onRotate: (panelIndex: number, cursor: number) => void;
  children: React.ReactNode;
}) {
  const rotateRef = useRef(onRotate);
  const cursorRef = useRef(0);

  useEffect(() => {
    rotateRef.current = onRotate;
  }, [onRotate]);

  useEffect(
    () => startHomePanelRotationClock(() => {
      rotateRef.current(panelIndex, cursorRef.current++);
    }, panelIndex),
    [panelIndex],
  );

  return <>{children}</>;
}

export interface HomeLiveLobbyWallProps {
  surface: HomepageDiscoverySurface;
  /** Max cards shown — never padded with duplicates when inventory is low. */
  maxTiles?: number;
  viewerUserId?: string | null;
  title?: string;
  style?: CSSProperties;
  showOpenOverlay?: boolean;
  viewAllHref?: string;
}

type TileIntent = "SELECT" | "WATCH" | "JOIN";

export default function HomeLiveLobbyWall({
  surface,
  maxTiles = 12,
  viewerUserId = null,
  title,
  style,
  showOpenOverlay = true,
  viewAllHref,
}: HomeLiveLobbyWallProps) {
  const records = useDiscoveryBus(viewerUserId);
  const surfaceRecords = useMemo(() => {
    const filtered = filterForHomepageSurface(records, surface);
    return filterPromotionalEligibleRecords(filtered);
  }, [records, surface]);
  const recordBySessionId = useMemo(() => {
    const map = new Map<string, LiveDiscoveryRecord>();
    for (const r of surfaceRecords) {
      if (!map.has(r.roomId)) map.set(r.roomId, r);
    }
    return map;
  }, [surfaceRecords]);
  const poolIds = useMemo(
    () =>
      uniqueSessionsForMosaic(surfaceRecords.map((r) => recordToMosaicCandidate(r))).map(
        (c) => c.sessionId,
      ),
    [surfaceRecords],
  );
  const copy = HOMEPAGE_SURFACE_COPY[surface];
  const label = title ?? copy.title;
  const { open: openOverlay } = useLiveDiscoveryOverlay();
  useAdaptiveWorldRuntime(LIVE_LOBBY_WALL_CONTRACT_ID);

  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [joinRoom, setJoinRoom] = useState<ReturnType<typeof resolveInstantJoin> | null>(null);
  const [role, setRole] = useState("FAN");
  const [slotSessionIds, setSlotSessionIds] = useState<string[]>([]);
  const [viewportWidth, setViewportWidth] = useState(1200);

  useEffect(() => {
    const sync = () => setViewportWidth(typeof window !== "undefined" ? window.innerWidth : 1200);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const visiblePanelCapacity = Math.min(maxTiles, viewportWidth < MOSAIC_LAYOUT.desktopMediaQueryMinPx ? 6 : 16);

  // Room IDs are canonical; inventory updates retain active assignments and only fill real vacancies.
  useEffect(() => {
    setSlotSessionIds((current) =>
      reconcileHomePanelAssignments(current, poolIds, visiblePanelCapacity),
    );
  }, [poolIds, visiblePanelCapacity]);

  const rotatePanel = useCallback((panelIndex: number, cursor: number) => {
    setSlotSessionIds((current) => {
      const result = rotateHomePanelAssignment(current, poolIds, panelIndex, cursor);
      return result.assignments;
    });
  }, [poolIds]);

  const filtered = slotSessionIds
    .map((sid) => (sid ? recordBySessionId.get(sid) : undefined))
    .filter((r): r is LiveDiscoveryRecord => Boolean(r));

  useEffect(() => {
    ensureRimKeyframes();
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((data: { authenticated?: boolean; user?: { role?: string; activeRole?: string | null } }) => {
        if (!cancelled && data?.authenticated) {
          setRole((data.user?.activeRole ?? data.user?.role ?? "FAN").toUpperCase());
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleIntent = useCallback(
    (record: LiveDiscoveryRecord, intent: TileIntent) => {
      if (intent === "SELECT") {
        setSelectedId(record.roomId);
        // Visibility / select never creates room membership
        void mosaicCreatesRoomMembershipOnVisibility();
        return;
      }
      if (intent === "WATCH") {
        setFocusedId(record.roomId);
        setSelectedId(record.roomId);
        return;
      }
      // JOIN only path — LobbyEntryFlow / InstantJoin
      setJoinRoom(resolveInstantJoin(record, { role }));
    },
    [role],
  );

  const mosaicAccent = copy.accent;
  const isArena = surface === "home5_arena";
  const isMosaic = surface === "home3_mosaic";
  const gridTemplate =
    viewportWidth >= MOSAIC_LAYOUT.desktopMediaQueryMinPx
      ? MOSAIC_LAYOUT.desktopCssGrid
      : MOSAIC_LAYOUT.mobileCssGrid;

  return (
    <>
      <section
        data-home-live-lobby-wall={surface}
        data-home-mosaic-rotation="independent-13s-per-panel"
        data-mosaic-audio-muted-default={MOSAIC_AUDIO.mutedByDefault ? "true" : "false"}
        data-mosaic-columns={viewportWidth >= MOSAIC_LAYOUT.desktopMediaQueryMinPx
          ? String(MOSAIC_LAYOUT.desktopMinColumns)
          : String(MOSAIC_LAYOUT.mobileColumns)}
        data-eligible-room-count={poolIds.length}
        data-visible-panel-capacity={visiblePanelCapacity}
        data-mosaic-interaction="SELECT_WATCH_JOIN"
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px 28px",
          ...style,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.18em",
                fontWeight: 900,
                color: mosaicAccent,
                textTransform: "uppercase",
              }}
            >
              {label}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
              {filtered.length === 0
                ? "No live rooms in this wall right now"
                : `${filtered.length} public rooms · audio muted until watch`}
            </div>
          </div>
          {viewAllHref ? (
            <Link
              href={viewAllHref}
              data-testid={`home-live-lobby-view-all-${surface}`}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: `1px solid ${mosaicAccent}66`,
                background: `${mosaicAccent}18`,
                color: mosaicAccent,
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.08em",
                textDecoration: "none",
              }}
            >
              VIEW ALL →
            </Link>
          ) : showOpenOverlay ? (
            <button
              type="button"
              onClick={() =>
                openOverlay({
                  lockedCategory: isArena ? "battles" : isMosaic ? "live_now" : null,
                })
              }
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: `1px solid ${mosaicAccent}66`,
                background: `${mosaicAccent}18`,
                color: mosaicAccent,
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.08em",
                cursor: "pointer",
              }}
            >
              ALL LIVE LOBBY WALLS →
            </button>
          ) : null}
        </div>

        {filtered.length === 0 ? (
          <div
            style={{
              borderRadius: 14,
              border: `1px solid ${mosaicAccent}33`,
              background: isMosaic
                ? "linear-gradient(145deg, rgba(0,255,136,0.08), rgba(5,5,16,0.9))"
                : isArena
                  ? "linear-gradient(145deg, rgba(255,45,170,0.1), rgba(5,5,16,0.9))"
                  : "rgba(5,5,16,0.85)",
              padding: "40px 20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 900,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 8,
              }}
            >
              {copy.emptyTitle}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.4)",
                marginBottom: 16,
                maxWidth: 360,
                marginInline: "auto",
              }}
            >
              {copy.emptyHint}
            </div>
            <Link
              href={copy.goLiveHref}
              style={{
                display: "inline-block",
                padding: "10px 18px",
                borderRadius: 8,
                background: mosaicAccent,
                color: "#050510",
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.08em",
                textDecoration: "none",
              }}
            >
              {isArena ? "ENTER ARENA" : "GO LIVE"}
            </Link>
          </div>
        ) : (
          <div
            data-mosaic-grid="promotional"
            style={{
              display: "grid",
              gridTemplateColumns: gridTemplate,
              gap: 12,
              alignItems: "stretch",
            }}
          >
            {filtered.map((r) => {
              const isSelected = selectedId === r.roomId;
              const isFocused = focusedId === r.roomId;
              return (
                <HomePanelClock key={slotSessionIds.indexOf(r.roomId)} panelIndex={slotSessionIds.indexOf(r.roomId)} onRotate={rotatePanel}>
                  <div
                    key={r.roomId}
                    data-mosaic-tile={r.roomId}
                    data-room-id={r.roomId}
                    data-category={r.category}
                    data-provenance={r.sourceType ?? "UNKNOWN"}
                    data-live-state={r.isLive ? "LIVE" : "NOT_LIVE"}
                    data-exact-room-destination={r.joinRoute}
                    data-mosaic-selected={isSelected ? "true" : "false"}
                    data-mosaic-focused={isFocused ? "true" : "false"}
                    onMouseEnter={() => setFocusedId(r.roomId)}
                    onMouseLeave={() => setFocusedId((cur) => (cur === r.roomId ? null : cur))}
                    style={{ animation: "homeRoomPanelEnter 220ms ease-out both" }}
                  >
                    <LobbyDiscoveryCard
                      record={r}
                      focused={isFocused || isSelected}
                      onJoin={(rec) => handleIntent(rec, "JOIN")}
                      onSelect={(rec) => handleIntent(rec, "SELECT")}
                      onWatch={(rec) => handleIntent(rec, "WATCH")}
                    />
                  </div>
                </HomePanelClock>
              );
            })}
          </div>
        )}
      </section>

      {joinRoom && (
        <LobbyEntryFlow
          room={joinRoom.room}
          instant={joinRoom.instant}
          onClose={() => setJoinRoom(null)}
        />
      )}
      <style>{`@keyframes homeRoomPanelEnter { from { opacity: 0; transform: scale(.97); } to { opacity: 1; transform: scale(1); } } @media (prefers-reduced-motion: reduce) { [data-mosaic-tile] { animation: none !important; } }`}</style>
    </>
  );
}
