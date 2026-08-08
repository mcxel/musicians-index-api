/**
 * GlobalLiveDiscoveryOverlay — Live Lobby Walls (human name).
 * Brady-Bunch WebRTC video wall via LiveLobbyWallGrid.
 * Non-modal floating discovery panel. Real published rooms only (Rule 20).
 * Tile click focuses in-panel → LobbyEntryFlow (Instant Join).
 */

"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LobbyEntryFlow } from "@/components/room/UniversalLobbyEntry";
import LiveLobbyWallGrid, { type LobbyRoom } from "@/components/live/LiveLobbyWallGrid";
import { resolveInstantJoin } from "@/lib/discovery/InstantJoinRuntime";
import { useDiscoveryBus } from "@/lib/discovery/useDiscoveryBus";
import { discoveryToLobbyRoom } from "@/lib/discovery/discoveryToLobbyRoom";
import {
  LIVE_DISCOVERY_CATEGORY_LABELS,
  LIVE_DISCOVERY_RAIL_ORDER,
  type LiveDiscoveryCategory,
} from "@/lib/discovery/LiveDiscoveryRecord";
import { resolveLobbyDestination } from "@/lib/lobby/DestinationResolver";
import { useLiveDiscoveryOverlay } from "@/lib/discovery/liveDiscoveryOverlayStore";
import { sanitizeWallHostLabel } from "@/lib/lobby/wallPublicIdentity";

export interface GlobalLiveDiscoveryOverlayProps {
  /** Optional session user id for private/friends entitlement */
  viewerUserId?: string | null;
  viewerRole?: string | null;
}

export default function GlobalLiveDiscoveryOverlay({
  viewerUserId: viewerUserIdProp = null,
  viewerRole: viewerRoleProp,
}: GlobalLiveDiscoveryOverlayProps) {
  const {
    isOpen,
    lockedCategory,
    tvMode,
    close,
    setTvMode,
    setLockedCategory,
  } = useLiveDiscoveryOverlay();

  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [sessionRole, setSessionRole] = useState<string>("FAN");
  const viewerUserId = viewerUserIdProp ?? sessionUserId;
  const viewerRole = viewerRoleProp ?? sessionRole;

  const records = useDiscoveryBus(viewerUserId);
  const [mounted, setMounted] = useState(false);
  const [joinRoom, setJoinRoom] = useState<ReturnType<typeof resolveInstantJoin> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || viewerUserIdProp) return;
    let cancelled = false;
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((data: { authenticated?: boolean; user?: { id?: string; role?: string } }) => {
        if (cancelled || !data?.authenticated) return;
        setSessionUserId(data.user?.id ?? null);
        setSessionRole((data.user?.role ?? "FAN").toUpperCase());
      })
      .catch(() => {
        /* public wall still works */
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, viewerUserIdProp]);

  const filteredRecords = useMemo(() => {
    if (!lockedCategory) return records;
    return records.filter(
      (r) => r.category === lockedCategory || r.categories.includes(lockedCategory),
    );
  }, [records, lockedCategory]);

  const lobbyRooms = useMemo(
    () => filteredRecords.map(discoveryToLobbyRoom),
    [filteredRecords],
  );

  const handleRoomJoin = useCallback(
    (room: LobbyRoom) => {
      const record =
        filteredRecords.find((r) => r.roomId === room.id || r.id === room.id) ?? null;
      if (record) {
        setJoinRoom(resolveInstantJoin(record, { role: viewerRole }));
        return;
      }
      const dest = resolveLobbyDestination({
        roomId: room.id,
        kind:
          room.type === "mini-cypher"
            ? "cypher"
            : room.type === "gauntlet"
              ? "gauntlet"
              : room.type === "battle" ||
                  room.type === "cypher" ||
                  room.type === "challenge" ||
                  room.type === "game" ||
                  room.type === "live" ||
                  room.type === "dance" ||
                  room.type === "concert" ||
                  room.type === "lounge"
                ? room.type
                : "live",
        href: room.href,
      });
      setJoinRoom({
        instant: true,
        gateReason: "none",
        href: dest.href,
        room: {
          id: room.id,
          title: room.name,
          hostName: sanitizeWallHostLabel(room.performerName, { hostUserId: room.hostUserId }),
          genre: room.genre,
          viewers: room.viewerCount,
          seatsOpen: undefined,
          status: room.status === "live" ? "live" : room.status === "starting" ? "starting-soon" : "upcoming",
          access: "free",
          accentColor: "#00FFFF",
          prizeLabel: room.prizePool,
          roomRoute: dest.href,
          venueIndex: 0,
        },
      });
    },
    [filteredRecords, viewerRole],
  );

  const emptyMessage = lockedCategory
    ? "No live events in your filters"
    : "No live rooms right now";

  if (!mounted) return null;

  return createPortal(
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="live-lobby-walls"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 92000,
              pointerEvents: "none",
            }}
          >
            <div
              role="presentation"
              onClick={close}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(5,5,16,0.45)",
                pointerEvents: "auto",
              }}
            />

            <motion.div
              role="dialog"
              aria-label="Live Lobby Walls"
              aria-modal="false"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.17, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                pointerEvents: "auto",
                position: "absolute",
                left: "50%",
                top: "4%",
                transform: "translateX(-50%)",
                width: "min(1100px, calc(100vw - 24px))",
                maxHeight: "min(90vh, 860px)",
                display: "flex",
                flexDirection: "column",
                background: "rgba(8, 8, 22, 0.96)",
                backdropFilter: "blur(22px)",
                border: "1px solid rgba(0,255,255,0.35)",
                borderRadius: 18,
                boxShadow:
                  "0 20px 60px rgba(0,0,0,0.85), 0 0 40px rgba(0,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
                color: "#fff",
                fontFamily: "'Inter', sans-serif",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "14px 18px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 9,
                      letterSpacing: "0.22em",
                      color: "#00FFFF",
                      fontWeight: 900,
                    }}
                  >
                    LIVE LOBBY WALLS
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900, marginTop: 2 }}>
                    Continuous Video Wall · Instant Join
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setTvMode(!tvMode)}
                    title="TV Mode auto-highlights rooms; panel stays put"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: tvMode
                        ? "1px solid #FFD700"
                        : "1px solid rgba(255,255,255,0.15)",
                      background: tvMode
                        ? "rgba(255,215,0,0.18)"
                        : "rgba(255,255,255,0.04)",
                      color: tvMode ? "#FFD700" : "rgba(255,255,255,0.7)",
                      fontSize: 9,
                      fontWeight: 900,
                      letterSpacing: "0.06em",
                      cursor: "pointer",
                    }}
                  >
                    TV MODE {tvMode ? "ON" : "OFF"}
                  </button>
                  {lockedCategory && (
                    <button
                      type="button"
                      onClick={() => setLockedCategory(null)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: "1px solid rgba(255,45,170,0.5)",
                        background: "rgba(255,45,170,0.15)",
                        color: "#FF2DAA",
                        fontSize: 9,
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      UNLOCK CHANNEL
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close Live Lobby Walls"
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.15)",
                      background: "rgba(255,255,255,0.06)",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div
                style={{
                  flexShrink: 0,
                  display: "flex",
                  gap: 6,
                  padding: "10px 14px",
                  overflowX: "auto",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setLockedCategory(null)}
                  style={chipStyle(!lockedCategory)}
                >
                  ALL
                </button>
                {LIVE_DISCOVERY_RAIL_ORDER.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setLockedCategory(cat)}
                    style={chipStyle(lockedCategory === cat)}
                  >
                    {LIVE_DISCOVERY_CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>

              <div
                style={{
                  flex: 1,
                  overflow: "hidden",
                  padding: "10px 14px 16px",
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {lobbyRooms.length === 0 ? (
                  <div
                    style={{
                      padding: "48px 20px",
                      textAlign: "center",
                      color: "rgba(255,255,255,0.55)",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {emptyMessage}
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 11,
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.35)",
                      }}
                    >
                      Go live publicly to appear here. Counts show real humans only.
                    </div>
                  </div>
                ) : (
                  <LiveLobbyWallGrid
                    rooms={lobbyRooms}
                    title="Live Now Video Wall"
                    accentColor="#00FFFF"
                    typeLabel="LIVE"
                    variant="embedded"
                    onRoomJoin={handleRoomJoin}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {joinRoom && (
        <LobbyEntryFlow
          room={joinRoom.room}
          instant
          onClose={() => {
            setJoinRoom(null);
            close();
          }}
        />
      )}
    </>,
    document.body,
  );
}

function chipStyle(active: boolean): CSSProperties {
  return {
    flexShrink: 0,
    padding: "5px 11px",
    borderRadius: 14,
    border: active ? "1px solid #00FFFF" : "1px solid rgba(255,255,255,0.12)",
    background: active ? "rgba(0,255,255,0.18)" : "rgba(255,255,255,0.03)",
    color: active ? "#00FFFF" : "rgba(255,255,255,0.6)",
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: "0.04em",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };
}
