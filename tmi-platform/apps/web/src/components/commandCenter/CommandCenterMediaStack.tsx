"use client";

/**
 * Command Center media stack — dual identical 16:9 vertical stack (prototype) → Quad → Octo.
 * Dual geometry via CanonicalDualMonitorStack (shared with Observatory).
 * Non-destructive monitor swapping preserves WebRTC video streams without flickering.
 */

import { useMemo, useState, type ReactNode } from "react";
import AudienceScene from "@/components/live/AudienceScene";
import CanonicalDualMonitorStack, {
  CanonicalMonitorFrame,
} from "@/components/monitors/CanonicalDualMonitorStack";

export type MediaGridMode = 2 | 4 | 8;

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

function MonitorMediaBody({ slot }: { slot: CommandCenterMediaSlot }) {
  return (
    <div style={{ position: "relative", flex: 1, width: "100%", minHeight: 0, overflow: "hidden" }}>
      {slot.kind === "playlist" && slot.playlistCast ? (
        <PlaylistCastBody cast={slot.playlistCast} />
      ) : slot.kind === "audience" ? (
        <div style={{ position: "absolute", inset: 0 }}>
          <AudienceScene view="fan" />
        </div>
      ) : slot.videoUrl ? (
        <video
          key={slot.videoUrl}
          autoPlay
          loop
          muted
          playsInline
          src={slot.videoUrl}
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
}: {
  slot: CommandCenterMediaSlot;
  onSwap?: () => void;
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
      </div>
      <MonitorMediaBody slot={slot} />
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
      {([2, 4, 8] as MediaGridMode[]).map((m) => (
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
          {m === 2 ? "DUAL" : m === 4 ? "QUAD" : "OCTO"}
        </button>
      ))}
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
      {mode === 2 ? (
        <CanonicalDualMonitorStack
          variant={bezelVariant}
          seriesLabel={seriesLabel}
          toolbar={toolbar}
          monitors={filled.slice(0, 2).map((slot) => ({
            id: slot.id,
            label: slot.label,
            children: <MonitorChrome slot={slot} onSwap={handleSwap} />,
          }))}
        />
      ) : (
        <>
          {toolbar}
          <div
            style={{
              flex: "0 0 auto",
              display: "grid",
              gridTemplateColumns: `repeat(${mode === 4 ? 2 : 4}, minmax(0, 1fr))`,
              gap: 8,
              alignContent: "start",
            }}
          >
            {filled.map((slot, index) => (
              <CanonicalMonitorFrame key={slot.id}>
                <MonitorChrome slot={slot} onSwap={index < 2 ? handleSwap : undefined} />
              </CanonicalMonitorFrame>
            ))}
          </div>
        </>
      )}

      {footer ? <div style={{ flexShrink: 0, marginTop: 8 }}>{footer}</div> : null}
    </div>
  );
}
