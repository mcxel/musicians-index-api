import { ensureSampleWorkforceProfiles } from "@/lib/bots/BotDepartmentEngine";
import { ensureBotTasks, listBotTasks } from "@/lib/bots/BotTaskEngine";

export default function AdminBotTasksPage() {
  const profiles = ensureSampleWorkforceProfiles();
  profiles.forEach((profile) => ensureBotTasks(profile.botId));
  const tasks = listBotTasks();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: 24 }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Bot Tasks</h1>
        <p style={{ color: "rgba(255,255,255,0.58)" }}>Governed work items with status and progress tracking.</p>
        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          {tasks.map((task) => (
            <div key={task.taskId} style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, padding: 10, background: "rgba(255,255,255,0.03)", display: "grid", gridTemplateColumns: "1fr 0.8fr 0.8fr 1fr 0.8fr", gap: 8 }}>
              <div>{task.type}</div>
              <div style={{ color: "#9ca3af" }}>{task.priority}</div>
              <div style={{ color: task.status === "completed" ? "#22c55e" : task.status === "failed" ? "#ef4444" : "#f59e0b" }}>{task.status}</div>
              <div style={{ color: "#9ca3af" }}>{task.assignedBot}</div>
              <div style={{ color: "#00FFFF" }}>{task.progress}%</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
