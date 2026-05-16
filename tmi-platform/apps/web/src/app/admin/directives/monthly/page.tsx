import Link from "next/link";
import { getMonthlyBoard, getMonthlyBoardSummary, type MonthlyDirective } from "@/lib/directives/MonthlyDirectiveEngine";
import type { DirectiveRole } from "@/lib/directives/DailyDirectiveEngine";

const ROLE_COLORS: Record<DirectiveRole, string> = {
  editorial_bot:  "#00FFFF",
  stage_bot:      "#FFD700",
  moderation_bot: "#FF2DAA",
  sponsor_bot:    "#AA2DFF",
  analytics_bot:  "#00FF88",
  camera_bot:     "#FF8C00",
  artist:         "#FFD700",
  fan:            "#00FFFF",
  venue:          "#AA2DFF",
  admin:          "#FF2DAA",
};

const PRIORITY_COLORS = { P0: "#FF2DAA", P1: "#FFD700", P2: "#00FFFF" };

export default function MonthlyDirectivePage() {
  const board = getMonthlyBoard();
  const summary = getMonthlyBoardSummary();

  const grouped = board.directives.reduce<Record<DirectiveRole, MonthlyDirective[]>>((acc, d) => {
    if (!acc[d.role]) acc[d.role] = [];
    acc[d.role].push(d);
    return acc;
  }, {} as Record<DirectiveRole, MonthlyDirective[]>);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "30px 20px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Link href="/admin/directives" style={{ color: "#FFD700", textDecoration: "none", fontSize: 12 }}>← Directives</Link>
        <h1 style={{ fontSize: 32, margin: "14px 0 6px", fontWeight: 700 }}>Monthly Campaign Board</h1>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{summary}</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 30, marginTop: 20 }}>
          {[
            { label: "Artist Growth Target", value: `+${board.artistGrowthTarget}` },
            { label: "Fan Growth Target", value: `+${board.fanGrowthTarget.toLocaleString()}` },
            { label: "Revenue Target", value: `$${board.revenueTarget.toLocaleString()}` },
            { label: "Battle Goal", value: board.battleGoal },
            { label: "Article Target", value: board.articlePublishTarget },
            { label: "Health Floor", value: `${board.platformHealthFloor}%` },
          ].map(stat => (
            <div key={stat.label} style={{ border: "1px solid rgba(255,215,0,0.2)", borderRadius: 10, padding: "12px 14px", background: "rgba(255,215,0,0.04)" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1.5 }}>{stat.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, color: "#FFD700" }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gap: 20 }}>
          {(Object.keys(grouped) as DirectiveRole[]).map(role => (
            <div key={role}>
              <div style={{ fontSize: 11, color: ROLE_COLORS[role], textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
                {role.replace("_", " ")}
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {grouped[role].map(d => (
                  <div key={d.id} style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", background: "rgba(255,255,255,0.02)", display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: PRIORITY_COLORS[d.priority], background: `${PRIORITY_COLORS[d.priority]}22`, borderRadius: 4, padding: "2px 6px", whiteSpace: "nowrap", marginTop: 2 }}>
                      {d.priority}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{d.campaign}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{d.goal} · {d.metric}</div>
                    </div>
                    <div style={{ fontSize: 10, color: "#FFD700", whiteSpace: "nowrap" }}>
                      target: {d.target}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
