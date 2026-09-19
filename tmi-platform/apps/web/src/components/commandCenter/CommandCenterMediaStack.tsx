"use client";

import { canBroadcastExternalDestinations } from "@/lib/broadcast/BroadcastCapabilityResolver";
import {
  openCanonicalWorkspaceQuick,
  presentCanonicalWorkspace,
} from "@/lib/workspace/universal/openCanonicalPresentation";
import { useWorkspacePresentationStore } from "@/lib/workspace/universal/WorkspacePresentationRuntime";
/**
 * Command Center media stack — dual identical 16:9 vertical stack (prototype) → Quad → Octo.
 * Dual geometry via CanonicalDualMonitorStack (shared with Observatory).
 * Non-destructive monitor swapping preserves WebRTC video streams without flickering.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CanonicalDualMonitorStack from "@/components/monitors/CanonicalDualMonitorStack";
import { resolveMinMonitorCount } from "@/lib/monitors/RoleMediaWorkspaceAuthority";
import IdleMonitorFallbackRuntime from "@/components/admin/overseer/IdleMonitorFallbackRuntime";
import InPlaceGoLiveMonitorLayer from "@/components/live/InPlaceGoLiveMonitorLayer";
import HubMonitorCameraPlayer from "@/components/live/HubMonitorCameraPlayer";
import HubMonitorRemoteFeedPlayer from "@/components/live/HubMonitorRemoteFeedPlayer";
import HubMonitorVenuePlayer from "@/components/live/HubMonitorVenuePlayer";
import LiveDistributionBezel from "@/components/broadcast/LiveDistributionBezel";
import PerformanceRailControls from "@/components/commandCenter/PerformanceRailControls";
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
import { useCanonicalMediaPlayerRuntime, type FrameId } from "@/lib/media/canonicalMediaPlayerRuntime";
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
import ExploreMatrixDiscoveryHost, { type ExploreColumnType } from "@/components/explore/ExploreMatrixDiscoveryHost";
import LiveLobbyWallHost from "@/components/live/LiveLobbyWallHost";
import type { LobbyRoom } from "@/components/live/LiveLobbyWallGrid";
import { LobbyEntryFlow, type UniversalRoom } from "@/components/room/UniversalLobbyEntry";
import { useCompactQuickPanelStore } from "@/lib/hud/compactQuickPanelStore";
import { resolveHubMonitorFeed } from "@/lib/monitors/HubMonitorFeedResolver";
import { createPortal } from "react-dom";

function lobbyRoomToUniversal(room: LobbyRoom): UniversalRoom {
  return {
    id: room.id,
    title: room.name,
    hostName: room.performerName,
    genre: room.genre,
    viewers: room.viewerCount ?? 0,
    status: room.status === "live" ? "live" : "starting-soon",
    access: "free",
    accentColor: "#00FFFF",
    roomRoute: room.href?.trim() || `/live/rooms/${encodeURIComponent(room.id)}`,
    venueIndex: 0,
    thumbnailUrl: room.previewUrl ?? undefined,
  };
}

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
  /**
   * Optional role for RoleMediaWorkspaceAuthority.
   * Business roles (advertiser/sponsor/promoter/band/venue) force 1×16:9 portal.
   * When set, overrides monitorLayoutMode for minMonitorCount.
   */
  mediaWorkspaceRole?: string;
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
  /** Shared desktop Companion Dock entry; monitor runtime stays mounted. */
  onOpenLivingOs?: (context: { playerId: string; role: "fan" | "performer" }) => void;
  /** Canonical Venue Tools doorway re-presented by the shared Companion Dock. */
  onOpenVenueTools?: (context: { roomId?: string; isLoungeHost: boolean; readOnly: boolean }) => void;
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
  routedRoomId,
}: {
  slot: CommandCenterMediaSlot;
  sponsorOverlay?: ActiveSponsorOverlay | null;
  hubLiveRoomId?: string | null;
  hubLiveMonitor?: "A" | "B" | null;
  cellIndex?: number;
  goLiveBootActive?: boolean;
  displayName?: string | null;
  watchingCount?: number;
  /** Lobby Wall SEND TO override — exact room on this monitor without unmounting the other. */
  routedRoomId?: string | null;
}) {
  const videoSrc = slot.videoUrl?.trim() || "";
  const [videoFailed, setVideoFailed] = useState(false);
  const frameId = hubLiveMonitor === "B" ? "b" : hubLiveMonitor === "A" ? "a" : null;
  const runtimeSource = useCanonicalMediaPlayerRuntime((s) =>
    frameId ? (s.frames[frameId]?.source ?? null) : null,
  );
  const effectiveRoomId = routedRoomId?.trim() || hubLiveRoomId || null;

  useEffect(() => {
    setVideoFailed(false);
  }, [videoSrc]);

  // Per-monitor FEED assignment wins — A and B stay independently routable.
  if (frameId && runtimeSource === "SELF_CAMERA") {
    return (
      <div style={{ position: "relative", flex: 1, width: "100%", height: "100%", minHeight: 0, overflow: "hidden" }}>
        {sponsorOverlay ? <SponsorOverlayBanner overlay={sponsorOverlay} /> : null}
        <HubMonitorCameraPlayer displayName={displayName} watchingCount={watchingCount ?? 0} />
      </div>
    );
  }

  // Todd P0: PERFORMER_FEED must bind remote camera — never VenuePlayer (LIVE != video).
  if (frameId && runtimeSource === "PERFORMER_FEED") {
    if (effectiveRoomId) {
      return (
        <div style={{ position: "relative", flex: 1, width: "100%", height: "100%", minHeight: 0, overflow: "hidden" }}>
          {sponsorOverlay ? <SponsorOverlayBanner overlay={sponsorOverlay} /> : null}
          <HubMonitorRemoteFeedPlayer roomId={effectiveRoomId} />
        </div>
      );
    }
    return (
      <div
        style={{
          position: "relative",
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#030318",
          color: "rgba(255,255,255,0.45)",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.1em",
        }}
      >
        WAITING FOR PERFORMER CAMERA
      </div>
    );
  }

  if (frameId && (runtimeSource === "AUDIENCE_VIEW" || runtimeSource === "VENUE_VIEW")) {
    if (effectiveRoomId) {
      return (
        <div style={{ position: "relative", flex: 1, width: "100%", height: "100%", minHeight: 0, overflow: "hidden" }}>
          {sponsorOverlay ? <SponsorOverlayBanner overlay={sponsorOverlay} /> : null}
          <HubMonitorVenuePlayer roomId={effectiveRoomId} />
        </div>
      );
    }
    return (
      <div
        style={{
          position: "relative",
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#030318",
          color: "rgba(255,255,255,0.45)",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.1em",
        }}
      >
        NO LIVE ROOM FEED
      </div>
    );
  }

  if (frameId && runtimeSource === "VIDEO_PLAYBACK") {
    if (slot.kind === "playlist" && slot.playlistCast) {
      return (
        <div style={{ position: "relative", flex: 1, width: "100%", height: "100%", minHeight: 0, overflow: "hidden" }}>
          {sponsorOverlay ? <SponsorOverlayBanner overlay={sponsorOverlay} /> : null}
          <PlaylistCastBody cast={slot.playlistCast} />
        </div>
      );
    }
    if (videoSrc && !videoFailed) {
      return (
        <div style={{ position: "relative", flex: 1, width: "100%", height: "100%", minHeight: 0, overflow: "hidden" }}>
          {sponsorOverlay ? <SponsorOverlayBanner overlay={sponsorOverlay} /> : null}
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
        </div>
      );
    }
    return (
      <div
        style={{
          position: "relative",
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#030318",
          color: "rgba(255,255,255,0.45)",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.1em",
        }}
      >
        NO MEDIA LOADED
      </div>
    );
  }

  if (frameId && runtimeSource === "SCREEN_SHARE") {
    return (
      <div
        style={{
          position: "relative",
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 6,
          background: "#030318",
          color: "rgba(0,255,136,0.7)",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.1em",
        }}
      >
        <span>🖥️ SCREEN SHARE ASSIGNED</span>
        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>
          Use CAST · SHARE SCREEN to start capture
        </span>
      </div>
    );
  }

  const feed = resolveHubMonitorFeed({
    slot,
    monitorTarget: hubLiveMonitor ?? "A",
    hubLiveRoomId: hubLiveRoomId ?? null,
    goLiveBootActive: Boolean(goLiveBootActive),
  });

  if (feed.kind === "live_camera" && hubLiveMonitor === "A") {
    return (
      <div style={{ position: "relative", flex: 1, width: "100%", height: "100%", minHeight: 0, overflow: "hidden" }}>
        {sponsorOverlay ? <SponsorOverlayBanner overlay={sponsorOverlay} /> : null}
        <HubMonitorCameraPlayer displayName={displayName} watchingCount={watchingCount ?? 0} />
      </div>
    );
  }

  if (feed.kind === "live_venue" && hubLiveMonitor === "B" && hubLiveRoomId) {
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
  routedRoomId,
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
  routedRoomId?: string | null;
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
      routedRoomId={routedRoomId}
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
  mediaWorkspaceRole,
  continuityContext,
  role = "fan",
  userId = null,
  displayName = null,
  onOpenYopho,
  onOpenLivingOs,
  onOpenVenueTools,
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
  const [identityOpen, setIdentityOpen] = useState(false);
  const [controlBedCollapsed, setControlBedCollapsed] = useState(false);
  /**
   * RECORD honesty (P0): no certified session/cloud recording consumer is wired to
   * the hub top cluster. Live-fabric startRecording is metadata-only today;
   * prior orphan toggle event had zero listeners. Do not stub browser MediaRecorder here.
   */
  const RECORD_UNAVAILABLE_REASON =
    "Session recording runtime not certified — RECORD unavailable until Program/ISO recording is wired";

  const onShareClick = useCallback(async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: "The Musician's Index — Live Hub",
          url,
        });
        return;
      } catch {
        /* user dismissed */
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        /* fallback */
      }
    }
  }, []);
  const [exploreMatrixOpen, setExploreMatrixOpen] = useState(false);
  const [exploreInitialColumn, setExploreInitialColumn] = useState<ExploreColumnType>("SNIPS");
  /** Desktop detach float only — same LiveLobbyWall authority as lower DRAWER (not Mini list). */
  const [detachedLobbyWallOpen, setDetachedLobbyWallOpen] = useState(false);
  /** Per-monitor Lobby Wall SEND TO room binding (exact roomId; does not change the other monitor). */
  const [monitorRoomOverrides, setMonitorRoomOverrides] = useState<Partial<Record<FrameId, string>>>({});
  const [lobbyPanelFocusRoom, setLobbyPanelFocusRoom] = useState<LobbyRoom | null>(null);
  const [lobbyPanelJoinRoom, setLobbyPanelJoinRoom] = useState<UniversalRoom | null>(null);
  const [activeSponsorOverlay, setActiveSponsorOverlay] = useState<ActiveSponsorOverlay | null>(null);
  const castControlsRef = useRef<HTMLDivElement | null>(null);
  const drawerWorkspace = useWorkspacePresentationStore((s) => s.drawerWorkspace);
  const isDrawerExpanded = useWorkspacePresentationStore((s) => s.isDrawerExpanded);

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
    const handler = () => {
      const { drawerWorkspace, isDrawerExpanded, closeSurface } =
        useWorkspacePresentationStore.getState();
      if (drawerWorkspace === "live-destinations" && isDrawerExpanded) {
        closeSurface("DRAWER");
        setCastPanelOpen(false);
      } else {
        presentCanonicalWorkspace("live-destinations", "DRAWER");
        setCastPanelOpen(true);
        castControlsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    };
    window.addEventListener("tmi:cast-panel-toggle", handler);
    return () => window.removeEventListener("tmi:cast-panel-toggle", handler);
  }, []);

  useEffect(() => {
    if (!castPanelOpen) return;
    const t = window.setTimeout(() => setCastPanelOpen(false), 2800);
    return () => window.clearTimeout(t);
  }, [castPanelOpen]);

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
    // Legacy event: desktop → lobby DRAWER; keep monitors mounted.
    const onToggleLobbyWall = () => {
      const { drawerWorkspace, isDrawerExpanded, closeSurface } =
        useWorkspacePresentationStore.getState();
      if (
        (drawerWorkspace === "lobby" || drawerWorkspace === "live-destinations") &&
        isDrawerExpanded
      ) {
        closeSurface("DRAWER");
      } else {
        presentCanonicalWorkspace("lobby", "DRAWER");
      }
    };
    const onDetachLobbyWall = () => {
      setDetachedLobbyWallOpen(true);
      useWorkspacePresentationStore.getState().closeSurface("DRAWER");
    };
    window.addEventListener("tmi:toggle-mini-lobby-wall", onToggleLobbyWall);
    window.addEventListener("tmi:detach-lobby-wall", onDetachLobbyWall);
    return () => {
      window.removeEventListener("tmi:toggle-mini-lobby-wall", onToggleLobbyWall);
      window.removeEventListener("tmi:detach-lobby-wall", onDetachLobbyWall);
    };
  }, []);

  // LOBBY WALL Command Control → compact dimensional mosaic panel (does NOT replace monitors).
  const toggleLobbyWallFromButton = useCallback(() => {
    setDetachedLobbyWallOpen((open) => {
      if (open) {
        setLobbyPanelFocusRoom(null);
        return false;
      }
      useWorkspacePresentationStore.getState().closeSurface("DRAWER");
      return true;
    });
  }, []);

  const sendLobbyRoomToMonitor = useCallback((roomId: string, frameId: FrameId) => {
    const rid = roomId.trim();
    if (!rid) return;
    setMonitorRoomOverrides((prev) => ({ ...prev, [frameId]: rid }));
    useCanonicalMediaPlayerRuntime.getState().assignSource(frameId, "AUDIENCE_VIEW");
  }, []);

  useEffect(() => {
    const onLobbySendTo = (e: Event) => {
      const detail = (e as CustomEvent<{ roomId?: string; frameId?: FrameId }>).detail;
      const roomId = detail?.roomId?.trim();
      const frameId = detail?.frameId;
      if (!roomId || !frameId) return;
      sendLobbyRoomToMonitor(roomId, frameId);
    };
    window.addEventListener("tmi:lobby-send-to-monitor", onLobbySendTo);
    return () => window.removeEventListener("tmi:lobby-send-to-monitor", onLobbySendTo);
  }, [sendLobbyRoomToMonitor]);

  const handleDetachMonitorB = useCallback(async () => {
    const monBVideo = document.querySelector('[data-monitor-chrome-id="mon-b"] video') as HTMLVideoElement | null;
    if (monBVideo && document.pictureInPictureEnabled && !document.pictureInPictureElement) {
      try {
        await monBVideo.requestPictureInPicture();
        return;
      } catch {
        /* fallback */
      }
    }
    if (typeof window !== "undefined") {
      window.open('/live-stage', 'TMI_MONITOR_B', 'width=840,height=520,menubar=no,toolbar=no,location=no,status=no');
    }
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
  const captureSourceForReturn = useCanonicalMediaPlayerRuntime((s) => s.captureSourceForReturn);
  const returnToPreviousSource = useCanonicalMediaPlayerRuntime((s) => s.returnToPreviousSource);
  const screenShareAudioSourceId = useCanonicalMediaPlayerRuntime((s) => s.screenShareAudioSourceId);
  const priorPresentationRef = useRef<PriorMediaPresentationSnapshot | null>(null);
  const priorPrimaryAudioRef = useRef<"a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | null>(null);
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
      // Restore exact prior monitor source — never blind-reset to a default feed
      const restored = returnToPreviousSource("a");
      if (!restored) {
        assignSource("a", role === "performer" ? "SELF_CAMERA" : "PERFORMER_FEED");
      }
      const priorAudio = priorPrimaryAudioRef.current;
      priorPrimaryAudioRef.current = null;
      if (priorAudio) setPrimaryAudio(priorAudio);
      else setPrimaryAudio("b");
      priorPresentationRef.current = null;
    },
    onScreenAudioOwnership: ({ sourceId, hasAudio }) => {
      // Single audio owner — replace in place, never stack a second registration
      setScreenShareAudioOwner(sourceId);
      if (sourceId && hasAudio) {
        const runtime = useCanonicalMediaPlayerRuntime.getState();
        if (runtime.frames.a?.source !== "SCREEN_SHARE") {
          priorPrimaryAudioRef.current = runtime.primaryAudioFrame;
          captureSourceForReturn("a");
        }
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

  // Capture prior presentation once when share becomes active (layout director)
  useEffect(() => {
    if (shareActive && !priorPresentationRef.current) {
      priorPresentationRef.current = {
        topSurface: "prior_media",
        bottomSurface: monitorLayoutMode === "dual" ? "audience" : "prior_media",
        fullscreenState: "none",
      };
    }
    // Do not clear here — onShareStopped owns restore + clear so we don't
    // race ahead of returnToPreviousSource.
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
            hubLiveMonitor="B"
            goLiveBootActive={goLiveBootActive}
            displayName={displayName}
            routedRoomId={monitorRoomOverrides.b ?? null}
          />
        ),
      }),
    );
    return tiles;
  }, [orderedSlots, topSlots, participantCount, hubLiveRoomId, goLiveBootActive, displayName, monitorRoomOverrides.b]);

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
    // Keep canonical media runtime frame sources in sync with visual slot order (no track tear).
    try {
      const { swapFrames } = useCanonicalMediaPlayerRuntime.getState();
      swapFrames("a", "b");
    } catch {
      /* runtime may be unmounted outside enableMediaRuntime */
    }
  };

  const utilityBtnStyle = (active: boolean, accent: string, disabled?: boolean): CSSProperties => ({
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: "0.1em",
    padding: "7px 12px",
    borderRadius: 6,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    border: active ? `1px solid ${accent}` : `1px solid ${accent}88`,
    background: active
      ? `linear-gradient(180deg, ${accent}66 0%, ${accent}22 100%)`
      : "linear-gradient(180deg, #4a5568 0%, #1c2230 55%, #12161f 100%)",
    color: active ? "#fff" : accent,
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    gap: 5,
    whiteSpace: "nowrap",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.45)",
    textTransform: "uppercase",
  });

  const utilityBtn = (
    active: boolean,
    accent: string,
    label: string,
    onClick: () => void,
    opts?: { testId?: string; title?: string; icon?: string; disabled?: boolean },
  ) => (
    <button
      type="button"
      data-testid={opts?.testId}
      onClick={opts?.disabled ? undefined : onClick}
      disabled={opts?.disabled}
      title={opts?.title ?? label}
      style={utilityBtnStyle(active, accent, opts?.disabled)}
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

  const sectionLabel: CSSProperties = {
    fontSize: 8,
    fontWeight: 900,
    letterSpacing: "0.12em",
    color: "rgba(255,255,255,0.38)",
    marginBottom: 2,
    width: "100%",
  };

  const toolbar = (
    <div
      data-tmi-polished-control-bed="1"
      style={{
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: controlBedCollapsed ? "4px 12px" : "8px 12px",
        background: "linear-gradient(180deg, #323947 0%, #1c2230 50%, #262e3d 100%)",
        border: "1px solid rgba(190, 210, 235, 0.35)",
        borderRadius: 10,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22), 0 6px 20px rgba(0,0,0,0.6)",
        marginBottom: 8,
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Upper Chassis Title & Specular Strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: controlBedCollapsed ? "none" : "1px solid rgba(255,255,255,0.08)",
          paddingBottom: controlBedCollapsed ? 0 : 4,
          marginBottom: controlBedCollapsed ? 0 : 4,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.14em",
              color: "#00FFFF",
              textShadow: "0 0 8px rgba(0,255,255,0.4)",
            }}
          >
            COMMAND BED
          </span>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>
            COMMAND · CAST · POWER MIX
          </span>
          {hubLiveRoomId && role === "performer" ? (
            <VenueToolsToggleButton
              roomId={hubLiveRoomId}
              role="performer"
              policyContext={{ isGoLiveContext: Boolean(hubLiveRoomId), isLive: Boolean(publishedRoomId) }}
              testId="tmi-venue-tools-media-stack"
              onOpen={onOpenVenueTools}
            />
          ) : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 8, fontWeight: 800, color: publishedRoomId ? "#00FF88" : "rgba(255,255,255,0.4)" }}>
            {publishedRoomId ? "● BROADCAST ACTIVE" : "○ READY"}
          </span>
          <button
            type="button"
            onClick={() => setControlBedCollapsed((v) => !v)}
            title={controlBedCollapsed ? "Expand Command & Cast Controls" : "Collapse Controls into Performance Mirror Mode"}
            style={{
              background: controlBedCollapsed ? "rgba(0,255,255,0.18)" : "rgba(255,255,255,0.06)",
              border: controlBedCollapsed ? "1px solid #00FFFF" : "1px solid rgba(255,255,255,0.18)",
              borderRadius: 4,
              color: controlBedCollapsed ? "#00FFFF" : "rgba(255,255,255,0.7)",
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: "0.06em",
              padding: "2px 8px",
              cursor: "pointer",
              fontFamily: "inherit",
              textTransform: "uppercase",
            }}
          >
            {controlBedCollapsed ? "▼ EXPAND BED" : "▲ HIDE (MIRROR)"}
          </button>
        </div>
      </div>

      {/* Main Split Control Deck: COMMAND | CAST | MIX / POWER MIX — never on bezel */}
      {!controlBedCollapsed ? (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {/* ── COMMAND CONTROLS (left) ── */}
          <div
            data-tmi-command-controls-group="1"
            data-tmi-master-controls-group="1"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexWrap: "wrap",
              flex: "1 1 280px",
            }}
          >
            <span
              style={{
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: "0.14em",
                color: "#FF2DAA",
                textTransform: "uppercase",
                marginRight: 2,
              }}
            >
              COMMAND CONTROLS:
            </span>

            {utilityBtn(Boolean(publishedRoomId), "#FF2DAA", publishedRoomId ? "● LIVE" : "GO LIVE", () => {
              void presentInstantGoLiveInPlace({
                role: role === "performer" ? "PERFORMER" : "FAN",
                preferredExperience: "live",
                roomId: hubLiveRoomId ?? undefined,
                publishSession: true,
              });
            }, {
              testId: "tmi-top-cluster-golive",
              title: "Go Live / broadcast to stage — not Cast, not bezel",
              icon: "🔴",
            })}

            <button
              type="button"
              data-testid="tmi-top-cluster-record"
              data-record-state="unavailable"
              disabled
              title={RECORD_UNAVAILABLE_REASON}
              style={utilityBtnStyle(false, "rgba(255,255,255,0.4)", true)}
            >
              <span style={{ pointerEvents: "none" }}>⏺</span>
              <span style={{ pointerEvents: "none" }}>RECORD</span>
            </button>

            {utilityBtn(
              identityOpen,
              role === "performer" ? "#FFD700" : "#00FF88",
              "USER ID",
              () => setIdentityOpen((v) => !v),
              {
                testId: "tmi-top-cluster-user-id",
                title: role === "performer" ? "Present Performer ID & Scannable QR Code" : "Present TMI User ID & Scannable QR Code",
                icon: "🪪",
              },
            )}

            {utilityBtn(
              detachedLobbyWallOpen,
              "#00FFFF",
              "LOBBY WALL",
              () => toggleLobbyWallFromButton(),
              {
                testId: "tmi-command-lobby-wall",
                title: "Open Live Lobby Wall mosaic panel — does not replace monitors",
                icon: "🧱",
              },
            )}

            <PerformanceRailControls
              role={role === "performer" ? "performer" : "fan"}
              userId={userId}
              displayName={displayName}
            />
          </div>

          <div
            data-tmi-center-split-divider="1"
            style={{
              width: 2,
              minHeight: 28,
              alignSelf: "stretch",
              background: "linear-gradient(180deg, rgba(0,255,255,0.2) 0%, #00FFFF 50%, rgba(0,255,255,0.2) 100%)",
              boxShadow: "0 0 8px rgba(0,255,255,0.6)",
              margin: "0 4px",
              flexShrink: 0,
            }}
          />

          {/* ── CAST CONTROLS (right of command) ── */}
          <div
            ref={castControlsRef}
            data-tmi-cast-controls-group="1"
            data-cast-section-highlight={castPanelOpen ? "1" : "0"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexWrap: "wrap",
              flex: "1 1 220px",
              padding: castPanelOpen ? "4px 8px" : undefined,
              borderRadius: castPanelOpen ? 8 : undefined,
              border: castPanelOpen ? "1px solid rgba(0,255,255,0.55)" : undefined,
              boxShadow: castPanelOpen ? "0 0 16px rgba(0,255,255,0.35)" : undefined,
              background: castPanelOpen ? "rgba(0,255,255,0.08)" : undefined,
              transition: "box-shadow 0.2s ease, background 0.2s ease",
            }}
          >
            <span
              style={{
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: "0.14em",
                color: "#00FFFF",
                textTransform: "uppercase",
                marginRight: 2,
              }}
            >
              CAST CONTROLS:
            </span>

            {utilityBtn(
              drawerWorkspace === "live-destinations" && isDrawerExpanded,
              "#00FFFF",
              "OPEN CAST",
              () => {
                if (drawerWorkspace === "live-destinations" && isDrawerExpanded) {
                  useWorkspacePresentationStore.getState().closeSurface("DRAWER");
                } else {
                  presentCanonicalWorkspace("live-destinations", "DRAWER");
                }
              },
              {
                testId: "tmi-top-cluster-open-cast",
                title: "Open Cast workspace (destinations & share)",
                icon: "📡",
              },
            )}

            {utilityBtn(shareActive, "#00FF88", shareActive ? "SHARING" : "SHARE SCREEN", () => void cycleSharePress(), {
              testId: "tmi-top-cluster-sharescreen",
              title: "Screen share — Cast presentation, not external destination",
              icon: "🖥️",
            })}

            {role === "performer" &&
              utilityBtn(sponsorPanelOpen || Boolean(activeSponsorOverlay), "#FFD700", "SPONSOR", () => setSponsorPanelOpen((v) => !v), {
                testId: "tmi-top-cluster-sponsors",
                title: "Sponsor overlay — Cast presentation / brand cabinet",
                icon: "🏷️",
              })}

            {utilityBtn(false, "#00FFFF", "SHARE LINK", () => void onShareClick(), {
              testId: "tmi-top-cluster-share",
              title: "Share live room link or copy URL",
              icon: "🔗",
            })}
          </div>

          <div
            data-tmi-mix-split-divider="1"
            style={{
              width: 1,
              minHeight: 24,
              background: "rgba(255,255,255,0.15)",
              margin: "0 2px",
              flexShrink: 0,
            }}
          />

          {/* ── MIX / POWER MIX (adjacent to Cast) ── */}
          <div
            data-tmi-mix-controls-group="1"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginLeft: "auto",
            }}
          >
            <span
              style={{
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: "0.14em",
                color: "#FFD700",
                textTransform: "uppercase",
                marginRight: 2,
              }}
            >
              MIX:
            </span>
            <CompactAudioMixer />
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <div
      ref={containerRef}
      data-command-center-media-stack="1"
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

      {/* PHYSICAL STACK (locked):
          1) CONTROL BED — Command | Cast | Mix/Power Mix
          2) TAG-LIGHT STRIP — destination status only (not Command/Cast)
          3) BEZEL — channel 1–8 + per-monitor FEED
          4) MONITOR PICTURE
          LiveLobbyMosaicScrollRail must NEVER mount here (INLINE_MAIN_FLOW = FAIL). */}
      {toolbar}

      <div
        data-media-player-tag-lights="1"
        data-media-player-live-bezel="1"
        style={{
          flexShrink: 0,
          marginBottom: 8,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 10,
        }}
      >
        {canBroadcastExternalDestinations({ activeRole: role }) ? (
          <div style={{ flex: 1, minWidth: 160 }} data-tag-light-strip="1">
            <LiveDistributionBezel userId={userId} />
          </div>
        ) : (
          <div
            data-tag-light-strip="unavailable"
            style={{
              fontSize: 8,
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.35)",
              padding: "6px 10px",
            }}
          >
            TAG LIGHTS · NO EXTERNAL DESTINATIONS FOR THIS ROLE
          </div>
        )}
      </div>

      <div
        data-canonical-monitor-workspace="1"
        style={{
          position: "relative",
          flex: naturalHeight ? undefined : 1,
          minHeight: compactHubLayout ? 180 : 0,
          width: "100%",
        }}
      >
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
        availableModes={[1, 2, 3, 4, 5, 6, 7, 8]}
        livingOsRole={mediaWorkspaceRole ?? (role === "performer" ? "PERFORMER" : "FAN")}
        minMonitorCount={
          mediaWorkspaceRole
            ? resolveMinMonitorCount(mediaWorkspaceRole)
            : monitorLayoutMode === "primary"
              ? 1
              : 2
        }
        enableMediaRuntime
        onOpenLivingOs={({ playerId }) => onOpenLivingOs?.({ playerId, role })}
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
                  routedRoomId={monitorRoomOverrides.a ?? null}
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
                  routedRoomId={monitorRoomOverrides.b ?? null}
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

      {detachedLobbyWallOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            data-lobby-presentation="detached-float"
            data-tmi-spatial-panel="lobby-wall"
            data-testid="detached-lobby-wall"
            data-lobby-wall-command-panel="1"
            style={{
              position: "fixed",
              bottom: 20,
              right: 20,
              zIndex: 90,
              width: "min(760px, calc(100vw - 28px))",
              height: "min(640px, calc(100vh - 40px))",
              display: "flex",
              flexDirection: "column",
              background:
                "linear-gradient(165deg, rgba(18,22,40,0.98) 0%, rgba(6,8,18,0.99) 45%, rgba(4,5,14,1) 100%)",
              border: "1px solid rgba(0,255,255,0.5)",
              borderRadius: 16,
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.06) inset, 0 1px 0 rgba(255,255,255,0.18) inset, 0 22px 56px rgba(0,0,0,0.78), 0 0 36px rgba(0,255,255,0.22)",
              overflow: "hidden",
              transform: "perspective(1200px) translateZ(0)",
              transformStyle: "preserve-3d",
            }}
          >
            <div
              data-tmi-panel-housing="header"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "11px 14px",
                borderBottom: "1px solid rgba(0,255,255,0.22)",
                background: "linear-gradient(180deg, rgba(0,255,255,0.1), rgba(0,0,0,0.2))",
                flexShrink: 0,
                boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.45)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: "0.14em",
                    color: "#00FFFF",
                    textTransform: "uppercase",
                  }}
                >
                  Live Lobby Wall · Mosaic
                </span>
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.55)", fontWeight: 700 }}>
                  Scroll the wall · tap a room · Watch / Join / Send To — monitors stay mounted
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDetachedLobbyWallOpen(false);
                  setLobbyPanelFocusRoom(null);
                }}
                aria-label="Close lobby wall panel"
                data-testid="detached-lobby-wall-close"
                style={{
                  background: "linear-gradient(180deg, #3a4254, #151a24)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "#fff",
                  borderRadius: 7,
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 800,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 6px rgba(0,0,0,0.4)",
                }}
              >
                ✕
              </button>
            </div>
            <div
              data-tmi-panel-content-stage="1"
              data-lobby-mosaic-scroll="1"
              style={{
                flex: 1,
                minHeight: 0,
                overflow: "auto",
                padding: 12,
                WebkitOverflowScrolling: "touch",
              }}
            >
              <LiveLobbyWallHost
                variant="page"
                title="Live Lobby Wall"
                typeLabel="LIVE"
                accentColor="#00FFFF"
                viewerUserId={userId ?? null}
                viewerRole={role === "performer" ? "PERFORMER" : "FAN"}
                defaultCategory={role === "performer" ? "lives" : "fan_avatar_lobbies"}
                enableMobileRoam
                onRoomJoin={(room) => setLobbyPanelFocusRoom(room)}
              />
            </div>
            {lobbyPanelFocusRoom ? (
              <div
                data-lobby-wall-action-bar="1"
                style={{
                  flexShrink: 0,
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 12px",
                  borderTop: "1px solid rgba(0,255,255,0.25)",
                  background: "rgba(6,10,24,0.96)",
                  boxShadow: "0 -8px 24px rgba(0,0,0,0.45)",
                }}
              >
                <div style={{ flex: "1 1 140px", minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 900,
                      color: "#fff",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {lobbyPanelFocusRoom.name}
                  </div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
                    {lobbyPanelFocusRoom.id} · {lobbyPanelFocusRoom.type}
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="lobby-panel-watch"
                  onClick={() => {
                    const href = lobbyPanelFocusRoom.href?.trim();
                    if (href && typeof window !== "undefined") {
                      window.dispatchEvent(
                        new CustomEvent("tmi:lobby-watch-exact", {
                          detail: { roomId: lobbyPanelFocusRoom.id, href },
                        }),
                      );
                      // Keep workspace: route venue feed to Monitor A as WATCH default.
                      sendLobbyRoomToMonitor(lobbyPanelFocusRoom.id, "a");
                    }
                  }}
                  style={{
                    padding: "7px 12px",
                    borderRadius: 7,
                    border: "1px solid #00FFFF",
                    background: "rgba(0,255,255,0.12)",
                    color: "#00FFFF",
                    fontSize: 9,
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    cursor: "pointer",
                  }}
                >
                  WATCH
                </button>
                <button
                  type="button"
                  data-testid="lobby-panel-join"
                  onClick={() => {
                    setLobbyPanelJoinRoom(lobbyRoomToUniversal(lobbyPanelFocusRoom));
                  }}
                  style={{
                    padding: "7px 12px",
                    borderRadius: 7,
                    border: "1px solid #FF2DAA",
                    background: "linear-gradient(135deg, #FF2DAA55, #AA2DFF44)",
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    cursor: "pointer",
                  }}
                >
                  JOIN
                </button>
                {(["a", "b", "c", "d", "e", "f", "g", "h"] as FrameId[]).map((fid, idx) => (
                  <button
                    key={fid}
                    type="button"
                    data-testid={`lobby-panel-send-${fid}`}
                    onClick={() => sendLobbyRoomToMonitor(lobbyPanelFocusRoom.id, fid)}
                    style={{
                      padding: "6px 8px",
                      borderRadius: 6,
                      border:
                        monitorRoomOverrides[fid] === lobbyPanelFocusRoom.id
                          ? "1px solid #FFD700"
                          : "1px solid rgba(255,215,0,0.35)",
                      background:
                        monitorRoomOverrides[fid] === lobbyPanelFocusRoom.id
                          ? "rgba(255,215,0,0.22)"
                          : "rgba(0,0,0,0.35)",
                      color: "#FFD700",
                      fontSize: 8,
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                    title={`Send ${lobbyPanelFocusRoom.name} to Monitor ${idx + 1}`}
                  >
                    →{idx + 1}
                  </button>
                ))}
              </div>
            ) : null}
          </div>,
          document.body,
        )}

      {lobbyPanelJoinRoom ? (
        <LobbyEntryFlow
          room={lobbyPanelJoinRoom}
          instant
          onClose={() => setLobbyPanelJoinRoom(null)}
        />
      ) : null}

      {/* Expanded User ID / Stage QR Overlay (Preserves monitor session beneath) */}
      {identityOpen ? (
        <div
          data-tmi-user-id-stage-overlay="1"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(3, 5, 14, 0.88)",
            backdropFilter: "blur(14px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setIdentityOpen(false)}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #101626 0%, #060913 100%)",
              border: `2px solid ${role === "performer" ? "#FFD700" : "#00FFFF"}`,
              boxShadow: `0 0 50px ${role === "performer" ? "rgba(255,215,0,0.35)" : "rgba(0,255,255,0.35)"}`,
              borderRadius: 16,
              padding: 28,
              maxWidth: 420,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              textAlign: "center",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIdentityOpen(false)}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff",
                borderRadius: 8,
                padding: "6px 10px",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              ✕ CLOSE
            </button>
            <div
              style={{
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.18em",
                color: role === "performer" ? "#FFD700" : "#00FFFF",
                textTransform: "uppercase",
              }}
            >
              {role === "performer" ? "PERFORMER IDENTITY · STAGE QR" : "USER IDENTITY · PROFILE QR"}
            </div>
            <div
              style={{
                width: 220,
                height: 220,
                background: "#fff",
                borderRadius: 12,
                padding: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
              }}
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  typeof window !== "undefined"
                    ? `${window.location.origin}/p/${userId ? (userId.startsWith("usr_") ? userId : `usr_${userId.slice(0, 8)}`) : "member"}`
                    : "https://themusiciansindex.com"
                )}`}
                alt="Stage ID QR"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", letterSpacing: "0.04em" }}>
              {displayName || (role === "performer" ? "TMI HEADLINER" : "TMI MEMBER")}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontFamily: "monospace" }}>
              {typeof window !== "undefined" ? `${window.location.origin}/p/${userId ? (userId.startsWith("usr_") ? userId : `usr_${userId.slice(0, 8)}`) : "member"}` : "/p/member"}
            </div>
            <div style={{ fontSize: 9, color: "#00FF88", fontWeight: 800, letterSpacing: "0.1em" }}>
              SCAN TO OPEN CANONICAL PROFILE & TIP WALLET
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
