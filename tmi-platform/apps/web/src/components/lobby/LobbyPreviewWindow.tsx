"use client";

/**
 * LobbyPreviewWindow — Continuous Live Lobby Wall preview surface.
 * Prefers a real preview MediaStream when provided; otherwise honest motion /
 * ready animation. Never presents a frozen photo as LIVE. Audio muted unless focused.
 */

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { LobbyPreviewTileState } from "@/lib/lobby/LobbyPreviewRuntime";

type Props = {
  preview: LobbyPreviewTileState;
  accent: string;
  performerInitial?: string;
  /** Optional WebRTC/preview publisher stream for THIS room (not a duplicate production session). */
  mediaStream?: MediaStream | null;
  /** Optional low-res preview URL from discovery (HTML video) — never N Daily clients. */
  previewUrl?: string | null;
};

export default function LobbyPreviewWindow({
  preview,
  accent,
  performerInitial = "?",
  mediaStream = null,
  previewUrl = null,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const urlVideoRef = useRef<HTMLVideoElement | null>(null);
  const isLive = preview.isLive && preview.camera.hasLiveSignal;
  const hasStream = Boolean(mediaStream && mediaStream.getVideoTracks().length > 0);
  const hasUrl =
    Boolean(previewUrl) &&
    (previewUrl!.startsWith("http") || previewUrl!.startsWith("/") || previewUrl!.startsWith("blob:"));

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (hasStream && mediaStream) {
      el.srcObject = mediaStream;
      el.muted = preview.muted;
      void el.play().catch(() => {});
    } else {
      el.srcObject = null;
    }
    return () => {
      if (el) el.srcObject = null;
    };
  }, [hasStream, mediaStream, preview.muted]);

  useEffect(() => {
    const el = videoRef.current;
    if (el) el.muted = preview.muted;
    const urlEl = urlVideoRef.current;
    if (urlEl) urlEl.muted = preview.muted;
  }, [preview.muted]);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {hasStream && isLive ? (
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted={preview.muted}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: preview.quality === "off" ? 0.25 : 1,
          }}
        />
      ) : hasUrl && isLive ? (
        <video
          ref={urlVideoRef}
          src={previewUrl!}
          playsInline
          autoPlay
          loop
          muted={preview.muted}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: preview.quality === "off" ? 0.25 : 0.9,
          }}
        />
      ) : isLive ? (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(160deg, ${accent}44 0%, transparent 50%, rgba(0,0,0,0.45) 100%)`,
            }}
          />
          <motion.div
            animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `linear-gradient(120deg, transparent 30%, ${accent}33 50%, transparent 70%)`,
              backgroundSize: "200% 200%",
              opacity: preview.quality === "off" ? 0.2 : 0.85,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -60%)",
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: `${accent}55`,
              border: `2px solid ${accent}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 900,
              color: "#fff",
              zIndex: 2,
            }}
          >
            {performerInitial.charAt(0).toUpperCase()}
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 36,
              left: 8,
              fontSize: 8,
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: "rgba(255,255,255,0.45)",
              zIndex: 3,
            }}
          >
            {preview.feedMode === "webrtc-preview"
              ? `PREVIEW BIND · ${preview.camera.label}`
              : `COMPOSED MOTION · ${preview.camera.label}`}
          </div>
        </>
      ) : (
        <motion.div
          animate={{ opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 45%, rgba(0,255,255,0.12), transparent 60%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.45)",
            }}
          >
            {preview.readyState === "waiting" ? "WAITING" : "READY"}
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
            {preview.camera.label}
          </div>
        </motion.div>
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
