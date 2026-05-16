import { listFeederIdeas, promoteFeederIdeaToVisualJob, setFeederIdeaStatus } from "@/lib/bots/AssetIdeaQueueEngine";
import { ensureSampleFeederIdeas } from "@/lib/bots/CreativePromptFeederEngine";
import { assignWorkerForFeederIdea, listVisualFeederWorkers } from "@/lib/bots/VisualFeederBotEngine";

export default function AdminBotFeederIdeasPage() {
  if (listFeederIdeas().length === 0) ensureSampleFeederIdeas();
  const ideas = listFeederIdeas();

  for (const idea of ideas.slice(0, 2)) {
    setFeederIdeaStatus(idea.ideaId, "approved");
    assignWorkerForFeederIdea(idea);
    promoteFeederIdeaToVisualJob(idea.ideaId);
  }

  const workers = listVisualFeederWorkers();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "24px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Feeder Ideas</h1>
        <p style={{ color: "rgba(255,255,255,0.55)" }}>
          Creative feeder bot suggestions with promotion to visual jobs and worker assignment.
        </p>

        <div style={{ marginTop: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: 10, background: "rgba(255,255,255,0.05)", fontSize: 12 }}>Idea Queue</div>
          {ideas.map((idea) => (
            <div key={idea.ideaId} style={{ padding: 10, borderTop: "1px solid rgba(255,255,255,0.08)", display: "grid", gridTemplateColumns: "0.8fr 1fr 1fr 0.8fr 0.8fr", gap: 8 }}>
              <div style={{ color: "#9ca3af" }}>{idea.sourceBotId}</div>
              <div>{idea.assetType}</div>
              <div style={{ color: "#9ca3af" }}>{idea.targetRoute}</div>
              <div style={{ color: idea.status === "promoted" ? "#00FF88" : "#FFD700" }}>{idea.status}</div>
              <div style={{ color: "#9ca3af" }}>{idea.priority}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: 10, background: "rgba(255,255,255,0.05)", fontSize: 12 }}>Worker Teams</div>
          {workers.map((worker) => (
            <div key={worker.workerId} style={{ padding: 10, borderTop: "1px solid rgba(255,255,255,0.08)", display: "grid", gridTemplateColumns: "1fr 1fr 0.8fr 0.8fr", gap: 8 }}>
              <div>{worker.label}</div>
              <div style={{ color: "#9ca3af" }}>{worker.specialty}</div>
              <div style={{ color: "#00FFFF" }}>{worker.queueLoad}</div>
              <div style={{ color: "#9ca3af" }}>{worker.performanceScore}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
