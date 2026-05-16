"use client";

import LobbyStageViewport from "@/components/lobbies/LobbyStageViewport";
import JuliusMascot from "@/components/mascot/JuliusMascot";
import { useJulius } from "@/hooks/useJulius";
import type { SharedStageRoomData } from "./useSharedStageRoomData";

type PerformerStageConsoleProps = {
  roomId: string;
  data: SharedStageRoomData;
};

export default function PerformerStageConsole({ roomId, data }: PerformerStageConsoleProps) {
  const { juliusState, triggerJulius, dismissJulius } = useJulius();
  const performerName = roomId.replace(/-/g, " ").toUpperCase();

  return (
    <section style={{ display: "grid", gap: 12 }} aria-label="Performer Stage Console">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9f7cf2", fontWeight: 800 }}>
          PerformerStageConsole
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "4px 10px",
            borderRadius: 999,
            background: "rgba(0,0,0,0.35)",
            border: `1px solid ${data.sentinel.color}`,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: data.sentinel.color,
            textTransform: "uppercase",
          }}
        >
          {data.sentinel.label}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(["pre-show", "reveal", "live"] as const).map((state) => (
          <button
            key={state}
            type="button"
            onClick={() => data.setStageState(state)}
            style={{
              padding: "8px 12px",
              borderRadius: 9,
              border: `1px solid ${data.stageState === state ? "rgba(0,255,255,0.65)" : "rgba(255,255,255,0.22)"}`,
              background: data.stageState === state ? "rgba(0,255,255,0.16)" : "rgba(255,255,255,0.06)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              cursor: "pointer",
            }}
          >
            {state}
          </button>
        ))}
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
          Audience Mesh Preview
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {data.members.slice(0, 8).map((member) => (
            <span key={member.userId} style={{ padding: "4px 8px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.22)", fontSize: 11 }}>
              {member.userId.startsWith("viewer-") ? "Guest" : member.userId}
            </span>
          ))}
          {data.members.length === 0 ? <span style={{ color: "rgba(255,255,255,0.62)", fontSize: 12 }}>No audience seated yet.</span> : null}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 10 }}>
        <div style={{ border: "1px solid rgba(255,215,0,0.35)", borderRadius: 10, padding: "10px 12px" }}>Earnings: ${(data.tipTotalCents / 100).toFixed(2)}</div>
        <div style={{ border: "1px solid rgba(255,45,170,0.35)", borderRadius: 10, padding: "10px 12px" }}>Tips: {data.tipsCount}</div>
        <div style={{ border: "1px solid rgba(0,255,255,0.35)", borderRadius: 10, padding: "10px 12px" }}>Heat: {data.population.heatLevel}</div>
        <div style={{ border: "1px solid rgba(170,45,255,0.35)", borderRadius: 10, padding: "10px 12px" }}>Intent: {data.intentSummary.dominantIntent}</div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" onClick={data.triggerHype} style={{ padding: "8px 11px", borderRadius: 8, border: "1px solid rgba(0,255,255,0.5)", background: "rgba(0,255,255,0.12)", color: "#BFFFFF", fontWeight: 700, cursor: "pointer" }}>Stage FX: Hype</button>
        <button type="button" onClick={data.triggerTip} style={{ padding: "8px 11px", borderRadius: 8, border: "1px solid rgba(255,215,0,0.5)", background: "rgba(255,215,0,0.12)", color: "#FFE28B", fontWeight: 700, cursor: "pointer" }}>Stage FX: Spark</button>
        <button type="button" onClick={() => triggerJulius("poll", { pollPrompt: "Who takes this round?" })} style={{ padding: "8px 11px", borderRadius: 8, border: "1px solid rgba(0,255,255,0.5)", background: "rgba(0,255,255,0.08)", color: "#BFFFFF", fontWeight: 700, cursor: "pointer" }}>Julius Poll</button>
        <button type="button" onClick={() => triggerJulius("celebrate")} style={{ padding: "8px 11px", borderRadius: 8, border: "1px solid rgba(255,215,0,0.5)", background: "rgba(255,215,0,0.08)", color: "#FFE28B", fontWeight: 700, cursor: "pointer" }}>Julius Celebrate</button>
        <button type="button" onClick={() => triggerJulius("nudge", { nudgeText: "Keep the wave alive" })} style={{ padding: "8px 11px", borderRadius: 8, border: "1px solid rgba(255,45,170,0.5)", background: "rgba(255,45,170,0.08)", color: "#FFB8E6", fontWeight: 700, cursor: "pointer" }}>Julius Nudge</button>
      </div>

      <div style={{ border: "1px solid rgba(255,255,255,0.16)", borderRadius: 12, padding: 12, background: "rgba(255,255,255,0.04)" }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
          Tip Ticker
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          {data.recentTips.slice(-4).reverse().map((tip, index) => (
            <div key={`${tip.name}-${index}`} style={{ fontSize: 12, color: "rgba(255,215,0,0.9)" }}>
              💸 {tip.name} tipped ${tip.amount}
            </div>
          ))}
          {data.recentTips.length === 0 ? <div style={{ fontSize: 12, color: "rgba(255,255,255,0.62)" }}>No tips yet.</div> : null}
        </div>
      </div>

      <JuliusMascot
        mode={juliusState.mode}
        visible={juliusState.visible}
        pollPrompt={juliusState.pollPrompt}
        nudgeText={juliusState.nudgeText}
        onDismiss={dismissJulius}
      />
    </section>
  );
}
