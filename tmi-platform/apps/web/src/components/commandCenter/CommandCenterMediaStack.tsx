"use client";

/**
 * Command Center media stack — dual identical 16:9 vertical stack (prototype) → Quad → Octo.
 * Dual geometry via CanonicalDualMonitorStack (shared with Observatory).
 * Non-destructive monitor swapping preserves WebRTC video streams without flickering.
 */

import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AudienceScene from "@/components/live/AudienceScene";
import CanonicalDualMonitorStack, {
  CanonicalMonitorFrame,
} from "@/components/monitors/CanonicalDualMonitorStack";
import {
  HOUSE_SPONSORS,
  type HouseSponsor,
} from "@/lib/commerce/DualStreamSponsorshipEngine";

export type MediaGridMode = 1 | 2 | 4 | 8 | 16;

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

function SponsorOverlayBanner({ overlay }: { overlay: ActiveSponsorOverlay }) {
  return (
    <AnimatePresence>
      <motion.div
        key={`${overlay.sponsor.id}-${overlay.pushedAt}`}
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        style={{
          position: "absolute",
          top: 10,
          left: "50%",
          x: "-50%",
          zIndex: 5,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 14px",
          borderRadius: 999,
          background: "rgba(5,5,16,0.85)",
          border: `1px solid ${overlay.sponsor.accent}`,
          boxShadow: `0 0 24px ${overlay.sponsor.accent}88`,
          backdropFilter: "blur(8px)",
        }}
      >
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          style={{ width: 7, height: 7, borderRadius: "50%", background: overlay.sponsor.accent, boxShadow: `0 0 8px ${overlay.sponsor.accent}` }}
        />
        <span style={{ fontSize: 11, fontWeight: 900, color: "#fff", letterSpacing: "0.04em" }}>
          {overlay.sponsor.name}
        </span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>{overlay.sponsor.tagline}</span>
      </motion.div>
    </AnimatePresence>
  );
}

// Ambient standby loop shown on panels with no live/uploaded source
const ROSE_FALLBACK_URL =
  process.env.NEXT_PUBLIC_DEFAULT_MONITOR_VIDEO?.trim() ||
  process.env.NEXT_PUBLIC_OBSERVATORY_ROSE_VIDEO_URL?.trim() ||
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export interface CommandCenterPlaylistCast {
  playlistId: string;
  trackId?: string;
  title: string;
  artist?: string;
  coverUrl?: string | null;
  audioUrl?: string | null;
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
  mode?: MediaGridMode;
  onModeChange?: (mode: MediaGridMode) => void;
  footer?: ReactNode;
  /** chrome = Fan/Performer hubs (prototype); gold unused here (Observatory owns gold). */
  bezelVariant?: "chrome" | "gold";
  seriesLabel?: string;
}

function PlaylistCastBody({ cast }: { cast: CommandCenterPlaylistCast }) {
  const progress = typeof cast.progress === "number" ? Math.min(1, Math.max(0, cast.progress)) : undefined;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        background: "radial-gradient(circle at 40% 20%, rgba(170,45,255,0.18), #010308 65%)",
        padding: 12,
        gap: 8,
      }}
    >
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

function MonitorMediaBody({ slot, sponsorOverlay }: { slot: CommandCenterMediaSlot; sponsorOverlay?: ActiveSponsorOverlay | null }) {
  const videoSrc = slot.videoUrl || ROSE_FALLBACK_URL;
  return (
    <div style={{ position: "relative", flex: 1, width: "100%", minHeight: 0, overflow: "hidden" }}>
      {sponsorOverlay ? <SponsorOverlayBanner overlay={sponsorOverlay} /> : null}
      {slot.kind === "playlist" && slot.playlistCast ? (
        <PlaylistCastBody cast={slot.playlistCast} />
      ) : videoSrc ? (
        <video
          key={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          src={videoSrc}
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
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 6,
            background: "radial-gradient(circle at 50% 30%, rgba(255,45,170,0.08), #010308 70%)",
          }}
        >
          <span style={{ fontSize: 22, opacity: 0.35 }}>📡</span>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)" }}>
            NO MEDIA
          </span>
        </div>
      )}
    </div>
  );
}

function MonitorChrome({
  slot,
  onSwap,
  onFullscreen,
  sponsorOverlay,
}: {
  slot: CommandCenterMediaSlot;
  onSwap?: () => void;
  onFullscreen?: () => void;
  sponsorOverlay?: ActiveSponsorOverlay | null;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        background: "#010308",
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
          {onFullscreen ? (
            <button
              type="button"
              onClick={onFullscreen}
              title="Expand monitor full screen"
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
          ) : null}
        </div>
      </div>
      <MonitorMediaBody slot={slot} sponsorOverlay={sponsorOverlay} />
    </div>
  );
}

export default function CommandCenterMediaStack({
  slots,
  mode: controlledMode,
  onModeChange,
  footer,
  bezelVariant = "chrome",
  seriesLabel = "COMMAND CENTER · CHROME SERIES · DUAL 16:9 MONITORS",
}: CommandCenterMediaStackProps) {
  const [internalMode, setInternalMode] = useState<MediaGridMode>(2);
  const [swapOrder, setSwapOrder] = useState(false);
  const [fullscreenSlotId, setFullscreenSlotId] = useState<string | null>(null);
  const [sponsorPanelOpen, setSponsorPanelOpen] = useState(false);
  const [activeSponsorOverlay, setActiveSponsorOverlay] = useState<ActiveSponsorOverlay | null>(null);

  const pushSponsorLive = (sponsor: HouseSponsor) => {
    setActiveSponsorOverlay({ sponsor, pushedAt: Date.now() });
    setSponsorPanelOpen(false);
  };

  const mode = controlledMode ?? internalMode;
  const setMode = (m: MediaGridMode) => {
    setInternalMode(m);
    onModeChange?.(m);
  };

  const filled = useMemo(() => {
    const base = [...slots];
    while (base.length < mode) {
      base.push({ id: `empty-${base.length}`, label: `MONITOR ${base.length + 1}`, kind: "empty" });
    }
    const sliced = base.slice(0, mode);
    if (swapOrder && sliced.length >= 2) {
      const copy = [...sliced];
      const temp = copy[0];
      copy[0] = copy[1];
      copy[1] = temp;
      return copy;
    }
    return sliced;
  }, [slots, mode, swapOrder]);

  const handleSwap = () => {
    setSwapOrder((prev) => !prev);
  };

  const fullscreenSlot = fullscreenSlotId ? filled.find((s) => s.id === fullscreenSlotId) ?? slots.find((s) => s.id === fullscreenSlotId) : null;

  const toolbar = (
    <div
      style={{
        flexShrink: 0,
        display: "flex",
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
        MEDIA GRID
      </span>
      {([1, 2, 4, 8, 16] as MediaGridMode[]).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => setMode(m)}
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.08em",
            padding: "3px 8px",
            borderRadius: 6,
            cursor: "pointer",
            border: mode === m ? "1px solid #00FFFF" : "1px solid rgba(255,255,255,0.12)",
            background: mode === m ? "rgba(0,255,255,0.15)" : "transparent",
            color: mode === m ? "#00FFFF" : "rgba(255,255,255,0.5)",
            fontFamily: "inherit",
          }}
        >
          {m === 1 ? "1 (SINGLE)" : m === 2 ? "2 (DUAL)" : m === 4 ? "4 (QUAD)" : m === 8 ? "8 (OCTO)" : "16 (MEGA)"}
        </button>
      ))}

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
              zIndex: 40,
              width: 220,
              background: "#0d1117",
              border: "1px solid rgba(255,215,0,0.4)",
              borderRadius: 10,
              padding: 8,
              boxShadow: "0 16px 40px rgba(0,0,0,0.65)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
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
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        overflow: "auto",
        background: "#010308",
        padding: 8,
      }}
    >
      {/* Fullscreen Overlay Modal */}
      {fullscreenSlot ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "#000",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "10px 16px",
              background: "rgba(10,10,25,0.9)",
              borderBottom: "1px solid rgba(0,255,255,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.1em" }}>
              FULLSCREEN MONITOR · {fullscreenSlot.label}
            </span>
            <button
              type="button"
              onClick={() => setFullscreenSlotId(null)}
              style={{
                fontSize: 10,
                fontWeight: 900,
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #FFD700",
                background: "rgba(255,215,0,0.2)",
                color: "#FFD700",
                cursor: "pointer",
              }}
            >
              EXIT FULLSCREEN ✕
            </button>
          </div>
          <div style={{ flex: 1, position: "relative" }}>
            <MonitorMediaBody slot={fullscreenSlot} />
          </div>
        </div>
      ) : null}

      {mode === 2 ? (
        <CanonicalDualMonitorStack
          variant={bezelVariant}
          seriesLabel={seriesLabel}
          toolbar={toolbar}
          monitors={filled.slice(0, 2).map((slot, index) => ({
            id: slot.id,
            label: slot.label,
            children: (
              <MonitorChrome
                slot={slot}
                onSwap={handleSwap}
                onFullscreen={() => setFullscreenSlotId(slot.id)}
                sponsorOverlay={index === 0 ? activeSponsorOverlay : null}
              />
            ),
          }))}
        />
      ) : (
        <>
          {toolbar}
          <div
            style={{
              flex: "0 0 auto",
              display: "grid",
              gridTemplateColumns: `repeat(${mode === 1 ? 1 : mode === 4 ? 2 : 4}, minmax(0, 1fr))`,
              gap: 8,
              alignContent: "start",
            }}
          >
            {filled.map((slot, index) => (
              <CanonicalMonitorFrame key={slot.id}>
                <MonitorChrome
                  slot={slot}
                  onSwap={index < 2 ? handleSwap : undefined}
                  onFullscreen={() => setFullscreenSlotId(slot.id)}
                  sponsorOverlay={index === 0 ? activeSponsorOverlay : null}
                />
              </CanonicalMonitorFrame>
            ))}
          </div>
        </>
      )}

      {footer ? <div style={{ flexShrink: 0, marginTop: 8 }}>{footer}</div> : null}
    </div>
  );
}
