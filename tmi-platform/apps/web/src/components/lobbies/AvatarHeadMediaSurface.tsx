"use client";

/**
 * Phase B — Shared avatar-head video panel (Fan Lobby + Playlist Lounge).
 * Modes: FULL | COMPACT | HIDDEN. Presence owns cam/mic/speaking; this renders tracks.
 * Socket: positioned above 2D free-roam avatar bubble (no fake 3D bone rig).
 */

import React, { useEffect, useRef } from "react";
import type { AvatarHeadMediaMode } from "@/lib/lobby/lobbyPeerMediaBinding";

export interface AvatarHeadMediaSurfaceProps {
  mode: AvatarHeadMediaMode;
  /** Live video track when available. */
  videoTrack: MediaStreamTrack | null;
  /** Presence: camera intended on (may still lack peer track). */
  cameraEnabled: boolean;
  /** Presence: mic on/off → mute badge. */
  micEnabled: boolean;
  /** Presence speaking frame. */
  isSpeaking: boolean;
  isSelf?: boolean;
  /** When camera on but no track (Daily down / peer not publishing). */
  peerMediaUnavailable?: boolean;
  label?: string;
}

const SIZES: Record<Exclude<AvatarHeadMediaMode, "HIDDEN">, { w: number; h: number; radius: number }> = {
  FULL: { w: 72, h: 54, radius: 10 },
  COMPACT: { w: 40, h: 30, radius: 8 },
};

export function AvatarHeadMediaSurface({
  mode,
  videoTrack,
  cameraEnabled,
  micEnabled,
  isSpeaking,
  isSelf,
  peerMediaUnavailable,
  label,
}: AvatarHeadMediaSurfaceProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (videoTrack && mode !== "HIDDEN") {
      const stream = new MediaStream([videoTrack]);
      el.srcObject = stream;
      void el.play().catch(() => {});
      return () => {
        el.srcObject = null;
      };
    }
    el.srcObject = null;
  }, [videoTrack, mode]);

  if (mode === "HIDDEN") return null;

  const { w, h, radius } = SIZES[mode];
  const showVideo = Boolean(videoTrack && cameraEnabled);
  const frameColor = isSpeaking ? "#00FF88" : isSelf ? "#00FFFF" : "rgba(255,255,255,0.35)";

  return (
    <div
      data-testid="avatar-head-media-surface"
      data-mode={mode}
      aria-label={label ?? (isSelf ? "Your camera" : "Peer camera")}
      style={{
        width: w,
        height: h,
        borderRadius: radius,
        overflow: "hidden",
        border: `2px solid ${frameColor}`,
        boxShadow: isSpeaking ? `0 0 14px ${frameColor}` : "0 4px 12px rgba(0,0,0,0.45)",
        background: "rgba(5,5,16,0.92)",
        position: "relative",
        flexShrink: 0,
        transition: "width 0.2s, height 0.2s, border-color 0.2s",
      }}
    >
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          muted={Boolean(isSelf)}
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: isSelf ? "scaleX(-1)" : undefined,
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            padding: 4,
            textAlign: "center",
          }}
        >
          {!cameraEnabled ? (
            <>
              <span style={{ fontSize: mode === "COMPACT" ? 10 : 12 }} aria-hidden>
                📷
              </span>
              <span
                style={{
                  fontSize: mode === "COMPACT" ? 6 : 7,
                  fontWeight: 800,
                  color: "rgba(255,255,255,0.45)",
                  letterSpacing: "0.04em",
                  lineHeight: 1.1,
                }}
              >
                CAM OFF
              </span>
            </>
          ) : peerMediaUnavailable || !videoTrack ? (
            <>
              <span style={{ fontSize: mode === "COMPACT" ? 10 : 12 }} aria-hidden>
                📡
              </span>
              <span
                style={{
                  fontSize: mode === "COMPACT" ? 5 : 6,
                  fontWeight: 800,
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.03em",
                  lineHeight: 1.15,
                }}
              >
                {isSelf ? "NO STREAM" : "NO PEER VIDEO"}
              </span>
            </>
          ) : null}
        </div>
      )}

      {!micEnabled ? (
        <div
          title="Mic muted"
          style={{
            position: "absolute",
            bottom: 2,
            right: 2,
            fontSize: mode === "COMPACT" ? 8 : 10,
            background: "rgba(0,0,0,0.7)",
            borderRadius: 4,
            padding: "1px 3px",
            lineHeight: 1,
          }}
        >
          🔇
        </div>
      ) : null}

      {isSpeaking ? (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: radius - 2,
            boxShadow: "inset 0 0 0 1.5px #00FF88",
            pointerEvents: "none",
          }}
        />
      ) : null}
    </div>
  );
}
