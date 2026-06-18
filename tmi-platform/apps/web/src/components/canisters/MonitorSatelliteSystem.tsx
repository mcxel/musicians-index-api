"use client";

import { useEffect, useRef, useState } from "react";
import MotionPosterPlayer from "@/components/media/MotionPosterPlayer";
import BillboardLiveWall from "@/components/media/BillboardLiveWall";
import UnifiedAdSlot from "@/components/ads/UnifiedAdSlot";
import ActionRail from "@/components/canisters/ActionRail";
import AudienceScene from "@/components/live/AudienceScene";

interface MonitorSatelliteSystemProps {
  mainLabel: string;
  isLive?: boolean;
  liveRoomRoute?: string;
  introVideoUrl?: string;
  motionPosterUrl?: string;
  staticImageUrl: string;
  audienceCount?: number;
  accentColor?: string;
  /** zone/slotKey for the sponsor-commercial fallback ad (Rule 12) */
  adZone?: string;
  /** Audience Visibility Rule v4: performer/host surfaces must show a live
   *  Audience Monitor the instant they go live — pass true for Performer Hub,
   *  Producer HQ, host-facing surfaces. Fan-facing surfaces can omit it. */
  showAudienceMonitor?: boolean;
}

type MainMode = "feed" | "lobbyWall";

/**
 * Monitor Satellite System (Profile Hub Blueprint): one large main monitor
 * + two small satellites (bottom-left = audio/mute panel, bottom-right =
 * PIP self-camera). Main monitor never goes blank — live feed, or the
 * Billboard Live Lobby Wall, or a sponsor commercial fallback.
 */
export default function MonitorSatelliteSystem({
  mainLabel,
  isLive = false,
  liveRoomRoute,
  introVideoUrl,
  motionPosterUrl,
  staticImageUrl,
  audienceCount,
  accentColor = "#00FFFF",
  adZone = "monitor-satellite",
  showAudienceMonitor = false,
}: MonitorSatelliteSystemProps) {
  const [mainMode, setMainMode] = useState<MainMode>("feed");
  const [muted, setMuted] = useState(false);
  const [micLive, setMicLive] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [captureState, setCaptureState] = useState<"idle" | "ready" | "saving" | "saved" | "error">("idle");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCaptureState("ready");
      })
      .catch(() => setCaptureState("error"));
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !next; });
  }

  function togglePushToTalk() {
    const next = !micLive;
    setMicLive(next);
    streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = next && !muted; });
  }

  function toggleCamera() {
    const next = !cameraOn;
    setCameraOn(next);
    streamRef.current?.getVideoTracks().forEach((t) => { t.enabled = next; });
  }

  function requestFullscreen() {
    videoRef.current?.requestFullscreen?.().catch(() => {});
  }

  async function captureSnapshot() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg", 0.85);

    setCaptureState("saving");
    try {
      const res = await fetch("/api/memory/capture", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ imageData, captureType: "selfie", roomLabel: mainLabel }),
      });
      setCaptureState(res.ok ? "saved" : "error");
      if (res.ok) setTimeout(() => setCaptureState("ready"), 2000);
    } catch {
      setCaptureState("error");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Main monitor */}
      <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", color: accentColor, display: "flex", alignItems: "center", gap: 8 }}>
        🎬 MAIN MONITOR
        <span style={{ flex: 1, height: 1, background: `${accentColor}33` }} />
      </div>
      <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: `2px solid ${accentColor}aa`, boxShadow: `0 0 32px ${accentColor}22`, minHeight: 460 }}>
        {mainMode === "feed" ? (
          <MotionPosterPlayer
            isLive={isLive}
            liveRoomRoute={liveRoomRoute}
            introVideoUrl={introVideoUrl}
            motionPosterUrl={motionPosterUrl}
            staticImageUrl={staticImageUrl}
            alt={mainLabel}
            audienceCount={audienceCount}
            showLiveOverlay={!isLive}
            height={460}
          />
        ) : (
          <div style={{ maxHeight: 460, overflowY: "auto", background: "#050510" }}>
            <BillboardLiveWall mode="home" maxTiles={6} title="BROWSE LIVE LOBBY WALLS" />
          </div>
        )}
        {!isLive && mainMode === "feed" && (
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <UnifiedAdSlot venue={adZone} slotKey="homepageBanner" format="horizontal" label="" style={{ position: "absolute", bottom: 8, left: 8, right: 8, minHeight: 0, pointerEvents: "auto" }} accentColor={accentColor} />
          </div>
        )}
        <button
          onClick={() => setMainMode((m) => (m === "feed" ? "lobbyWall" : "feed"))}
          style={{ position: "absolute", top: 8, right: 8, fontSize: 9, fontWeight: 800, padding: "4px 10px", borderRadius: 6, background: "rgba(5,5,16,0.8)", border: `1px solid ${accentColor}66`, color: accentColor, cursor: "pointer" }}
        >
          {mainMode === "feed" ? "📡 BROWSE LOBBY WALLS" : "◀ BACK TO FEED"}
        </button>
      </div>

      {/* Audience Monitor — Audience Visibility Rule v4: visible the instant a performer/host goes live */}
      {showAudienceMonitor && (
        <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid rgba(0,255,255,0.3)" }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: accentColor, padding: "8px 12px", background: "#0f0f1a" }}>
            👥 AUDIENCE MONITOR {audienceCount != null ? `· ${audienceCount.toLocaleString()} WATCHING` : ""}
          </div>
          <AudienceScene view="performer" venue={0} watcherCount={audienceCount ?? 0} bpm={120} accentColor={accentColor} occupancyRatio={isLive ? Math.min(1, (audienceCount ?? 0) / 200 || 0.3) : 0} hideControls />
        </div>
      )}

      {/* Satellites */}
      <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
        📡 SATELLITES
        <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {/* Audio / mute panel — PIP Left */}
        <div style={{ background: "#0f0f1a", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: "#FFD700" }}>PIP LEFT · AUDIO MONITOR</div>
          <button
            onClick={toggleMute}
            style={{ width: 42, height: 42, borderRadius: "50%", border: `2px solid ${muted ? "#E63000" : "#FFD700"}`, background: muted ? "rgba(230,48,0,0.15)" : "rgba(255,215,0,0.1)", color: muted ? "#E63000" : "#FFD700", fontSize: 16, cursor: "pointer" }}
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <button
            onClick={togglePushToTalk}
            style={{ fontSize: 9, fontWeight: 800, padding: "5px 10px", borderRadius: 6, border: `1px solid ${micLive ? "#E63000" : "rgba(255,255,255,0.2)"}`, background: micLive ? "rgba(230,48,0,0.2)" : "transparent", color: micLive ? "#E63000" : "rgba(255,255,255,0.6)", cursor: "pointer" }}
          >
            {micLive ? "🎙️ LIVE — TALKING" : "🎙️ PUSH TO TALK"}
          </button>
        </div>

        {/* PIP self-camera — PIP Right */}
        <div style={{ background: "#0f0f1a", border: "1px solid rgba(83,74,183,0.4)", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: "#AA2DFF" }}>PIP RIGHT · YOUR CAMERA</div>
          <div style={{ width: "100%", aspectRatio: "4/3", background: "#000", borderRadius: 6, overflow: "hidden", position: "relative" }}>
            {captureState === "error" ? (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                👤
              </div>
            ) : !cameraOn ? (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, background: "rgba(170,45,255,0.08)" }}>
                👤
              </div>
            ) : (
              <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>
          <ActionRail
            cameraOn={cameraOn}
            micOn={micLive}
            speakerOn={!muted}
            onToggleCamera={toggleCamera}
            onToggleMic={togglePushToTalk}
            onToggleSpeaker={toggleMute}
            onFullscreen={requestFullscreen}
            accentColor="#AA2DFF"
          />
          <button
            onClick={captureSnapshot}
            disabled={captureState !== "ready" || !cameraOn}
            style={{ fontSize: 9, fontWeight: 800, padding: "5px 10px", borderRadius: 6, border: "1px solid #AA2DFF66", background: "rgba(170,45,255,0.12)", color: "#AA2DFF", cursor: captureState === "ready" && cameraOn ? "pointer" : "default", opacity: captureState === "ready" && cameraOn ? 1 : 0.5 }}
          >
            {captureState === "saving" ? "Saving…" : captureState === "saved" ? "✓ Saved to Memory Wall" : "📸 Capture → Memory Wall"}
          </button>
        </div>
      </div>
    </div>
  );
}
