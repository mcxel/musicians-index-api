import { ensureSampleWorkforceProfiles } from "@/lib/bots/BotDepartmentEngine";
import { ensureGovernanceCheckpoints, listGovernanceCheckpoints } from "@/lib/bots/BotCheckpointEngine";

export default function AdminBotCheckpointsPage() {
  const profiles = ensureSampleWorkforceProfiles();
  profiles.forEach((profile) => ensureGovernanceCheckpoints(profile.botId));
  const checkpoints = listGovernanceCheckpoints();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: 24 }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Bot Checkpoints</h1>
        <p style={{ color: "rgba(255,255,255,0.58)" }}>Daily, weekly, monthly, yearly progress gates.</p>
        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          {checkpoints.map((checkpoint) => (
            <div key={checkpoint.checkpointId} style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, padding: 10, background: "rgba(255,255,255,0.03)", display: "grid", gridTemplateColumns: "1fr 0.8fr 0.8fr 1fr", gap: 8 }}>
              <div>{checkpoint.botId}</div>
              <div style={{ color: "#9ca3af" }}>{checkpoint.period}</div>
              <div style={{ color: checkpoint.status === "passed" ? "#22c55e" : checkpoint.status === "blocked" ? "#ef4444" : "#f59e0b" }}>{checkpoint.status}</div>
              <div style={{ color: "#9ca3af" }}>{checkpoint.actualProgress}/{checkpoint.expectedProgress}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
