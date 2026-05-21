// apps/web/src/app/live/[roomId]/control/page.tsx
// Host control panel — lighting, rewards, prompts, mute, camera, ad breaks.
"use client";
import { useState } from "react";

const T = { void:"#0D0520", deep:"#150830", card:"#1E0D3E", raised:"#2A1452", gold:"#FFB800", cyan:"#00E5FF", pink:"#FF2D78", amber:"#FF8C00", teal:"#00C896", text:"#fff", text2:"#C8A8E8", text3:"#7A5F9A", display:"'Bebas Neue',Impact,sans-serif", heading:"'Oswald',sans-serif" };

const LIGHTING_PRESETS = ["standard","neon_purple","concert_white","battle_red","victory_gold","cypher_cyan","sponsor_spotlight","afterparty","dim_intimate","rainbow_party","strobe_hype","off_air"];

function ControlButton({ label, icon, color, onClick, disabled }: any) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "10px 14px", background: disabled ? T.raised : `${color}22`,
      border: `1px solid ${disabled ? "rgba(255,255,255,0.05)" : color}`,
      borderRadius: 8, fontFamily: T.heading, fontSize: 11, color: disabled ? T.text3 : color,
      cursor: disabled ? "not-allowed" : "pointer", letterSpacing: 1,
      display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
    }}>
      <span>{icon}</span> {label}
    </button>
  );
}

export default function HostControlPanel() {
  const [lighting, setLighting] = useState("standard");
  const [adBreakActive, setAdBreakActive] = useState(false);

  return (
    <div style={{ background: T.void, minHeight: "100vh", color: T.text, fontFamily: "Inter,sans-serif", padding: 24 }}>
      <div style={{ fontFamily: T.display, fontSize: 28, color: T.gold, letterSpacing: 2, marginBottom: 20 }}>HOST CONTROL ROOM</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>

        {/* LIGHTING */}
        <div style={{ background: T.card, border: `1px solid rgba(255,184,0,0.3)`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontFamily: T.heading, fontSize: 12, color: T.gold, letterSpacing: 1.5, marginBottom: 12 }}>💡 LIGHTING</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {LIGHTING_PRESETS.map(preset => (
              <button key={preset} onClick={() => setLighting(preset)} style={{
                padding: "5px 10px", background: lighting === preset ? T.gold : T.raised,
                border: `1px solid ${lighting === preset ? T.gold : "rgba(255,255,255,0.1)"}`,
                borderRadius: 6, fontFamily: T.heading, fontSize: 9, color: lighting === preset ? T.void : T.text2,
                cursor: "pointer", letterSpacing: 0.5,
              }}>{preset.replace("_"," ").toUpperCase()}</button>
            ))}
          </div>
        </div>

        {/* REWARDS */}
        <div style={{ background: T.card, border: `1px solid rgba(0,229,255,0.3)`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontFamily: T.heading, fontSize: 12, color: T.cyan, letterSpacing: 1.5, marginBottom: 12 }}>🎁 REWARDS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <ControlButton label="DROP RANDOM PRIZE" icon="🎲" color={T.cyan} onClick={() => {}} />
            <ControlButton label="FIRE TRIVIA PROMPT" icon="⚡" color={T.gold} onClick={() => {}} />
            <ControlButton label="MANUAL GIFT ITEM" icon="🎀" color={T.pink} onClick={() => {}} />
            <ControlButton label="SPONSOR DROP" icon="📢" color={T.amber} onClick={() => {}} />
          </div>
        </div>

        {/* BROADCAST */}
        <div style={{ background: T.card, border: `1px solid rgba(255,45,120,0.3)`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontFamily: T.heading, fontSize: 12, color: T.pink, letterSpacing: 1.5, marginBottom: 12 }}>📡 BROADCAST</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <ControlButton label={adBreakActive ? "END AD BREAK" : "START AD BREAK"} icon="📺" color={T.amber} onClick={() => setAdBreakActive(!adBreakActive)} />
            <ControlButton label="SHOW LOWER THIRD" icon="📝" color={T.cyan} onClick={() => {}} />
            <ControlButton label="CROWN REVEAL" icon="👑" color={T.gold} onClick={() => {}} />
            <ControlButton label="FIREWORKS 🎆" icon="✨" color={T.pink} onClick={() => {}} />
          </div>
        </div>

        {/* ROOM */}
        <div style={{ background: T.card, border: `1px solid rgba(0,200,150,0.3)`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontFamily: T.heading, fontSize: 12, color: T.teal, letterSpacing: 1.5, marginBottom: 12 }}>🏠 ROOM</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <ControlButton label="MUTE USER" icon="🔇" color={T.amber} onClick={() => {}} />
            <ControlButton label="REMOVE USER" icon="🚪" color={T.pink} onClick={() => {}} />
            <ControlButton label="PIN MESSAGE" icon="📌" color={T.cyan} onClick={() => {}} />
            <ControlButton label="CROWD WAVE" icon="🌊" color={T.teal} onClick={() => {}} />
          </div>
        </div>

        {/* GAME CONTROLS */}
        <div style={{ background: T.card, border: `1px solid rgba(123,47,190,0.3)`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontFamily: T.heading, fontSize: 12, color: T.purple, letterSpacing: 1.5, marginBottom: 12 }}>🎮 GAME</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <ControlButton label="START ROUND" icon="▶️" color={T.teal} onClick={() => {}} />
            <ControlButton label="END ROUND" icon="⏹️" color={T.amber} onClick={() => {}} />
            <ControlButton label="ANNOUNCE WINNER" icon="🏆" color={T.gold} onClick={() => {}} />
            <ControlButton label="CHANGE PERSONALITY" icon="🎙️" color={T.purple} onClick={() => {}} />
          </div>
        </div>

        {/* EMERGENCY */}
        <div style={{ background: T.card, border: `1px solid rgba(255,32,32,0.4)`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontFamily: T.heading, fontSize: 12, color: "#FF2020", letterSpacing: 1.5, marginBottom: 12 }}>🚨 EMERGENCY</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <ControlButton label="END SHOW" icon="⏹️" color="#FF2020" onClick={() => {}} />
            <ControlButton label="STANDBY MODE" icon="📡" color={T.amber} onClick={() => {}} />
            <ControlButton label="LOCK ROOM" icon="🔒" color="#FF2020" onClick={() => {}} />
          </div>
        </div>

      </div>
    </div>
  );
}
