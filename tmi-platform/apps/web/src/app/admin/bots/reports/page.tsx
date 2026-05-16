import { ensureSampleWorkforceProfiles } from "@/lib/bots/BotDepartmentEngine";
import { ensureBotReports, listBotReports, summarizeGovernanceReports } from "@/lib/bots/BotReportingEngine";

export default function AdminBotReportsPage() {
  const profiles = ensureSampleWorkforceProfiles();
  profiles.forEach((profile) => ensureBotReports(profile.botId));

  const reports = listBotReports();
  const summary = summarizeGovernanceReports();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: 24 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Bot Reports</h1>
        <p style={{ color: "rgba(255,255,255,0.58)" }}>Bot to Supervisor to Department Lead to MC to Big Ace reporting chain.</p>

        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 8 }}>
          <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 10 }}>Working: {summary.working}</div>
          <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 10 }}>Failing: {summary.failing}</div>
          <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 10 }}>Completed: {summary.completed}</div>
          <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 10 }}>Missed Goals: {summary.missedGoals}</div>
          <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 10 }}>Reassignment: {summary.needsReassignment}</div>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          {reports.map((report) => (
            <div key={report.reportId} style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, padding: 10, background: "rgba(255,255,255,0.03)", display: "grid", gridTemplateColumns: "1fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr", gap: 8 }}>
              <div>
                <div>{report.botId}</div>
                <div style={{ color: "#9ca3af", fontSize: 10 }}>{report.department}</div>
              </div>
              <div style={{ color: "#22c55e" }}>done {report.completedWork}</div>
              <div style={{ color: "#ef4444" }}>fail {report.failedWork}</div>
              <div style={{ color: "#f59e0b" }}>block {report.blockedWork}</div>
              <div style={{ color: "#00FFFF" }}>retry {report.retryWork}</div>
              <div style={{ color: report.mcStatus === "green" ? "#22c55e" : report.mcStatus === "yellow" ? "#f59e0b" : "#ef4444" }}>{report.mcStatus}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
