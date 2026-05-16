import {
  completeHumanReplacement,
  listArchivedBotIdentities,
  listHumanReplacementQueue,
  queueHumanReplacement,
} from "@/lib/bots/HumanReplacementEngine";
import { ensureSampleBotIdentityFaces } from "@/lib/bots/BotFaceGenerationEngine";

export default function AdminReplacementQueuePage() {
  ensureSampleBotIdentityFaces();

  if (listHumanReplacementQueue().length === 0) {
    queueHumanReplacement({
      botId: "synthetic-bot-1",
      humanUserId: "user-real-1",
      slots: ["rank-slot", "visual-slot", "profile-card"],
    });
  }

  const queue = listHumanReplacementQueue();
  for (const item of queue.slice(0, 1)) {
    completeHumanReplacement(item.replacementId);
  }

  const archived = listArchivedBotIdentities();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "24px" }}>
      <div style={{ maxWidth: 1020, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Replacement Queue</h1>
        <p style={{ color: "rgba(255,255,255,0.55)" }}>
          HumanReplacementEngine queue for bot-to-human transfer of rank/profile/article/room/battle slots.
        </p>

        <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
          {listHumanReplacementQueue().map((item) => (
            <div key={item.replacementId} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, background: "rgba(255,255,255,0.03)", padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800 }}>{item.botId} → {item.humanUserId}</div>
                  <div style={{ color: "#9ca3af", fontSize: 10 }}>{item.slots.join(", ")}</div>
                </div>
                <div style={{ color: item.status === "transferred" ? "#00FF88" : "#FFD700", fontSize: 11 }}>{item.status}</div>
              </div>
            </div>
          ))}
        </div>

        <h2 style={{ marginTop: 18, marginBottom: 8, fontSize: 18 }}>Archived Bot History</h2>
        <div style={{ display: "grid", gap: 8 }}>
          {archived.map((entry) => (
            <div key={entry.botId} style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, background: "rgba(255,255,255,0.02)", padding: 10, fontSize: 12 }}>
              {entry.botId} archived to preserve history after transfer to {entry.transferredToUserId}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
