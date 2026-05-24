"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  MediaCaptureEngine,
  fireCaptureAnalytics,
  type CaptureStatus,
  type CaptureSource,
} from "@/lib/media/MediaCaptureEngine";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MediaCapturePanelProps {
  onStreamReady?: (stream: MediaStream) => void;
  onStreamStopped?: () => void;
  showControls?: boolean;
  compact?: boolean;
}

// ── Status display map ────────────────────────────────────────────────────────

const STATUS_LABEL: Record<CaptureStatus, string> = {
  IDLE:         "Idle",
  REQUESTING:   "Connecting...",
  ACTIVE:       "Live",
  DEGRADED:     "Degrading...",
  RECONNECTING: "Reconnecting...",
  ERROR:        "Error",
  STOPPED:      "Stopped",
};

const STATUS_COLOR: Record<CaptureStatus, string> = {
  IDLE:         "rgba(255,255,255,0.3)",
  REQUESTING:   "#00FFFF",
  ACTIVE:       "#00FF88",
  DEGRADED:     "#FFD700",
  RECONNECTING: "#FFA500",
  ERROR:        "#FF2DAA",
  STOPPED:      "rgba(255,255,255,0.3)",
};

const STATUS_DOT: Record<CaptureStatus, string> = {
  IDLE:         "○",
  REQUESTING:   "◌",
  ACTIVE:       "●",
  DEGRADED:     "◉",
  RECONNECTING: "◌",
  ERROR:        "✕",
  STOPPED:      "○",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function MediaCapturePanel({
  onStreamReady,
  onStreamStopped,
  showControls = true,
  compact = false,
}: MediaCapturePanelProps) {
  const videoRef       = useRef<HTMLVideoElement>(null);
  const engineRef      = useRef<MediaCaptureEngine | null>(null);
  const [status, setStatus]   = useState<CaptureStatus>("IDLE");
  const [source, setSource]   = useState<CaptureSource>("CAMERA");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [warning, setWarning]   = useState<string | null>(null);

  // Lazy-init engine (browser-only)
  function getEngine(): MediaCaptureEngine {
    if (!engineRef.current) {
      engineRef.current = new MediaCaptureEngine();
    }
    return engineRef.current;
  }

  // Subscribe to capture events
  useEffect(() => {
    const engine = getEngine();
    const unsub = engine.on((event, session) => {
      setStatus(session.status);
      setErrorMsg(session.errorMessage);

      if (event === "black_frame_detected") {
        setWarning("Black frame detected — check your camera input.");
      } else if (event === "frozen_frame_detected") {
        setWarning("Frozen frame detected — your feed may be stalled.");
      } else if (event === "desync_detected") {
        setWarning("Audio/video desync detected.");
      } else if (event === "quality_downgrade") {
        setWarning("Lowering stream quality for better stability.");
      } else if (event === "reconnected") {
        setWarning(null);
      } else if (event === "started" || event === "stopped") {
        setWarning(null);
      }
    });
    return unsub;
  }, []);

  // Attach stream to video element when active
  useEffect(() => {
    const engine = getEngine();
    const session = engine.getSession();
    if (session?.stream && videoRef.current) {
      videoRef.current.srcObject = session.stream;
    }
  }, [status]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleStartCamera = useCallback(async () => {
    const engine = getEngine();
    try {
      setErrorMsg(null);
      setWarning(null);
      const stream = await engine.startCamera("HD_1080");
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      fireCaptureAnalytics(engine.getSession()?.analyticsTag ?? "camera", "start");
      onStreamReady?.(stream);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Camera access denied";
      setErrorMsg(msg);
      fireCaptureAnalytics("camera:failed", "error");
    }
  }, [onStreamReady]);

  const handleShareScreen = useCallback(async () => {
    const engine = getEngine();
    try {
      setErrorMsg(null);
      setWarning(null);
      setSource("SCREEN");
      const stream = await engine.startScreenShare();
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      fireCaptureAnalytics(engine.getSession()?.analyticsTag ?? "screen", "start");
      onStreamReady?.(stream);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Screen share denied or cancelled";
      setErrorMsg(msg);
      setSource("CAMERA");
      fireCaptureAnalytics("screen:failed", "error");
    }
  }, [onStreamReady]);

  const handleStop = useCallback(() => {
    const engine = getEngine();
    fireCaptureAnalytics(engine.getSession()?.analyticsTag ?? "capture", "stop");
    engine.stopCapture();
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setWarning(null);
    onStreamStopped?.();
  }, [onStreamStopped]);

  // ── Derived ──────────────────────────────────────────────────────────────────

  const isActive     = status === "ACTIVE" || status === "DEGRADED";
  const isBusy       = status === "REQUESTING" || status === "RECONNECTING";
  const statusColor  = STATUS_COLOR[status];
  const sourceLabel  = source === "SCREEN" ? "Screen Share" : "Camera";

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={{ width: "100%", background: "#050510", borderRadius: compact ? 10 : 16, overflow: "hidden", border: `1px solid ${isActive ? "rgba(0,255,136,0.25)" : "rgba(255,255,255,0.08)"}`, transition: "border-color 0.3s" }}>

      {/* Video preview */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#000" }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover", display: isActive ? "block" : "none" }}
        />

        {/* Placeholder when not active */}
        {!isActive && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <div style={{ fontSize: compact ? 28 : 40, opacity: 0.3 }}>📹</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em" }}>
              {isBusy ? "CONNECTING" : "NO SIGNAL"}
            </div>
          </div>
        )}

        {/* Status badge */}
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", borderRadius: 999, padding: "4px 10px", border: `1px solid ${statusColor}30` }}>
          <span style={{ fontSize: 8, color: statusColor }}>{STATUS_DOT[status]}</span>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: statusColor }}>
            {STATUS_LABEL[status].toUpperCase()}
          </span>
          {isActive && (
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginLeft: 2 }}>{sourceLabel}</span>
          )}
        </div>

        {/* Warning overlay */}
        {warning && (
          <div style={{ position: "absolute", bottom: 10, left: 10, right: 10, background: "rgba(255,165,0,0.15)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,165,0,0.3)", borderRadius: 8, padding: "6px 10px", fontSize: 10, color: "#FFA500", display: "flex", alignItems: "center", gap: 6 }}>
            <span>⚠</span>
            <span>{warning}</span>
            <button onClick={() => setWarning(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,165,0,0.5)", cursor: "pointer", fontSize: 12, padding: 0 }}>✕</button>
          </div>
        )}
      </div>

      {/* Controls */}
      {showControls && (
        <div style={{ padding: compact ? "10px 12px" : "14px 16px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {!isActive && !isBusy && (
            <>
              <button
                onClick={handleStartCamera}
                style={{ flex: 1, minWidth: 100, padding: "9px 12px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "linear-gradient(135deg,#00FF88,#00AA55)", border: "none", borderRadius: 8, cursor: "pointer" }}
              >
                START CAMERA
              </button>
              <button
                onClick={handleShareScreen}
                style={{ flex: 1, minWidth: 100, padding: "9px 12px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#00FFFF", background: "rgba(0,255,255,0.08)", border: "1px solid rgba(0,255,255,0.25)", borderRadius: 8, cursor: "pointer" }}
              >
                SHARE SCREEN
              </button>
            </>
          )}

          {isBusy && (
            <div style={{ flex: 1, padding: "9px 12px", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "#00FFFF", textAlign: "center", opacity: 0.7 }}>
              {STATUS_LABEL[status].toUpperCase()}...
            </div>
          )}

          {isActive && (
            <button
              onClick={handleStop}
              style={{ flex: 1, padding: "9px 12px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#FF2DAA", background: "rgba(255,45,170,0.08)", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 8, cursor: "pointer" }}
            >
              STOP CAMERA
            </button>
          )}
        </div>
      )}

      {/* Error message */}
      {errorMsg && (
        <div style={{ margin: "0 12px 12px", padding: "8px 12px", background: "rgba(255,45,170,0.08)", border: "1px solid rgba(255,45,170,0.2)", borderRadius: 8, fontSize: 10, color: "#FF2DAA" }}>
          {errorMsg}
        </div>
      )}
    </div>
  );
}
