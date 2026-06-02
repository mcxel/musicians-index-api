"use client";
import { useState } from "react";
import JudgeInterface from "@/components/battles/JudgeInterface";
import { HubBackNav } from "@/components/nav/HubBackNav";
import NeonWaveUnderlay from "@/components/atmosphere/NeonWaveUnderlay";

export default function BattleJudgePage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#050510", minHeight: "100vh", position: "relative" }}>
      <NeonWaveUnderlay colorA="#FFD700" colorB="#FF2DAA" colorC="#AA2DFF" opacity={0.07} zIndex={0} />

      {/* Nav */}
      <div style={{ position: "relative", zIndex: 2, background: "rgba(0,0,0,0.75)", borderBottom: "1px solid rgba(255,215,0,0.2)", padding: "10px 24px", display: "flex", alignItems: "center", gap: 14, backdropFilter: "blur(12px)" }}>
        <HubBackNav accentColor="#FFD700" />
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", color: "#FFD700", textTransform: "uppercase" }}>⚖️ JUDGE PANEL</span>
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "40px auto", padding: "0 20px 60px" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.22em", color: "#FFD700", fontWeight: 900 }}>BATTLE JUDGING SYSTEM</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginTop: 4 }}>Rate Each Contestant</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Score 1–10 per criterion. Your scorecard is combined with other judges after the battle ends.</div>
        </div>

        <JudgeInterface
          battleId="battle-demo-001"
          contestants={[
            { id: "nova-cipher", name: "Nova Cipher", emoji: "🎤", color: "#AA2DFF" },
            { id: "echo-vee",    name: "Echo Vee",    emoji: "⚡", color: "#00FF88" },
          ]}
          judgeId="judge-001"
          judgeName="Official Judge"
          accentColor="#FFD700"
        />
      </div>
    </div>
  );
}
