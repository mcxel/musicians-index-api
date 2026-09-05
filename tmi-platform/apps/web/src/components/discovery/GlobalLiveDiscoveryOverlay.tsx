/**
 * GlobalLiveDiscoveryOverlay — Live Lobby Walls (human name).
 * Brady-Bunch WebRTC video wall via LiveLobbyWallGrid.
 * Non-modal floating discovery panel. Real published rooms only (Rule 20).
 * Tile click focuses in-panel → LobbyEntryFlow (Instant Join).
 */

"use client";

import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LobbyEntryFlow } from "@/components/room/UniversalLobbyEntry";
import LiveLobbyWallHost from "@/components/live/LiveLobbyWallHost";
import type { LobbyRoom } from "@/components/live/LiveLobbyWallGrid";
import { resolveInstantJoin } from "@/lib/discovery/InstantJoinRuntime";
import { useDiscoveryBus } from "@/lib/discovery/useDiscoveryBus";
import { mapDiscoveryToWallCategory } from "@/lib/lobby/liveLobbyWallLaw";
import { useLiveDiscoveryOverlay } from "@/lib/discovery/liveDiscoveryOverlayStore";

export interface GlobalLiveDiscoveryOverlayProps {
  /** Optional session user id for private/friends entitlement */
  viewerUserId?: string | null;
  viewerRole?: string | null;
}

export default function GlobalLiveDiscoveryOverlay({
  viewerUserId: viewerUserIdProp = null,
  viewerRole: viewerRoleProp,
}: GlobalLiveDiscoveryOverlayProps) {
  const pathname = usePathname() ?? "";
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

  const defaultWallCategory = mapDiscoveryToWallCategory(lockedCategory ?? undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  // HQ / Command Center: Discovery must never permanently obstruct Stage Deck.
  // Path gate runs AFTER all hooks (Rules of Hooks). Capability stays under OPS/GPS.
  const currentPath = pathname || (typeof window !== "undefined" ? window.location.pathname : "");
  const suppressOnHq =
    currentPath.startsWith("/hub") || currentPath.startsWith("/dashboard");

  useEffect(() => {
    if (suppressOnHq && isOpen) close();
  }, [suppressOnHq, isOpen, close]);

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

  const handleRoomJoin = useCallback(
    (room: LobbyRoom) => {
      const record = records.find((r) => r.roomId === room.id || r.id === room.id) ?? null;
      if (record) {
        setJoinRoom(resolveInstantJoin(record, { role: viewerRole }));
      }
    },
    [records, viewerRole],
  );

  if (suppressOnHq || !mounted) return null;

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
                  flex: 1,
                  overflow: "hidden",
                  padding: "10px 14px 16px",
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <LiveLobbyWallHost
                  accentColor="#00FFFF"
                  title="Live Now Video Wall"
                  typeLabel="LIVE"
                  variant="embedded"
                  viewerUserId={viewerUserId}
                  viewerRole={viewerRole}
                  defaultCategory={defaultWallCategory}
                  onRoomJoin={handleRoomJoin}
                  showFanLobbySearch
                  enableMobileRoam
                />
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
