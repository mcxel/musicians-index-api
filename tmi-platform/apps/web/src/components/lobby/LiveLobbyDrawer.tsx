"use client";

/**
 * LiveLobbyDrawer.tsx — Canonical Multi-Row Live Lobby Wall & Focused Room Preview
 *
 * Architecture (Reference Rebuild — 2026-09-15):
 * 1. Mounted in CanonicalBottomDrawerHost beneath the mini media player.
 * 2. Floor = permanent 24/7 bot/anchor rooms (isAnchor). Never fabricate filler tiles.
 * 3. Ephemeral human rooms animate in when Discovery publishes LIVE; animate out on leave.
 * 4. Wall height grows/retracts with real panel count (layout animation).
 * 5. WATCH STAGE vs JOIN ROOM remain distinct on focused preview.
 */

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useDiscoveryBus } from "@/lib/discovery/useDiscoveryBus";
import {
  LOBBY_WALL_CORE_CATEGORY_TABS,
  filterDiscoveryByWallCategory,
  type LobbyWallCoreCategoryId,
} from "@/lib/lobby/liveLobbyWallLaw";
import type { LiveDiscoveryRecord } from "@/lib/discovery/LiveDiscoveryRecord";
import { resolveInstantJoin, type InstantJoinDecision } from "@/lib/discovery/InstantJoinRuntime";
import { LobbyEntryFlow } from "@/components/room/UniversalLobbyEntry";
import { useLivePrivacyState } from "@/lib/live/livePrivacyState";
import { useActivePerformer } from "@/lib/context/ActivePerformerContext";

function isPermanentAutomatedRoom(record: LiveDiscoveryRecord): boolean {
  return record.isAnchor === true;
}

function sortLobbyWallRecords(records: LiveDiscoveryRecord[]): LiveDiscoveryRecord[] {
  return [...records].sort((a, b) => {
    const aAnchor = isPermanentAutomatedRoom(a) ? 1 : 0;
    const bAnchor = isPermanentAutomatedRoom(b) ? 1 : 0;
    if (aAnchor !== bAnchor) return bAnchor - aAnchor; // 24/7 anchors first (stable floor)
    if (a.isLive !== b.isLive) return Number(b.isLive) - Number(a.isLive);
    return (b.humanViewerCount ?? 0) - (a.humanViewerCount ?? 0) || a.title.localeCompare(b.title);
  });
}

export interface LiveLobbyWallContentProps {
  role?: "fan" | "performer";
}

export function LiveLobbyWallContent({ role = "fan" }: LiveLobbyWallContentProps) {
  const router = useRouter();
  const busRecords = useDiscoveryBus();
  const publishedRoomId = useLivePrivacyState((s) => s.publishedRoomId);
  const isLivePublished = useLivePrivacyState((s) => s.isLivePublished);
  const { setActivePerformer } = useActivePerformer();

  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<LiveDiscoveryRecord | null>(null);
  const [joinDecision, setJoinDecision] = useState<InstantJoinDecision | null>(null);

  // Responsive media query check
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(max-width: 900px)");
    const sync = () => setIsMobileViewport(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  // Filter category tabs based on role
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

  // DiscoveryBus only — anchors (24/7) + real published live rooms. No fabricated tiles.
  const allRecords = useMemo<LiveDiscoveryRecord[]>(() => busRecords, [busRecords]);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    // Full-workspace Search: when typing, search ALL discovery categories (not only active tab).
    let records = q
      ? allRecords
      : filterDiscoveryByWallCategory(allRecords, activeCategoryId);
    const anchors = allRecords.filter(isPermanentAutomatedRoom);
    const byId = new Map<string, LiveDiscoveryRecord>();
    for (const r of [...anchors, ...records]) byId.set(r.roomId, r);
    records = sortLobbyWallRecords([...byId.values()]);
    if (!q) return records;
    return records.filter(
      (r) =>
        isPermanentAutomatedRoom(r) ||
        r.title.toLowerCase().includes(q) ||
        (r.hostName ?? "").toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        (r.anchorFamily ?? "").toLowerCase().includes(q) ||
        (r.statusLine ?? "").toLowerCase().includes(q) ||
        (r.experienceId ?? "").toLowerCase().includes(q),
    );
  }, [allRecords, activeCategoryId, searchQuery]);

  const ephemeralLiveCount = useMemo(
    () => filteredRecords.filter((r) => !isPermanentAutomatedRoom(r)).length,
    [filteredRecords],
  );
  const automatedFloorCount = useMemo(
    () => filteredRecords.filter(isPermanentAutomatedRoom).length,
    [filteredRecords],
  );

  // When a live room leaves discovery, drop focused preview (panel retracts).
  useEffect(() => {
    if (!selectedRecord) return;
    const stillPresent = filteredRecords.some((r) => r.roomId === selectedRecord.roomId);
    if (!stillPresent) setSelectedRecord(null);
  }, [filteredRecords, selectedRecord]);

  const handleCardClick = (record: LiveDiscoveryRecord) => {
    setSelectedRecord(record);
    // Contextual Artist Shop: Fan selecting Performer A's room binds Shop → A
    if (role === "fan" && record.hostUserId) {
      setActivePerformer({
        id: record.hostUserId,
        slug: record.hostUserId,
        name: record.hostName,
      });
    }
  };

  const handleInstantJoin = (record: LiveDiscoveryRecord) => {
    const decision = resolveInstantJoin(record, { role: role.toUpperCase() });
    setJoinDecision(decision);
  };

  const handleWatchStage = (record: LiveDiscoveryRecord) => {
    if (record.joinRoute) {
      router.push(record.joinRoute);
    }
  };

  return (
    <div
      data-testid="live-lobby-wall-mosaic"
      data-spatial-tier="tier-2"
      data-lobby-wall-mode="expandable-24-7-floor"
      data-lobby-panel-total={filteredRecords.length}
      data-lobby-ephemeral-live={ephemeralLiveCount}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minHeight: 0,
        flex: 1,
        width: "100%",
        color: "#fff",
      }}
    >
      {/* ── Active Lobby Entry Modal Flow ────────────────────────────── */}
      {joinDecision?.room && (
        <LobbyEntryFlow
          room={joinDecision.room}
          instant={joinDecision.instant}
          onClose={() => setJoinDecision(null)}
        />
      )}

      {/* ── Stable Readable HUD Controls ─────────────────────────────── */}
      <div
        data-hud-control-plane
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          flexShrink: 0,
          background: "rgba(5, 5, 16, 0.9)",
          padding: "6px 0",
          borderBottom: "1px solid rgba(0, 229, 255, 0.15)",
        }}
      >
        {/* Search input */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <span
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 12,
                opacity: 0.6,
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search live rooms, battles, cyphers, challenges, artists…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 32px",
                background: "rgba(10, 16, 38, 0.9)",
                border: "1px solid rgba(0, 229, 255, 0.3)",
                borderRadius: 8,
                color: "#fff",
                fontSize: 11,
                fontFamily: "'Inter', sans-serif",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: "#00FFFF",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              padding: "4px 8px",
              background: "rgba(0, 229, 255, 0.1)",
              border: "1px solid rgba(0, 229, 255, 0.25)",
              borderRadius: 6,
            }}
            data-lobby-panel-count={filteredRecords.length}
            data-lobby-automated-count={automatedFloorCount}
            data-lobby-ephemeral-count={ephemeralLiveCount}
          >
            {automatedFloorCount}×24/7
            {ephemeralLiveCount > 0 ? ` · +${ephemeralLiveCount} LIVE` : " · WAITING FOR LIVE"}
          </span>
          {!isMobileViewport ? (
            <button
              type="button"
              data-testid="lobby-wall-detach-btn"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("tmi:detach-lobby-wall"));
                }
              }}
              title="Detach lobby wall as floating panel (same multi-tile authority)"
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.08em",
                color: "#FFD700",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                padding: "4px 8px",
                background: "rgba(255, 215, 0, 0.08)",
                border: "1px solid rgba(255, 215, 0, 0.35)",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              DETACH
            </button>
          ) : null}
        </div>

        {/* Category horizontal pill carousel */}
        <div
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            paddingBottom: 4,
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
                  padding: "5px 12px",
                  borderRadius: 20,
                  border: `1px solid ${isSelected ? cat.accentColor : "rgba(255,255,255,0.12)"}`,
                  background: isSelected ? `${cat.accentColor}28` : "rgba(10, 16, 38, 0.6)",
                  color: isSelected ? cat.accentColor : "rgba(255, 255, 255, 0.7)",
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: 8,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  transition: "all 0.15s ease",
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Spatial Mosaic: 24/7 floor + expanding live panels ───────── */}
      <motion.div
        data-spatial-mosaic-container
        data-lobby-wall-expandable="1"
        layout
        style={{
          flex: 1,
          overflowY: "auto",
          perspective: "1200px",
          position: "relative",
          padding: "4px 2px 16px",
        }}
      >
        {filteredRecords.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "rgba(255,255,255,0.4)",
              fontSize: 12,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            24/7 automated rooms are seeding. Live human rooms appear here as people go live worldwide.
          </div>
        ) : (
          <LayoutGroup id="lobby-wall-mosaic">
            <motion.div
              layout
              data-lobby-mosaic-grid="1"
              style={{
                display: "grid",
                gridTemplateColumns: isMobileViewport
                  ? "repeat(2, minmax(0, 1fr))"
                  : "repeat(4, minmax(0, 1fr))",
                gap: isMobileViewport ? 10 : 14,
              }}
              transition={{ layout: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredRecords.map((record) => {
                  const isSelected = selectedRecord?.roomId === record.roomId;
                  const accent = record.accentColor ?? "#00FFFF";
                  const viewerCount = record.humanViewerCount ?? 0;
                  const automated = isPermanentAutomatedRoom(record);

                  return (
                    <motion.div
                      key={record.roomId}
                      layout
                      data-room-tile={record.roomId}
                      data-room-kind={automated ? "automated-24-7" : "ephemeral-live"}
                      initial={{ opacity: 0, scale: 0.88, y: 18 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.82, y: -12, transition: { duration: 0.28 } }}
                      transition={{
                        layout: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                        opacity: { duration: 0.28 },
                        scale: { duration: 0.32 },
                      }}
                      onClick={() => handleCardClick(record)}
                      style={{
                        position: "relative",
                        background: "linear-gradient(150deg, rgba(16, 24, 52, 0.95) 0%, rgba(6, 10, 24, 0.98) 100%)",
                        border: `1px solid ${isSelected ? "#00FFFF" : automated ? "rgba(255,215,0,0.35)" : "rgba(0, 229, 255, 0.28)"}`,
                        borderRadius: 12,
                        overflow: "hidden",
                        cursor: "pointer",
                        transformStyle: "preserve-3d",
                        boxShadow: isSelected
                          ? `0 16px 40px rgba(0,0,0,0.8), 0 0 20px ${accent}44, inset 0 1px 0 rgba(255,255,255,0.2)`
                          : "0 8px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
                        display: "flex",
                        flexDirection: "column",
                      }}
                      whileHover={{ y: -4, transition: { duration: 0.18 } }}
                    >
                      <div
                        style={{
                          height: isMobileViewport ? 100 : 124,
                          position: "relative",
                          background: "#050814",
                          overflow: "hidden",
                        }}
                      >
                        {record.posterUrl ? (
                          <img
                            src={record.posterUrl}
                            alt={record.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              filter: "brightness(0.9) contrast(1.05)",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: automated
                                ? "radial-gradient(circle at 50% 40%, rgba(255,215,0,0.18), #050814 70%)"
                                : "radial-gradient(circle at 50% 40%, rgba(0,229,255,0.15), #050814 70%)",
                              color: "rgba(255,255,255,0.3)",
                              fontSize: 24,
                            }}
                          >
                            {automated ? "🤖" : "📺"}
                          </div>
                        )}

                        <div
                          style={{
                            position: "absolute",
                            top: 6,
                            left: 6,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            background: "rgba(0,0,0,0.75)",
                            backdropFilter: "blur(4px)",
                            padding: "2px 6px",
                            borderRadius: 4,
                            border: automated
                              ? "1px solid rgba(255,215,0,0.55)"
                              : "1px solid rgba(255,68,68,0.4)",
                          }}
                        >
                          {!automated ? (
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: "#FF3333",
                                boxShadow: "0 0 8px #FF3333",
                                display: "inline-block",
                              }}
                            />
                          ) : null}
                          <span
                            style={{
                              fontSize: 7,
                              fontWeight: 900,
                              color: "#fff",
                              letterSpacing: "0.06em",
                            }}
                          >
                            {automated ? "24/7 · TMI HOST" : "LIVE"}
                          </span>
                        </div>

                        <div
                          style={{
                            position: "absolute",
                            bottom: 6,
                            right: 6,
                            background: "rgba(0,0,0,0.75)",
                            backdropFilter: "blur(4px)",
                            padding: "2px 6px",
                            borderRadius: 4,
                            fontSize: 8,
                            fontWeight: 800,
                            color: automated ? "#FFD700" : "#00FFFF",
                          }}
                        >
                          {automated
                            ? "ALWAYS OPEN"
                            : `👥 ${viewerCount}`}
                        </div>
                      </div>

                      <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 3 }}>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 900,
                            color: "#fff",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontFamily: "'Orbitron', sans-serif",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {record.title}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: 8,
                            color: "rgba(255,255,255,0.6)",
                          }}
                        >
                          <span>
                            {automated
                              ? "System Host"
                              : (record.hostName ?? "Performer")}
                          </span>
                          <span
                            style={{
                              color: accent,
                              fontWeight: 800,
                              textTransform: "uppercase",
                            }}
                          >
                            {record.category}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </LayoutGroup>
        )}

        {/* ── In-Place Focused Room Preview Child Panel ────────────── */}
        {selectedRecord && (
          <div
            data-focused-room-preview
            style={{
              position: "sticky",
              bottom: 8,
              marginTop: 16,
              background: "rgba(10, 16, 40, 0.96)",
              backdropFilter: "blur(12px)",
              border: "1px solid #00FFFF",
              borderRadius: 14,
              padding: "12px 16px",
              boxShadow: "0 16px 48px rgba(0,0,0,0.85), inset 0 1px 0 rgba(0,229,255,0.3)",
              display: "flex",
              flexDirection: isMobileViewport ? "column" : "row",
              alignItems: isMobileViewport ? "stretch" : "center",
              gap: 12,
              zIndex: 20,
              transformStyle: "preserve-3d",
              transform: "translateZ(36px)",
            }}
          >
            {/* Left Preview Info */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 8,
                  overflow: "hidden",
                  flexShrink: 0,
                  border: "1px solid rgba(0,229,255,0.4)",
                  background: "#050814",
                }}
              >
                {selectedRecord.posterUrl ? (
                  <img
                    src={selectedRecord.posterUrl}
                    alt={selectedRecord.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                    📺
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    color: "#fff",
                    fontFamily: "'Orbitron', sans-serif",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {selectedRecord.title}
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.65)" }}>
                  Host: <strong style={{ color: "#FFD700" }}>{selectedRecord.hostName ?? "Performer"}</strong> · {selectedRecord.category.toUpperCase()}
                </div>
                <div style={{ fontSize: 8, color: "#00FF88", fontWeight: 800 }}>
                  {selectedRecord.isAnchor
                    ? "● 24/7 AUTOMATED · ALWAYS OPEN"
                    : `● LIVE NOW · ${selectedRecord.humanViewerCount ?? 0} watching`}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
              <button
                type="button"
                data-testid="lobby-watch-stage-btn"
                onClick={() => handleWatchStage(selectedRecord)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: "rgba(0, 229, 255, 0.15)",
                  border: "1px solid #00FFFF",
                  color: "#00FFFF",
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                📺 WATCH STAGE
              </button>

              <button
                type="button"
                data-testid="lobby-join-room-btn"
                onClick={() => handleInstantJoin(selectedRecord)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #FF2DAA 0%, #AA2DFF 100%)",
                  border: "1px solid #FF2DAA",
                  color: "#fff",
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: "0 0 12px rgba(255,45,170,0.4)",
                }}
              >
                ⚡ JOIN ROOM
              </button>

              {(["a", "b", "c", "d", "e", "f", "g", "h"] as const).map((fid, idx) => (
                <button
                  key={fid}
                  type="button"
                  data-testid={`lobby-drawer-send-${fid}`}
                  onClick={() => {
                    if (typeof window === "undefined") return;
                    window.dispatchEvent(
                      new CustomEvent("tmi:lobby-send-to-monitor", {
                        detail: { roomId: selectedRecord.roomId, frameId: fid },
                      }),
                    );
                  }}
                  style={{
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid rgba(255,215,0,0.4)",
                    background: "rgba(255,215,0,0.1)",
                    color: "#FFD700",
                    fontSize: 8,
                    fontWeight: 900,
                    cursor: "pointer",
                    fontFamily: "'Orbitron', sans-serif",
                  }}
                  title={`Send to Monitor ${idx + 1}`}
                >
                  →{idx + 1}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 9,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
                title="Dismiss preview"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/**
 * Default export — maintains legacy stub export compatibility without mounting
 * edge floaters. Real content mounts in CanonicalBottomDrawerHost via LiveLobbyWallContent.
 */
export default function LiveLobbyDrawer() {
  return null;
}