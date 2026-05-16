"use client";

import Link from "next/link";
import LobbyStageViewport from "@/components/lobbies/LobbyStageViewport";
import type { SharedStageRoomData } from "./useSharedStageRoomData";

type InteractiveAudienceHUDProps = {
  roomId: string;
  data: SharedStageRoomData;
};

function roomRules(type: SharedStageRoomData["roomType"]): string {
  if (type === "battle") return "Battle chat: keep bars clean, no spam, no hate.";
  if (type === "cypher") return "Cypher chat: callouts + reactions, no personal attacks.";
  if (type === "game") return "Game chat: short answers only, one guess per turn.";
  return "Concert chat: support performers, no harassment, no spam.";
}

export default function InteractiveAudienceHUD({ roomId, data }: InteractiveAudienceHUDProps) {
  const performerName = roomId.replace(/-/g, " ").toUpperCase();

  return (
    <section style={{ display: "grid", gap: 12 }} aria-label="Interactive Audience HUD">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9f7cf2", fontWeight: 800 }}>
          InteractiveAudienceHUD
        </div>
        <button
          type="button"
          style={{
            padding: "8px 11px",
            borderRadius: 8,
            border: "1px solid rgba(0,255,255,0.45)",
            background: "rgba(0,255,255,0.12)",
            color: "#BFFFFF",
            fontSize: 11,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            cursor: "pointer",
          }}
        >
          🎲 Smart Jump
        </button>
      </div>

      <LobbyStageViewport
        roomName={roomId}
        performerName={performerName}
        isLive={data.stageState === "live"}
        activeUsers={data.presence.occupancy}
        fanCount={data.members.length}
        queueDepth={data.queueCount}
        occupancyPercent={Math.min(100, Math.round((data.presence.occupancy / 12) * 100))}
        reactionPulseId={data.emojiTrail.length}
        hypePulseId={data.population.heatLevel}
      />

      <div style={{ border: "1px solid rgba(255,255,255,0.16)", borderRadius: 12, padding: 12, background: "rgba(255,255,255,0.04)" }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
          Seat Lens Controls
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" onClick={data.triggerHype} style={{ padding: "8px 11px", borderRadius: 8, border: "1px solid rgba(0,255,255,0.5)", background: "rgba(0,255,255,0.12)", color: "#BFFFFF", fontWeight: 700, cursor: "pointer" }}>Throw Hype</button>
          <button type="button" onClick={data.triggerTip} style={{ padding: "8px 11px", borderRadius: 8, border: "1px solid rgba(255,215,0,0.5)", background: "rgba(255,215,0,0.12)", color: "#FFE28B", fontWeight: 700, cursor: "pointer" }}>Send Tip</button>
          <button type="button" style={{ padding: "8px 11px", borderRadius: 8, border: "1px solid rgba(255,45,170,0.5)", background: "rgba(255,45,170,0.12)", color: "#FFB8E6", fontWeight: 700, cursor: "pointer" }}>Open Magazine</button>
          <button type="button" style={{ padding: "8px 11px", borderRadius: 8, border: "1px solid rgba(170,45,255,0.5)", background: "rgba(170,45,255,0.12)", color: "#D6B8FF", fontWeight: 700, cursor: "pointer" }}>After-show Discussion</button>
        </div>
      </div>

      <div style={{ border: "1px solid rgba(255,255,255,0.16)", borderRadius: 12, padding: 12, background: "rgba(255,255,255,0.04)" }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
          LiveActionJunction
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
          <Link href="/rooms/live/battle-wall" style={{ border: "1px solid rgba(255,59,59,0.45)", borderRadius: 10, padding: "10px 12px", color: "#ff9f9f", textDecoration: "none", fontWeight: 700, fontSize: 12 }}>Battle · Quick Join</Link>
          <Link href="/rooms/live/cypher-arena" style={{ border: "1px solid rgba(0,255,255,0.45)", borderRadius: 10, padding: "10px 12px", color: "#bfffff", textDecoration: "none", fontWeight: 700, fontSize: 12 }}>Cypher · Quick Join</Link>
          <Link href="/rooms/live/monday-night-stage" style={{ border: "1px solid rgba(255,215,0,0.45)", borderRadius: 10, padding: "10px 12px", color: "#ffe28b", textDecoration: "none", fontWeight: 700, fontSize: 12 }}>Concert · Quick Join</Link>
          <Link href="/rooms/live/trivia-show" style={{ border: "1px solid rgba(170,45,255,0.45)", borderRadius: 10, padding: "10px 12px", color: "#d6b8ff", textDecoration: "none", fontWeight: 700, fontSize: 12 }}>Game · Quick Join</Link>
        </div>
      </div>

      <div style={{ border: "1px solid rgba(255,255,255,0.16)", borderRadius: 12, padding: 12, background: "rgba(255,255,255,0.04)" }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 700 }}>Chat Rules</div>
        <div style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{roomRules(data.roomType)}</div>
      </div>
    </section>
  );
}
