"use client";

/**
 * OverseerMonitorWall — TOP deck live monitor grid (0–8 Monitors).
 * Live room feeds first. Honest NO SOURCE ASSIGNED when idle.
 * Uses CanonicalAdminMonitorBezel: SOURCE · SWAP · FULL · INSPECT · PIN · DETACH.
 * Supports elastic detachment down to DISPLAY-ONLY (0), rising operational deck.
 */

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";

import {
  getLiveMonitorSource,
  LIVE_MONITOR_SOURCE_GROUPS,
} from "@/components/admin/overseer/workspace/widgets/MediaSourceRegistry";
import { MonitorScreenShareVideo } from "@/components/monitors/MonitorScreenSharePrimitives";
import useViewportMode from "@/hooks/useViewportMode";
import {
  assignMonitorSource,
  createEmptyMonitorState,
  OVERSEER_MONITOR_IDS,
  swapMonitorSources,
  type OverseerMonitorId,
  type OverseerMonitorState,
} from "@/lib/admin/overseerMonitorState";
import {
  dispatchOverseerInspect,
  scrollToControlDesk,
} from "@/lib/admin/overseerInspectBridge";
import { desktopMonitorStageStyle } from "@/lib/admin/overseerDeckConvergence";
import {
  resolveAdminMonitorLayout,
  type AttachedMonitorCount,
} from "@/lib/admin/AdminMonitorLayoutResolver";
import CanonicalAdminMonitorBezel from "./CanonicalAdminMonitorBezel";

type LiveSessionRow = {
  roomId?: string;
  title?: string;
  category?: string;
  displayName?: string;
  previewUrl?: string | null;
  thumbnailUrl?: string | null;
  stageState?: string;
  viewerCount?: number;
};

export type OverseerMonitorWallProps = {
  isMobile?: boolean;
  screenStream?: MediaStream | null;
  shareMonitorId?: OverseerMonitorId | null;
  onStopScreenShare?: () => void;
  attachedCount?: AttachedMonitorCount;
  onAttachedCountChange?: (count: AttachedMonitorCount) => void;
};

const ROSE_FALLBACK_URL =
  process.env.NEXT_PUBLIC_DEFAULT_MONITOR_VIDEO?.trim() ||
  process.env.NEXT_PUBLIC_OBSERVATORY_ROSE_VIDEO_URL?.trim() ||
  "";

function controlBtn(active = false): CSSProperties {
  return {
    padding: "2px 6px",
    borderRadius: 4,
    border: active ? "1px solid #00FFFF" : "1px solid rgba(255,215,0,0.35)",
    background: active ? "rgba(0,255,255,0.15)" : "rgba(0,0,0,0.45)",
    color: active ? "#00FFFF" : "#FFD700",
    fontSize: 7.5,
    fontWeight: 900,
    letterSpacing: "0.08em",
    cursor: "pointer",
    fontFamily: "inherit",
    textTransform: "uppercase",
  };
}

export default function OverseerMonitorWall({
  isMobile: isMobileProp,
  screenStream = null,
  shareMonitorId = null,
  onStopScreenShare,
  attachedCount: externalAttachedCount,
  onAttachedCountChange,
}: OverseerMonitorWallProps) {
  const viewport = useViewportMode();
  const isMobile = isMobileProp ?? viewport.isPhone;
  const isDesktop = !isMobile && !viewport.isTablet;

  const [internalAttachedCount, setInternalAttachedCount] = useState<AttachedMonitorCount>(4);
  const attachedCount = externalAttachedCount ?? internalAttachedCount;

  const handleSetAttachedCount = (count: AttachedMonitorCount) => {
    setInternalAttachedCount(count);
    onAttachedCountChange?.(count);
  };

  const [assignments, setAssignments] = useState<OverseerMonitorState>(() => createEmptyMonitorState());
  const [pinnedSlots, setPinnedSlots] = useState<Set<string>>(new Set());
  const [detachedPool, setDetachedPool] = useState<Record<string, string | null>>({});
  const [swapAnchor, setSwapAnchor] = useState<string | null>(null);
  const [sourcePickerSlot, setSourcePickerSlot] = useState<string | null>(null);
  const [fullscreenSlot, setFullscreenSlot] = useState<string | null>(null);
  const [liveSessions, setLiveSessions] = useState<LiveSessionRow[]>([]);
  const [liveFetch, setLiveFetch] = useState<"loading" | "ok" | "empty" | "error">("loading");

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const res = await fetch("/api/live/go", { cache: "no-store" });
        if (!active) return;
        if (!res.ok) {
          setLiveSessions([]);
          setLiveFetch("error");
          return;
        }
        const data = (await res.json()) as { sessions?: LiveSessionRow[] };
        const sessions = data.sessions ?? [];
        setLiveSessions(sessions);
        setLiveFetch(sessions.length > 0 ? "ok" : "empty");

        // ROOM-FEED-FIRST DEFAULTS:
        // When sessions arrive and Monitor A / B are empty, seed them with real active rooms!
        if (sessions.length > 0) {
          setAssignments((prev) => {
            const next = { ...prev };
            if (!next.A.sourceId) {
              const liveA = sessions.find((s) => s.category === "cypher") || sessions[0];
              if (liveA) next.A = { sourceId: `live:${liveA.roomId || "main-stage"}`, pinned: false };
            }
            if (!next.B.sourceId && sessions.length > 1) {
              const liveB = sessions.find((s) => s.category === "battle") || sessions[1] || sessions[0];
              if (liveB) next.B = { sourceId: `live:${liveB.roomId || "battle-ring"}`, pinned: false };
            }
            return next;
          });
        }
      } catch {
        if (!active) return;
        setLiveSessions([]);
        setLiveFetch("error");
      }
    };
    void poll();
    const id = setInterval(() => void poll(), 10000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const layout = useMemo(
    () => resolveAdminMonitorLayout(attachedCount, isMobile, viewport.isTablet),
    [attachedCount, isMobile, viewport.isTablet],
  );

  const stageStyle = desktopMonitorStageStyle(isDesktop);

  const pickSessionForSource = useCallback(
    (sourceId: string | null): LiveSessionRow | null => {
      if (!sourceId) return null;
      if (sourceId.startsWith("live:")) {
        const rId = sourceId.replace("live:", "");
        return liveSessions.find((s) => s.roomId === rId) ?? liveSessions[0] ?? null;
      }
      const source = getLiveMonitorSource(sourceId);
      if (!source) return null;
      if (source.categoryFilter) {
        const match = liveSessions.find(
          (s) => (s.category ?? "").toLowerCase() === source.categoryFilter,
        );
        if (match) return match;
      }
      return liveSessions[0] ?? null;
    },
    [liveSessions],
  );

  const assignSource = (slot: string, sourceId: string | null) => {
    if (OVERSEER_MONITOR_IDS.includes(slot as OverseerMonitorId)) {
      setAssignments((prev) => assignMonitorSource(prev, slot as OverseerMonitorId, sourceId));
    }
    setSourcePickerSlot(null);
    setSwapAnchor(null);
  };

  const handleSwap = (slot: string) => {
    if (swapAnchor === null) {
      setSwapAnchor(slot);
      return;
    }
    if (swapAnchor === slot) {
      setSwapAnchor(null);
      return;
    }
    if (
      OVERSEER_MONITOR_IDS.includes(swapAnchor as OverseerMonitorId) &&
      OVERSEER_MONITOR_IDS.includes(slot as OverseerMonitorId)
    ) {
      setAssignments((prev) =>
        swapMonitorSources(prev, swapAnchor as OverseerMonitorId, slot as OverseerMonitorId),
      );
    }
    setSwapAnchor(null);
  };

  const handleTogglePin = (slot: string) => {
    setPinnedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(slot)) next.delete(slot);
      else next.add(slot);
      return next;
    });
  };

  const handleDetach = (slot: string) => {
    // Save current source to detached pool to restore on reattach
    const currentSrc = (assignments as Record<string, { sourceId: string | null }>)[slot]?.sourceId ?? null;
    setDetachedPool((prev) => ({ ...prev, [slot]: currentSrc }));

    // Decrement attached monitor count
    if (attachedCount > 0) {
      handleSetAttachedCount((attachedCount - 1) as AttachedMonitorCount);
    }
  };

  const handleInspect = (slot: string) => {
    const sourceId = (assignments as Record<string, { sourceId: string | null }>)[slot]?.sourceId ?? null;
    const source = sourceId ? getLiveMonitorSource(sourceId) : null;
    const session = pickSessionForSource(sourceId);
    dispatchOverseerInspect({
      monitorId: slot,
      sourceId: sourceId ?? "none",
      roomId: session?.roomId,
      label: source?.label ?? session?.title ?? `Monitor ${slot}`,
      type: source?.kind?.toUpperCase() ?? "LIVE",
      viewerCount: session?.viewerCount,
    });
    scrollToControlDesk();
  };

  const handleOpenLivingOs = (slot: string) => {
    const sourceId = (assignments as Record<string, { sourceId: string | null }>)[slot]?.sourceId ?? null;
    const source = sourceId ? getLiveMonitorSource(sourceId) : null;
    const session = pickSessionForSource(sourceId);
    dispatchOverseerInspect({
      monitorId: slot,
      sourceId: sourceId ?? "none",
      roomId: session?.roomId,
      label: source?.label ?? session?.title ?? `Monitor ${slot}`,
      type: "MEDIA_PLAYER",
      viewerCount: session?.viewerCount,
    });
    scrollToControlDesk();
  };

  const renderMonitorBody = (slot: string, sourceId: string | null) => {
    if (screenStream && shareMonitorId === slot) {
      return (
        <MonitorScreenShareVideo
          stream={screenStream}
          onStop={onStopScreenShare ?? (() => undefined)}
          label={`MONITOR ${slot} · SHARE`}
        />
      );
    }

    if (!sourceId) {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "grid",
            placeItems: "center",
            background: "#030318",
            color: "rgba(255,255,255,0.45)",
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            textAlign: "center",
            padding: 16,
          }}
        >
          No Source Assigned
        </div>
      );
    }

    const source = getLiveMonitorSource(sourceId);
    const session = pickSessionForSource(sourceId);
    const preview =
      session?.previewUrl?.trim() ||
      session?.thumbnailUrl?.trim() ||
      (source?.status === "LIVE" && liveFetch === "ok" ? ROSE_FALLBACK_URL : "");

    if (!preview) {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "grid",
            placeItems: "center",
            background: "#030318",
            color: "rgba(255,255,255,0.55)",
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            textAlign: "center",
            padding: 12,
          }}
        >
          NO LIVE SIGNAL
          <div style={{ marginTop: 6, fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>
            {liveFetch === "empty"
              ? "No active rooms in registry"
              : liveFetch === "error"
                ? "Registry unavailable"
                : "Waiting for stream URL"}
          </div>
        </div>
      );
    }

    return (
      <video
        src={preview}
        autoPlay
        muted
        loop
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          background: "#000",
        }}
      />
    );
  };

  // DISPLAY-ONLY MODE (attachedCount === 0):
  // Render minimal bar; center grid collapses so operational deck rises to Media Player boundary
  if (attachedCount === 0) {
    return (
      <div
        data-overseer-monitor-wall="collapsed"
        style={{
          width: "100%",
          padding: "6px 12px",
          background: "linear-gradient(90deg, rgba(0,255,255,0.1), rgba(255,215,0,0.08))",
          border: "1px solid rgba(0,255,255,0.3)",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
          transition: "all 300ms cubic-bezier(0.25, 1, 0.5, 1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.14em" }}>
            DISPLAY-ONLY MODE · 0 MONITORS ATTACHED
          </span>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.6)" }}>
            Operational Display Deck elevated to Media Player boundary
          </span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {([1, 2, 4, 8] as AttachedMonitorCount[]).map((count) => (
            <button
              key={count}
              type="button"
              data-monitor-count-btn={count}
              onClick={() => handleSetAttachedCount(count)}
              style={controlBtn(false)}
            >
              Attach {count}M
            </button>
          ))}
        </div>
      </div>
    );
  }

  const activeSlots = fullscreenSlot ? [fullscreenSlot] : layout.activeSlots;

  return (
    <div
      data-overseer-monitor-wall
      data-desktop={isDesktop ? "true" : "false"}
      data-attached-count={attachedCount}
      data-fullscreen-slot={fullscreenSlot ?? "none"}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minWidth: 0,
        transition: "all 280ms cubic-bezier(0.25, 1, 0.5, 1)",
        ...stageStyle,
      }}
    >
      {/* Elastic Monitor Strip & Count Selector */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 8.5,
              fontWeight: 900,
              letterSpacing: "0.16em",
              color: "rgba(255,215,0,0.85)",
              textTransform: "uppercase",
            }}
          >
            Live Monitor Wall · {liveFetch === "ok" ? `${liveSessions.length} live` : liveFetch}
          </span>
          <span style={{ fontSize: 7.5, color: "#00FFFF", fontWeight: 800 }}>
            ({attachedCount} Attached)
          </span>
        </div>

        {/* Monitor Count Selector Strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
          <button
            type="button"
            data-monitor-count-btn="0"
            onClick={() => handleSetAttachedCount(0)}
            style={controlBtn(false)}
            title="Display-only mode: collapse monitors and elevate display deck"
          >
            Display (0)
          </button>
          {([1, 2, 3, 4, 6, 8] as AttachedMonitorCount[]).map((count) => (
            <button
              key={count}
              type="button"
              data-monitor-count-btn={count}
              onClick={() => handleSetAttachedCount(count)}
              style={controlBtn(attachedCount === count)}
            >
              {count}
            </button>
          ))}
          {fullscreenSlot ? (
            <button type="button" style={controlBtn(true)} onClick={() => setFullscreenSlot(null)}>
              Exit Fullscreen
            </button>
          ) : null}
        </div>
      </div>

      {/* Monitor Grid */}
      <div
        data-monitor-wall-grid
        style={{
          display: "grid",
          gridTemplateColumns: fullscreenSlot ? "1fr" : layout.gridTemplateColumns,
          gridTemplateRows: fullscreenSlot ? "1fr" : layout.gridTemplateRows,
          gap: layout.gap,
          width: "100%",
          minWidth: 0,
        }}
      >
        {activeSlots.map((slot) => {
          const sourceId =
            (assignments as Record<string, { sourceId: string | null }>)[slot]?.sourceId ?? null;
          const source = sourceId ? getLiveMonitorSource(sourceId) : null;
          const session = pickSessionForSource(sourceId);
          const isSwapAnchor = swapAnchor === slot;
          const pickerOpen = sourcePickerSlot === slot;
          const isPinned = pinnedSlots.has(slot);

          return (
            <div
              key={slot}
              data-monitor-slot={slot}
              data-source-assigned={sourceId ? "true" : "false"}
              style={{
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                borderRadius: 8,
                border: isSwapAnchor
                  ? "2px solid #00FFFF"
                  : "2px solid rgba(212,175,55,0.45)",
                background: "#020210",
                overflow: "hidden",
                outline: isSwapAnchor ? "0 0 12px rgba(0,255,255,0.35)" : undefined,
              }}
            >
              {/* Canonical Shared Monitor Bezel */}
              <CanonicalAdminMonitorBezel
                monitorId={slot}
                sourceLabel={source?.label ?? session?.title ?? (sourceId ? "LIVE ROOM" : "NO SOURCE")}
                accentColor={source?.accent ?? "#FFD700"}
                isLive={Boolean(source?.status === "LIVE" || session?.stageState === "live")}
                viewerCount={session?.viewerCount}
                isPinned={isPinned}
                isFullscreen={fullscreenSlot === slot}
                isSwapAnchor={isSwapAnchor}
                isPickerOpen={pickerOpen}
                hasSource={Boolean(sourceId)}
                onSourceClick={() => setSourcePickerSlot((cur) => (cur === slot ? null : slot))}
                onLivingOsClick={() => handleOpenLivingOs(slot)}
                onSwapClick={() => handleSwap(slot)}
                onFullClick={() => setFullscreenSlot((cur) => (cur === slot ? null : slot))}
                onInspectClick={() => handleInspect(slot)}
                onPinClick={() => handleTogglePin(slot)}
                onDetachClick={() => handleDetach(slot)}
                isMobile={isMobile}
              />

              {/* Monitor Video Viewport */}
              <div
                data-monitor-viewport
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: layout.aspectRatio,
                  minHeight: isDesktop ? layout.minHeight : 100,
                  background: "#030318",
                }}
              >
                {renderMonitorBody(slot, sourceId)}
              </div>

              {/* Source Picker Drawer */}
              {pickerOpen ? (
                <div
                  data-source-picker
                  style={{
                    borderTop: "1px solid rgba(0,255,255,0.25)",
                    background: "rgba(0,0,0,0.92)",
                    padding: 8,
                    maxHeight: 180,
                    overflowY: "auto",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => assignSource(slot, null)}
                    style={{
                      ...controlBtn(false),
                      width: "100%",
                      marginBottom: 6,
                      padding: "6px 8px",
                    }}
                  >
                    Clear · No Source
                  </button>

                  {/* Active Live Rooms direct assign */}
                  {liveSessions.length > 0 ? (
                    <div style={{ marginBottom: 8 }}>
                      <div
                        style={{
                          fontSize: 7,
                          fontWeight: 900,
                          letterSpacing: "0.14em",
                          color: "#00FFFF",
                          marginBottom: 4,
                          textTransform: "uppercase",
                        }}
                      >
                        Active Live Rooms ({liveSessions.length})
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {liveSessions.map((ls) => (
                          <button
                            key={ls.roomId}
                            type="button"
                            onClick={() => assignSource(slot, `live:${ls.roomId}`)}
                            style={{
                              ...controlBtn(sourceId === `live:${ls.roomId}`),
                              width: "100%",
                              textAlign: "left",
                              padding: "5px 8px",
                              fontSize: 8,
                            }}
                          >
                            🔴 {ls.title || ls.displayName || ls.roomId} · {ls.category?.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {LIVE_MONITOR_SOURCE_GROUPS.map((group) => (
                    <div key={group.id} style={{ marginBottom: 8 }}>
                      <div
                        style={{
                          fontSize: 7,
                          fontWeight: 900,
                          letterSpacing: "0.14em",
                          color: group.accent,
                          marginBottom: 4,
                          textTransform: "uppercase",
                        }}
                      >
                        {group.label}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {group.sources.map((src) => (
                          <button
                            key={src.id}
                            type="button"
                            onClick={() => assignSource(slot, src.id)}
                            style={{
                              ...controlBtn(sourceId === src.id),
                              width: "100%",
                              textAlign: "left",
                              padding: "5px 8px",
                              fontSize: 8,
                            }}
                          >
                            {src.label}
                            {src.status === "LIVE" ? " · LIVE" : ""}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
