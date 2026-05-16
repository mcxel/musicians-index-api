"use client";

import { useState } from "react";
import Link from "next/link";
import TmiPerformerMonitorWindow from "@/components/video/TmiPerformerMonitorWindow";
import TmiFanViewerWindow from "@/components/video/TmiFanViewerWindow";
import TmiAudienceReactionGrid from "@/components/video/TmiAudienceReactionGrid";
import { pushPerformerFeed } from "@/lib/video/tmiLivePerformerFeedBridge";
import { getWallState, injectArtistPromo } from "@/lib/video/VideoWallSyncEngine";

const WALL_ID = "camera-studio";

const ROOM_ID = "studio-main";
const PERFORMER_ID = "performer-demo";

type CameraMode = "off" | "standby" | "live";

export default function CameraStudioPage() {
  const [mode, setMode] = useState<CameraMode>("off");
  const [audienceCount, setAudienceCount] = useState(0);
  const [reactionIntensity, setReactionIntensity] = useState(0);
  const [wallSlots, setWallSlots] = useState(() => getWallState(WALL_ID)?.queue.length ?? 0);

  function goLive() {
    pushPerformerFeed({
      performerId: PERFORMER_ID,
      roomId: ROOM_ID,
      isLive: true,
      audienceCount: 142,
      reactionIntensity: 0.6,
    });
    setMode("live");
    setAudienceCount(142);
    setReactionIntensity(0.6);
  }

  function goStandby() {
    pushPerformerFeed({
      performerId: PERFORMER_ID,
      roomId: ROOM_ID,
      isLive: false,
      audienceCount: 0,
      reactionIntensity: 0,
    });
    setMode("standby");
    setAudienceCount(0);
    setReactionIntensity(0);
  }

  function goOff() {
    setMode("off");
    setAudienceCount(0);
    setReactionIntensity(0);
  }

  function queueWallContent() {
    injectArtistPromo(WALL_ID, {
      artistName: "Studio Session Live",
      tagline: "Performer is on-air now",
      artistId: PERFORMER_ID,
      ctaRoute: "/camera",
    });
    setWallSlots(s => s + 1);
  }

  const modeColor = mode === "live" ? "#00FF88" : mode === "standby" ? "#FFD700" : "rgba(255,255,255,0.2)";
  const modeLabel = mode === "live" ? "LIVE" : mode === "standby" ? "STANDBY" : "OFF";

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: "1px solid rgba(0,255,255,0.1)", background: "rgba(0,0,0,0.5)" }}>
        <Link href="/performer" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← Performer Hub</Link>
        <div style={{ flex: 1, textAlign: "center" }}>
          <span style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 800 }}>CAMERA STUDIO</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: modeColor, boxShadow: mode === "live" ? `0 0 8px ${modeColor}` : "none", display: "inline-block" }} />
          <span style={{ fontSize: 9, color: modeColor, fontWeight: 700 }}>{modeLabel}</span>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 8, fontSize: 9, letterSpacing: "0.4em", color: "#AA2DFF", fontWeight: 800 }}>TMI CAMERA RUNTIME</div>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900, marginBottom: 6 }}>Camera Studio</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>
          Performer video control surface. Go live, manage your feed, monitor audience reactions.
        </p>

        {/* Camera viewport */}
        <div style={{ position: "relative", background: "#000", borderRadius: 16, overflow: "hidden", border: `2px solid ${modeColor}40`, marginBottom: 24, aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            {mode === "off" && (
              <>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Camera off</div>
              </>
            )}
            {mode === "standby" && (
              <>
                <div style={{ fontSize: 48, marginBottom: 12 }}>⏸️</div>
                <div style={{ fontSize: 12, color: "#FFD700" }}>STANDBY — not broadcasting</div>
              </>
            )}
            {mode === "live" && (
              <>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#00FF88" }}>YOU ARE LIVE</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>{audienceCount.toLocaleString()} watching</div>
              </>
            )}
          </div>
          {mode === "live" && (
            <div style={{ position: "absolute", top: 12, left: 12, background: "#FF2DAA", color: "#fff", fontSize: 8, fontWeight: 900, letterSpacing: "0.15em", padding: "3px 10px", borderRadius: 4 }}>
              ● LIVE
            </div>
          )}
          {mode !== "off" && (
            <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(0,0,0,0.7)", borderRadius: 8, padding: "6px 10px" }}>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>Room: {ROOM_ID}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>Performer: {PERFORMER_ID}</div>
            </div>
          )}
        </div>

        {/* Control buttons */}
        <div style={{ display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap" }}>
          <button onClick={goLive} disabled={mode === "live"} style={{ padding: "11px 28px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: mode === "live" ? "rgba(0,255,136,0.3)" : "#00FF88", border: "none", borderRadius: 8, cursor: mode === "live" ? "not-allowed" : "pointer" }}>
            GO LIVE
          </button>
          <button onClick={goStandby} disabled={mode === "off"} style={{ padding: "11px 28px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: mode === "standby" ? "#050510" : "#FFD700", background: mode === "standby" ? "#FFD700" : "transparent", border: "1px solid rgba(255,215,0,0.5)", borderRadius: 8, cursor: mode === "off" ? "not-allowed" : "pointer" }}>
            STANDBY
          </button>
          <button onClick={goOff} disabled={mode === "off"} style={{ padding: "11px 28px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, cursor: mode === "off" ? "not-allowed" : "pointer" }}>
            END BROADCAST
          </button>
          <button onClick={queueWallContent} style={{ padding: "11px 28px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#AA2DFF", background: "transparent", border: "1px solid rgba(170,45,255,0.4)", borderRadius: 8, cursor: "pointer", marginLeft: "auto" }}>
            PUSH TO VIDEO WALL ({wallSlots})
          </button>
        </div>

        {/* Stats bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 32 }}>
          {[
            { label: "AUDIENCE", value: audienceCount.toLocaleString(), color: "#00FFFF" },
            { label: "INTENSITY", value: `${Math.round(reactionIntensity * 100)}%`, color: "#FF2DAA" },
            { label: "WALL QUEUE", value: wallSlots, color: "#AA2DFF" },
            { label: "STATUS", value: modeLabel, color: modeColor },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color }}>{value}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Video engine panels */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, marginBottom: 24 }}>
          <TmiPerformerMonitorWindow performerId={PERFORMER_ID} roomId={ROOM_ID} />
          <TmiFanViewerWindow performerId={PERFORMER_ID} roomId={ROOM_ID} watching={mode === "live"} />
        </div>

        <TmiAudienceReactionGrid roomId={ROOM_ID} />

        {/* Navigation */}
        <div style={{ marginTop: 28, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/performers/dashboard" style={{ fontSize: 10, color: "#00FFFF", textDecoration: "none", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 8, padding: "9px 16px" }}>Performer Dashboard</Link>
          <Link href="/rooms" style={{ fontSize: 10, color: "#AA2DFF", textDecoration: "none", border: "1px solid rgba(170,45,255,0.2)", borderRadius: 8, padding: "9px 16px" }}>My Rooms</Link>
          <Link href="/live" style={{ fontSize: 10, color: "#00FF88", textDecoration: "none", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 8, padding: "9px 16px" }}>Live Schedule</Link>
        </div>
      </div>
    </main>
  );
}
