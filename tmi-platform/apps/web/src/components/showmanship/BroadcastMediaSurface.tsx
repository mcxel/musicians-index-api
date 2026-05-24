"use client";

import { useEffect, useRef, useState } from "react";
import { slotToStyle, type ChaosSlot } from "@/lib/showmanship/ChaosGridEngine";

export type MediaSource =
  | { type: "youtube"; videoId: string }
  | { type: "spotify"; embedUrl: string }
  | { type: "url"; src: string }
  | { type: "image"; src: string; alt?: string }
  | { type: "memory"; memoryUrl: string; title?: string }
  | { type: "screen" };

interface BroadcastMediaSurfaceProps {
  slot: ChaosSlot;
  source: MediaSource | null;
  focused?: boolean;
  fallbackImageUrl?: string;   // album art / artist motion image
  fallbackLabel?: string;
  onFocus?: () => void;
  onClose?: () => void;
}

let cssInjected = false;
const SURFACE_CSS = `
@keyframes surfacePulse {
  0%,100% { opacity: 0.4; }
  50%      { opacity: 0.65; }
}
@keyframes surfaceEntry {
  from { opacity: 0; transform: scale(0.94); }
  to   { opacity: 1; transform: scale(1); }
}
`;

function AmbientState({ fallbackImageUrl, label }: { fallbackImageUrl?: string; label?: string }) {
  return (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: fallbackImageUrl
        ? `url(${fallbackImageUrl}) center/cover no-repeat`
        : "linear-gradient(135deg,#0a0520 0%,#050510 100%)",
      animation: "surfacePulse 3s ease-in-out infinite",
    }}>
      {!fallbackImageUrl && (
        <div style={{ textAlign: "center", padding: 12 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📡</div>
          <div style={{ color: "rgba(0,229,255,0.6)", fontSize: 10, fontWeight: 800, letterSpacing: "0.2em" }}>
            {label ?? "STANDBY"}
          </div>
        </div>
      )}
      {fallbackImageUrl && (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)",
        }} />
      )}
    </div>
  );
}

export default function BroadcastMediaSurface({
  slot,
  source,
  focused = false,
  fallbackImageUrl,
  fallbackLabel,
  onFocus,
  onClose,
}: BroadcastMediaSurfaceProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!cssInjected && typeof document !== "undefined") {
      cssInjected = true;
      const s = document.createElement("style");
      s.textContent = SURFACE_CSS;
      document.head.appendChild(s);
    }
    setLoaded(false);
    setError(false);
  }, [source?.type]);

  const style = slotToStyle(slot, focused);

  function renderContent() {
    if (!source || error) {
      return <AmbientState fallbackImageUrl={fallbackImageUrl} label={fallbackLabel} />;
    }
    if (!loaded && source.type !== "image" && source.type !== "memory") {
      return <AmbientState fallbackImageUrl={fallbackImageUrl} label="Loading…" />;
    }
    switch (source.type) {
      case "youtube":
        return (
          <iframe
            src={`https://www.youtube.com/embed/${source.videoId}?autoplay=0&rel=0`}
            style={{ width: "100%", height: "100%", border: "none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        );
      case "spotify":
        return (
          <iframe
            src={source.embedUrl}
            style={{ width: "100%", height: "100%", border: "none" }}
            allow="encrypted-media"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        );
      case "url":
        return (
          <iframe
            src={source.src}
            style={{ width: "100%", height: "100%", border: "none" }}
            sandbox="allow-scripts allow-same-origin allow-forms"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        );
      case "image":
      case "memory":
        return (
          <img
            src={source.type === "image" ? source.src : source.memoryUrl}
            alt={source.type === "image" ? (source.alt ?? "") : (source.title ?? "Memory")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        );
      default:
        return <AmbientState fallbackImageUrl={fallbackImageUrl} label="Screen Share" />;
    }
  }

  return (
    <div
      style={{
        ...style,
        background: "#050510",
        border: `1px solid ${focused ? "rgba(0,229,255,0.4)" : "rgba(255,255,255,0.06)"}`,
        boxShadow: focused ? "0 0 32px rgba(0,229,255,0.2)" : "none",
        cursor: focused ? "default" : "pointer",
        animation: loaded ? "surfaceEntry 0.35s ease-out" : undefined,
      }}
      onClick={!focused ? onFocus : undefined}
    >
      {renderContent()}

      {/* Close button when focused */}
      {focused && onClose && (
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          style={{
            position: "absolute", top: 6, right: 8,
            background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 4, color: "#fff", fontSize: 12, cursor: "pointer",
            padding: "2px 7px", zIndex: 200,
          }}
        >
          ×
        </button>
      )}

      {/* Focus hint when ambient */}
      {!focused && source && (
        <div style={{
          position: "absolute", bottom: 6, left: 8,
          color: "rgba(0,229,255,0.7)", fontSize: 9, fontWeight: 800,
          letterSpacing: "0.15em", pointerEvents: "none",
        }}>
          TAP TO FOCUS
        </div>
      )}
    </div>
  );
}
