"use client";

import { useEffect, useRef, useState } from "react";
import MotionPosterPlayer from "@/components/media/MotionPosterPlayer";
import BillboardLiveWall from "@/components/media/BillboardLiveWall";
import UnifiedAdSlot from "@/components/ads/UnifiedAdSlot";
import ActionRail from "@/components/canisters/ActionRail";
import AudienceScene from "@/components/live/AudienceScene";
import { shouldShowAd, type MembershipTier } from "@/lib/commerce/AdFrequencyEngine";

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
  /** Viewer's membership tier — governs how often the ad rail actually
   *  shows an ad (FREE/PRO always, DIAMOND "once in a blue moon"). Defaults
   *  to FREE so callers that don't pass it get today's existing behavior. */
  viewerTier?: MembershipTier;
  /** Audience Visibility Rule v4: performer/host surfaces must show a live
   *  Audience Monitor the instant they go live — pass true for Performer Hub,
   *  Producer HQ, host-facing surfaces. Fan-facing surfaces can omit it. */
  showAudienceMonitor?: boolean;
  /** Optional real-time fan entry events from live registry telemetry. */
  audienceEntryEvents?: AudienceEntryEvent[];
  /** Optional country distribution from live registry telemetry. */
  audienceCountryDistribution?: AudienceCountrySlice[];
  /** Enables pulse overlays without forcing the audience monitor itself on. */
  showAudiencePulse?: boolean;
}

type MainMode = "feed" | "lobbyWall";

interface AudienceEntryEvent {
  id: string;
  at: number;
  countryCode: string;
  countryName: string;
  viewerCount: number;
}

interface AudienceCountrySlice {
  countryCode: string;
  countryName: string;
  count: number;
}

const AUDIENCE_MILESTONES = [1, 5, 10, 25, 50, 100, 250, 500, 1000] as const;

function countryCodeToFlag(countryCode: string): string {
  const code = countryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "🏳️";
  const base = 127397;
  return String.fromCodePoint(...code.split("").map((c) => base + c.charCodeAt(0)));
}

function resolveEnergyState(audienceCount: number): { label: string; color: string } {
  if (audienceCount >= 500) return { label: "Frenzy", color: "#FF2DAA" };
  if (audienceCount >= 100) return { label: "Electric", color: "#FFD700" };
  if (audienceCount >= 25) return { label: "Building", color: "#00FFFF" };
  if (audienceCount >= 5) return { label: "Warming", color: "#00FF88" };
  return { label: "Calm", color: "rgba(255,255,255,0.65)" };
}

function resolveEvolutionProgress(audienceCount: number): { previous: number; next: number; progressPct: number } {
  const current = Math.max(0, audienceCount);
  const previous = [...AUDIENCE_MILESTONES].reverse().find((n) => n <= current) ?? 0;
  const next = AUDIENCE_MILESTONES.find((n) => n > current) ?? AUDIENCE_MILESTONES[AUDIENCE_MILESTONES.length - 1];
  if (next <= previous) return { previous, next, progressPct: 100 };
  const ratio = (current - previous) / (next - previous);
  return { previous, next, progressPct: Math.max(0, Math.min(100, ratio * 100)) };
}

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
  viewerTier = "FREE",
  audienceEntryEvents,
  audienceCountryDistribution,
  showAudiencePulse,
}: MonitorSatelliteSystemProps) {
  const [mainMode, setMainMode] = useState<MainMode>("feed");
  // Rolled once per mount, not per render, so the ad doesn't flicker in/out
  // on unrelated state changes (mute toggle, capture state, etc.).
  const [showAdThisSession] = useState(() => shouldShowAd(viewerTier));
  const [muted, setMuted] = useState(false);
  const [micLive, setMicLive] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [captureState, setCaptureState] = useState<"idle" | "ready" | "saving" | "saved" | "error">("idle");
  const [arrivalToasts, setArrivalToasts] = useState<AudienceEntryEvent[]>([]);
  const [milestoneToast, setMilestoneToast] = useState<{ milestone: number; audienceCount: number } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastAudienceCountRef = useRef(audienceCount ?? 0);
  const reachedMilestonesRef = useRef<Set<number>>(new Set());
  const seenArrivalIdsRef = useRef<Set<string>>(new Set());

  const shouldShowPulse = showAudiencePulse ?? showAudienceMonitor;

  useEffect(() => {
    if (!shouldShowPulse) return;
    const current = audienceCount ?? 0;
    const previous = lastAudienceCountRef.current;
    lastAudienceCountRef.current = current;
    if (!isLive || current <= previous) return;

    const nextSyntheticEntries: AudienceEntryEvent[] = [];
    const increase = Math.min(3, current - previous);
    for (let i = 0; i < increase; i += 1) {
      nextSyntheticEntries.push({
        id: `count-${Date.now()}-${i}`,
        at: Date.now(),
        countryCode: "ZZ",
        countryName: "Unknown",
        viewerCount: current,
      });
    }
    if (nextSyntheticEntries.length > 0) {
      setArrivalToasts((prev) => [...nextSyntheticEntries, ...prev].slice(0, 4));
    }
  }, [audienceCount, isLive, shouldShowPulse]);

  useEffect(() => {
    if (!shouldShowPulse || !audienceEntryEvents || audienceEntryEvents.length === 0) return;
    const fresh = audienceEntryEvents
      .slice()
      .sort((a, b) => b.at - a.at)
      .filter((entry) => {
        if (seenArrivalIdsRef.current.has(entry.id)) return false;
        seenArrivalIdsRef.current.add(entry.id);
        return true;
      })
      .slice(0, 4);

    if (fresh.length > 0) {
      setArrivalToasts((prev) => [...fresh, ...prev].slice(0, 4));
    }
  }, [audienceEntryEvents, shouldShowPulse]);

  useEffect(() => {
    if (!shouldShowPulse) return;
    if (!milestoneToast) return;
    const id = window.setTimeout(() => setMilestoneToast(null), 2500);
    return () => window.clearTimeout(id);
  }, [milestoneToast, shouldShowPulse]);

  useEffect(() => {
    if (!shouldShowPulse) return;
    const current = audienceCount ?? 0;
    const reached = AUDIENCE_MILESTONES.filter((m) => current >= m && !reachedMilestonesRef.current.has(m));
    if (reached.length === 0) return;
    const newest = reached[reached.length - 1]!;
    reached.forEach((m) => reachedMilestonesRef.current.add(m));
    setMilestoneToast({ milestone: newest, audienceCount: current });
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tmi:audience-pulse-milestone", {
          detail: { milestone: newest, audienceCount: current },
        }),
      );
    }
  }, [audienceCount, shouldShowPulse]);

  useEffect(() => {
    if (arrivalToasts.length === 0) return;
    const id = window.setTimeout(() => {
      setArrivalToasts((prev) => prev.slice(0, -1));
    }, 2800);
    return () => window.clearTimeout(id);
  }, [arrivalToasts]);

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

  const effectiveAudienceCount = audienceCount ?? 0;
  const topCountries = (audienceCountryDistribution ?? []).slice(0, 5);
  const energy = resolveEnergyState(effectiveAudienceCount);
  const evolution = resolveEvolutionProgress(effectiveAudienceCount);

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
        {!isLive && mainMode === "feed" && showAdThisSession && (
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
        <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid rgba(0,255,255,0.3)", position: "relative" }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: accentColor, padding: "8px 12px", background: "#0f0f1a" }}>
            👥 AUDIENCE MONITOR {audienceCount != null ? `· ${audienceCount.toLocaleString()} WATCHING` : ""}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)", overflowX: "auto" }}>
            {topCountries.length > 0 ? (
              topCountries.map((country) => (
                <div key={country.countryCode} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(5,5,16,0.55)", fontSize: 9, whiteSpace: "nowrap" }}>
                  <span>{countryCodeToFlag(country.countryCode)}</span>
                  <span style={{ color: "rgba(255,255,255,0.78)" }}>{country.countryName}</span>
                  <span style={{ color: accentColor, fontWeight: 800 }}>{country.count}</span>
                </div>
              ))
            ) : (
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>No audience country signals yet</span>
            )}
          </div>
          <AudienceScene view="performer" venue={0} watcherCount={audienceCount ?? 0} bpm={120} accentColor={accentColor} occupancyRatio={isLive ? Math.min(1, (audienceCount ?? 0) / 200 || 0.3) : 0} hideControls />
          {shouldShowPulse && (
            <>
              {milestoneToast && (
                <div style={{ position: "absolute", top: 56, right: 14, zIndex: 3, borderRadius: 10, border: "1px solid rgba(255,215,0,0.45)", background: "rgba(5,5,16,0.92)", padding: "8px 10px", boxShadow: "0 0 16px rgba(255,215,0,0.2)", textAlign: "right" }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.12em", color: "#FFD700", fontWeight: 900 }}>MILESTONE HIT</div>
                  <div style={{ fontSize: 13, color: "#fff", fontWeight: 900 }}>{milestoneToast.milestone.toLocaleString()} LIVE</div>
                </div>
              )}

              <div style={{ position: "absolute", right: 8, top: 118, bottom: 56, width: 36, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <div style={{ width: 12, height: "100%", borderRadius: 999, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.5)", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <div style={{ height: `${evolution.progressPct}%`, background: `linear-gradient(180deg, ${accentColor}, #FF2DAA)`, boxShadow: `0 0 10px ${accentColor}55` }} />
                </div>
                <div style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%) rotate(90deg)", transformOrigin: "right center", fontSize: 8, letterSpacing: "0.12em", color: "rgba(255,255,255,0.65)", whiteSpace: "nowrap" }}>
                  EVOLUTION {evolution.previous} → {evolution.next}
                </div>
              </div>

              <div style={{ position: "absolute", left: 10, bottom: 12, zIndex: 3, display: "grid", gap: 6, maxWidth: 240 }}>
                {arrivalToasts.map((entry) => (
                  <div key={entry.id} style={{ borderRadius: 8, border: "1px solid rgba(0,255,255,0.35)", background: "rgba(5,5,16,0.86)", padding: "6px 8px", fontSize: 10, boxShadow: "0 0 14px rgba(0,255,255,0.12)" }}>
                    <span>{countryCodeToFlag(entry.countryCode)}</span>
                    <span style={{ marginLeft: 6, color: "#fff", fontWeight: 700 }}>{entry.countryName}</span>
                    <span style={{ marginLeft: 6, color: "rgba(255,255,255,0.65)", fontSize: 9 }}>joined · {entry.viewerCount.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div style={{ position: "absolute", bottom: 12, right: 54, zIndex: 3, borderRadius: 999, border: `1px solid ${energy.color}66`, background: "rgba(5,5,16,0.88)", padding: "4px 10px", fontSize: 9, color: energy.color, fontWeight: 900, letterSpacing: "0.08em" }}>
                CROWD ENERGY · {energy.label}
              </div>
            </>
          )}
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
