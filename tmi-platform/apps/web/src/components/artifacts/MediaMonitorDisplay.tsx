"use client";

/**
 * MediaMonitorDisplay — The live "screen" rendered inside every artifact character.
 *
 * Three layers (matching TMI visual spec):
 *   Layer 1: NOW PLAYING header — artist, song, track counter, progress bar
 *   Layer 2: Animated visualizer — sonar / bars / stars / bubbles (theme-matched)
 *   Layer 3: Scrolling ticker — song info, next up, listener count, XP available
 *
 * Plus: Live artist presence badge (🟢 ARTIST ONLINE / LIVE)
 */

import { useEffect, useRef, useState } from "react";
import type { ArtifactTrack, PlaylistArtifact } from "@/lib/artifacts/PlaylistArtifactEngine";

export type VisualizerStyle = "sonar" | "bars" | "stars" | "leaves" | "fire" | "circuit" | "bubbles" | "radar";

interface MediaMonitorDisplayProps {
  artifact:        PlaylistArtifact;
  currentTrack?:   ArtifactTrack;
  currentIndex:    number;
  totalTracks:     number;
  isPlaying:       boolean;
  progress:        number;         // 0–1
  elapsedSecs:     number;
  volume:          number;
  sessionPoints:   number;
  visualizerStyle: VisualizerStyle;
  accent:          string;
  width?:          number;
  height?:         number;
  onPresenceClick?: () => void;
}

// ─── Time formatter ───────────────────────────────────────────────────────────
function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

// ─── Sonar visualizer ─────────────────────────────────────────────────────────
function SonarVisualizer({ accent, isPlaying }: { accent: string; isPlaying: boolean }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: 0.25 }}>
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: 80, height: 80,
        border: `1.5px solid ${accent}`,
        borderRadius: "50%",
        animation: isPlaying ? "sonarPing 2s ease-out infinite" : "none",
      }} />
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: 50, height: 50,
        border: `1.5px solid ${accent}`,
        borderRadius: "50%",
        animation: isPlaying ? "sonarPing 2s ease-out infinite 0.7s" : "none",
      }} />
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: 20, height: 20,
        background: `${accent}44`,
        borderRadius: "50%",
      }} />
      <style>{`
        @keyframes sonarPing {
          0%   { opacity: 0.8; transform: translate(-50%,-50%) scale(0.5); }
          100% { opacity: 0;   transform: translate(-50%,-50%) scale(2);   }
        }
      `}</style>
    </div>
  );
}

// ─── Bar visualizer ───────────────────────────────────────────────────────────
function BarVisualizer({ accent, isPlaying }: { accent: string; isPlaying: boolean }) {
  const BARS = 12;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 3, padding: "0 8px 4px", opacity: 0.5 }}>
      {Array.from({ length: BARS }, (_, i) => {
        const h = isPlaying ? 20 + Math.sin(i * 0.8) * 15 : 4;
        const delay = i * 0.07;
        return (
          <div key={i} style={{
            flex: 1, height: `${h}px`, background: accent, borderRadius: "2px 2px 0 0",
            animation: isPlaying ? `barBounce 0.8s ease-in-out infinite ${delay}s` : "none",
            transition: "height 0.3s",
          }} />
        );
      })}
      <style>{`
        @keyframes barBounce {
          0%,100% { transform: scaleY(0.5); }
          50%      { transform: scaleY(1.3); }
        }
      `}</style>
    </div>
  );
}

// ─── Stars visualizer ─────────────────────────────────────────────────────────
function StarsVisualizer({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: 0.4 }}>
      {Array.from({ length: 16 }, (_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: 2 + (i % 3), height: 2 + (i % 3),
          background: "#FFD700",
          borderRadius: "50%",
          top:  `${5 + (i * 17) % 85}%`,
          left: `${(i * 13 + 5) % 90}%`,
          animation: isPlaying ? `starTwinkle ${0.8 + (i % 5) * 0.3}s ease-in-out infinite ${(i * 0.15) % 1}s` : "none",
        }} />
      ))}
      <style>{`
        @keyframes starTwinkle {
          0%,100% { opacity: 0.2; transform: scale(0.8); }
          50%      { opacity: 1;   transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}

// ─── Bubbles visualizer ───────────────────────────────────────────────────────
function BubblesVisualizer({ accent, isPlaying }: { accent: string; isPlaying: boolean }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: 0.35 }}>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: 4 + (i % 4) * 3, height: 4 + (i % 4) * 3,
          background: "none",
          border: `1.5px solid ${accent}`,
          borderRadius: "50%",
          bottom: "-10px",
          left: `${10 + (i * 11) % 80}%`,
          animation: isPlaying
            ? `bubbleRise ${1.5 + (i * 0.4) % 2}s ease-in infinite ${(i * 0.3) % 1.5}s`
            : "none",
        }} />
      ))}
      <style>{`
        @keyframes bubbleRise {
          0%   { transform: translateY(0) translateX(0);   opacity: 0.8; }
          50%  { transform: translateY(-40px) translateX(${Math.random() > 0.5 ? 5 : -5}px); opacity: 0.5; }
          100% { transform: translateY(-80px) translateX(0); opacity: 0;   }
        }
      `}</style>
    </div>
  );
}

// ─── Scrolling ticker ─────────────────────────────────────────────────────────
function ScrollingTicker({
  currentTrack,
  nextTrack,
  listeners,
  xpAvailable,
  accent,
}: {
  currentTrack?: ArtifactTrack;
  nextTrack?:    ArtifactTrack;
  listeners:     number;
  xpAvailable:   number;
  accent:        string;
}) {
  const text = [
    currentTrack ? `NOW PLAYING: ${currentTrack.artist.toUpperCase()} — ${currentTrack.title.toUpperCase()}` : "NO TRACK SELECTED",
    nextTrack    ? `UP NEXT: ${nextTrack.artist.toUpperCase()} — ${nextTrack.title.toUpperCase()}` : "",
    `${listeners} LISTENERS ONLINE`,
    `+${xpAvailable} XP AVAILABLE`,
  ].filter(Boolean).join("     •     ");

  return (
    <div style={{ overflow: "hidden", position: "relative", height: 14 }}>
      <div style={{
        whiteSpace: "nowrap",
        fontSize: 8,
        fontWeight: 700,
        color: accent,
        letterSpacing: "0.08em",
        animation: "tickerScroll 18s linear infinite",
        display: "inline-block",
        paddingLeft: "100%",
      }}>
        {text}
      </div>
      <style>{`
        @keyframes tickerScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MediaMonitorDisplay({
  artifact,
  currentTrack,
  currentIndex,
  totalTracks,
  isPlaying,
  progress,
  elapsedSecs,
  volume,
  sessionPoints,
  visualizerStyle,
  accent,
  width  = 180,
  height = 120,
  onPresenceClick,
}: MediaMonitorDisplayProps) {
  const [pointsFlash, setPointsFlash] = useState(0);
  const prevPoints = useRef(sessionPoints);

  // Flash +XP when points change
  useEffect(() => {
    if (sessionPoints > prevPoints.current) {
      setPointsFlash(sessionPoints - prevPoints.current);
      const t = setTimeout(() => setPointsFlash(0), 1400);
      prevPoints.current = sessionPoints;
      return () => clearTimeout(t);
    }
  }, [sessionPoints]);

  const nextTrack = artifact.tracks[currentIndex + 1];
  const trackDur  = currentTrack?.duration ?? 0;
  const presence  = artifact.presence;

  const BG   = "#040810";
  const FONT = "'Courier New', 'Share Tech Mono', monospace";

  return (
    <div
      style={{
        width,
        height,
        background: BG,
        borderRadius: 6,
        overflow: "hidden",
        position: "relative",
        fontFamily: FONT,
        display: "flex",
        flexDirection: "column",
        border: `1.5px solid ${accent}33`,
        boxShadow: `inset 0 0 20px rgba(0,0,0,0.8), 0 0 8px ${accent}22`,
      }}
    >
      {/* ── Visualizer background ── */}
      {visualizerStyle === "sonar"   && <SonarVisualizer   accent={accent} isPlaying={isPlaying} />}
      {visualizerStyle === "bars"    && <BarVisualizer     accent={accent} isPlaying={isPlaying} />}
      {visualizerStyle === "stars"   && <StarsVisualizer   isPlaying={isPlaying} />}
      {visualizerStyle === "bubbles" && <BubblesVisualizer accent={accent} isPlaying={isPlaying} />}
      {(visualizerStyle === "leaves" || visualizerStyle === "radar" || visualizerStyle === "circuit" || visualizerStyle === "fire") &&
        <BarVisualizer accent={accent} isPlaying={isPlaying} />}

      {/* ── Content (above visualizer) ── */}
      <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", flexDirection: "column", padding: "5px 6px 3px" }}>

        {/* Artist presence badge */}
        {presence?.isOnline && (
          <div
            onClick={onPresenceClick}
            style={{
              display: "flex", alignItems: "center", gap: 3,
              marginBottom: 3, cursor: onPresenceClick ? "pointer" : "default",
            }}
          >
            <div style={{
              width: 5, height: 5, borderRadius: "50%",
              background: presence.isLive ? "#cc0000" : "#00FF88",
              boxShadow: `0 0 5px ${presence.isLive ? "#cc0000" : "#00FF88"}`,
            }} />
            <span style={{ fontSize: 7, color: presence.isLive ? "#ff4444" : "#00FF88", fontWeight: 700, letterSpacing: "0.1em" }}>
              {presence.isLive ? "● ARTIST LIVE" : "● ARTIST ONLINE"}
            </span>
          </div>
        )}

        {/* NOW PLAYING header */}
        <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", fontWeight: 700, marginBottom: 2 }}>
          NOW PLAYING
        </div>

        {/* Artist name */}
        <div style={{ fontSize: 10, fontWeight: 900, color: accent, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2, marginBottom: 1 }}>
          {currentTrack?.artist ?? artifact.ownerName}
        </div>

        {/* Song title */}
        <div style={{ fontSize: 9, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2, marginBottom: 3 }}>
          {currentTrack?.title ?? "Select a track"}
        </div>

        {/* Track counter */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>
            Track {currentIndex + 1} / {totalTracks}
          </span>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>
            {fmt(elapsedSecs)} / {fmt(trackDur)}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden", marginBottom: 3 }}>
          <div style={{
            height: "100%",
            width: `${Math.min(100, progress * 100)}%`,
            background: `linear-gradient(90deg, ${accent}, ${accent}cc)`,
            borderRadius: 2,
            transition: "width 0.3s linear",
          }} />
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
          <span style={{ fontSize: 7, color: "rgba(255,255,255,0.3)" }}>
            👁 {artifact.stats.listeners}
          </span>
          <span style={{ fontSize: 7, color: "rgba(255,255,255,0.3)" }}>
            ❤️ {artifact.stats.likes.toLocaleString()}
          </span>
          <span style={{ fontSize: 7, color: accent, fontWeight: 700 }}>
            ⭐{artifact.stats.rating}
          </span>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Scrolling ticker */}
        <ScrollingTicker
          currentTrack={currentTrack}
          nextTrack={nextTrack}
          listeners={artifact.stats.listeners}
          xpAvailable={artifact.stats.xpAvailable}
          accent={accent}
        />
      </div>

      {/* ── +XP flash overlay ── */}
      {pointsFlash > 0 && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, pointerEvents: "none",
        }}>
          <div style={{
            fontSize: 18, fontWeight: 900, color: accent,
            textShadow: `0 0 12px ${accent}`,
            animation: "xpFlash 1.2s ease-out forwards",
          }}>
            +{pointsFlash} XP
          </div>
        </div>
      )}

      {/* ── Playing indicator (scanning line) ── */}
      {isPlaying && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: `linear-gradient(90deg, transparent, ${accent}88, transparent)`,
          animation: "scanLine 3s linear infinite",
          zIndex: 3, pointerEvents: "none",
        }} />
      )}

      <style>{`
        @keyframes xpFlash {
          0%   { opacity: 1; transform: scale(1) translateY(0); }
          80%  { opacity: 1; transform: scale(1.2) translateY(-10px); }
          100% { opacity: 0; transform: scale(0.8) translateY(-20px); }
        }
        @keyframes scanLine {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%);  }
        }
      `}</style>
    </div>
  );
}
