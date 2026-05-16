import { decideMCAuthority, listMCAuthorityDecisions, summarizeMCAuthority } from "@/lib/admin/MCAuthorityEngine";
import { ensureSampleWorkforceProfiles } from "@/lib/bots/BotDepartmentEngine";
import { ensureBotTasks, listBotTasks } from "@/lib/bots/BotTaskEngine";

export default function AdminMCAuthorityPage() {
  ensureSampleWorkforceProfiles().forEach((profile) => ensureBotTasks(profile.botId));
  const tasks = listBotTasks();

  if (listMCAuthorityDecisions().length === 0 && tasks.length > 2) {
    decideMCAuthority({ targetId: tasks[0].taskId, targetType: "task", status: "green", reason: "approved" });
    decideMCAuthority({ targetId: tasks[1].taskId, targetType: "task", status: "yellow", reason: "needs correction" });
    decideMCAuthority({ targetId: tasks[2].taskId, targetType: "task", status: "red", reason: "blocked" });
  }

  const summary = summarizeMCAuthority();
  const decisions = listMCAuthorityDecisions();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: 24 }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>MC Authority</h1>
        <p style={{ color: "rgba(255,255,255,0.58)" }}>Michael Charlie approval layer: green, yellow, red.</p>

        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 8 }}>
          <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 10, color: "#22c55e" }}>Green: {summary.green}</div>
          <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 10, color: "#f59e0b" }}>Yellow: {summary.yellow}</div>
          <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 10, color: "#ef4444" }}>Red: {summary.red}</div>
          <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 10 }}>Total: {summary.total}</div>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          {decisions.map((decision) => (
            <div key={decision.decisionId} style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, padding: 10, background: "rgba(255,255,255,0.03)", display: "grid", gridTemplateColumns: "1fr 0.8fr 0.8fr", gap: 8 }}>
              <div>{decision.targetType}:{decision.targetId}</div>
              <div style={{ color: decision.status === "green" ? "#22c55e" : decision.status === "yellow" ? "#f59e0b" : "#ef4444" }}>{decision.status}</div>
              <div style={{ color: "#9ca3af" }}>{decision.reason}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
