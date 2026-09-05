"use client";

import { useState } from "react";
import {
  RehearsalAudioEngine,
  type LocalMonitorMix,
  type RehearsalAudioProfile,
} from "@/lib/audio/RehearsalAudioEngine";

export type PerformerRoomMode =
  | "SOCIAL"
  | "PRIVATE_MEETING"
  | "REHEARSAL"
  | "BAND_PRACTICE"
  | "AUDITION"
  | "BACKROOM_SESSION"
  | "LISTENING_SESSION"
  | "GREEN_ROOM";

export type PerformerLobbyTheme =
  | "RECORDING_STUDIO"
  | "LUXURY_PENTHOUSE"
  | "REHEARSAL_WAREHOUSE"
  | "GREEN_ROOM_SUITE"
  | "GARAGE_PRACTICE"
  | "ARENA_REHEARSAL_HALL"
  | "JAZZ_LOUNGE"
  | "PRODUCER_LAB";

export type VideoPanelSkin =
  | "GLASS_LUXURY"
  | "GOLD_FRAME"
  | "PLATINUM_FRAME"
  | "DIAMOND_FRAME"
  | "STUDIO_MONITOR"
  | "RETRO_CRT"
  | "STAGE_SPEAKER";

export interface PerformerPanel {
  id: string;
  performerName: string;
  role: string;
  posX: number;
  posY: number; // floating presentation height (e.g. 1.5m)
  posZ: number;
  skin: VideoPanelSkin;
  isPerforming?: boolean;
}

const INITIAL_PANELS: PerformerPanel[] = [
  { id: "perf-1", performerName: "Bobby (Lead Vocals)", role: "VOCALIST", posX: -2, posY: 1.6, posZ: 3, skin: "PLATINUM_FRAME", isPerforming: true },
  { id: "perf-2", performerName: "Marcus (Drums)", role: "DRUMMER", posX: 2, posY: 1.5, posZ: 4, skin: "STUDIO_MONITOR" },
  { id: "perf-3", performerName: "Elena (Keys/Synth)", role: "KEYBOARDIST", posX: 0, posY: 1.6, posZ: 2, skin: "GLASS_LUXURY" },
];

export interface PerformerSpatialLoungeProps {
  roomId: string;
  roomTitle?: string;
}

export default function PerformerSpatialLounge({
  roomId,
  roomTitle = "Performer Rehearsal & Backroom Lounge",
}: PerformerSpatialLoungeProps) {
  const [roomMode, setRoomMode] = useState<PerformerRoomMode>("REHEARSAL");
  const [lobbyTheme, setLobbyTheme] = useState<PerformerLobbyTheme>("RECORDING_STUDIO");
  const [activeSkin, setActiveSkin] = useState<VideoPanelSkin>("PLATINUM_FRAME");
  const [panels, setPanels] = useState<PerformerPanel[]>(INITIAL_PANELS);
  const [audioProfile, setAudioProfileState] = useState<RehearsalAudioProfile>("VOCAL_REHEARSAL");
  const [talkbackActive, setTalkbackActive] = useState(false);
  const [monitorMix, setMonitorMix] = useState<LocalMonitorMix>(RehearsalAudioEngine.getLocalMix());
  const [showMixDrawer, setShowMixDrawer] = useState(false);

  const handleProfileChange = (p: RehearsalAudioProfile) => {
    setAudioProfileState(p);
    RehearsalAudioEngine.setProfile(p);
  };

  const handleTalkbackToggle = () => {
    const next = !talkbackActive;
    setTalkbackActive(next);
    RehearsalAudioEngine.setTalkback(next);
  };

  const handleSliderChange = (key: keyof LocalMonitorMix, val: number) => {
    const updated = RehearsalAudioEngine.updateLocalMix({ [key]: val });
    setMonitorMix(updated);
  };

  const movePanel = (id: string, dx: number, dz: number) => {
    setPanels((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, posX: p.posX + dx, posZ: p.posZ + dz } : p
      )
    );
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "min(600px, 80vh)",
        borderRadius: 20,
        overflow: "hidden",
        border: "1.5px solid rgba(0,255,255,0.4)",
        background: "radial-gradient(ellipse at center, #0b0b24 0%, #03030d 100%)",
        boxShadow: "0 0 40px rgba(0,255,255,0.15)",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* TOP CONTROL RAIL */}
      <div
        style={{
          padding: "14px 20px",
          background: "rgba(6,6,20,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          zIndex: 20,
        }}
      >
        <div>
          <div style={{ fontSize: 9, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.14em" }}>
            PERFORMER LOBBY & REHEARSAL SYSTEM (ZERO AVATARS · LIVE WEBRTC PANELS ONLY)
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", marginTop: 2 }}>{roomTitle}</div>
        </div>

        {/* Room Mode Selector */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <select
            value={roomMode}
            onChange={(e) => setRoomMode(e.target.value as PerformerRoomMode)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              background: "rgba(255,45,170,0.15)",
              border: "1px solid #FF2DAA",
              color: "#FF2DAA",
              fontSize: 10,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            <option value="SOCIAL">SOCIAL HANGOUT</option>
            <option value="PRIVATE_MEETING">PRIVATE MEETING</option>
            <option value="REHEARSAL">REHEARSAL</option>
            <option value="BAND_PRACTICE">BAND PRACTICE</option>
            <option value="AUDITION">AUDITION</option>
            <option value="BACKROOM_SESSION">BACKROOM SESSION</option>
            <option value="LISTENING_SESSION">LISTENING SESSION</option>
            <option value="GREEN_ROOM">GREEN ROOM</option>
          </select>

          {/* Theme Selector */}
          <select
            value={lobbyTheme}
            onChange={(e) => setLobbyTheme(e.target.value as PerformerLobbyTheme)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              background: "rgba(0,255,255,0.15)",
              border: "1px solid #00FFFF",
              color: "#00FFFF",
              fontSize: 10,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            <option value="RECORDING_STUDIO">RECORDING STUDIO</option>
            <option value="LUXURY_PENTHOUSE">LUXURY PENTHOUSE</option>
            <option value="REHEARSAL_WAREHOUSE">REHEARSAL WAREHOUSE</option>
            <option value="GREEN_ROOM_SUITE">GREEN ROOM SUITE</option>
            <option value="GARAGE_PRACTICE">GARAGE PRACTICE</option>
            <option value="ARENA_REHEARSAL_HALL">ARENA REHEARSAL HALL</option>
            <option value="JAZZ_LOUNGE">JAZZ LOUNGE</option>
            <option value="PRODUCER_LAB">PRODUCER LAB</option>
          </select>

          <button
            type="button"
            onClick={() => setShowMixDrawer((v) => !v)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              background: "rgba(255,215,0,0.15)",
              border: "1px solid #FFD700",
              color: "#FFD700",
              fontSize: 10,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            🎛️ MONITOR MIX
          </button>
        </div>
      </div>

      {/* 3D SPATIAL PERFORMER VIEWPORT (FREE-ROAMING WEBRTC PANELS) */}
      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
        {/* Floor Navigation Plane Grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(0,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            opacity: 0.5,
          }}
        />

        {/* Free-Roaming Live WebRTC Video Panels */}
        {panels.map((p) => {
          const isMe = p.id === "perf-1";
          return (
            <div
              key={p.id}
              style={{
                position: "absolute",
                top: `${40 + p.posZ * 6}%`,
                left: `${50 + p.posX * 12}%`,
                transform: "translate(-50%, -50%)",
                width: p.isPerforming ? 220 : 160,
                aspectRatio: "16/9",
                borderRadius: 14,
                border: p.isPerforming ? "2px solid #FFD700" : "1.5px solid #00FFFF",
                background: "#000",
                boxShadow: p.isPerforming ? "0 0 24px rgba(255,215,0,0.4)" : "0 0 16px rgba(0,255,255,0.2)",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: 8,
                zIndex: p.isPerforming ? 10 : 5,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 8, fontWeight: 900, color: p.isPerforming ? "#FFD700" : "#00FFFF" }}>
                  {p.role}
                </span>
                <span style={{ fontSize: 7, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
                  Y={p.posY}m (Panel)
                </span>
              </div>

              <div style={{ textAlign: "center", fontSize: 10, fontWeight: 800, color: "#fff" }}>
                {p.performerName}
              </div>

              {/* Free-roam Movement Controls for User Panel */}
              {isMe && (
                <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                  <button type="button" onClick={() => movePanel(p.id, -0.5, 0)} style={navBtn}>◀</button>
                  <button type="button" onClick={() => movePanel(p.id, 0, -0.5)} style={navBtn}>▲</button>
                  <button type="button" onClick={() => movePanel(p.id, 0, 0.5)} style={navBtn}>▼</button>
                  <button type="button" onClick={() => movePanel(p.id, 0.5, 0)} style={navBtn}>▶</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MONITOR MIX & REHEARSAL AUDIO DRAWER */}
      {showMixDrawer && (
        <div
          style={{
            padding: 16,
            background: "rgba(8,8,24,0.95)",
            backdropFilter: "blur(16px)",
            borderTop: "1px solid rgba(0,255,255,0.3)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            zIndex: 30,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: "#FFD700", letterSpacing: "0.1em" }}>
              REHEARSAL AUDIO ENGINE & LOCAL MONITOR MIX
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <select
                value={audioProfile}
                onChange={(e) => handleProfileChange(e.target.value as RehearsalAudioProfile)}
                style={{
                  padding: "4px 8px",
                  borderRadius: 6,
                  background: "rgba(0,255,136,0.15)",
                  border: "1px solid #00FF88",
                  color: "#00FF88",
                  fontSize: 9,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                <option value="VOCAL_REHEARSAL">VOCAL REHEARSAL</option>
                <option value="FULL_BAND">FULL BAND (SAFETY LIMITER)</option>
                <option value="ACOUSTIC_REHEARSAL">ACOUSTIC</option>
                <option value="MEETING">MEETING (SPEECH DUCK)</option>
              </select>

              <button
                type="button"
                onClick={handleTalkbackToggle}
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  background: talkbackActive ? "rgba(255,68,102,0.25)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${talkbackActive ? "#FF4466" : "rgba(255,255,255,0.2)"}`,
                  color: talkbackActive ? "#FF4466" : "#fff",
                  fontSize: 9,
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                {talkbackActive ? "🎙 TALKBACK ACTIVE (DUCKING ON)" : "🎙 TALKBACK OFF"}
              </button>
            </div>
          </div>

          {/* Slider Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 12 }}>
            {(["me", "band", "backingTrack", "talkback", "room"] as const).map((key) => (
              <div key={key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>
                  {key} ({monitorMix[key]}%)
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={monitorMix[key]}
                  onChange={(e) => handleSliderChange(key, Number(e.target.value))}
                  style={{ accentColor: "#00FFFF", cursor: "pointer" }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const navBtn: React.CSSProperties = {
  width: 18,
  height: 18,
  borderRadius: 4,
  border: "1px solid rgba(0,255,255,0.4)",
  background: "rgba(0,255,255,0.15)",
  color: "#00FFFF",
  fontSize: 8,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
