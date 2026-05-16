import Link from "next/link";
import { getDailyBoard, getBotTaskSummary, type DirectiveRole } from "@/lib/directives/DailyDirectiveEngine";

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

export default function DailyDirectivePage() {
  const board = getDailyBoard();
  const summary = getBotTaskSummary();

  const grouped = board.directives.reduce<Record<DirectiveRole, typeof board.directives>>((acc, d) => {
    if (!acc[d.role]) acc[d.role] = [];
    acc[d.role].push(d);
    return acc;
  }, {} as Record<DirectiveRole, typeof board.directives>);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "30px 20px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Link href="/admin/directives" style={{ color: "#00FFFF", textDecoration: "none", fontSize: 12 }}>← Directives</Link>
        <h1 style={{ fontSize: 32, margin: "14px 0 6px", fontWeight: 700 }}>Daily Directive Board</h1>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{summary}</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 30, marginTop: 20 }}>
          {[
            { label: "Article Goal", value: board.articleGoal },
            { label: "Engagement Target", value: `${board.engagementTarget}%` },
            { label: "Sponsor Activations", value: board.sponsorActivations },
            { label: "Bot Tasks", value: board.botTaskCount },
            { label: "Platform Health", value: `${board.platformHealthScore}%` },
            { label: "Date", value: board.date },
          ].map(stat => (
            <div key={stat.label} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 14px", background: "rgba(255,255,255,0.03)" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1.5 }}>{stat.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{stat.value}</div>
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
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{d.task}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{d.goal} · {d.metric}</div>
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>
                      resets {d.resetAt.split("T")[0]}
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
