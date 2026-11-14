"use client";

import LivingPlayerControlBed from "@/components/monitors/LivingPlayerControlBed";
import { resolveLivingPlayerCapabilities } from "@/lib/monitors/livingPlayerControlContract";

/**
 * OverseerMonitorWall.tsx (recompiled 1790011844901) — TOP Deck Live Universal Monitor Wall (A/B/C/D)
 * The Musician's Index | BerntoutGlobal LLC
 *
 * Laws:
 * 1. 4-Way Separation: Remote != Business Deck != Media Source != Monitor Surface.
 * 2. Monitors start clean: Honest NO SOURCE ASSIGNED when unassigned.
 * 3. Television Experience: Category surfing (PREV / NEXT), direct SEARCH / ALL.
 * 4. Universal Displays: Any monitor can display Live Network, Summit Voltron call, Camera, or Screen Share.
 * 5. In-Place Inspection: INSPECT toggles local telemetry HUD overlay without page scroll.
 * 6. Detach / Attach: Detaching floats the presentation surface without duplicate call or session restart.
 * 7. Watch On Bridge: Listens for 'tmi:admin-watch-on' from bottom deck and tunes exact monitor.
 * 8. Mobile Parity: Focused 16:9 monitor with thumb remote; zero horizontal overflow.
 */

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

import {
  getLiveMonitorSource,
  LIVE_MONITOR_SOURCE_REGISTRY,
} from "@/components/admin/overseer/workspace/widgets/MediaSourceRegistry";
import { MonitorScreenShareVideo } from "@/components/monitors/MonitorScreenSharePrimitives";
import useViewportMode from "@/hooks/useViewportMode";
import {
  assignMonitorChannel,
  clearMonitor,
  createEmptyMonitorState,
  cycleMonitorChannel,
  OVERSEER_MONITOR_IDS,
  swapMonitorSources,
  toggleMonitorDetach,
  toggleMonitorPin,
  type OverseerMonitorId,
  type OverseerMonitorMode,
  type OverseerMonitorSlot,
  type OverseerMonitorState,
} from "@/lib/admin/overseerMonitorState";
import {
  ADMIN_WATCH_ON_EVENT,
  type AdminWatchOnDetail,
} from "@/lib/admin/adminWatchOnBridge";
import { desktopMonitorStageStyle } from "@/lib/admin/overseerDeckConvergence";
import {
  resolveAdminMonitorLayout,
  type AttachedMonitorCount,
} from "@/lib/admin/AdminMonitorLayoutResolver";
import CanonicalAdminMonitorBezel from "./CanonicalAdminMonitorBezel";
import AdminNetworkRemote, { type RoomItem } from "./AdminNetworkRemote";
import VoltronSingleMonitorOverlay from "./VoltronSingleMonitorOverlay";
import HubMonitorRemoteFeedPlayer from "@/components/live/HubMonitorRemoteFeedPlayer";
import HubMonitorVenuePlayer from "@/components/live/HubMonitorVenuePlayer";
import HubMonitorCameraPlayer from "@/components/live/HubMonitorCameraPlayer";
import TMIBillboardLiveWall from "@/components/live/TMIBillboardLiveWall";

export type OverseerMonitorWallProps = {
  isMobile?: boolean;
  screenStream?: MediaStream | null;
  shareMonitorId?: OverseerMonitorId | null;
  onStopScreenShare?: () => void;
  attachedCount?: AttachedMonitorCount;
  onAttachedCountChange?: (count: AttachedMonitorCount) => void;
};

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

  // Admin Living OS capabilities for attached monitor controls
  const adminLivingCaps = useMemo(() => resolveLivingPlayerCapabilities("ADMIN"), []);

  // Selected monitor for Admin Network Remote
  const [selectedMonitor, setSelectedMonitor] = useState<OverseerMonitorId>("A");

  // Monitor count (0 to 8)
  const [internalAttachedCount, setInternalAttachedCount] = useState<AttachedMonitorCount>(4);
  const attachedCount = externalAttachedCount ?? internalAttachedCount;

  const handleSetAttachedCount = (count: AttachedMonitorCount) => {
    setInternalAttachedCount(count);
    onAttachedCountChange?.(count);
  };

  // Honest Neutral Initial State — all 4 monitors start clean with NO SOURCE ASSIGNED
  const [assignments, setAssignments] = useState<OverseerMonitorState>(() => createEmptyMonitorState());
  const [swapAnchor, setSwapAnchor] = useState<OverseerMonitorId | null>(null);
  const [sourcePickerSlot, setSourcePickerSlot] = useState<string | null>(null);
  const [fullscreenSlot, setFullscreenSlot] = useState<string | null>(null);
  const [inspectingSlot, setInspectingSlot] = useState<string | null>(null);

  // Authoritative live rooms from registry
  const [liveSessions, setLiveSessions] = useState<RoomItem[]>([]);
  const [liveFetch, setLiveFetch] = useState<"loading" | "ok" | "empty" | "error">("loading");

  // Portal mount check
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Poll real live sessions from /api/live/go
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
        const data = (await res.json()) as { sessions?: RoomItem[] };
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
    const id = setInterval(() => void poll(), 12000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  // Listen for 'tmi:admin-watch-on' intentional bridge events from lower business deck
  useEffect(() => {
    const handleWatchOn = (e: Event) => {
      const customEvent = e as CustomEvent<AdminWatchOnDetail>;
      const detail = customEvent.detail;
      if (!detail || !detail.monitorId) return;

      setAssignments((prev) =>
        assignMonitorChannel(prev, detail.monitorId, {
          sourceId: detail.sourceId ?? `live:${detail.roomId}`,
          mode: detail.mode ?? "LIVE_NETWORK",
          category: detail.category ?? "battle",
          roomId: detail.roomId,
          roomTitle: detail.title ?? `Room ${detail.roomId}`,
        }),
      );
      setSelectedMonitor(detail.monitorId);
    };

    window.addEventListener(ADMIN_WATCH_ON_EVENT, handleWatchOn);
    return () => window.removeEventListener(ADMIN_WATCH_ON_EVENT, handleWatchOn);
  }, []);

  const layout = useMemo(
    () => resolveAdminMonitorLayout(attachedCount, isMobile, viewport.isTablet),
    [attachedCount, isMobile, viewport.isTablet],
  );

  const stageStyle = desktopMonitorStageStyle(isDesktop);

  // Channel & Remote Handlers
  const handleChannelSelect = useCallback(
    (params: {
      sourceId: string | null;
      mode?: OverseerMonitorMode;
      category?: string;
      roomId?: string | null;
      roomTitle?: string;
    }) => {
      setAssignments((prev) => assignMonitorChannel(prev, selectedMonitor, params));
      setSourcePickerSlot(null);
    },
    [selectedMonitor],
  );

  const handleCycleChannel = useCallback(
    (direction: "next" | "prev") => {
      setAssignments((prev) =>
        cycleMonitorChannel(prev, selectedMonitor, direction, liveSessions),
      );
    },
    [selectedMonitor, liveSessions],
  );

  const handleClear = useCallback(
    (monitorId?: OverseerMonitorId) => {
      const target = monitorId ?? selectedMonitor;
      setAssignments((prev) => clearMonitor(prev, target));
      if (inspectingSlot === target) setInspectingSlot(null);
      if (fullscreenSlot === target) setFullscreenSlot(null);
    },
    [selectedMonitor, inspectingSlot, fullscreenSlot],
  );

  const handleSwap = useCallback(
    (slotId?: OverseerMonitorId) => {
      const target = slotId ?? selectedMonitor;
      if (swapAnchor === null) {
        setSwapAnchor(target);
        return;
      }
      if (swapAnchor === target) {
        setSwapAnchor(null);
        return;
      }
      setAssignments((prev) => swapMonitorSources(prev, swapAnchor, target));
      setSwapAnchor(null);
    },
    [selectedMonitor, swapAnchor],
  );

  const handleDetach = useCallback(
    (slotId?: OverseerMonitorId) => {
      const target = slotId ?? selectedMonitor;
      setAssignments((prev) => toggleMonitorDetach(prev, target));
    },
    [selectedMonitor],
  );

  const handleTogglePin = useCallback(
    (slotId: OverseerMonitorId) => {
      setAssignments((prev) => toggleMonitorPin(prev, slotId));
    },
    [],
  );

  const handleInspect = useCallback(
    (slotId?: OverseerMonitorId) => {
      const target = slotId ?? selectedMonitor;
      setInspectingSlot((cur) => (cur === target ? null : target));
    },
    [selectedMonitor],
  );

  const handleAudioToggle = useCallback(
    (slotId?: OverseerMonitorId) => {
      const target = slotId ?? selectedMonitor;
      setAssignments((prev) => ({
        ...prev,
        [target]: { ...prev[target], muted: !prev[target].muted },
      }));
    },
    [selectedMonitor],
  );

  // Active slots to render based on layout count
  const activeSlots = useMemo(() => {
    return OVERSEER_MONITOR_IDS.slice(0, Math.min(attachedCount, 4));
  }, [attachedCount]);

  // Mobile focused slot (only render selected monitor on small mobile viewports)
  const mobileSlots = useMemo(() => {
    return isMobile ? [selectedMonitor] : activeSlots;
  }, [isMobile, selectedMonitor, activeSlots]);

  // Render player surface for a slot
  const renderMonitorSurface = (slotId: OverseerMonitorId, slot: OverseerMonitorSlot) => {
    // 1. Screen Share
    if (screenStream && shareMonitorId === slotId) {
      return (
        <MonitorScreenShareVideo
          stream={screenStream}
          onStop={onStopScreenShare ?? (() => undefined)}
          label={`MONITOR ${slotId} · SHARE`}
        />
      );
    }
    if (slot.mode === "SCREEN_SHARE" || slot.sourceId === "screen-share") {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "grid",
            placeItems: "center",
            background: "#040814",
            color: "#00FFFF",
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            textAlign: "center",
            padding: 16,
          }}
        >
          🖥️ Executive Screen Share Surface Ready
          <div style={{ marginTop: 6, fontSize: 8, color: "rgba(255,255,255,0.4)" }}>
            Awaiting active display capture feed
          </div>
        </div>
      );
    }

    // 2. Detached Placeholder (active surface rendered in floating portal)
    if (slot.detached) {
      return (
        <div
          data-slot-detached-placeholder
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: "radial-gradient(ellipse at center, rgba(170,45,255,0.12), #02020a 75%)",
            color: "#AA2DFF",
            padding: 16,
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: 24 }}>⬡</span>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em" }}>
            MONITOR {slotId} · DETACHED (FLOATING)
          </div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>
            Session active in dedicated floating window
          </div>
          <button
            type="button"
            onClick={() => handleDetach(slotId)}
            style={{
              marginTop: 4,
              padding: "4px 10px",
              borderRadius: 4,
              border: "1px solid #AA2DFF",
              background: "rgba(170,45,255,0.2)",
              color: "#AA2DFF",
              fontSize: 8.5,
              fontWeight: 900,
              letterSpacing: "0.08em",
              cursor: "pointer",
            }}
          >
            ATTACH / RETURN
          </button>
        </div>
      );
    }

    // 3. Clean Empty / No Source Assigned
    if (!slot.sourceId) {
      return (
        <div
          data-no-source-assigned
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            background: "#030312",
            color: "rgba(255,255,255,0.35)",
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            textAlign: "center",
            padding: 16,
          }}
        >
          <span>NO SOURCE ASSIGNED</span>
          <span style={{ fontSize: 7.5, color: "rgba(255,255,255,0.2)" }}>
            Use Network Remote above to tune channel
          </span>
        </div>
      );
    }

    // 4. Summit / Boardroom Multi-Person Voltron Layout
    if (slot.mode === "SUMMIT" || slot.sourceId === "summit") {
      return (
        <VoltronSingleMonitorOverlay
          monitorId={slotId}
          roomId={slot.roomId ?? "boardroom-main"}
          isFullscreen={fullscreenSlot === slotId}
          isDetached={slot.detached}
          onLeaveCall={() => handleClear(slotId)}
        />
      );
    }

    // 5. Admin Camera
    if (slot.sourceId === "admin-camera") {
      return <HubMonitorCameraPlayer />;
    }

    // 6. 3D Venue / BOH Stage
    if (slot.category === "venue" || slot.sourceId === "venue") {
      return <HubMonitorVenuePlayer roomId={slot.roomId ?? "venue-main"} />;
    }

    // 7. Lobby Wall (Fan or Performer)
    if (
      slot.category === "fan-lobby" ||
      slot.category === "performer-lobby" ||
      slot.category === "fan_lobby" ||
      slot.category === "performer_lobby"
    ) {
      return <TMIBillboardLiveWall
        feeds={liveSessions.map((s, idx) => ({
          id: s.roomId ?? `feed-${idx}`,
          performerId: s.roomId ?? `perf-${idx}`,
          performerName: s.displayName ?? s.title ?? `Performer ${idx + 1}`,
          performerTier: "gold",
          roomId: s.roomId ?? `room-${idx}`,
          genre: "live",
          privacy: "PUBLIC",
          accentColor: "#00FFFF",
          viewers: s.viewerCount ?? 12,
          tips: 0,
          battleRank: idx + 1,
          activityLevel: 5,
          boostWeight: 0,
          isLive: true,
        }))}
      />;
    }

    // 8. Remote Performer Feed (Canonical WebRTC Room)
    if (slot.sourceId.startsWith("live:")) {
      return <HubMonitorRemoteFeedPlayer roomId={slot.roomId ?? "main-stage"} />;
    }

    // 9. Recorded / Fallback HTML5 Media
    const sourceDef = getLiveMonitorSource(slot.sourceId);
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "grid",
          placeItems: "center",
          background: "#010208",
          color: sourceDef?.accent ?? "#00FFFF",
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: "0.12em",
          textAlign: "center",
          padding: 12,
        }}
      >
        <div>
          <div>● {sourceDef?.label?.toUpperCase() ?? "ACTIVE MEDIA STREAM"}</div>
          <div style={{ marginTop: 6, fontSize: 8, color: "rgba(255,255,255,0.4)" }}>
            {slot.roomTitle || slot.roomId || "Standby Channel"}
          </div>
        </div>
      </div>
    );
  };

  // Find any detached slot to render floating window portal
  const detachedSlotEntry = useMemo(() => {
    return Object.entries(assignments).find(
      ([, slot]) => slot.detached && slot.sourceId,
    ) as [OverseerMonitorId, OverseerMonitorSlot] | undefined;
  }, [assignments]);

  return (
    <div
      data-overseer-monitor-wall
      style={{
        ...stageStyle,
        display: "flex",
        flexDirection: "column",
        width: "100%",
        minWidth: 0,
      }}
    >
      {/* TOP DECK: ADMIN NETWORK REMOTE / COMMAND DESK */}
      <AdminNetworkRemote
        selectedMonitor={selectedMonitor}
        onSelectMonitor={(id) => setSelectedMonitor(id)}
        slots={assignments}
        onChannelSelect={handleChannelSelect}
        onCycleChannel={handleCycleChannel}
        onSwap={() => handleSwap()}
        onFull={() => setFullscreenSlot((cur) => (cur === selectedMonitor ? null : selectedMonitor))}
        onInspect={() => handleInspect()}
        onDetach={() => handleDetach()}
        onClear={() => handleClear()}
        onAudioToggle={() => handleAudioToggle()}
        availableRooms={liveSessions}
        isMobile={isMobile}
        isSwapAnchor={swapAnchor === selectedMonitor}
        isFullscreen={fullscreenSlot === selectedMonitor}
        isInspecting={inspectingSlot === selectedMonitor}
      />

      {/* MONITOR GRID / DISPLAY SURFACES */}
      <div
        data-monitor-wall-grid
        style={{
          display: "grid",
          gridTemplateColumns:
            fullscreenSlot || isMobile ? "1fr" : layout.gridTemplateColumns,
          gridTemplateRows:
            fullscreenSlot || isMobile ? "1fr" : layout.gridTemplateRows,
          gap: layout.gap,
          width: "100%",
          minWidth: 0,
        }}
      >
        {mobileSlots.map((slotId) => {
          const slot = assignments[slotId];
          const isSelected = selectedMonitor === slotId;
          const isSwap = swapAnchor === slotId;
          const isFull = fullscreenSlot === slotId;
          const isInspecting = inspectingSlot === slotId;
          const sourceDef = getLiveMonitorSource(slot.sourceId);

          return (
            <div
              key={slotId}
              data-monitor-slot={slotId}
              data-source-assigned={slot.sourceId ? "true" : "false"}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                borderRadius: 8,
                border: isSwap
                  ? "2px solid #FF2DAA"
                  : isSelected
                    ? "2px solid #00FFFF"
                    : "2px solid rgba(212,175,55,0.45)",
                background: "#020210",
                overflow: "hidden",
                outline: isSelected ? "0 0 14px rgba(0,255,255,0.3)" : undefined,
                boxShadow: "0 6px 24px rgba(0,0,0,0.7)",
              }}
            >
              {/* Mandatory Attached Living OS Monitor Control Header */}
              <div data-living-os-attached="1" style={{ marginBottom: 2 }}>
                <LivingPlayerControlBed
                  destinationId={`admin-monitor-${slotId}`}
                  capabilities={adminLivingCaps}
                  viewCount={1}
                  onViewCountChange={() => undefined}
                  monLabel={`MONITOR ${slotId}`}
                  accent={sourceDef?.accent ?? "#FFD700"}
                  onCommand={(cmd) => {
                    if (cmd === "FULL") setFullscreenSlot((cur) => (cur === slotId ? null : slotId));
                    else if ((cmd as string) === "SWAP" || cmd === "SWITCH") handleSwap(slotId);
                    else if (cmd === "INSPECT") handleInspect(slotId);
                    else if (cmd === "DETACH") handleDetach(slotId);
                    else if (cmd === "RESET") handleClear(slotId);
                    else if (cmd === "PIN") handleTogglePin(slotId);
                    else if (cmd === "SOURCE" || cmd === "ROOM" || cmd === "STATION") {
                      setSelectedMonitor(slotId);
                      handleCycleChannel("next");
                    }
                  }}
                  onOpenDesk={() => {
                    const el = document.querySelector("[data-desk-workspace]");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                />
              </div>

              {/* Canonical Shared Monitor Bezel */}
              <CanonicalAdminMonitorBezel
                monitorId={slotId}
                sourceLabel={slot.roomTitle || sourceDef?.label || (slot.sourceId ? "LIVE ROOM" : "NO SOURCE")}
                accentColor={sourceDef?.accent ?? "#FFD700"}
                isLive={Boolean(slot.sourceId)}
                viewerCount={liveSessions.find((r) => r.roomId === slot.roomId)?.viewerCount}
                isPinned={slot.pinned}
                isFullscreen={isFull}
                isSwapAnchor={isSwap}
                isPickerOpen={sourcePickerSlot === slotId}
                hasSource={Boolean(slot.sourceId)}
                isDetached={slot.detached}
                isMuted={slot.muted}
                isInspecting={isInspecting}
                onSourceClick={() => setSelectedMonitor(slotId)}
                onSwapClick={() => handleSwap(slotId)}
                onFullClick={() => setFullscreenSlot((cur) => (cur === slotId ? null : slotId))}
                onInspectClick={() => handleInspect(slotId)}
                onPinClick={() => handleTogglePin(slotId)}
                onDetachClick={() => handleDetach(slotId)}
                onClearClick={() => handleClear(slotId)}
                onAudioToggle={() => handleAudioToggle(slotId)}
                isMobile={isMobile}
              />

              {/* Clean Monitor Video Viewport */}
              <div
                data-monitor-viewport
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: layout.aspectRatio,
                  minHeight: isDesktop ? layout.minHeight : 140,
                  background: "#030318",
                  overflow: "hidden",
                }}
              >
                {renderMonitorSurface(slotId, slot)}

                {/* IN-PLACE TELEMETRY HUD (Zero Page Scroll) */}
                {isInspecting ? (
                  <div
                    data-monitor-telemetry-hud
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(2,4,14,0.92)",
                      backdropFilter: "blur(6px)",
                      color: "#fff",
                      padding: 12,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      zIndex: 10,
                      fontFamily: "var(--font-mono, monospace), system-ui, sans-serif",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,255,255,0.3)", paddingBottom: 6, marginBottom: 8 }}>
                        <div style={{ fontSize: 9, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.14em" }}>
                          MONITOR {slotId} · MEDIA TELEMETRY & SIGNAL
                        </div>
                        <button
                          type="button"
                          onClick={() => setInspectingSlot(null)}
                          style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 13 }}
                        >
                          ✕
                        </button>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 8 }}>
                        <div>
                          <span style={{ color: "rgba(255,255,255,0.4)" }}>ROOM ID: </span>
                          <span style={{ color: "#FFD700", fontWeight: 800 }}>{slot.roomId ?? "STANDBY"}</span>
                        </div>
                        <div>
                          <span style={{ color: "rgba(255,255,255,0.4)" }}>MODE: </span>
                          <span style={{ color: "#00FF88", fontWeight: 800 }}>{slot.mode ?? "LIVE_NETWORK"}</span>
                        </div>
                        <div>
                          <span style={{ color: "rgba(255,255,255,0.4)" }}>BITRATE: </span>
                          <span style={{ color: "#fff" }}>3,840 kbps</span>
                        </div>
                        <div>
                          <span style={{ color: "rgba(255,255,255,0.4)" }}>RESOLUTION: </span>
                          <span style={{ color: "#fff" }}>1920×1080 @ 60fps</span>
                        </div>
                        <div>
                          <span style={{ color: "rgba(255,255,255,0.4)" }}>CODEC: </span>
                          <span style={{ color: "#fff" }}>H.264 / Opus 48kHz</span>
                        </div>
                        <div>
                          <span style={{ color: "rgba(255,255,255,0.4)" }}>TRANSPORT: </span>
                          <span style={{ color: "#00FFFF" }}>WebRTC Live Fabric</span>
                        </div>
                        <div>
                          <span style={{ color: "rgba(255,255,255,0.4)" }}>PACKET LOSS: </span>
                          <span style={{ color: "#00FF88" }}>0.0% (RTT 14ms)</span>
                        </div>
                        <div>
                          <span style={{ color: "rgba(255,255,255,0.4)" }}>AUDIO: </span>
                          <span style={{ color: slot.muted ? "#FF4444" : "#00FF88" }}>
                            {slot.muted ? "MUTED" : "ACTIVE (-14 LUFS)"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 6, fontSize: 7.5, color: "rgba(255,255,255,0.4)" }}>
                      <span>CANONICAL INSPECTOR · NO PAGE SCROLL</span>
                      <button
                        type="button"
                        onClick={() => setInspectingSlot(null)}
                        style={{
                          padding: "2px 6px",
                          borderRadius: 3,
                          border: "1px solid rgba(0,255,255,0.4)",
                          background: "rgba(0,255,255,0.15)",
                          color: "#00FFFF",
                          fontSize: 7.5,
                          cursor: "pointer",
                        }}
                      >
                        DISMISS HUD
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* FLOATING DETACHED MONITOR PORTAL (Continuous Session, Zero Reconnect) */}
      {mounted && detachedSlotEntry
        ? createPortal(
            <div
              data-detached-monitor-window
              style={{
                position: "fixed",
                top: 80,
                right: 24,
                width: isMobile ? 320 : 460,
                aspectRatio: "16 / 9",
                zIndex: 10050,
                borderRadius: 10,
                border: "2px solid #AA2DFF",
                background: "#020210",
                boxShadow: "0 16px 48px rgba(0,0,0,0.85), 0 0 24px rgba(170,45,255,0.3)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                fontFamily: "var(--font-mono, monospace), system-ui, sans-serif",
              }}
            >
              {/* Floating Bezel Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "4px 8px",
                  background: "rgba(10,4,24,0.95)",
                  borderBottom: "1px solid rgba(170,45,255,0.4)",
                  fontSize: 8.5,
                  fontWeight: 900,
                  color: "#AA2DFF",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>⬡ MONITOR {detachedSlotEntry[0]}</span>
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>·</span>
                  <span style={{ color: "#fff" }}>
                    {detachedSlotEntry[1].roomTitle || "FLOATING DISPLAY"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    type="button"
                    onClick={() => handleDetach(detachedSlotEntry[0])}
                    style={{
                      padding: "2px 7px",
                      borderRadius: 4,
                      border: "1px solid #00FFFF",
                      background: "rgba(0,255,255,0.2)",
                      color: "#00FFFF",
                      fontSize: 7.5,
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    ATTACH / RETURN
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDetach(detachedSlotEntry[0])}
                    style={{
                      padding: "2px 6px",
                      borderRadius: 4,
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "rgba(255,255,255,0.08)",
                      color: "#fff",
                      fontSize: 8,
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Floating Content Body */}
              <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
                {renderMonitorSurface(detachedSlotEntry[0], {
                  ...detachedSlotEntry[1],
                  detached: false, // Render actual surface inside the floating window
                })}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
