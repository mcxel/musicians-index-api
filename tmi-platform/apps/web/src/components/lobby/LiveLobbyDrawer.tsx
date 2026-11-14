"use client";

/**
 * LiveLobbyDrawer.tsx — Canonical Multi-Row Live Lobby Wall & Focused Room Preview
 *
 * Architecture (Reference Rebuild — 2026-09-13):
 * 1. Mounted strictly inside CanonicalBottomDrawerHost beneath the mini media player.
 * 2. Multi-Row, Multi-Column Discovery Canvas:
 *    - Desktop: 4 columns (from Lobbies pc veiw.mp4 frame analysis).
 *    - Mobile: 2 columns (from Lobbies phone veiw.mp4 frame analysis).
 * 3. Spatial Window Depth (Tier 2 Spatial Content Panel):
 *    - Cards behave as "Windows into active rooms" with perspective, metallic bezels,
 *      depth elevation (translateZ), and subtle 3D tilt.
 * 4. In-Place Focused Preview Child Panel:
 *    - Card click opens in-place preview with WATCH STAGE and JOIN ROOM (LobbyEntryFlow).
 * 5. Readable HUD Plane:
 *    - Category pills and search input remain locked to a flat, legible 2D HUD layer.
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDiscoveryBus } from "@/lib/discovery/useDiscoveryBus";
import {
  LOBBY_WALL_CORE_CATEGORY_TABS,
  filterDiscoveryByWallCategory,
  type LobbyWallCoreCategoryId,
} from "@/lib/lobby/liveLobbyWallLaw";
import type { LiveDiscoveryRecord } from "@/lib/discovery/LiveDiscoveryRecord";
import { PERFORMER_REGISTRY } from "@/lib/performers/PerformerRegistry";
import { resolveInstantJoin, type InstantJoinDecision } from "@/lib/discovery/InstantJoinRuntime";
import { LobbyEntryFlow } from "@/components/room/UniversalLobbyEntry";
import { useLivePrivacyState } from "@/lib/live/livePrivacyState";

export interface LiveLobbyWallContentProps {
  role?: "fan" | "performer";
}

export function LiveLobbyWallContent({ role = "fan" }: LiveLobbyWallContentProps) {
  const router = useRouter();
  const busRecords = useDiscoveryBus();
  const publishedRoomId = useLivePrivacyState((s) => s.publishedRoomId);
  const isLivePublished = useLivePrivacyState((s) => s.isLivePublished);

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

  // Synthesize rich catalog fallback from PERFORMER_REGISTRY if busRecords is cold
  const allRecords = useMemo<LiveDiscoveryRecord[]>(() => {
    if (busRecords.length > 0) return busRecords;
    return PERFORMER_REGISTRY.map((p, idx) => ({
      roomId: `live-room-${p.id}`,
      title: `${p.name} Live Session`,
      hostUserId: p.id,
      hostName: p.name,
      category: idx % 3 === 0 ? "battles" : idx % 3 === 1 ? "cyphers" : "lives",
      categories: [p.category.toLowerCase(), "music"],
      humanViewerCount: 14 + (idx * 7) % 89,
      isLive: true,
      joinRoute: p.profileRoute,
      posterUrl: p.profileImageUrl,
      accentColor: idx % 2 === 0 ? "#00FFFF" : "#FF2DAA",
      certified: true,
      experienceId: `exp-${p.id}`,
    })) as unknown as LiveDiscoveryRecord[];
  }, [busRecords]);

  // Apply category filtering + search
  const filteredRecords = useMemo(() => {
    let records = filterDiscoveryByWallCategory(allRecords, activeCategoryId);
    if (records.length === 0 && allRecords.length > 0) {
      records = allRecords;
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) return records;
    return records.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.hostName ?? "").toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q),
    );
  }, [allRecords, activeCategoryId, searchQuery]);

  const handleCardClick = (record: LiveDiscoveryRecord) => {
    setSelectedRecord(record);
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
          >
            {filteredRecords.length} ROOMS ACTIVE
          </span>
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

      {/* ── Spatial Mosaic Container (Windows into Active Places) ────── */}
      <div
        data-spatial-mosaic-container
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
            No active broadcast rooms found matching this category.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobileViewport
                ? "repeat(2, minmax(0, 1fr))"
                : "repeat(4, minmax(0, 1fr))",
              gap: isMobileViewport ? 10 : 14,
            }}
          >
            {filteredRecords.map((record) => {
              const isSelected = selectedRecord?.roomId === record.roomId;
              const accent = record.accentColor ?? "#00FFFF";
              const viewerCount = record.humanViewerCount ?? 0;

              return (
                <div
                  key={record.roomId}
                  data-room-tile={record.roomId}
                  onClick={() => handleCardClick(record)}
                  style={{
                    position: "relative",
                    background: "linear-gradient(150deg, rgba(16, 24, 52, 0.95) 0%, rgba(6, 10, 24, 0.98) 100%)",
                    border: `1px solid ${isSelected ? "#00FFFF" : "rgba(0, 229, 255, 0.28)"}`,
                    borderRadius: 12,
                    overflow: "hidden",
                    cursor: "pointer",
                    transformStyle: "preserve-3d",
                    transform: isSelected ? "translateZ(28px)" : "translateZ(0px)",
                    boxShadow: isSelected
                      ? `0 16px 40px rgba(0,0,0,0.8), 0 0 20px ${accent}44, inset 0 1px 0 rgba(255,255,255,0.2)`
                      : "0 8px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
                    transition: "transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 0.22s ease, border-color 0.22s ease",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = "translateY(-4px) translateZ(14px) rotateX(2deg)";
                      e.currentTarget.style.borderColor = accent;
                      e.currentTarget.style.boxShadow = `0 14px 32px rgba(0,0,0,0.7), 0 0 16px ${accent}33`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = "translateZ(0px)";
                      e.currentTarget.style.borderColor = "rgba(0, 229, 255, 0.28)";
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)";
                    }
                  }}
                >
                  {/* Thumbnail / Window Stage */}
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
                          background: "radial-gradient(circle at 50% 40%, rgba(0,229,255,0.15), #050814 70%)",
                          color: "rgba(255,255,255,0.3)",
                          fontSize: 24,
                        }}
                      >
                        📺
                      </div>
                    )}

                    {/* Live Badge */}
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
                        border: "1px solid rgba(255,68,68,0.4)",
                      }}
                    >
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
                      <span
                        style={{
                          fontSize: 7,
                          fontWeight: 900,
                          color: "#fff",
                          letterSpacing: "0.06em",
                        }}
                      >
                        LIVE
                      </span>
                    </div>

                    {/* Viewer Count Badge */}
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
                        color: "#00FFFF",
                      }}
                    >
                      👥 {viewerCount}
                    </div>
                  </div>

                  {/* Metadata Header */}
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
                      <span>{record.hostName ?? "Performer"}</span>
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
                </div>
              );
            })}
          </div>
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
                  ● LIVE NOW · {selectedRecord.humanViewerCount ?? 0} watching
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
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
      </div>
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