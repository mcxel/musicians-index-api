import Link from "next/link";
import { getDailyMotionBoard, getMotionDirective, type MotionDirectiveType } from "@/lib/avatar/AvatarDailyMotionEngine";

const PRIORITY_COLORS: Record<1 | 2 | 3, string> = {
  1: "#FF2DAA",
  2: "#FFD700",
  3: "#00FFFF",
};

const ALL_MOTIONS: MotionDirectiveType[] = [
  "idle", "walking", "dancing", "talking", "lip-sync", "blinking",
  "eye-movement", "head-turn", "hand-gesture", "crowd-react",
  "happy", "angry", "surprised", "stage-swagger", "battle-stance",
  "winner-celebration", "pocket-pull", "collectible-reveal",
];

export default function AvatarMotionPage() {
  const board = getDailyMotionBoard();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "30px 20px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Link href="/admin/directives" style={{ color: "#FF2DAA", textDecoration: "none", fontSize: 12 }}>← Directives</Link>
        <h1 style={{ fontSize: 32, margin: "14px 0 6px", fontWeight: 700 }}>Avatar Motion Directives</h1>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>
          Daily motion board for {board.date} — all avatar instances use these assignments.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 30 }}>
          {[
            { label: "Default Motion", value: board.defaultMotion, color: "#00FFFF" },
            { label: "Battle Motion", value: board.battleMotion, color: "#FF2DAA" },
            { label: "Celebration Motion", value: board.celebrationMotion, color: "#FFD700" },
            { label: "Crowd Motion", value: board.crowdMotion, color: "#00FF88" },
          ].map(item => (
            <div key={item.label} style={{ border: `1px solid ${item.color}33`, borderRadius: 10, padding: "14px 16px", background: `${item.color}08` }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1.5 }}>{item.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
            Idle Variants Today
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {board.idleVariants.map(v => (
              <span key={v} style={{ fontSize: 12, color: "#00FFFF", background: "#00FFFF22", borderRadius: 6, padding: "4px 10px" }}>
                {v}
              </span>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
            Reaction Set Today
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {board.reactionSet.map(v => (
              <span key={v} style={{ fontSize: 12, color: "#FFD700", background: "#FFD70022", borderRadius: 6, padding: "4px 10px" }}>
                {v}
              </span>
            ))}
          </div>
        </div>

        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14, color: "rgba(255,255,255,0.8)" }}>
          Full Motion Directive Registry
        </h2>
        <div style={{ display: "grid", gap: 8 }}>
          {ALL_MOTIONS.map(motion => {
            const d = getMotionDirective(motion);
            return (
              <div key={motion} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px", background: "rgba(255,255,255,0.02)", display: "grid", gridTemplateColumns: "160px 1fr 1fr 80px 60px", gap: 12, alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{motion}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                  {d.duration}ms · {d.loopable ? "loops" : "one-shot"}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                  fallback: {d.fallback}
                </div>
                <div style={{ fontSize: 10, color: PRIORITY_COLORS[d.priority], textAlign: "center", background: `${PRIORITY_COLORS[d.priority]}22`, borderRadius: 4, padding: "2px 0" }}>
                  P{d.priority}
                </div>
                <div style={{ fontSize: 10, color: d.lipSyncEnabled ? "#00FF88" : "rgba(255,255,255,0.2)", textAlign: "center" }}>
                  {d.lipSyncEnabled ? "lip-sync" : "—"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
