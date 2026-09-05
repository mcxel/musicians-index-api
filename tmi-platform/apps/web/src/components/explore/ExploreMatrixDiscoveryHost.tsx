"use client";

/**
 * ExploreMatrixDiscoveryHost.tsx — Unified Visual Media & Profile Discovery Surface
 *
 * Architecture:
 * 1. Horizontal Left/Right: Switches between 3 discovery surfaces:
 *    [ SNIPS ] ◀───► [ VIDEO SHUFFLE ] ◀───► [ PUBLIC PROFILES ]
 * 2. Vertical Up/Down: Advances through continuous media items inside the active surface.
 * 3. Stateful Navigation: Preserves index positions per column (no state reset when switching columns).
 * 4. Resource-Budgeted Playback: Active card plays video; offscreen cards pause.
 * 5. Live Binding: If an author is currently streaming, shows live badge with direct jump to room.
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  PERFORMER_REGISTRY,
  type PerformerIdentity,
} from "@/lib/performers/PerformerRegistry";
import { useDiscoveryBus } from "@/lib/discovery/useDiscoveryBus";
import { buildSnipPool, type SnipReference } from "@/lib/discovery/SnipsDiscoveryRuntime";
import { castPlaylistToMonitor } from "@/lib/playlists/PlaylistMonitorCast";
import Link from "next/link";

export type ExploreColumnType = "SNIPS" | "VIDEO_SHUFFLE" | "PUBLIC_PROFILES";

export interface ExploreMatrixDiscoveryHostProps {
  initialColumn?: ExploreColumnType;
  onClose: () => void;
}

export default function ExploreMatrixDiscoveryHost({
  initialColumn = "SNIPS",
  onClose,
}: ExploreMatrixDiscoveryHostProps) {
  console.log("[TMI_EXPLORE_MATRIX] Mounting with initialColumn:", initialColumn);

  // ── Surface Navigation State ────────────────────────────────────────────────
  const columns: ExploreColumnType[] = ["SNIPS", "VIDEO_SHUFFLE", "PUBLIC_PROFILES"];
  const [activeColIndex, setActiveColIndex] = useState(() => {
    const idx = columns.indexOf(initialColumn);
    return idx >= 0 ? idx : 0;
  });

  // Preserve vertical scroll indices per column
  const [columnPositions, setColumnPositions] = useState<Record<number, number>>({
    0: 0, // Snips
    1: 0, // Video Shuffle
    2: 0, // Public Profiles
  });

  // ── Canonical Data Pools ────────────────────────────────────────────────────
  const liveSessions = useDiscoveryBus();

  // 1. Snips Pool
  const snipsPool = useMemo(() => {
    const p = buildSnipPool();
    if (p && p.length > 0) return p;
    return PERFORMER_REGISTRY.map((pr) => ({
      id: `snip-${pr.slug}`,
      title: pr.name,
      subtitle: pr.category,
      videoUrl: pr.introVideoUrl ?? pr.motionPosterUrl ?? pr.coverImageUrl ?? pr.profileImageUrl,
      thumbnailUrl: pr.profileImageUrl,
      sourceKind: "performer-moment" as const,
      destinationHref: `/performers/${pr.slug}`,
      attribution: pr.name,
      performerSlug: pr.slug,
    }));
  }, []);

  // 2. Video Shuffle Pool
  const videoPool = useMemo(() => {
    return PERFORMER_REGISTRY.map((p) => ({
      id: `vid-${p.slug}`,
      title: p.name,
      artist: p.name,
      category: p.category,
      videoUrl: p.introVideoUrl ?? p.motionPosterUrl ?? p.coverImageUrl ?? p.profileImageUrl,
      thumbnailUrl: p.profileImageUrl,
      performerSlug: p.slug,
      bio: p.bio ?? "",
      city: p.city,
      country: p.countryName,
    }));
  }, []);

  // 3. Public Profiles Pool (Mixed Performers + Creators)
  const profilePool = useMemo(() => {
    return PERFORMER_REGISTRY.map((p) => {
      const activeLive = Array.isArray(liveSessions)
        ? liveSessions.find((s) => s && (s.hostUserId === p.slug || (s.roomId && s.roomId.includes(p.slug))))
        : null;
      return {
        id: `prof-${p.slug}`,
        name: p.name,
        slug: p.slug,
        role: "PERFORMER" as const,
        genre: p.category,
        avatarUrl: p.profileImageUrl,
        coverUrl: p.motionPosterUrl ?? p.coverImageUrl ?? p.profileImageUrl,
        isLive: Boolean(activeLive),
        liveRoomId: activeLive?.roomId ?? null,
        tagline: p.bio ?? `${p.category} Artist based in ${p.city}`,
        city: p.city,
        country: p.countryName,
      };
    });
  }, [liveSessions]);

  // Current vertical index in active column
  const currentVerticalIndex = columnPositions[activeColIndex] ?? 0;

  // ── Navigation Advancers ───────────────────────────────────────────────────
  const advanceVertical = useCallback(
    (direction: 1 | -1) => {
      setColumnPositions((prev) => {
        const cur = prev[activeColIndex] ?? 0;
        let poolLen = 1;
        if (activeColIndex === 0) poolLen = snipsPool.length || 1;
        else if (activeColIndex === 1) poolLen = videoPool.length || 1;
        else if (activeColIndex === 2) poolLen = profilePool.length || 1;

        const next = (cur + direction + poolLen) % poolLen;
        return { ...prev, [activeColIndex]: next };
      });
    },
    [activeColIndex, snipsPool.length, videoPool.length, profilePool.length]
  );

  const advanceHorizontal = useCallback(
    (direction: 1 | -1) => {
      setActiveColIndex((prev) => (prev + direction + columns.length) % columns.length);
    },
    [columns.length]
  );

  // ── Touch & Gesture Handling ────────────────────────────────────────────────
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    touchStartY.current = e.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const startX = touchStartX.current;
    const startY = touchStartY.current;
    if (startX == null || startY == null) return;

    const endX = e.changedTouches[0]?.clientX ?? startX;
    const endY = e.changedTouches[0]?.clientY ?? startY;
    const deltaX = startX - endX;
    const deltaY = startY - endY;

    // Determine dominant swipe axis
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 45) {
      // Horizontal swipe
      advanceHorizontal(deltaX > 0 ? 1 : -1);
    } else if (Math.abs(deltaY) > 45) {
      // Vertical swipe
      advanceVertical(deltaY > 0 ? 1 : -1);
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        advanceVertical(-1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        advanceVertical(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        advanceHorizontal(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        advanceHorizontal(1);
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [advanceVertical, advanceHorizontal, onClose]);

  // Active items
  const activeSnip = snipsPool[columnPositions[0] ?? 0] ?? null;
  const activeVideo = videoPool[columnPositions[1] ?? 0] ?? null;
  const activeProfile = profilePool[columnPositions[2] ?? 0] ?? null;

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      data-testid="tmi-explore-matrix-discovery"
      role="dialog"
      aria-label="Explore Visual Discovery Matrix"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9500,
        background: "rgba(2,4,12,0.96)",
        backdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        color: "#fff",
        userSelect: "none",
      }}
    >
      {/* ── Top Header & Horizontal Surface Switcher ────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(0,0,0,0.6)",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.2em", color: "#00FFFF" }}>
            🧭 EXPLORE MATRIX
          </span>
          {/* Surface Category Tabs */}
          <div style={{ display: "flex", gap: 6 }}>
            {columns.map((col, idx) => {
              const isCurrent = activeColIndex === idx;
              const labels = {
                SNIPS: "🎬 SNIPS",
                VIDEO_SHUFFLE: "🎥 VIDEO SHUFFLE",
                PUBLIC_PROFILES: "👤 PUBLIC PROFILES",
              };
              return (
                <button
                  key={col}
                  type="button"
                  onClick={() => setActiveColIndex(idx)}
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    padding: "5px 12px",
                    borderRadius: 20,
                    border: `1px solid ${isCurrent ? "#00FFFF" : "rgba(255,255,255,0.15)"}`,
                    background: isCurrent ? "rgba(0,255,255,0.2)" : "rgba(255,255,255,0.04)",
                    color: isCurrent ? "#00FFFF" : "rgba(255,255,255,0.6)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {labels[col]}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>
            [ ◀ ▶ Column · ▲ ▼ Media ]
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              fontSize: 12,
              fontWeight: 800,
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "#fff",
              borderRadius: "50%",
              width: 28,
              height: 28,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── Visual Media Viewport Matrix ────────────────────────────────────── */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        
        {/* COLUMN 0: SNIPS */}
        {activeColIndex === 0 && activeSnip && (
          <div
            key={activeSnip.id}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 480,
              height: "90%",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(0,255,255,0.3)",
              background: "#000",
              boxShadow: "0 24px 60px rgba(0,0,0,0.8)",
            }}
          >
            <video
              src={activeSnip.videoUrl}
              autoPlay
              loop
              playsInline
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {/* Snip Metadata Overlay */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "24px 16px 16px 16px",
                background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 100%)",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>
                  {activeSnip.title}
                </span>
                <span style={{ fontSize: 8, fontWeight: 800, color: "#00FFFF", background: "rgba(0,255,255,0.15)", padding: "2px 6px", borderRadius: 4 }}>
                  {activeSnip.subtitle}
                </span>
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)" }}>
                By {activeSnip.attribution}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => advanceVertical(1)}
                  style={{
                    flex: 1,
                    fontSize: 9,
                    fontWeight: 900,
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  NEXT SNIP ▼
                </button>
                {activeSnip.performerSlug && (
                  <Link
                    href={`/performers/${activeSnip.performerSlug}`}
                    onClick={onClose}
                    style={{
                      fontSize: 9,
                      fontWeight: 900,
                      padding: "8px 14px",
                      borderRadius: 8,
                      background: "linear-gradient(135deg, #00FFFF, #AA2DFF)",
                      color: "#050510",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    VIEW PROFILE →
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* COLUMN 1: VIDEO SHUFFLE */}
        {activeColIndex === 1 && activeVideo && (
          <div
            key={activeVideo.id}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 720,
              height: "85%",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(170,45,255,0.4)",
              background: "#000",
              boxShadow: "0 24px 60px rgba(0,0,0,0.8)",
            }}
          >
            <video
              src={activeVideo.videoUrl}
              autoPlay
              loop
              playsInline
              controls
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {/* Video Footer Info */}
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                background: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(6px)",
                padding: "6px 12px",
                borderRadius: 8,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 900, color: "#fff" }}>
                {activeVideo.title}
              </span>
              <span style={{ fontSize: 8, color: "#FFD700", fontWeight: 700 }}>
                {activeVideo.category} · {activeVideo.city}, {activeVideo.country}
              </span>
            </div>
          </div>
        )}

        {/* COLUMN 2: PUBLIC PROFILES */}
        {activeColIndex === 2 && activeProfile && (
          <div
            key={activeProfile.id}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 420,
              height: "85%",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid ${activeProfile.isLive ? "#FF4444" : "rgba(0,255,136,0.35)"}`,
              background: "linear-gradient(180deg, rgba(14,14,30,0.98) 0%, rgba(5,5,16,0.98) 100%)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.85)",
              display: "flex",
              flexDirection: "column",
              padding: 20,
              gap: 14,
            }}
          >
            {/* Cover & Avatar Header */}
            <div style={{ position: "relative", height: 140, borderRadius: 12, overflow: "hidden", background: "rgba(255,255,255,0.05)" }}>
              <img
                src={activeProfile.coverUrl}
                alt={activeProfile.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }}
              />
              {activeProfile.isLive && (
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    background: "rgba(255,68,68,0.9)",
                    color: "#fff",
                    fontSize: 8,
                    fontWeight: 900,
                    padding: "3px 8px",
                    borderRadius: 6,
                    letterSpacing: "0.1em",
                  }}
                >
                  🔴 LIVE NOW
                </div>
              )}
            </div>

            {/* Profile Identity Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>
                  {activeProfile.name}
                </span>
                <span style={{ fontSize: 8, fontWeight: 800, color: "#00FF88", background: "rgba(0,255,136,0.15)", padding: "2px 6px", borderRadius: 4 }}>
                  {activeProfile.genre}
                </span>
              </div>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.6)" }}>
                {activeProfile.city}, {activeProfile.country}
              </span>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", margin: "4px 0 0 0", lineHeight: 1.4 }}>
                {activeProfile.tagline}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {activeProfile.isLive && activeProfile.liveRoomId && (
                <Link
                  href={`/live/rooms/${activeProfile.liveRoomId}`}
                  onClick={onClose}
                  style={{
                    background: "linear-gradient(135deg, #FF4444, #FF2DAA)",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 900,
                    padding: "10px",
                    borderRadius: 10,
                    textAlign: "center",
                    textDecoration: "none",
                  }}
                >
                  🚀 ENTER LIVE ROOM
                </Link>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => advanceVertical(1)}
                  style={{
                    flex: 1,
                    fontSize: 9,
                    fontWeight: 900,
                    padding: "8px 10px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  NEXT PROFILE ▼
                </button>
                <Link
                  href={`/performers/${activeProfile.slug}`}
                  onClick={onClose}
                  style={{
                    flex: 1,
                    fontSize: 9,
                    fontWeight: 900,
                    padding: "8px 10px",
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #00FFFF, #AA2DFF)",
                    color: "#050510",
                    textAlign: "center",
                    textDecoration: "none",
                  }}
                >
                  FULL PROFILE →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Indicator Bar ────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "8px 16px",
          background: "rgba(0,0,0,0.5)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>
          Column {activeColIndex + 1} of 3 · Item {currentVerticalIndex + 1}
        </span>
      </div>
    </div>,
    document.body
  );
}
