"use client";

import { openCanonicalWorkspaceQuick } from "@/lib/workspace/universal/openCanonicalPresentation";
import { useCompactQuickPanelStore } from "@/lib/hud/compactQuickPanelStore";

/**
 * Command Center media stack — dual identical 16:9 vertical stack (prototype) → Quad → Octo.
 * Dual geometry via CanonicalDualMonitorStack (shared with Observatory).
 * Non-destructive monitor swapping preserves WebRTC video streams without flickering.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CanonicalDualMonitorStack from "@/components/monitors/CanonicalDualMonitorStack";
import IdleMonitorFallbackRuntime from "@/components/admin/overseer/IdleMonitorFallbackRuntime";
import InPlaceGoLiveMonitorLayer from "@/components/live/InPlaceGoLiveMonitorLayer";
import HubMonitorCameraPlayer from "@/components/live/HubMonitorCameraPlayer";
import HubMonitorVenuePlayer from "@/components/live/HubMonitorVenuePlayer";
import LiveDistributionBezel from "@/components/broadcast/LiveDistributionBezel";
import { useGoLiveTransition } from "@/lib/live/goLiveTransitionStore";
import { useLivePrivacyState } from "@/lib/live/livePrivacyState";
import { DEFAULT_MONITOR_A, DEFAULT_MONITOR_B } from "@/lib/personal-media";
import {
  MonitorScreenShareVideo,
  MonitorShareSlotPicker,
} from "@/components/monitors/MonitorScreenSharePrimitives";
import { useMonitorScreenShare } from "@/hooks/useMonitorScreenShare";
import { shareSlotTargetsCell } from "@/lib/monitors/monitorScreenShareTypes";
import {
  HOUSE_SPONSORS,
  type HouseSponsor,
} from "@/lib/commerce/DualStreamSponsorshipEngine";

function traceLaunch(action: string, payload?: unknown): void {
  if (process.env.NODE_ENV !== "development") return;
  if (typeof window !== "undefined") {
    const w = window as Window & { __TMI_LAUNCH_TRACE__?: Array<unknown> };
    const current = w.__TMI_LAUNCH_TRACE__ ?? [];
    current.push({ action, payload, timestamp: performance.now() });
    if (current.length > 200) current.shift();
    w.__TMI_LAUNCH_TRACE__ = current;
  }
  console.debug("[TMI:LAUNCH]", { action, payload });
}

/** @deprecated Shared mega grid removed — per-monitor splits are 1/2/3/4/8 (dual max 16). */
export type MediaGridMode = 1 | 2 | 3 | 4 | 8;

/**
 * The 3 permanent TMI house sponsors — always present in every user's
 * sponsor overlay trigger, per Marcel Dickens (2026-08-05). Pushing one
 * overlays a branded animated banner on the monitor. Cross-platform
 * promotion points (tagging this on Twitch/YouTube/etc.) are explicitly
 * NOT implemented — there is no real way to verify TMI branding appeared
 * in an external broadcast without integrating those platforms' APIs
 * (same infra gap as the already-blocked Multi-Platform Simulcast
 * request), so no points are awarded here rather than faking verification.
 */
export type { HouseSponsor };
export { HOUSE_SPONSORS };

interface ActiveSponsorOverlay {
  sponsor: HouseSponsor;
  pushedAt: number;
}

/** Broadcast ad bumper — large lower-third with spin + scale entrance (Downy-style). */
function SponsorOverlayBanner({ overlay }: { overlay: ActiveSponsorOverlay }) {
  return (
    <AnimatePresence>
      <motion.div
        key={`${overlay.sponsor.id}-${overlay.pushedAt}`}
        initial={{ opacity: 0, scale: 0.35, rotate: -220, y: 48 }}
        animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
        exit={{ opacity: 0, scale: 0.6, rotate: 40, y: 24 }}
        transition={{ type: "spring", stiffness: 220, damping: 16, mass: 0.9 }}
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 14,
          zIndex: 8,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 18px",
          borderRadius: 14,
          background: `linear-gradient(105deg, rgba(5,5,16,0.94) 0%, ${overlay.sponsor.accent}33 55%, rgba(5,5,16,0.9) 100%)`,
          border: `2px solid ${overlay.sponsor.accent}`,
          boxShadow: `0 12px 40px rgba(0,0,0,0.65), 0 0 36px ${overlay.sponsor.accent}66`,
          backdropFilter: "blur(12px)",
          transformOrigin: "center bottom",
        }}
      >
        <motion.div
          animate={{ rotate: [0, 8, -6, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            flexShrink: 0,
            background: `${overlay.sponsor.accent}33`,
            border: `1px solid ${overlay.sponsor.accent}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            fontWeight: 900,
            color: overlay.sponsor.accent,
          }}
        >
          ★
        </motion.div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.22em", color: overlay.sponsor.accent, marginBottom: 4 }}>
            SPONSORED BY
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: "0.02em", lineHeight: 1.1 }}>
            {overlay.sponsor.name}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>{overlay.sponsor.tagline}</div>
        </div>
        <motion.span
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          style={{
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.14em",
            color: "#050510",
            background: overlay.sponsor.accent,
            padding: "8px 12px",
            borderRadius: 8,
            flexShrink: 0,
          }}
        >
          AD
        </motion.span>
      </motion.div>
    </AnimatePresence>
  );
}

/** Hub monitors use honest idle states — no stock singer / Big Buck Bunny fallback. */

export interface CommandCenterPlaylistCast {
  playlistId: string;
  trackId?: string;
  title: string;
  artist?: string;
  coverUrl?: string | null;
  audioUrl?: string | null;
  videoUrl?: string | null;
  isPlaying?: boolean;
  progress?: number;
}

export interface CommandCenterMediaSlot {
  id: string;
  label: string;
  videoUrl?: string | null;
  imageUrl?: string | null;
  kind?: "video" | "audience" | "empty" | "playlist";
  /** Cast-to-monitor payload when kind === "playlist" */
  playlistCast?: CommandCenterPlaylistCast | null;
}

interface CommandCenterMediaStackProps {
  slots: CommandCenterMediaSlot[];
  /** @deprecated Ignored — dual monitors use per-side 1/2/3/4/8 splits only. */
  mode?: MediaGridMode;
  /** @deprecated Ignored with shared mega grid removal. */
  onModeChange?: (mode: MediaGridMode) => void;
  footer?: ReactNode;
  /** chrome = Fan/Performer hubs (prototype); gold unused here (Observatory owns gold). */
  bezelVariant?: "chrome" | "gold";
  seriesLabel?: string;
  /** When true, stack height follows dual monitors (no 100% stretch in hub grid). */
  naturalHeight?: boolean;
  /** Presentation-only layout mode for Stage Deck monitor visibility. */
  monitorLayoutMode?: "dual" | "primary";
  /** Fan vs performer — Rule 26: avatar-ownership controls never show for performers. */
  role?: "fan" | "performer";
  /** Broadcaster user id for Live Distribution Bezel link state. */
  userId?: string | null;
  /** Optional dev-only continuity context supplied by the route/runtime layer. */
  continuityContext?: {
    venueInstanceId?: string;
    roomSessionId?: string;
    rtcSessionId?: string;
  };
}

function PlaylistCastBody({ cast }: { cast: CommandCenterPlaylistCast }) {
  const progress = typeof cast.progress === "number" ? Math.min(1, Math.max(0, cast.progress)) : undefined;
  const videoSrc = cast.videoUrl?.trim() || "";
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        background: videoSrc
          ? "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(5,5,16,0.8) 65%)"
          : "radial-gradient(circle at 40% 20%, rgba(170,45,255,0.18), #010308 65%)",
        padding: 12,
        gap: 8,
        zIndex: 1,
      }}
    >
      {videoSrc ? (
        <video
          key={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          src={videoSrc}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
          onError={() => {
            // Keep UI honest: PlaylistCastBody remains as "title projected only".
          }}
        />
      ) : null}
      <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.16em", color: "#AA2DFF" }}>
        CAST · PLAYLIST
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flex: 1, minHeight: 0 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 8,
            flexShrink: 0,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {cast.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cast.coverUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: 28, opacity: 0.5 }}>🎵</span>
          )}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 900,
              color: "#fff",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {cast.title}
          </div>
          {cast.artist ? (
            <div style={{ fontSize: 11, color: "#00FFFF", fontWeight: 700, marginTop: 2 }}>{cast.artist}</div>
          ) : null}
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 6, letterSpacing: "0.06em" }}>
            {cast.isPlaying ? "▶ PLAYING ON WORKSPACE MONITOR" : "📺 CAST TO WORKSPACE MONITOR"}
          </div>
          {cast.audioUrl ? (
            <audio
              key={cast.audioUrl}
              src={cast.audioUrl}
              controls
              autoPlay={Boolean(cast.isPlaying)}
              style={{ width: "100%", marginTop: 8, height: 28 }}
            />
          ) : (
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>
              No playable audio URL on this track — title projected only.
            </div>
          )}
        </div>
      </div>
      {progress !== undefined ? (
        <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${progress * 100}%`,
              background: "linear-gradient(90deg,#AA2DFF,#00FFFF)",
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function MonitorMediaBody({
  slot,
  sponsorOverlay,
  hubLiveRoomId,
  hubLiveMonitor,
  cellIndex,
}: {
  slot: CommandCenterMediaSlot;
  sponsorOverlay?: ActiveSponsorOverlay | null;
  hubLiveRoomId?: string | null;
  hubLiveMonitor?: "A" | "B" | null;
  cellIndex?: number;
}) {
  const videoSrc = slot.videoUrl?.trim() || "";
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    setVideoFailed(false);
  }, [videoSrc]);

  if (hubLiveRoomId && hubLiveMonitor === "A") {
    return (
      <div style={{ position: "relative", flex: 1, width: "100%", height: "100%", minHeight: 0, overflow: "hidden" }}>
        {sponsorOverlay ? <SponsorOverlayBanner overlay={sponsorOverlay} /> : null}
        <HubMonitorCameraPlayer />
      </div>
    );
  }

  if (hubLiveRoomId && hubLiveMonitor === "B") {
    return (
      <div style={{ position: "relative", flex: 1, width: "100%", height: "100%", minHeight: 0, overflow: "hidden" }}>
        <HubMonitorVenuePlayer roomId={hubLiveRoomId} />
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        flex: 1,
        width: "100%",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      {sponsorOverlay ? <SponsorOverlayBanner overlay={sponsorOverlay} /> : null}
      {slot.kind === "playlist" && slot.playlistCast ? (
        <PlaylistCastBody cast={slot.playlistCast} />
      ) : videoSrc && !videoFailed ? (
        <video
          key={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          src={videoSrc}
          onError={() => setVideoFailed(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : slot.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slot.imageUrl}
          alt={slot.label}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <IdleMonitorFallbackRuntime monitorId={slot.id} seedIndex={slot.id.length} cellIndex={cellIndex} />
      )}
    </div>
  );
}

function MonitorChrome({
  slot,
  onSwap,
  sponsorOverlay,
  overlayTarget,
  hubLiveRoomId,
  hubLiveMonitor,
  cellIndex,
}: {
  slot: CommandCenterMediaSlot;
  onSwap?: () => void;
  sponsorOverlay?: ActiveSponsorOverlay | null;
  overlayTarget?: typeof DEFAULT_MONITOR_A;
  hubLiveRoomId?: string | null;
  hubLiveMonitor?: "A" | "B" | null;
  cellIndex?: number;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  const handleFullscreen = () => {
    const el = rootRef.current;
    if (!el) return;
    if (document.fullscreenElement === el) {
      void document.exitFullscreen().catch(() => undefined);
      return;
    }
    void el.requestFullscreen().catch(() => undefined);
  };

  const mediaBody = (
    <MonitorMediaBody
      slot={slot}
      sponsorOverlay={sponsorOverlay}
      hubLiveRoomId={hubLiveRoomId}
      hubLiveMonitor={hubLiveMonitor}
      cellIndex={cellIndex}
    />
  );

  return (
    <div
      ref={rootRef}
      data-monitor-chrome-id={slot.id}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        background: "#010308",
        position: "relative",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 8px",
          background: "rgba(0,0,0,0.75)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          zIndex: 2,
        }}
      >
        <span
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.14em",
            color: "#FFD700",
            textTransform: "uppercase",
          }}
        >
          {slot.label}
        </span>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {onSwap ? (
            <button
              type="button"
              onClick={onSwap}
              title="Swap top and bottom monitors"
              style={{
                background: "rgba(255,215,0,0.15)",
                border: "1px solid rgba(255,215,0,0.4)",
                borderRadius: 4,
                color: "#FFD700",
                fontSize: 8,
                fontWeight: 800,
                padding: "2px 6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <span>⇼</span>
              <span>SWAP</span>
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleFullscreen}
            title="Expand this same monitor — same player instance"
              style={{
                background: "rgba(0,255,255,0.15)",
                border: "1px solid rgba(0,255,255,0.4)",
                borderRadius: 4,
                color: "#00FFFF",
                fontSize: 8,
                fontWeight: 800,
                padding: "2px 6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <span>⛶</span>
              <span>FULLSCREEN</span>
          </button>
        </div>
      </div>
      {overlayTarget ? (
        <InPlaceGoLiveMonitorLayer target={overlayTarget}>{mediaBody}</InPlaceGoLiveMonitorLayer>
      ) : (
        mediaBody
      )}
    </div>
  );
}

function padSlots(list: CommandCenterMediaSlot[], count: number, prefix: string): CommandCenterMediaSlot[] {
  const out = [...list];
  while (out.length < count) {
    out.push({ id: `${prefix}-${out.length}`, label: `CELL ${out.length + 1}`, kind: "empty" });
  }
  return out.slice(0, count);
}

export default function CommandCenterMediaStack({
  slots,
  footer,
  bezelVariant = "chrome",
  seriesLabel = "COMMAND CENTER · CHROME SERIES · DUAL 16:9 MONITORS",
  naturalHeight = false,
  monitorLayoutMode = "dual",
  continuityContext,
  role = "fan",
  userId = null,
}: CommandCenterMediaStackProps) {
  const isDevDiagnostics = process.env.NODE_ENV !== "production";
  const hubInPlaceRoomId = useGoLiveTransition((s) => s.inPlace?.roomId ?? null);
  const publishedRoomId = useLivePrivacyState((s) => s.publishedRoomId);
  const hubLiveRoomId = hubInPlaceRoomId ?? publishedRoomId;
  const [swapOrder, setSwapOrder] = useState(false);
  const [sponsorPanelOpen, setSponsorPanelOpen] = useState(false);
  const [activeSponsorOverlay, setActiveSponsorOverlay] = useState<ActiveSponsorOverlay | null>(null);

  const toggleRemotePanel = useCompactQuickPanelStore((s) => s.togglePanel);
  const remoteActive = useCompactQuickPanelStore((s) => s.activePanel === "remote");

  // ── Native browser fullscreen ─────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const runtimeInstanceId = useMemo(() => {
    const roomSeed = continuityContext?.roomSessionId ?? "unknown-room-session";
    const venueSeed = continuityContext?.venueInstanceId ?? "unknown-venue-instance";
    const slotSeed = (slots[0]?.id ?? "no-slot").replace(/[^a-zA-Z0-9_-]/g, "_");
    return `runtime-${roomSeed}-${venueSeed}-${slotSeed}`;
  }, [continuityContext?.roomSessionId, continuityContext?.venueInstanceId, slots]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      document.exitFullscreen().catch(() => undefined);
    } else {
      containerRef.current?.requestFullscreen().catch(() => undefined);
    }
  }, [isFullscreen]);

  // ── Screen share state ────────────────────────────────────────────────────
  const {
    screenStream,
    shareSlot,
    slotPickerOpen,
    setSlotPickerOpen,
    startScreenShare,
    stopScreenShare,
    pickShareSlot,
  } = useMonitorScreenShare();

  // ── Sponsor logic ─────────────────────────────────────────────────────────
  const pushSponsorLive = (sponsor: HouseSponsor) => {
    setActiveSponsorOverlay({ sponsor, pushedAt: Date.now() });
    setSponsorPanelOpen(false);
  };

  // Dual monitors: up to 8 cells each from the slot pool (independent per-side splits in stack).
  const orderedSlots = useMemo(() => {
    const base = [...slots];
    while (base.length < 1) {
      base.push({ id: `empty-${base.length}`, label: `MONITOR ${base.length + 1}`, kind: "empty" });
    }
    if (monitorLayoutMode === "dual") {
      while (base.length < 2) {
        base.push({ id: `empty-${base.length}`, label: `MONITOR ${base.length + 1}`, kind: "empty" });
      }
    }
    if (swapOrder && base.length >= 2) {
      const copy = [...base];
      const temp = copy[0]!;
      copy[0] = copy[1]!;
      copy[1] = temp;
      return copy;
    }
    return base;
  }, [slots, swapOrder, monitorLayoutMode]);

  const topSlots = useMemo(() => padSlots(orderedSlots.slice(0, 8), 8, "top"), [orderedSlots]);
  const bottomSlots = useMemo(
    () => padSlots(orderedSlots.slice(8, 16).length > 0 ? orderedSlots.slice(8, 16) : orderedSlots.slice(1, 9), 8, "bot"),
    [orderedSlots],
  );

  const primarySourceId = topSlots[0]?.id ?? null;
  const secondarySourceId = monitorLayoutMode === "dual" ? (bottomSlots[0]?.id ?? null) : null;

  let presentationMode: "DUAL" | "SINGLE_PRIMARY" | "FULLSCREEN_PRIMARY" | "FULLSCREEN_SECONDARY" =
    monitorLayoutMode === "dual" ? "DUAL" : "SINGLE_PRIMARY";
  if (typeof document !== "undefined" && document.fullscreenElement) {
    const fsId = document.fullscreenElement.getAttribute?.("data-monitor-chrome-id");
    if (fsId && topSlots.some((s) => s.id === fsId)) presentationMode = "FULLSCREEN_PRIMARY";
    else if (fsId && bottomSlots.some((s) => s.id === fsId)) presentationMode = "FULLSCREEN_SECONDARY";
  }

  const continuitySnapshot = useMemo(
    () => ({
      runtimeInstanceId,
      venueInstanceId: continuityContext?.venueInstanceId ?? "unknown-venue-instance",
      roomSessionId: continuityContext?.roomSessionId ?? "unknown-room-session",
      rtcSessionId: continuityContext?.rtcSessionId ?? "unknown-rtc-session",
      primarySourceId: primarySourceId ?? "unknown-primary-source",
      secondarySourceId: secondarySourceId ?? "none",
      presentationMode,
    }),
    [
      continuityContext?.roomSessionId,
      continuityContext?.rtcSessionId,
      continuityContext?.venueInstanceId,
      presentationMode,
      primarySourceId,
      runtimeInstanceId,
      secondarySourceId,
    ],
  );

  const handleSwap = () => {
    setSwapOrder((prev) => !prev);
  };

  const enterPrimaryFullscreen = useCallback(() => {
    const el = document.querySelector(`[data-monitor-chrome-id="${topSlots[0]?.id ?? ""}"]`);
    if (el instanceof HTMLElement) void el.requestFullscreen().catch(() => undefined);
  }, [topSlots]);

  const enterSecondaryFullscreen = useCallback(() => {
    const el = document.querySelector(`[data-monitor-chrome-id="${bottomSlots[0]?.id ?? ""}"]`);
    if (el instanceof HTMLElement) void el.requestFullscreen().catch(() => undefined);
  }, [bottomSlots]);

  const exitMonitorFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!isDevDiagnostics) return;
    (
      window as typeof window & {
        __TMI_DEV_CONTINUITY__?: unknown;
        __TMI_DEV_CONTINUITY_ACTIONS__?: {
          toggleSwap: () => void;
          enterPrimaryFullscreen: () => void;
          enterSecondaryFullscreen: () => void;
          exitFullscreen: () => void;
          getSnapshot: () => typeof continuitySnapshot;
        };
      }
    ).__TMI_DEV_CONTINUITY__ = continuitySnapshot;
    (
      window as typeof window & {
        __TMI_DEV_CONTINUITY_ACTIONS__?: {
          toggleSwap: () => void;
          enterPrimaryFullscreen: () => void;
          enterSecondaryFullscreen: () => void;
          exitFullscreen: () => void;
          getSnapshot: () => typeof continuitySnapshot;
        };
      }
    ).__TMI_DEV_CONTINUITY_ACTIONS__ = {
      toggleSwap: handleSwap,
      enterPrimaryFullscreen,
      enterSecondaryFullscreen,
      exitFullscreen: exitMonitorFullscreen,
      getSnapshot: () => continuitySnapshot,
    };
    return () => {
      delete (
        window as typeof window & {
          __TMI_DEV_CONTINUITY__?: unknown;
          __TMI_DEV_CONTINUITY_ACTIONS__?: unknown;
        }
      ).__TMI_DEV_CONTINUITY__;
      delete (
        window as typeof window & {
          __TMI_DEV_CONTINUITY_ACTIONS__?: unknown;
        }
      ).__TMI_DEV_CONTINUITY_ACTIONS__;
    };
  }, [
    continuitySnapshot,
    enterPrimaryFullscreen,
    enterSecondaryFullscreen,
    exitMonitorFullscreen,
    handleSwap,
    isDevDiagnostics,
  ]);

  const toolbar = (
    <div
      style={{
        flexShrink: 0,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(0,0,0,0.35)",
        marginBottom: 8,
        borderRadius: 8,
      }}
    >
      <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)" }}>
        DUAL MONITORS · PER-SIDE 1/2/3/4/8
      </span>
      <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", fontWeight: 700 }}>
        Max 8+8=16
      </span>

      <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.12)", margin: "0 2px" }} />

      <div style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setSponsorPanelOpen((v) => !v)}
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.08em",
            padding: "3px 8px",
            borderRadius: 6,
            cursor: "pointer",
            border: activeSponsorOverlay ? "1px solid #FFD700" : "1px solid rgba(255,215,0,0.4)",
            background: activeSponsorOverlay ? "rgba(255,215,0,0.18)" : "transparent",
            color: "#FFD700",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>★</span>
          <span>SPONSORS</span>
        </button>

        {sponsorPanelOpen ? (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              zIndex: 12,
              width: 220,
              background: "#0d1117",
              border: "1px solid rgba(255,215,0,0.4)",
              borderRadius: 10,
              padding: 8,
              boxShadow: "0 16px 40px rgba(0,0,0,0.65)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              pointerEvents: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)" }}>
              OFFICIAL TMI SPONSORS
            </span>
            {HOUSE_SPONSORS.map((sp) => (
              <motion.button
                key={sp.id}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => pushSponsorLive(sp)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 2,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: `1px solid ${sp.accent}55`,
                  background: `${sp.accent}12`,
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 900, color: sp.accent }}>{sp.name}</span>
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.45)" }}>{sp.tagline}</span>
              </motion.button>
            ))}
            {activeSponsorOverlay ? (
              <button
                type="button"
                onClick={() => {
                  setActiveSponsorOverlay(null);
                  setSponsorPanelOpen(false);
                }}
                style={{
                  marginTop: 2,
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "transparent",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 9,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Stop overlay
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.12)", margin: "0 2px" }} />

      {/* SHARE SCREEN — routes stream into any monitor slot without blocking camera feed */}
      <div style={{ position: "relative" }}>
        <button
          type="button"
          onClick={screenStream ? () => setSlotPickerOpen((v) => !v) : startScreenShare}
          title={screenStream ? "Change which slot shows your screen share" : "Share your screen to a monitor slot"}
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.08em",
            padding: "3px 9px",
            borderRadius: 6,
            cursor: "pointer",
            border: screenStream ? "1px solid #00FF88" : "1px solid rgba(0,255,136,0.45)",
            background: screenStream ? "rgba(0,255,136,0.15)" : "transparent",
            color: "#00FF88",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>{screenStream ? "⬡" : "⬡"}</span>
          <span>{screenStream ? "SHARING…" : "SHARE SCREEN"}</span>
        </button>
        {screenStream && (
          <button
            type="button"
            onClick={stopScreenShare}
            title="Stop screen share"
            style={{
              marginLeft: 3,
              fontSize: 7,
              fontWeight: 900,
              padding: "3px 6px",
              borderRadius: 5,
              border: "1px solid rgba(255,68,68,0.5)",
              background: "rgba(255,68,68,0.12)",
              color: "#FF6B6B",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        )}
        <AnimatePresence>
          {slotPickerOpen && screenStream && (
            <MonitorShareSlotPicker
              activeSlot={shareSlot}
              onPick={pickShareSlot}
              onClose={() => setSlotPickerOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* BIG SCREEN — native browser fullscreen */}
      <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.12)", margin: "0 2px" }} />
      <button
        type="button"
        onClick={toggleFullscreen}
        title={isFullscreen ? "Exit fullscreen" : "Big screen — native fullscreen"}
        style={{
          fontSize: 8,
          fontWeight: 900,
          letterSpacing: "0.08em",
          padding: "3px 10px",
          borderRadius: 6,
          cursor: "pointer",
          border: isFullscreen ? "1px solid #00FFFF" : "1px solid rgba(0,255,255,0.4)",
          background: isFullscreen ? "rgba(0,255,255,0.18)" : "transparent",
          color: "#00FFFF",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <span>{isFullscreen ? "⛶" : "⛶"}</span>
        <span>{isFullscreen ? "EXIT BIG SCREEN" : "BIG SCREEN"}</span>
      </button>

      <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.12)", margin: "0 2px" }} />

      {/* Direct-Action Quick Shortcuts: One Tap = Immediate Action */}
      <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
        {role === "fan" ? (
        <button
          type="button"
          onClick={() => openCanonicalWorkspaceQuick("inventory", "DRAWER")}
          title="Open Avatar Studio"
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.08em",
            padding: "3px 8px",
            borderRadius: 6,
            cursor: "pointer",
            border: "1px solid #00FFFF",
            background: "rgba(0,255,255,0.14)",
            color: "#00FFFF",
            fontFamily: "inherit",
          }}
        >
          👤 AVATAR
        </button>
        ) : null}

        <button
          type="button"
          onClick={() => openCanonicalWorkspaceQuick("memory", "DRAWER")}
          title="Open Memory Wall"
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.08em",
            padding: "3px 8px",
            borderRadius: 6,
            cursor: "pointer",
            border: "1px solid #9D4EDD",
            background: "rgba(157,78,221,0.14)",
            color: "#9D4EDD",
            fontFamily: "inherit",
          }}
        >
          🧠 MEMORY
        </button>

        <button
          type="button"
          onClick={() => {
            traceLaunch("PLAYLIST_CLICK", { source: "media-stack", workspaceId: "playlist-studio" });
            openCanonicalWorkspaceQuick("playlist", "DRAWER");
          }}
          title="Open Playlist Library"
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.08em",
            padding: "3px 8px",
            borderRadius: 6,
            cursor: "pointer",
            border: "1px solid #00FF88",
            background: "rgba(0,255,136,0.14)",
            color: "#00FF88",
            fontFamily: "inherit",
          }}
        >
          🎵 PLAYLIST
        </button>

        <button
          type="button"
          onClick={() => toggleRemotePanel("remote", "bottom-right")}
          title="Open Remote — quick playlist + player controller"
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.08em",
            padding: "3px 8px",
            borderRadius: 6,
            cursor: "pointer",
            border: remoteActive ? "1px solid #FF2DAA" : "1px solid rgba(255,45,170,0.45)",
            background: remoteActive ? "rgba(255,45,170,0.2)" : "rgba(255,45,170,0.14)",
            color: "#FF2DAA",
            fontFamily: "inherit",
          }}
        >
          🎚️ REMOTE
        </button>

        <button
          type="button"
          data-testid="tmi-yopho-media-stack-trigger"
          data-tmi-action="open-workspace"
          data-tmi-workspace="yopho"
          onClick={() => {
            traceLaunch("YOPHO_CLICK", { source: "media-stack", workspaceId: "yopho" });
            openCanonicalWorkspaceQuick("yopho", "DRAWER");
          }}
          title="Open YoPho Studio"
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.08em",
            padding: "3px 8px",
            borderRadius: 6,
            cursor: "pointer",
            border: "1px solid #FF2DAA",
            background: "rgba(255,45,170,0.14)",
            color: "#FF2DAA",
            fontFamily: "inherit",
          }}
        >
          📸 YOPHO
        </button>
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      data-tmi-dev-runtime-instance-id={isDevDiagnostics ? continuitySnapshot.runtimeInstanceId : undefined}
      data-tmi-dev-venue-instance-id={isDevDiagnostics ? continuitySnapshot.venueInstanceId : undefined}
      data-tmi-dev-room-session-id={isDevDiagnostics ? continuitySnapshot.roomSessionId : undefined}
      data-tmi-dev-rtc-session-id={isDevDiagnostics ? continuitySnapshot.rtcSessionId : undefined}
      data-tmi-dev-primary-source-id={isDevDiagnostics ? continuitySnapshot.primarySourceId : undefined}
      data-tmi-dev-secondary-source-id={isDevDiagnostics ? continuitySnapshot.secondarySourceId : undefined}
      data-tmi-dev-presentation-mode={isDevDiagnostics ? continuitySnapshot.presentationMode : undefined}
      style={{
        display: "flex",
        flexDirection: "column",
        height: naturalHeight ? "auto" : "100%",
        minHeight: naturalHeight ? 0 : 0,
        flexShrink: naturalHeight ? 0 : undefined,
        overflow: naturalHeight ? "visible" : "auto",
        background: "#010308",
        padding: 8,
        ...(isFullscreen ? { background: "#050510", padding: 16 } : {}),
      }}
    >
      {isDevDiagnostics ? (
        <div
          data-tmi-dev-continuity-overlay="1"
          style={{
            position: "fixed",
            right: 12,
            bottom: 12,
            zIndex: 10001,
            maxWidth: 360,
            background: "rgba(4,6,14,0.9)",
            border: "1px solid rgba(0,255,255,0.3)",
            borderRadius: 10,
            padding: "8px 10px",
            fontSize: 10,
            lineHeight: 1.45,
            color: "#D8FFFF",
            fontFamily: "monospace",
            pointerEvents: "none",
          }}
        >
          <div style={{ color: "#00FFFF", fontWeight: 800, marginBottom: 4 }}>DEV CONTINUITY</div>
          <div>runtimeInstanceId: {continuitySnapshot.runtimeInstanceId}</div>
          <div>venueInstanceId: {continuitySnapshot.venueInstanceId}</div>
          <div>roomSessionId: {continuitySnapshot.roomSessionId}</div>
          <div>rtcSessionId: {continuitySnapshot.rtcSessionId}</div>
          <div>primarySourceId: {continuitySnapshot.primarySourceId}</div>
          <div>secondarySourceId: {continuitySnapshot.secondarySourceId}</div>
          <div>presentationMode: {continuitySnapshot.presentationMode}</div>
        </div>
      ) : null}

      {/* External-only Live Distribution Bezel — ABOVE monitors, no TMI light */}
      {role === "performer" ? <LiveDistributionBezel userId={userId} /> : null}

      <CanonicalDualMonitorStack
        variant={bezelVariant}
        seriesLabel={seriesLabel}
        toolbar={toolbar}
        minMonitorCount={monitorLayoutMode === "primary" ? 1 : 2}
        monitors={[
          {
            id: topSlots[0]!.id,
            label: "MONITOR A",
            children:
              screenStream && shareSlotTargetsCell(shareSlot, 0, -1) ? (
                <MonitorScreenShareVideo stream={screenStream} onStop={stopScreenShare} label="MON A" />
              ) : (
                <MonitorChrome
                  slot={topSlots[0]!}
                  onSwap={handleSwap}
                  overlayTarget={DEFAULT_MONITOR_A}
                  sponsorOverlay={activeSponsorOverlay}
                  hubLiveRoomId={hubLiveRoomId}
                  hubLiveMonitor="A"
                />
              ),
            cells: topSlots.map((slot, ci) =>
              screenStream && shareSlotTargetsCell(shareSlot, 0, ci) ? (
                <MonitorScreenShareVideo key={slot.id} stream={screenStream} onStop={stopScreenShare} label={`A${ci + 1}`} />
              ) : (
                <MonitorChrome
                  key={slot.id}
                  slot={slot}
                  sponsorOverlay={activeSponsorOverlay}
                  cellIndex={ci}
                />
              ),
            ),
          },
          ...(monitorLayoutMode === "dual"
            ? [{
            id: bottomSlots[0]!.id,
            label: "MONITOR B",
            children:
              screenStream && shareSlotTargetsCell(shareSlot, 1, -1) ? (
                <MonitorScreenShareVideo stream={screenStream} onStop={stopScreenShare} label="MON B" />
              ) : (
                <MonitorChrome
                  slot={bottomSlots[0]!}
                  onSwap={handleSwap}
                  overlayTarget={DEFAULT_MONITOR_B}
                  hubLiveRoomId={hubLiveRoomId}
                  hubLiveMonitor="B"
                />
              ),
            cells: bottomSlots.map((slot, ci) =>
              screenStream && shareSlotTargetsCell(shareSlot, 1, ci) ? (
                <MonitorScreenShareVideo key={slot.id} stream={screenStream} onStop={stopScreenShare} label={`B${ci + 1}`} />
              ) : (
                <MonitorChrome
                  key={slot.id}
                  slot={slot}
                  cellIndex={ci}
                />
              ),
            ),
          }]
            : []),
        ]}
      />

      {footer ? <div style={{ flexShrink: 0, marginTop: 8 }}>{footer}</div> : null}
    </div>
  );
}
