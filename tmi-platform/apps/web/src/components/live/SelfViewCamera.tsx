"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type CameraFacing = "user" | "environment";
export type SelfViewSize = "sm" | "md" | "lg" | "fullscreen";

export interface SelfViewCameraProps {
  /** Automatically request camera on mount */
  autoStart?: boolean;
  /** Mirror the video (natural selfie orientation) */
  mirror?: boolean;
  /** Display size preset */
  size?: SelfViewSize;
  /** Called when stream is ready */
  onStreamReady?: (stream: MediaStream) => void;
  /** Called when stream stops */
  onStreamStopped?: () => void;
  /** Called on any error */
  onError?: (err: string) => void;
  /** Show mic / camera toggle controls */
  showControls?: boolean;
  /** Show the live indicator badge */
  showLiveBadge?: boolean;
  /** Show viewer count (pass 0 to hide) */
  viewerCount?: number;
  /** Accent color for controls */
  accent?: string;
  /** Extra class or style on the wrapper */
  className?: string;
  style?: React.CSSProperties;
}

const SIZE_MAP: Record<SelfViewSize, { width: string; height: string }> = {
  sm:         { width: "160px",  height: "100px"  },
  md:         { width: "320px",  height: "200px"  },
  lg:         { width: "560px",  height: "350px"  },
  fullscreen: { width: "100%",   height: "100%"   },
};

const ERROR_MESSAGES: Record<string, string> = {
  NotAllowedError:    "Camera access denied. Please allow camera permissions and try again.",
  NotFoundError:      "No camera found on this device.",
  NotReadableError:   "Camera is already in use by another app.",
  OverconstrainedError: "Camera does not meet the required constraints.",
  SecurityError:      "Camera blocked by browser security policy.",
  AbortError:         "Camera request was cancelled.",
};

function humanizeError(e: unknown): string {
  if (e instanceof DOMException) {
    return ERROR_MESSAGES[e.name] ?? `Camera error: ${e.message}`;
  }
  if (e instanceof Error) return `Camera error: ${e.message}`;
  return "Unknown camera error.";
}

export default function SelfViewCamera({
  autoStart   = false,
  mirror      = true,
  size        = "md",
  onStreamReady,
  onStreamStopped,
  onError,
  showControls = true,
  showLiveBadge = true,
  viewerCount,
  accent = "#FF2DAA",
  style,
}: SelfViewCameraProps) {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const streamRef  = useRef<MediaStream | null>(null);
  const [active,   setActive]   = useState(false);
  const [micOn,    setMicOn]    = useState(true);
  const [camOn,    setCamOn]    = useState(true);
  const [facing,   setFacing]   = useState<CameraFacing>("user");
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [duration, setDuration] = useState(0);

  // Live timer
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(t);
  }, [active]);

  const formatDuration = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const startCamera = useCallback(async (facingMode: CameraFacing = facing) => {
    setError(null);
    setLoading(true);

    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      const msg = "This browser does not support camera access. Please use Chrome, Firefox, or Safari.";
      setError(msg);
      onError?.(msg);
      setLoading(false);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width:  { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30, max: 60 },
        },
        audio: {
          echoCancellation:  true,
          noiseSuppression:  true,
          autoGainControl:   true,
          sampleRate:        { ideal: 48000 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // prevent echo — audio goes to WebRTC peer, not local speaker
        await videoRef.current.play();
      }

      setActive(true);
      setDuration(0);
      onStreamReady?.(stream);
    } catch (e) {
      const msg = humanizeError(e);
      setError(msg);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  }, [facing, onStreamReady, onError]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
    setDuration(0);
    onStreamStopped?.();
  }, [onStreamStopped]);

  const toggleMic = useCallback(() => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  }, []);

  const toggleCam = useCallback(() => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCamOn(track.enabled);
    }
  }, []);

  const flipCamera = useCallback(async () => {
    const next: CameraFacing = facing === "user" ? "environment" : "user";
    setFacing(next);
    if (active) await startCamera(next);
  }, [facing, active, startCamera]);

  // Auto-start
  useEffect(() => {
    if (autoStart) void startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dims = SIZE_MAP[size];
  const BG = "#050812";

  return (
    <div
      style={{
        position: "relative",
        width:  dims.width,
        height: dims.height,
        background: BG,
        borderRadius: size === "fullscreen" ? 0 : 12,
        overflow: "hidden",
        border: active ? `2px solid ${accent}` : "2px solid #1a1a2e",
        boxShadow: active ? `0 0 24px ${accent}44` : "none",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        ...style,
      }}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: mirror && facing === "user" ? "scaleX(-1)" : "none",
          display: active ? "block" : "none",
          background: "#000",
        }}
      />

      {/* Placeholder when not active */}
      {!active && !loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            background: `radial-gradient(circle at 50% 50%, #0a0818 0%, ${BG} 100%)`,
          }}
        >
          <div style={{ fontSize: 32, opacity: 0.4 }}>📷</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Camera off
          </div>
          {error && (
            <div
              style={{
                margin: "0 16px",
                padding: "8px 12px",
                background: "rgba(255,68,68,0.08)",
                border: "1px solid rgba(255,68,68,0.25)",
                borderRadius: 7,
                fontSize: 10,
                color: "#ff6666",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}
        </div>
      )}

      {/* Loading spinner */}
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: "rgba(5,8,18,0.9)",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: `3px solid ${accent}22`,
              borderTop: `3px solid ${accent}`,
              animation: "spin 0.8s linear infinite",
            }}
          />
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>
            Starting camera…
          </div>
        </div>
      )}

      {/* LIVE badge + duration */}
      {showLiveBadge && active && (
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            display: "flex",
            alignItems: "center",
            gap: 6,
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 8px",
              background: "#cc0000",
              borderRadius: 4,
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "#fff",
                boxShadow: "0 0 5px #fff",
              }}
            />
            <span style={{ fontSize: 8, fontWeight: 900, color: "#fff", letterSpacing: "0.1em" }}>LIVE</span>
          </div>
          <div
            style={{
              padding: "3px 8px",
              background: "rgba(0,0,0,0.6)",
              borderRadius: 4,
              fontSize: 9,
              fontWeight: 700,
              color: "#fff",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatDuration(duration)}
          </div>
        </div>
      )}

      {/* Viewer count */}
      {active && viewerCount !== undefined && viewerCount > 0 && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            padding: "3px 8px",
            background: "rgba(0,0,0,0.6)",
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 9,
            fontWeight: 700,
            color: "#fff",
            zIndex: 10,
          }}
        >
          <span>👁</span>
          <span>{viewerCount.toLocaleString()}</span>
        </div>
      )}

      {/* Camera-off overlay (stream paused but active) */}
      {active && !camOn && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(5,8,18,0.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5,
          }}
        >
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.1em" }}>
            VIDEO PAUSED
          </div>
        </div>
      )}

      {/* Controls bar */}
      {showControls && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "8px 10px",
            background: "linear-gradient(0deg, rgba(0,0,0,0.75) 0%, transparent 100%)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            zIndex: 10,
          }}
        >
          {/* Go Live / Stop */}
          {!active ? (
            <button
              type="button"
              onClick={() => void startCamera()}
              disabled={loading}
              style={{
                flex: 1,
                padding: "7px",
                background: accent,
                border: "none",
                borderRadius: 7,
                cursor: loading ? "wait" : "pointer",
                fontSize: 10,
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "0.08em",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Starting…" : "Start Camera"}
            </button>
          ) : (
            <>
              {/* Mic */}
              <ControlBtn
                icon={micOn ? "🎙️" : "🔇"}
                label={micOn ? "Mute" : "Unmute"}
                active={micOn}
                accent={accent}
                onClick={toggleMic}
              />
              {/* Camera */}
              <ControlBtn
                icon={camOn ? "📷" : "📷"}
                label={camOn ? "Cam off" : "Cam on"}
                active={camOn}
                accent={accent}
                onClick={toggleCam}
              />
              {/* Flip (mobile) */}
              <ControlBtn
                icon="🔄"
                label="Flip"
                active={false}
                accent={accent}
                onClick={() => void flipCamera()}
              />
              {/* Stop */}
              <button
                type="button"
                onClick={stopCamera}
                style={{
                  marginLeft: "auto",
                  padding: "6px 10px",
                  background: "rgba(200,0,0,0.7)",
                  border: "1px solid rgba(255,0,0,0.3)",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 9,
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "0.06em",
                }}
              >
                ■ STOP
              </button>
            </>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ControlBtn({
  icon,
  label,
  active,
  accent,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  accent: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        padding: "5px 8px",
        background: active ? "rgba(255,255,255,0.12)" : "rgba(200,0,0,0.25)",
        border: `1px solid ${active ? "rgba(255,255,255,0.2)" : "rgba(200,0,0,0.3)"}`,
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 14,
      }}
    >
      <span>{icon}</span>
      <span style={{ fontSize: 7, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>{label}</span>
    </button>
  );
}
