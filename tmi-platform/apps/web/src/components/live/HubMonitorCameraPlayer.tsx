"use client";

/**
 * Monitor A — FOH stage viewport: local performer camera ONLY after explicit CAM ON / GO LIVE.
 * Never auto-requests getUserMedia on mount. Not a second UVR instance.
 */

import { useEffect, useRef } from "react";
import { useLivePrivacyState } from "@/lib/live/livePrivacyState";
import { resolveHubMonitorViewport } from "@/lib/live/canonicalWorldViewport";

const FOH = resolveHubMonitorViewport("A");

function HubMonitorIdle({ label, hint }: { label: string; hint?: string }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        background: "radial-gradient(circle at 50% 28%, rgba(0,255,255,0.08), #010308 72%)",
      }}
    >
      <span style={{ fontSize: 24, opacity: 0.35 }}>📹</span>
      <span
        style={{
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.14em",
          color: "rgba(255,255,255,0.42)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      {hint ? (
        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.28)", letterSpacing: "0.08em" }}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export default function HubMonitorCameraPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraPreviewActive = useLivePrivacyState((s) => s.cameraPreviewActive);
  const isLivePublished = useLivePrivacyState((s) => s.isLivePublished);
  const previewStream = useLivePrivacyState((s) => s.previewStream);

  const showPreview =
    Boolean(previewStream) && (cameraPreviewActive || isLivePublished);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (showPreview && previewStream) {
      video.srcObject = previewStream;
      void video.play().catch(() => {});
      return;
    }
    video.srcObject = null;
  }, [showPreview, previewStream]);

  if (!showPreview) {
    return (
      <HubMonitorIdle
        label="Camera idle"
        hint="Tap CAM ON for local preview · GO LIVE to broadcast"
      />
    );
  }

  return (
    <div
      data-hub-monitor-camera-player="true"
      data-canonical-viewport={FOH.role}
      data-canonical-zone={FOH.zone}
      style={{ position: "absolute", inset: 0, background: "#000" }}
    >
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          zIndex: 4,
          padding: "2px 8px",
          borderRadius: 4,
          background: "rgba(0,0,0,0.65)",
          fontSize: 8,
          fontWeight: 900,
          letterSpacing: "0.12em",
          color: "#FFD700",
          pointerEvents: "none",
        }}
      >
        {FOH.shortLabel} · STAGE
      </div>
      <video
        ref={videoRef}
        muted
        playsInline
        autoPlay
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      {!isLivePublished ? (
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            padding: "3px 8px",
            borderRadius: 4,
            background: "rgba(0,0,0,0.72)",
            border: "1px solid rgba(0,255,136,0.45)",
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.1em",
            color: "#00FF88",
            pointerEvents: "none",
          }}
        >
          LOCAL PREVIEW · NOT LIVE
        </div>
      ) : null}
    </div>
  );
}
