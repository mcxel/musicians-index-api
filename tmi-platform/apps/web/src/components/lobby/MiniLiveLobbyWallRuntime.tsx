"use client";

/**
 * MiniLiveLobbyWallRuntime.tsx — Phone-Sized Floating Live Wall Discovery Runtime
 *
 * Architecture:
 * 1. Phone-sized floating container on Desktop (360x580px) and responsive sheet on Mobile.
 * 2. Pulls strictly from canonical Live Discovery Bus (zero mock rooms).
 * 3. Horizontal category navigation (LIVE NOW, BATTLES, CHALLENGES, CYPHERS, GAMES, FAN/PERFORMER LOBBIES, LOUNGES).
 * 4. First touch selects and expands the active live room card with a budgeted preview.
 * 5. Distinct WATCH (audience spectator state) vs JOIN (participation path) actions.
 * 6. Background experience remains visibly active throughout.
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { LobbyEntryFlow } from "@/components/room/UniversalLobbyEntry";
import { useDiscoveryBus } from "@/lib/discovery/useDiscoveryBus";
import {
  LOBBY_WALL_CORE_CATEGORY_TABS,
  filterDiscoveryByWallCategory,
  isFanAvatarLobbyRecord,
  isPerformerLobbyRecord,
  type LobbyWallCoreCategoryId,
} from "@/lib/lobby/liveLobbyWallLaw";
import type { LiveDiscoveryRecord } from "@/lib/discovery/LiveDiscoveryRecord";
import { resolveInstantJoin, type InstantJoinDecision } from "@/lib/discovery/InstantJoinRuntime";
import { useLivePrivacyState } from "@/lib/live/livePrivacyState";

export interface MiniLiveLobbyWallRuntimeProps {
  role: "fan" | "performer";
  isOpen: boolean;
  onClose: () => void;
  onSelectRoom?: (room: LiveDiscoveryRecord) => void;
  /** Authenticated viewer — used for YOU / self-tile discovery after GO LIVE. */
  viewerUserId?: string | null;
}

function resolveCategoryForSelf(
  role: "fan" | "performer",
  record: LiveDiscoveryRecord,
): LobbyWallCoreCategoryId {
  if (isFanAvatarLobbyRecord(record)) return "fan_avatar_lobbies";
  if (isPerformerLobbyRecord(record)) return "performer_lobbies";
  if (role === "fan") return "fan_avatar_lobbies";
  return "lives";
}

export default function MiniLiveLobbyWallRuntime({
  role,
  isOpen,
  onClose,
  onSelectRoom,
  viewerUserId = null,
}: MiniLiveLobbyWallRuntimeProps) {
  const router = useRouter();
  const allRecords = useDiscoveryBus();
  const publishedRoomId = useLivePrivacyState((s) => s.publishedRoomId);
  const isLivePublished = useLivePrivacyState((s) => s.isLivePublished);

  // Filter category tabs based on role (Rule 26 — performers never own fan-avatar lobby tabs)
  const categoryTabs = useMemo(() => {
    return LOBBY_WALL_CORE_CATEGORY_TABS.filter((tab) => {
      if (role === "fan" && tab.id === "performer_lobbies") return false;
      if (role === "performer" && tab.id === "fan_avatar_lobbies") return false;
      return true;
    });
  }, [role]);

  const defaultCategory: LobbyWallCoreCategoryId =
    role === "fan" ? "fan_avatar_lobbies" : "lives";
  const [activeCategoryId, setActiveCategoryId] =
    useState<LobbyWallCoreCategoryId>(defaultCategory);
  const [selectedRecord, setSelectedRecord] = useState<LiveDiscoveryRecord | null>(null);
  // Canonical LobbyEntryFlow decision — keeps entry alive if the mini wall closes mid-join.
  const [joinDecision, setJoinDecision] = useState<InstantJoinDecision | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(max-width: 900px)");
    const sync = () => setIsMobileViewport(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  const selfRecord = useMemo(() => {
    if (!isLivePublished && !publishedRoomId && !viewerUserId) return null;
    return (
      allRecords.find(
        (r) =>
          (publishedRoomId && r.roomId === publishedRoomId) ||
          (viewerUserId && r.hostUserId === viewerUserId),
      ) ?? null
    );
  }, [allRecords, isLivePublished, publishedRoomId, viewerUserId]);

  const selfRoomId = selfRecord?.roomId ?? (isLivePublished ? publishedRoomId : null);

  // When the viewer publishes, jump to the tab that holds their session.
  useEffect(() => {
    if (!isOpen || !selfRecord) return;
    const next = resolveCategoryForSelf(role, selfRecord);
    if (categoryTabs.some((t) => t.id === next)) {
      setActiveCategoryId(next);
    }
  }, [isOpen, selfRecord, role, categoryTabs]);

  // Filtered rooms from canonical discovery bus
  const activeRooms = useMemo(() => {
    const filtered = filterDiscoveryByWallCategory(allRecords, activeCategoryId);
    return filtered;
  }, [allRecords, activeCategoryId]);

  // Initial selection — prefer self tile when present
  useEffect(() => {
    if (activeRooms.length === 0) {
      if (selectedRecord) setSelectedRecord(null);
      return;
    }
    const selfInTab = selfRoomId
      ? activeRooms.find((r) => r.roomId === selfRoomId)
      : null;
    if (selfInTab) {
      if (selectedRecord?.id !== selfInTab.id) setSelectedRecord(selfInTab);
      return;
    }
    if (!selectedRecord || !activeRooms.some((r) => r.id === selectedRecord.id)) {
      setSelectedRecord(activeRooms[0] ?? null);
    }
  }, [activeRooms, selectedRecord, selfRoomId]);

  // ── Gestures & Horizontal Category Advancer ────────────────────────────────
  const advanceCategory = useCallback(
    (direction: 1 | -1) => {
      const idx = categoryTabs.findIndex((t) => t.id === activeCategoryId);
      const nextIdx = (idx + direction + categoryTabs.length) % categoryTabs.length;
      const nextCat = categoryTabs[nextIdx]!.id as LobbyWallCoreCategoryId;
      setActiveCategoryId(nextCat);
      setSelectedRecord(null);
    },
    [categoryTabs, activeCategoryId]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        advanceCategory(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        advanceCategory(1);
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, advanceCategory, onClose]);

  // ── Actions: WATCH vs JOIN ──────────────────────────────────────────────────
  const handleWatch = (record: LiveDiscoveryRecord) => {
    onSelectRoom?.(record);
    const hubRole = role === "performer" ? "performer" : "fan";
    router.push(
      `/hub/${hubRole}?watch=${encodeURIComponent(record.roomId)}&from=live-mosaic-rail`,
    );
    onClose();
  };

  const handleJoin = (record: LiveDiscoveryRecord) => {
    onSelectRoom?.(record);
    // Same path as LiveLobbyWallHost → resolveInstantJoin → LobbyEntryFlow
    // (auth / seat / queue / session / exact room). Never bypass canonical entry.
    setJoinDecision(
      resolveInstantJoin(record, { role: role === "performer" ? "PERFORMER" : "FAN" }),
    );
  };

  if (typeof document === "undefined") return null;

  const entryFlow =
    joinDecision != null
      ? createPortal(
          <LobbyEntryFlow
            room={joinDecision.room}
            instant={joinDecision.instant}
            onClose={() => {
              setJoinDecision(null);
              onClose();
            }}
          />,
          document.body,
        )
      : null;

  // Keep LobbyEntryFlow mounted even if the mini wall closes mid-join.
  if (!isOpen && !joinDecision) return null;

  const panelStyle: React.CSSProperties = isMobileViewport
    ? {
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9200,
        width: "100%",
        maxWidth: "100vw",
        height: "min(72dvh, 640px)",
        maxHeight: "calc(100dvh - 72px)",
        background: "rgba(5,5,16,0.98)",
        border: "1px solid rgba(255,45,170,0.45)",
        borderBottom: "none",
        borderRadius: "20px 20px 0 0",
        boxShadow: "0 -24px 60px rgba(0,0,0,0.85)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        color: "#fff",
      }
    : {
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9200,
        width: 360,
        maxWidth: "calc(100vw - 32px)",
        height: "min(560px, calc(100dvh - 96px))",
        maxHeight: "calc(100dvh - 96px)",
        background: "rgba(5,5,16,0.98)",
        border: "1px solid rgba(255,45,170,0.45)",
        borderRadius: 20,
        boxShadow: "0 24px 60px rgba(0,0,0,0.85)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        color: "#fff",
      };

  return (
    <>
      {entryFlow}
      {isOpen
        ? createPortal(
            <div
              data-testid="tmi-mini-live-lobby-wall"
              data-live-lobby-mosaic-rail="1"
              data-live-lobby-wall-discovery="1"
              data-lobby-presentation={isMobileViewport ? "bottom-drawer" : "floating-panel"}
              role="dialog"
              aria-label="Live Lobby Wall Mini Runtime"
              style={panelStyle}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Top Header ──────────────────────────────────────────────────────── */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(0,0,0,0.5)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF4444", display: "inline-block" }} />
                  <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", color: "#FF2DAA" }}>
                    LIVE LOBBY WALL · MOSAIC
                  </span>
                  <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
                    ({role})
                  </span>
                  {selfRoomId ? (
                    <span
                      data-live-mosaic-you-are-live="1"
                      style={{
                        fontSize: 8,
                        fontWeight: 900,
                        color: "#050510",
                        background: role === "performer" ? "#FFD700" : "#00FF88",
                        padding: "3px 8px",
                        borderRadius: 999,
                      }}
                    >
                      YOU ARE LIVE
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    background: "rgba(255,255,255,0.1)",
                    border: "none",
                    color: "#fff",
                    borderRadius: 4,
                    padding: "2px 6px",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>

              {/* ── Horizontal Category Pills ────────────────────────────────────────── */}
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  overflowX: "auto",
                  padding: "8px 12px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(0,0,0,0.3)",
                  scrollbarWidth: "none",
                }}
              >
                {categoryTabs.map((cat) => {
                  const isSelected = activeCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setActiveCategoryId(cat.id as LobbyWallCoreCategoryId);
                        setSelectedRecord(null);
                      }}
                      style={{
                        fontSize: 8,
                        fontWeight: 800,
                        padding: "4px 10px",
                        borderRadius: 16,
                        border: `1px solid ${isSelected ? cat.accentColor : "rgba(255,255,255,0.1)"}`,
                        background: isSelected ? `${cat.accentColor}33` : "rgba(255,255,255,0.03)",
                        color: isSelected ? cat.accentColor : "rgba(255,255,255,0.6)",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* ── Selected Room Active Live Preview Box ───────────────────────────── */}
              {selectedRecord && (
                <div
                  style={{
                    padding: 10,
                    background: "rgba(0,0,0,0.6)",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      height: 120,
                      borderRadius: 10,
                      overflow: "hidden",
                      border: "1px solid rgba(0,255,255,0.3)",
                      background: "#000",
                    }}
                  >
                    {selectedRecord.previewUrl ? (
                      <video
                        src={selectedRecord.previewUrl}
                        autoPlay
                        loop
                        playsInline
                        muted
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : selectedRecord.posterUrl ? (
                      <img
                        src={selectedRecord.posterUrl}
                        alt={selectedRecord.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
                        LIVE AUDIO / STAGE BROADCAST
                      </div>
                    )}
                    <div
                      style={{
                        position: "absolute",
                        top: 6,
                        left: 6,
                        background: "rgba(255,68,68,0.9)",
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontSize: 8,
                        fontWeight: 900,
                      }}
                    >
                      🔴 LIVE
                      {selectedRecord.humanViewerCount > 0
                        ? ` · ${selectedRecord.humanViewerCount} watching`
                        : ""}
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        bottom: 4,
                        left: 6,
                        right: 6,
                        background: "rgba(0,0,0,0.7)",
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontSize: 8,
                        fontWeight: 800,
                        color: "#fff",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {selectedRecord.title} · {selectedRecord.hostName}
                    </div>
                  </div>

                  {/* Differentiated WATCH vs JOIN Action Buttons */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => handleWatch(selectedRecord)}
                      style={{
                        fontSize: 9,
                        fontWeight: 900,
                        padding: "7px 10px",
                        borderRadius: 6,
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "#00FFFF",
                        cursor: "pointer",
                      }}
                    >
                      👁️ WATCH STAGE
                    </button>
                    <button
                      type="button"
                      onClick={() => handleJoin(selectedRecord)}
                      style={{
                        fontSize: 9,
                        fontWeight: 900,
                        padding: "7px 10px",
                        borderRadius: 6,
                        background: "linear-gradient(135deg, #FF2DAA, #FFD700)",
                        color: "#050510",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      🚀 JOIN ROOM
                    </button>
                  </div>
                </div>
              )}

              {/* ── Scrollable Room Tiles ────────────────────────────────────────────── */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: 10,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {activeRooms.length === 0 ? (
                  <div style={{ padding: 24, textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
                    No live rooms active in {activeCategoryId.replace("_", " ")} right now.
                  </div>
                ) : (
                  activeRooms.map((room) => {
                    const isSelected = selectedRecord?.id === room.id;
                    const isSelf = Boolean(
                      selfRoomId &&
                        (room.roomId === selfRoomId ||
                          (viewerUserId && room.hostUserId === viewerUserId)),
                    );
                    return (
                      <div
                        key={room.id}
                        data-live-mosaic-tile={room.roomId}
                        data-live-mosaic-self={isSelf ? "1" : undefined}
                        onClick={() => setSelectedRecord(room)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 10px",
                          borderRadius: 10,
                          background: isSelf
                            ? "rgba(0,255,136,0.14)"
                            : isSelected
                              ? "rgba(255,45,170,0.18)"
                              : "rgba(255,255,255,0.03)",
                          border: `1px solid ${
                            isSelf ? "#00FF88" : isSelected ? "#FF2DAA" : "rgba(255,255,255,0.08)"
                          }`,
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1, paddingRight: 8 }}>
                          <span style={{ fontSize: 9, fontWeight: 900, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {isSelf ? "YOU · " : ""}
                            {room.title}
                          </span>
                          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>
                            {room.hostName} · <span style={{ color: "#00FF88" }}>{room.category || "Live"}</span>
                          </span>
                        </div>
                        <span style={{ fontSize: 8, fontWeight: 900, color: isSelf ? "#00FF88" : "#FF4444" }}>
                          {isSelf ? "YOU · LIVE" : "● LIVE"}
                          {!isSelf && room.humanViewerCount > 0 ? ` · ${room.humanViewerCount}` : ""}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
