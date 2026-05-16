import Link from "next/link";
import {
  getDailyExpressionBoard,
  getExpressionConfig,
  type ExpressionType,
} from "@/lib/avatar/AvatarExpressionDirectiveEngine";

const ALL_EXPRESSIONS: ExpressionType[] = [
  "neutral", "smile", "smirk", "grin", "scowl", "raised-brow",
  "wide-eyes", "squint", "wink", "pout", "jaw-drop",
  "confident", "focused", "disgusted", "shocked",
];

const INTENSITY_COLORS: Record<0 | 1 | 2 | 3, string> = {
  0: "rgba(255,255,255,0.3)",
  1: "#00FFFF",
  2: "#FFD700",
  3: "#FF2DAA",
};

export default function AvatarExpressionsPage() {
  const board = getDailyExpressionBoard();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "30px 20px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Link href="/admin/directives" style={{ color: "#00FF88", textDecoration: "none", fontSize: 12 }}>← Directives</Link>
        <h1 style={{ fontSize: 32, margin: "14px 0 6px", fontWeight: 700 }}>Avatar Expression Directives</h1>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>
          Daily facial expression assignments for {board.date}.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 30 }}>
          {[
            { label: "Default Expression", value: board.defaultExpression, color: "#00FFFF" },
            { label: "Crowd Expression", value: board.crowdExpression, color: "#FFD700" },
            { label: "Battle Expression", value: board.battleExpression, color: "#FF2DAA" },
            { label: "Celebration Expression", value: board.celebrationExpression, color: "#00FF88" },
          ].map(item => (
            <div key={item.label} style={{ border: `1px solid ${item.color}33`, borderRadius: 10, padding: "14px 16px", background: `${item.color}08` }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1.5 }}>{item.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 26 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
            Idle Variants Today
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {board.idleVariants.map(v => (
              <span key={v} style={{ fontSize: 12, color: "#00FF88", background: "#00FF8822", borderRadius: 6, padding: "4px 10px" }}>
                {v}
              </span>
            ))}
          </div>
        </div>

        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14, color: "rgba(255,255,255,0.8)" }}>
          Full Expression Registry
        </h2>
        <div style={{ display: "grid", gap: 8 }}>
          {ALL_EXPRESSIONS.map(expr => {
            const cfg = getExpressionConfig(expr);
            return (
              <div key={expr} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px", background: "rgba(255,255,255,0.02)", display: "grid", gridTemplateColumns: "140px 100px 120px 100px 80px 60px", gap: 10, alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{expr}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>brow: {cfg.browPosition}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>eye: {cfg.eyeShape}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>mouth: {cfg.mouthCurve}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{cfg.holdMs}ms</div>
                <div style={{ fontSize: 11, color: INTENSITY_COLORS[cfg.intensity], textAlign: "center" }}>
                  I{cfg.intensity}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
