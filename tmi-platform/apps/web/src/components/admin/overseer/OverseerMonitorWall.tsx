"use client";

/**
 * OverseerMonitorWall — TOP deck live monitor grid (A/B/C/D).
 * Live/video sources only. Honest NO SOURCE ASSIGNED when idle.
 * Per-monitor: SOURCE · SWAP · FULLSCREEN · INSPECT
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
import { resolveMonitorLayoutPreset } from "@/lib/monitors/MonitorLayoutDirector";

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
    fontSize: 7,
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
}: OverseerMonitorWallProps) {
  const viewport = useViewportMode();
  const isMobile = isMobileProp ?? viewport.isPhone;
  const isDesktop = !isMobile && !viewport.isTablet;

  const [assignments, setAssignments] = useState<OverseerMonitorState>(() => createEmptyMonitorState());
  const [swapAnchor, setSwapAnchor] = useState<OverseerMonitorId | null>(null);
  const [sourcePickerSlot, setSourcePickerSlot] = useState<OverseerMonitorId | null>(null);
  const [fullscreenSlot, setFullscreenSlot] = useState<OverseerMonitorId | null>(null);
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
    () => resolveMonitorLayoutPreset(4, isMobile, viewport.isTablet),
    [isMobile, viewport.isTablet],
  );

  const stageStyle = desktopMonitorStageStyle(isDesktop);

  const pickSessionForSource = useCallback(
    (sourceId: string | null): LiveSessionRow | null => {
      if (!sourceId) return null;
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

  const assignSource = (slot: OverseerMonitorId, sourceId: string | null) => {
    setAssignments((prev) => assignMonitorSource(prev, slot, sourceId));
    setSourcePickerSlot(null);
    setSwapAnchor(null);
  };

  const handleSwap = (slot: OverseerMonitorId) => {
    if (swapAnchor === null) {
      setSwapAnchor(slot);
      return;
    }
    if (swapAnchor === slot) {
      setSwapAnchor(null);
      return;
    }
    setAssignments((prev) => swapMonitorSources(prev, swapAnchor, slot));
    setSwapAnchor(null);
  };

  const handleInspect = (slot: OverseerMonitorId) => {
    const sourceId = assignments[slot].sourceId;
    const source = sourceId ? getLiveMonitorSource(sourceId) : null;
    const session = pickSessionForSource(sourceId);
    dispatchOverseerInspect({
      monitorId: slot,
      sourceId: sourceId ?? "none",
      roomId: session?.roomId,
      label: source?.label ?? `Monitor ${slot}`,
      type: source?.kind?.toUpperCase() ?? "LIVE",
      viewerCount: session?.viewerCount,
    });
    scrollToControlDesk();
  };

  const renderMonitorBody = (slot: OverseerMonitorId, sourceId: string | null) => {
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

  const gridMonitors = fullscreenSlot ? [fullscreenSlot] : OVERSEER_MONITOR_IDS;

  return (
    <div
      data-overseer-monitor-wall
      data-desktop={isDesktop ? "true" : "false"}
      data-fullscreen-slot={fullscreenSlot ?? "none"}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minWidth: 0,
        ...stageStyle,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.16em",
            color: "rgba(255,215,0,0.7)",
            textTransform: "uppercase",
          }}
        >
          Live Monitor Wall · {liveFetch === "ok" ? `${liveSessions.length} live` : liveFetch}
        </span>
        {fullscreenSlot ? (
          <button type="button" style={controlBtn(true)} onClick={() => setFullscreenSlot(null)}>
            Exit Fullscreen
          </button>
        ) : null}
      </div>

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
        {gridMonitors.map((slot) => {
          const sourceId = assignments[slot].sourceId;
          const source = sourceId ? getLiveMonitorSource(sourceId) : null;
          const isSwapAnchor = swapAnchor === slot;
          const pickerOpen = sourcePickerSlot === slot;

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
              <div
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 4,
                  padding: "4px 6px",
                  borderBottom: "1px solid rgba(255,215,0,0.2)",
                  background: "rgba(0,0,0,0.55)",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 900,
                    letterSpacing: "0.12em",
                    color: source?.accent ?? "#FFD700",
                  }}
                >
                  MONITOR {slot}
                  {source ? ` · ${source.label}` : " · NO SOURCE"}
                </span>
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    style={controlBtn(pickerOpen)}
                    onClick={() =>
                      setSourcePickerSlot((cur) => (cur === slot ? null : slot))
                    }
                  >
                    Source
                  </button>
                  <button
                    type="button"
                    style={controlBtn(isSwapAnchor)}
                    onClick={() => handleSwap(slot)}
                  >
                    Swap
                  </button>
                  <button
                    type="button"
                    style={controlBtn(fullscreenSlot === slot)}
                    onClick={() =>
                      setFullscreenSlot((cur) => (cur === slot ? null : slot))
                    }
                  >
                    Full
                  </button>
                  <button
                    type="button"
                    style={controlBtn(false)}
                    onClick={() => handleInspect(slot)}
                    disabled={!sourceId}
                  >
                    Inspect
                  </button>
                </div>
              </div>

              <div
                data-monitor-viewport
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: layout.aspectRatio,
                  minHeight: isDesktop ? 140 : 100,
                  background: "#030318",
                }}
              >
                {renderMonitorBody(slot, sourceId)}
              </div>

              {pickerOpen ? (
                <div
                  data-source-picker
                  style={{
                    borderTop: "1px solid rgba(0,255,255,0.25)",
                    background: "rgba(0,0,0,0.85)",
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
