"use client";

import {
  openCanonicalWorkspaceQuick,
  presentCanonicalWorkspace,
} from "@/lib/workspace/universal/openCanonicalPresentation";
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
import MediaPlayerGoLiveControl from "@/components/commandCenter/MediaPlayerGoLiveControl";
import { useGoLiveTransition } from "@/lib/live/goLiveTransitionStore";
import { useLivePrivacyState } from "@/lib/live/livePrivacyState";
import { DEFAULT_MONITOR_A, DEFAULT_MONITOR_B } from "@/lib/personal-media";
import {
  MonitorScreenShareVideo,
  MonitorShareSlotPicker,
  ScreenShareErrorBanner,
} from "@/components/monitors/MonitorScreenSharePrimitives";
import ParticipantSurfaceGrid from "@/components/monitors/ParticipantSurfaceGrid";
import { useMonitorScreenShare } from "@/hooks/useMonitorScreenShare";
import { shareSlotTargetsCell } from "@/lib/monitors/monitorScreenShareTypes";
import {
  resolveMediaSurfaceLayout,
  type FullscreenState,
  type PriorMediaPresentationSnapshot,
} from "@/lib/monitors/MediaSurfaceLayoutDirector";
import { useCanonicalMediaPlayerRuntime } from "@/lib/media/canonicalMediaPlayerRuntime";
import useViewportMode from "@/hooks/useViewportMode";
import {
  HOUSE_SPONSORS,
  type HouseSponsor,
} from "@/lib/commerce/HouseSponsorCanon";
import {
  useGoLiveBootstrapStore,
  type GoLiveBootstrapPhase,
} from "@/lib/live/goLiveBootstrapStore";
import { presentInstantGoLiveInPlace } from "@/lib/dock/presentInstantGoLiveInPlace";
import ArtistIdShareStrip from "@/components/identity/ArtistIdShareStrip";
import VenueToolsToggleButton from "@/components/hud/VenueToolsToggleButton";
import CompactAudioMixer from "@/components/audio/CompactAudioMixer";
import FastPlaylistCastPicker from "@/components/playlists/FastPlaylistCastPicker";
import AvatarQuickChangeDrawer from "@/components/avatar/AvatarQuickChangeDrawer";
import ExploreMatrixDiscoveryHost, { type ExploreColumnType } from "@/components/explore/ExploreMatrixDiscoveryHost";
import MiniLiveLobbyWallRuntime from "@/components/lobby/MiniLiveLobbyWallRuntime";
import LiveLobbyMosaicScrollRail from "@/components/live/LiveLobbyMosaicScrollRail";
import { useCompactQuickPanelStore } from "@/lib/hud/compactQuickPanelStore";

/** Bootstrap / error chrome over dual monitors during Instant GO LIVE. */
function GoLiveBootstrapOverlay({
  phase,
  errorCode,
  errorMessage,
  onRetry,
}: {
  phase: GoLiveBootstrapPhase;
  errorCode: string | null;
  errorMessage: string | null;
  onRetry: () => void;
}) {
  if (phase === "IDLE" || phase === "READY") return null;
  const booting =
    phase === "REQUESTING_MEDIA" ||
    phase === "SESSION_CREATED" ||
    phase === "VENUE_RESOLVING" ||
    phase === "VENUE_LOADING" ||
    phase === "HUD_MOUNTING";
  if (!booting && phase !== "ERROR") return null;

  return (
    <div
      data-golive-bootstrap={phase}
      style={{
        position: "absolute",
        left: 12,
        right: 12,
        bottom: 12,
        zIndex: 20,
        pointerEvents: phase === "ERROR" ? "auto" : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        padding: "8px 12px",
        borderRadius: 10,
        background:
          phase === "ERROR" ? "rgba(80,0,20,0.92)" : "rgba(5,5,16,0.82)",
        border:
          phase === "ERROR"
            ? "1px solid rgba(255,45,170,0.55)"
            : "1px solid rgba(0,255,255,0.35)",
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: "0.08em",
        color: phase === "ERROR" ? "#FF2DAA" : "#00FFFF",
      }}
    >
      <span>
        {phase === "ERROR"
          ? `${errorCode ?? "ERROR"} · ${errorMessage ?? "Go Live failed"}`
          : `${phase.replace(/_/g, " ")}…`}
      </span>
      {phase === "ERROR" ? (
        <button
          type="button"
          onClick={onRetry}
          style={{
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.12em",
            padding: "5px 10px",
            borderRadius: 6,
            border: "1px solid #FF2DAA",
            background: "rgba(255,45,170,0.2)",
            color: "#FF2DAA",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          RETRY
        </button>
      ) : null}
    </div>
  );
}

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
  /** Display name for Fan ID / Artist ID strip. */
  displayName?: string | null;
  /** Shell-owned YoPho launch (canonical drawer / workspace — never a route). */
  onOpenYopho?: () => void;
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
          data-video-shuffle-player="true"
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
          onLoadedData={(e) => {
            void e.currentTarget.play().catch(() => {});
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
  goLiveBootActive,
  displayName,
  watchingCount,
}: {
  slot: CommandCenterMediaSlot;
  sponsorOverlay?: ActiveSponsorOverlay | null;
  hubLiveRoomId?: string | null;
  hubLiveMonitor?: "A" | "B" | null;
  cellIndex?: number;
  goLiveBootActive?: boolean;
  displayName?: string | null;
  watchingCount?: number;
}) {
  const videoSrc = slot.videoUrl?.trim() || "";
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    setVideoFailed(false);
  }, [videoSrc]);

  if ((hubLiveRoomId || goLiveBootActive) && hubLiveMonitor === "A") {
    // Explicit playlist / video-shuffle cast wins Monitor A (QP retest path).
    // Live camera remains default when no cast is active.
    if (!(slot.kind === "playlist" && slot.playlistCast?.videoUrl?.trim())) {
      return (
        <div style={{ position: "relative", flex: 1, width: "100%", height: "100%", minHeight: 0, overflow: "hidden" }}>
          {sponsorOverlay ? <SponsorOverlayBanner overlay={sponsorOverlay} /> : null}
          <HubMonitorCameraPlayer displayName={displayName} watchingCount={watchingCount ?? 0} />
        </div>
      );
    }
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
  goLiveBootActive,
  displayName,
}: {
  slot: CommandCenterMediaSlot;
  onSwap?: () => void;
  sponsorOverlay?: ActiveSponsorOverlay | null;
  overlayTarget?: typeof DEFAULT_MONITOR_A;
  hubLiveRoomId?: string | null;
  hubLiveMonitor?: "A" | "B" | null;
  cellIndex?: number;
  goLiveBootActive?: boolean;
  displayName?: string | null;
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
      goLiveBootActive={goLiveBootActive}
      displayName={displayName}
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
        <InPlaceGoLiveMonitorLayer
          target={overlayTarget}
          showTransition={hubLiveMonitor === "B"}
        >
          {mediaBody}
        </InPlaceGoLiveMonitorLayer>
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
  displayName = null,
  onOpenYopho,
}: CommandCenterMediaStackProps) {
  // Assign every render — cert must not depend on effect timing / StrictMode cleanup races.
  if (typeof window !== "undefined") {
    document.documentElement.dataset.tmiMediaStackBoot = String(Date.now());
    (window as Window & { __TMI_OPEN_YOPHO__?: () => void }).__TMI_OPEN_YOPHO__ = () => {
      document.documentElement.setAttribute("data-yopho-btn-click", "1");
      useCompactQuickPanelStore.getState().openPanel("yopho", "bottom-left");
      if (onOpenYopho) onOpenYopho();
      else presentCanonicalWorkspace("yopho", "DRAWER");
    };
    try {
      // Mirror onto documentElement so Playwright can detect boot without window enumeration issues.
      document.documentElement.setAttribute("data-tmi-open-yopho-fn", "1");
    } catch {
      /* ignore */
    }
  }

  const isDevDiagnostics = process.env.NODE_ENV !== "production";
  const hubInPlaceRoomId = useGoLiveTransition((s) => s.inPlace?.roomId ?? null);
  const publishedRoomId = useLivePrivacyState((s) => s.publishedRoomId);
  const hubLiveRoomId = hubInPlaceRoomId ?? publishedRoomId;
  const bootPhase = useGoLiveBootstrapStore((s) => s.phase);
  const bootErrorCode = useGoLiveBootstrapStore((s) => s.errorCode);
  const bootErrorMessage = useGoLiveBootstrapStore((s) => s.errorMessage);
  const goLiveBootActive =
    bootPhase !== "IDLE" && bootPhase !== "READY" && bootPhase !== "ERROR";
  const [swapOrder, setSwapOrder] = useState(false);
  const [sponsorPanelOpen, setSponsorPanelOpen] = useState(false);
  const [castPanelOpen, setCastPanelOpen] = useState(false);
  const [playlistCastOpen, setPlaylistCastOpen] = useState(false);
  const [avatarQuickOpen, setAvatarQuickOpen] = useState(false);
  const [identityOpen, setIdentityOpen] = useState(false);
  const [exploreMatrixOpen, setExploreMatrixOpen] = useState(false);
  const [exploreInitialColumn, setExploreInitialColumn] = useState<ExploreColumnType>("SNIPS");
  const [miniLobbyWallOpen, setMiniLobbyWallOpen] = useState(false);
  const [activeSponsorOverlay, setActiveSponsorOverlay] = useState<ActiveSponsorOverlay | null>(null);

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

  useEffect(() => {
    const handler = () => setCastPanelOpen((v) => !v);
    window.addEventListener("tmi:cast-panel-toggle", handler);
    return () => window.removeEventListener("tmi:cast-panel-toggle", handler);
  }, []);

  useEffect(() => {
    const onOpenExplore = (e: Event) => {
      const customEvent = e as CustomEvent<{ column?: ExploreColumnType }>;
      const col = customEvent.detail?.column ?? "SNIPS";
      setExploreInitialColumn(col);
      setExploreMatrixOpen(true);
    };
    window.addEventListener("tmi:open-explore-matrix", onOpenExplore);
    return () => window.removeEventListener("tmi:open-explore-matrix", onOpenExplore);
  }, []);

  useEffect(() => {
    const onToggleLobbyWall = () => {
      setMiniLobbyWallOpen((v) => !v);
    };
    window.addEventListener("tmi:toggle-mini-lobby-wall", onToggleLobbyWall);
    return () => window.removeEventListener("tmi:toggle-mini-lobby-wall", onToggleLobbyWall);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      document.exitFullscreen().catch(() => undefined);
    } else {
      containerRef.current?.requestFullscreen().catch(() => undefined);
    }
  }, [isFullscreen]);

  // ── Screen share — cyclic single-button + MediaSurfaceLayoutDirector ─────
  const { isPhone, isTablet } = useViewportMode();
  const deviceTier = isPhone ? "phone" : isTablet ? "tablet" : "desktop";
  /** Hub mobile (≤900px): shell status bar + session strip own GPS/CHAT/workspaces — hide duplicate toolbar. */
  const [compactHubLayout, setCompactHubLayout] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 900px)");
    const sync = () => setCompactHubLayout(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);
  const setPrimaryAudio = useCanonicalMediaPlayerRuntime((s) => s.setPrimaryAudio);
  const setScreenShareAudioOwner = useCanonicalMediaPlayerRuntime((s) => s.setScreenShareAudioOwner);
  const assignSource = useCanonicalMediaPlayerRuntime((s) => s.assignSource);
  const screenShareAudioSourceId = useCanonicalMediaPlayerRuntime((s) => s.screenShareAudioSourceId);
  const priorPresentationRef = useRef<PriorMediaPresentationSnapshot | null>(null);
  const [surfaceFullscreenManual, setSurfaceFullscreen] = useState<FullscreenState>("none");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPrefersReducedMotion(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  const {
    screenStream,
    availableShareSources,
    shareSourceIndex,
    shareActive,
    shareButtonLabel,
    shareSlot,
    slotPickerOpen,
    setSlotPickerOpen,
    error: shareError,
    clearError: clearShareError,
    cycleSharePress,
    addShareSource,
    stopScreenShare,
    pickShareSlot,
  } = useMonitorScreenShare({
    defaultSlot: { monitor: 0, cellIndex: -1 },
    openPickerOnStart: false,
    onShareStopped: () => {
      setSurfaceFullscreen("none");
      setPrimaryAudio("b");
      assignSource("a", "SELF_CAMERA");
    },
    onScreenAudioOwnership: ({ sourceId, hasAudio }) => {
      // Single audio owner — replace in place, never stack a second registration
      setScreenShareAudioOwner(sourceId);
      if (sourceId && hasAudio) {
        setPrimaryAudio("a");
        assignSource("a", "SCREEN_SHARE");
      }
    },
  });

  const surfaceFullscreen: FullscreenState =
    isFullscreen && shareActive ? "share" : surfaceFullscreenManual;

  useEffect(() => {
    const onClusterShare = () => {
      void cycleSharePress();
    };
    window.addEventListener("tmi:performer-share-screen", onClusterShare);
    return () => window.removeEventListener("tmi:performer-share-screen", onClusterShare);
  }, [cycleSharePress]);

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

  const participantCount = useMemo(() => {
    const named = orderedSlots.filter((s) => s.kind !== "empty").length;
    if (shareActive) return Math.max(1, Math.min(8, named || 1));
    return Math.min(8, named);
  }, [orderedSlots, shareActive]);

  const surfaceLayout = useMemo(
    () =>
      resolveMediaSurfaceLayout({
        screenShareActive: shareActive,
        shareSourceIndex,
        availableShareSources: availableShareSources.map((s) => ({
          id: s.id,
          label: s.label,
          alive: s.alive,
        })),
        participantCount,
        activeSpeakerId: null,
        audiencePanelEnabled: monitorLayoutMode === "dual",
        fullscreenState: surfaceFullscreen,
        deviceTier,
        roleContext: role === "performer" ? "performer" : "fan",
        prefersReducedMotion,
        priorTopSurface: priorPresentationRef.current?.topSurface,
        priorBottomSurface: priorPresentationRef.current?.bottomSurface,
      }),
    [
      shareActive,
      shareSourceIndex,
      availableShareSources,
      participantCount,
      surfaceFullscreen,
      deviceTier,
      role,
      prefersReducedMotion,
      monitorLayoutMode,
    ],
  );

  // Capture prior presentation once when share becomes active
  useEffect(() => {
    if (shareActive && !priorPresentationRef.current) {
      priorPresentationRef.current = {
        topSurface: "prior_media",
        bottomSurface: monitorLayoutMode === "dual" ? "audience" : "prior_media",
        fullscreenState: "none",
      };
    }
    if (!shareActive) {
      priorPresentationRef.current = null;
    }
  }, [shareActive, monitorLayoutMode]);

  const participantTiles = useMemo(() => {
    const sourceSlots = orderedSlots.filter((s) => s.kind !== "empty").slice(0, 8);
    const tiles = (sourceSlots.length > 0 ? sourceSlots : topSlots.slice(0, Math.max(1, participantCount))).map(
      (slot, i) => ({
        id: `p${i}`,
        label: slot.label,
        children: (
          <MonitorChrome
            slot={slot}
            cellIndex={i}
            hubLiveRoomId={hubLiveRoomId}
            hubLiveMonitor={i === 0 ? "A" : "B"}
            goLiveBootActive={goLiveBootActive}
            displayName={displayName}
          />
        ),
      }),
    );
    return tiles;
  }, [orderedSlots, topSlots, participantCount, hubLiveRoomId, goLiveBootActive]);

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

  const utilityBtn = (
    active: boolean,
    accent: string,
    label: string,
    onClick: () => void,
    opts?: { testId?: string; title?: string; icon?: string },
  ) => (
    <button
      type="button"
      data-testid={opts?.testId}
      onClick={onClick}
      title={opts?.title ?? label}
      style={{
        fontSize: 8,
        fontWeight: 900,
        letterSpacing: "0.08em",
        padding: "3px 9px",
        borderRadius: 6,
        cursor: "pointer",
        border: active ? `1px solid ${accent}` : `1px solid ${accent}66`,
        background: active ? `${accent}22` : "transparent",
        color: accent,
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        gap: 4,
        whiteSpace: "nowrap",
      }}
    >
      {opts?.icon ? <span style={{ pointerEvents: "none" }}>{opts.icon}</span> : null}
      <span style={{ pointerEvents: "none" }}>{label}</span>
    </button>
  );

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

  const sectionLabel: React.CSSProperties = {
    fontSize: 8,
    fontWeight: 900,
    letterSpacing: "0.12em",
    color: "rgba(255,255,255,0.38)",
    marginBottom: 2,
    width: "100%",
  };

  const toolbar = (
    <div
      style={{
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "8px 10px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(0,0,0,0.45)",
        marginBottom: 8,
        borderRadius: 10,
      }}
    >
      {/* Action Row: CAST Group, QUICK Group, VENUE TOOLS */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 12 }}>
        {/* CAST GROUP */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.15em", color: "#AA2DFF" }}>
            CAST
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4 }}>
            {/* 1. PLAYLIST */}
            <div style={{ position: "relative" }}>
              {utilityBtn(playlistCastOpen, "#00FFFF", "PLAYLIST", () => setPlaylistCastOpen((v) => !v), {
                testId: "tmi-cast-playlist-btn",
                title: "Cast playlist / song to room",
                icon: "🎵",
              })}
              {playlistCastOpen ? (
                <FastPlaylistCastPicker
                  onClose={() => setPlaylistCastOpen(false)}
                  targetSlotId={topSlots[0]?.id ?? "mon-a"}
                />
              ) : null}
            </div>

            {/* 2. GO LIVE */}
            {utilityBtn(Boolean(publishedRoomId), "#FF4444", "GO LIVE", () => {
              void presentInstantGoLiveInPlace({
                role: role === "performer" ? "PERFORMER" : "FAN",
                preferredExperience: "live",
                roomId: hubLiveRoomId ?? undefined,
                publishSession: true,
              });
            }, {
              testId: "tmi-cast-golive-btn",
              title: "Go Live / broadcast to stage",
              icon: "🔴",
            })}

            {/* 3. MEMORY */}
            {utilityBtn(false, "#AA2DFF", "MEMORY", () => {
              useCompactQuickPanelStore.getState().togglePanel("memory-wall");
            }, {
              testId: "tmi-cast-memory-btn",
              title: "Cast photos & memories to room display",
              icon: "🧠",
            })}

            {/* 4. YOPHO */}
            {utilityBtn(false, "#FF2DAA", "YOPHO", () => {
              document.documentElement.setAttribute("data-yopho-btn-click", "1");
              useCompactQuickPanelStore.getState().openPanel("yopho", "bottom-left");
              if (onOpenYopho) {
                onOpenYopho();
                return;
              }
              presentCanonicalWorkspace("yopho", "DRAWER");
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("tmi:hub-cast-yopho"));
                (
                  window as Window & { __TMI_OPEN_YOPHO__?: () => void }
                ).__TMI_OPEN_YOPHO__?.();
              }
            }, {
              testId: "tmi-cast-yopho-btn",
              title: "Open YoPho living canvas (background-first Free tier)",
              icon: "📱",
            })}

            {/* 5. SHARE SCREEN */}
            <div style={{ position: "relative" }}>
              {utilityBtn(castPanelOpen || shareActive || isFullscreen, "#00FF88", "SHARE SCREEN", () => setCastPanelOpen((v) => !v), {
                testId: "tmi-cast-sharescreen-btn",
                title: "Share screen / window / tab",
                icon: "🖥️",
              })}
              {castPanelOpen ? (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: 0,
                    zIndex: 40,
                    width: 280,
                    background: "#0d1117",
                    border: "1px solid rgba(0,255,136,0.45)",
                    borderRadius: 10,
                    padding: 8,
                    boxShadow: "0 16px 40px rgba(0,0,0,0.65)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)" }}>
                    SCREEN CAST OPTIONS
                  </span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    <button
                      type="button"
                      data-testid="tmi-share-screen-cycle"
                      onClick={() => void cycleSharePress()}
                      title={shareActive ? "Cycle share sources" : "Share screen / window / tab"}
                      style={{
                        fontSize: 8,
                        fontWeight: 900,
                        padding: "8px 10px",
                        borderRadius: 6,
                        cursor: "pointer",
                        border: shareActive ? "1px solid #00FF88" : "1px solid rgba(0,255,136,0.45)",
                        background: shareActive ? "rgba(0,255,136,0.15)" : "transparent",
                        color: "#00FF88",
                        fontFamily: "inherit",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <span>⬡</span>
                      <span>{shareActive ? "CYCLE SHARE" : "START SHARE"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        toggleFullscreen();
                        setCastPanelOpen(false);
                      }}
                      title={isFullscreen ? "Exit big screen" : "Big screen — native fullscreen"}
                      style={{
                        fontSize: 8,
                        fontWeight: 900,
                        padding: "8px 10px",
                        borderRadius: 6,
                        cursor: "pointer",
                        border: isFullscreen ? "1px solid #00FFFF" : "1px solid rgba(0,255,255,0.4)",
                        background: isFullscreen ? "rgba(0,255,255,0.18)" : "transparent",
                        color: "#00FFFF",
                        fontFamily: "inherit",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <span>⛶</span>
                      <span>{isFullscreen ? "EXIT FULL" : "FULLSCREEN"}</span>
                    </button>
                  </div>
                  {shareActive ? (
                    <button
                      type="button"
                      onClick={stopScreenShare}
                      style={{
                        fontSize: 8,
                        fontWeight: 900,
                        padding: "5px 8px",
                        borderRadius: 5,
                        border: "1px solid rgba(255,68,68,0.5)",
                        background: "rgba(255,68,68,0.12)",
                        color: "#FF6B6B",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      STOP SHARE
                    </button>
                  ) : null}
                  {shareError ? (
                    <ScreenShareErrorBanner
                      code={shareError}
                      onDismiss={clearShareError}
                      onRetry={() => void cycleSharePress()}
                    />
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setCastPanelOpen(false)}
                    style={{
                      marginTop: 2,
                      padding: "4px 8px",
                      borderRadius: 6,
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "transparent",
                      color: "rgba(255,255,255,0.55)",
                      fontSize: 8,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    CLOSE
                  </button>
                </div>
              ) : null}
            </div>

            {/* 6. SPONSOR */}
            {utilityBtn(sponsorPanelOpen || Boolean(activeSponsorOverlay), "#FFD700", "SPONSOR", () => setSponsorPanelOpen((v) => !v), {
              testId: "tmi-cast-sponsor-btn",
              title: "Cast sponsor overlay or creative to audience",
              icon: "🏷️",
            })}
          </div>
        </div>

        {/* QUICK GROUP */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.15em", color: "#00FFFF" }}>
            QUICK
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4 }}>
            {/* AVATAR QUICK PANEL */}
            <div style={{ position: "relative" }}>
              {utilityBtn(avatarQuickOpen, "#00FFFF", "AVATAR", () => setAvatarQuickOpen((v) => !v), {
                testId: "tmi-quick-avatar-btn",
                title: "Quick avatar customizer & loadouts",
                icon: "👤",
              })}
              {avatarQuickOpen ? (
                <AvatarQuickChangeDrawer
                  onClose={() => setAvatarQuickOpen(false)}
                />
              ) : null}
            </div>

            {/* FAN ID / PERFORMER ID */}
            <div style={{ position: "relative" }}>
              {utilityBtn(
                identityOpen,
                role === "performer" ? "#FFD700" : "#00FF88",
                role === "performer" ? "PERFORMER ID" : "FAN ID",
                () => setIdentityOpen((v) => !v),
                {
                  testId: role === "performer" ? "tmi-artist-id-rail" : "tmi-fan-id-rail",
                  title: role === "performer" ? "Performer ID / QR credentials" : "Fan ID / QR card",
                  icon: "🪪",
                },
              )}
              {identityOpen ? (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: 0,
                    zIndex: 30,
                    width: 280,
                    padding: 10,
                    borderRadius: 10,
                    background: "rgba(5,5,16,0.96)",
                    border: `1px solid ${role === "performer" ? "rgba(255,215,0,0.45)" : "rgba(0,255,136,0.45)"}`,
                    boxShadow: "0 16px 40px rgba(0,0,0,0.65)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <ArtistIdShareStrip
                    userId={userId ?? "local"}
                    displayName={displayName ?? (role === "performer" ? "Performer" : "Fan")}
                    role={role}
                  />
                  <button
                    type="button"
                    onClick={() => setIdentityOpen(false)}
                    style={{
                      marginTop: 8,
                      width: "100%",
                      fontSize: 8,
                      fontWeight: 900,
                      padding: "6px 8px",
                      borderRadius: 6,
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "transparent",
                      color: "rgba(255,255,255,0.65)",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    CLOSE
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* EXPLORE GROUP */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.15em", color: "#FFD700" }}>
            EXPLORE
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4 }}>
            {/* 1. SNIPS */}
            {utilityBtn(exploreMatrixOpen && exploreInitialColumn === "SNIPS", "#FFD700", "SNIPS", () => {
              setExploreInitialColumn("SNIPS");
              setExploreMatrixOpen(true);
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("tmi:open-explore-matrix", { detail: { column: "SNIPS" } }));
              }
            }, {
              testId: "tmi-explore-snips-btn",
              title: "Explore short reels & live clips",
              icon: "🎬",
            })}

            {/* 2. VIDEO SHUFFLE */}
            {utilityBtn(exploreMatrixOpen && exploreInitialColumn === "VIDEO_SHUFFLE", "#AA2DFF", "VIDEO SHUFFLE", () => {
              setExploreInitialColumn("VIDEO_SHUFFLE");
              setExploreMatrixOpen(true);
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("tmi:open-explore-matrix", { detail: { column: "VIDEO_SHUFFLE" } }));
              }
            }, {
              testId: "tmi-explore-videoshuffle-btn",
              title: "Explore full music videos & performances",
              icon: "🎥",
            })}

            {/* 3. PUBLIC PROFILES */}
            {utilityBtn(exploreMatrixOpen && exploreInitialColumn === "PUBLIC_PROFILES", "#00FF88", "PUBLIC PROFILES", () => {
              setExploreInitialColumn("PUBLIC_PROFILES");
              setExploreMatrixOpen(true);
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("tmi:open-explore-matrix", { detail: { column: "PUBLIC_PROFILES" } }));
              }
            }, {
              testId: "tmi-explore-profiles-btn",
              title: "Explore creators & fan public profiles",
              icon: "👥",
            })}
          </div>
        </div>

        {/* VENUE & LOBBIES */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginLeft: "auto" }}>
          <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)" }}>
            VENUE & LOBBIES
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {utilityBtn(miniLobbyWallOpen, "#FF2DAA", "LOBBY WALL", () => {
              setMiniLobbyWallOpen((v) => !v);
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("tmi:toggle-mini-lobby-wall"));
              }
            }, {
              testId: "tmi-lobby-wall-trigger",
              title: "Open phone-sized Live Lobby Wall",
              icon: "🏛️",
            })}
            <VenueToolsToggleButton
              role={role === "performer" ? "performer" : "fan"}
              accent={role === "performer" ? "#AA2DFF" : "#00FF88"}
              corner="bottom-right"
              roomId={hubLiveRoomId ?? undefined}
              testId="tmi-venue-tools-media-stack"
              policyContext={{
                isLive: Boolean(publishedRoomId),
                isGoLiveContext: Boolean(hubInPlaceRoomId),
              }}
            />
          </div>
        </div>
      </div>

      {/* 3-Bus Audio Mixer Strip */}
      <CompactAudioMixer />
    </div>
  );

  return (
    <div
      ref={containerRef}
      data-command-center-media-stack
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

      {/* Media-player live authority — Fan + Performer (Marcel product law) */}
      <div
        data-media-player-live-bezel="1"
        style={{
          flexShrink: 0,
          marginBottom: 8,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          gap: 10,
        }}
      >
        <MediaPlayerGoLiveControl
          role={role === "performer" ? "performer" : "fan"}
          compact={compactHubLayout}
        />
        {role === "performer" ? (
          <div style={{ flex: 1, minWidth: 160 }}>
            <LiveDistributionBezel userId={userId} />
          </div>
        ) : null}
      </div>

      <LiveLobbyMosaicScrollRail
        role={role === "performer" ? "performer" : "fan"}
        viewerUserId={userId}
        accentColor={role === "performer" ? "#FFD700" : "#00FF88"}
      />

      {/* Top Command Strip & 3-Bus Mixer */}
      {toolbar}

      <div style={{ position: "relative", flex: naturalHeight ? undefined : 1, minHeight: 0 }}>
      <GoLiveBootstrapOverlay
        phase={bootPhase}
        errorCode={bootErrorCode}
        errorMessage={bootErrorMessage}
        onRetry={() => {
          void presentInstantGoLiveInPlace({
            role: role === "performer" ? "PERFORMER" : "FAN",
            preferredExperience: "live",
            roomId: hubLiveRoomId ?? undefined,
            publishSession: true,
          });
        }}
      />
      <CanonicalDualMonitorStack
        variant={bezelVariant}
        seriesLabel={seriesLabel}
        minMonitorCount={monitorLayoutMode === "primary" ? 1 : 2}
        enableMediaRuntime
        monitors={[
          {
            id: topSlots[0]!.id,
            label: surfaceLayout.topSurface === "screen_share" ? "SCREEN SHARE" : "MONITOR A",
            children:
              surfaceLayout.topSurface === "screen_share" && screenStream ? (
                <MonitorScreenShareVideo
                  stream={screenStream}
                  onStop={stopScreenShare}
                  label={surfaceLayout.shareButtonLabel}
                  audioOwned={Boolean(screenShareAudioSourceId)}
                  transitionKey={surfaceLayout.activeShareSourceId ?? "share"}
                />
              ) : screenStream && shareSlotTargetsCell(shareSlot, 0, -1) ? (
                <MonitorScreenShareVideo
                  stream={screenStream}
                  onStop={stopScreenShare}
                  label="MON A"
                  audioOwned={Boolean(screenShareAudioSourceId)}
                  transitionKey={surfaceLayout.activeShareSourceId ?? "share"}
                />
              ) : (
                <MonitorChrome
                  slot={topSlots[0]!}
                  onSwap={handleSwap}
                  overlayTarget={DEFAULT_MONITOR_A}
                  sponsorOverlay={activeSponsorOverlay}
                  hubLiveRoomId={hubLiveRoomId}
                  hubLiveMonitor="A"
                  goLiveBootActive={goLiveBootActive}
                  displayName={displayName}
                />
              ),
            cells: topSlots.map((slot, ci) =>
              screenStream &&
              surfaceLayout.topSurface !== "screen_share" &&
              shareSlotTargetsCell(shareSlot, 0, ci) ? (
                <MonitorScreenShareVideo
                  key={slot.id}
                  stream={screenStream}
                  onStop={stopScreenShare}
                  label={`A${ci + 1}`}
                  audioOwned={Boolean(screenShareAudioSourceId)}
                />
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
            label:
              surfaceLayout.bottomSurface === "participant_grid"
                ? "PARTICIPANTS"
                : "MONITOR B",
            children:
              surfaceLayout.bottomSurface === "participant_grid" ? (
                <ParticipantSurfaceGrid
                  layout={surfaceLayout.participantLayout}
                  tiles={participantTiles}
                  overflowLabel={surfaceLayout.overflow.fallbackLabel}
                />
              ) : screenStream && shareSlotTargetsCell(shareSlot, 1, -1) ? (
                <MonitorScreenShareVideo
                  stream={screenStream}
                  onStop={stopScreenShare}
                  label="MON B"
                  audioOwned={false}
                />
              ) : (
                <MonitorChrome
                  slot={bottomSlots[0]!}
                  onSwap={handleSwap}
                  overlayTarget={DEFAULT_MONITOR_B}
                  hubLiveRoomId={hubLiveRoomId}
                  hubLiveMonitor="B"
                  goLiveBootActive={goLiveBootActive}
                />
              ),
            cells:
              surfaceLayout.bottomSurface === "participant_grid"
                ? participantTiles.slice(0, 8).map((tile) => (
                    <div key={tile.id} style={{ position: "absolute", inset: 0 }}>
                      {tile.children}
                    </div>
                  ))
                : bottomSlots.map((slot, ci) =>
                    screenStream && shareSlotTargetsCell(shareSlot, 1, ci) ? (
                      <MonitorScreenShareVideo
                        key={slot.id}
                        stream={screenStream}
                        onStop={stopScreenShare}
                        label={`B${ci + 1}`}
                        audioOwned={false}
                      />
                    ) : (
                      <MonitorChrome key={slot.id} slot={slot} cellIndex={ci} />
                    ),
                  ),
          }]
            : []),
        ]}
      />
      </div>

      {footer ? <div style={{ flexShrink: 0, marginTop: 8 }}>{footer}</div> : null}

      {/* Overlays / Runtimes (Root-Level Mounting) */}
      {exploreMatrixOpen && (
        <ExploreMatrixDiscoveryHost
          initialColumn={exploreInitialColumn}
          onClose={() => setExploreMatrixOpen(false)}
        />
      )}

      {miniLobbyWallOpen && (
        <MiniLiveLobbyWallRuntime
          role={role === "performer" ? "performer" : "fan"}
          isOpen={miniLobbyWallOpen}
          onClose={() => setMiniLobbyWallOpen(false)}
        />
      )}
    </div>
  );
}
