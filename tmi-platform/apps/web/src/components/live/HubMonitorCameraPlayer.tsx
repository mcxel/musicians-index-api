"use client";

/**
 * Monitor A — FOH stage viewport: local performer camera ONLY after explicit CAM ON / GO LIVE.
 * Never auto-requests getUserMedia on mount. Not a second UVR instance.
 * Production presentation: PerformerLivePresentationShell (host-first DNA).
 */

import { useEffect, useRef, useState } from "react";
import { useLivePrivacyState } from "@/lib/live/livePrivacyState";
import { resolveHubMonitorViewport } from "@/lib/live/canonicalWorldViewport";
import { useGoLiveBootstrapStore } from "@/lib/live/goLiveBootstrapStore";
import PerformerLivePresentationShell from "@/components/live/PerformerLivePresentationShell";
import {
  getActivePerformerLiveProgram,
  type PerformerLiveProgramComposition,
} from "@/lib/experiencePresentation/composePerformerLiveProgram";

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

export default function HubMonitorCameraPlayer({
  displayName = null,
  watchingCount: watchingCountProp,
}: {
  displayName?: string | null;
  watchingCount?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraPreviewActive = useLivePrivacyState((s) => s.cameraPreviewActive);
  const isLivePublished = useLivePrivacyState((s) => s.isLivePublished);
  const previewStream = useLivePrivacyState((s) => s.previewStream);
  const [program, setProgram] = useState<PerformerLiveProgramComposition | null>(null);
  const [watchingCount, setWatchingCount] = useState(watchingCountProp ?? 0);

  const hasLiveVideo =
    Boolean(previewStream) &&
    Boolean(previewStream?.getVideoTracks().some((t) => t.readyState === "live"));

  // Self preview ASAP when track exists — GO LIVE or CAM ON
  const showPreview = hasLiveVideo;

  useEffect(() => {
    if (typeof watchingCountProp === "number") setWatchingCount(watchingCountProp);
  }, [watchingCountProp]);

  useEffect(() => {
    const onAudience = (ev: Event) => {
      const detail = (ev as CustomEvent<{ viewers?: number }>).detail;
      if (typeof detail?.viewers === "number" && detail.viewers >= 0) {
        setWatchingCount(Math.floor(detail.viewers));
      }
    };
    window.addEventListener("tmi:watch-audience-count", onAudience as EventListener);
    return () => window.removeEventListener("tmi:watch-audience-count", onAudience as EventListener);
  }, []);

  useEffect(() => {
    const refresh = () => setProgram(getActivePerformerLiveProgram());
    refresh();
    const id = window.setInterval(refresh, 1000);
    return () => window.clearInterval(id);
  }, [isLivePublished]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (showPreview && previewStream) {
      video.srcObject = previewStream;
      void video.play().catch(() => {});
      useGoLiveBootstrapStore.getState().markSelfPreview(true);
      return;
    }
    video.srcObject = null;
  }, [showPreview, previewStream]);

  if (!showPreview) {
    const idle = (
      <HubMonitorIdle
        label={isLivePublished || cameraPreviewActive ? "Camera starting…" : "Camera idle"}
        hint={
          isLivePublished || cameraPreviewActive
            ? "Requesting camera/mic for this live session"
            : "Tap CAM ON for local preview · GO LIVE to broadcast"
        }
      />
    );
    // When published / previewing, still mount production identity shell (not green diagnostic).
    if (isLivePublished || cameraPreviewActive) {
      return (
        <PerformerLivePresentationShell
          displayName={displayName}
          isLivePublished={isLivePublished}
          cameraPreviewActive={cameraPreviewActive}
          hasLiveVideo={false}
          watchingCount={watchingCount}
          composition={program}
        >
          {idle}
        </PerformerLivePresentationShell>
      );
    }
    return idle;
  }

  return (
    <PerformerLivePresentationShell
      displayName={displayName}
      isLivePublished={isLivePublished}
      cameraPreviewActive={cameraPreviewActive}
      hasLiveVideo={hasLiveVideo}
      watchingCount={watchingCount}
      composition={program}
    >
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
      </div>
    </PerformerLivePresentationShell>
  );
}
