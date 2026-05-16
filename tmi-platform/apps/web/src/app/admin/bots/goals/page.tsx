import { ensureSampleWorkforceProfiles, listBotWorkforceProfiles } from "@/lib/bots/BotDepartmentEngine";
import { ensureBotGoals, listBotGoals } from "@/lib/bots/BotGoalEngine";

export default function AdminBotGoalsPage() {
  const profiles = ensureSampleWorkforceProfiles();
  profiles.forEach((profile) => ensureBotGoals(profile.botId));

  const goals = listBotGoals();
  const workers = listBotWorkforceProfiles();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: 24 }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Bot Goals</h1>
        <p style={{ color: "rgba(255,255,255,0.58)" }}>Daily, weekly, monthly, yearly measurable goals.</p>
        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 8 }}>
          <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: 10 }}>Workers: {workers.length}</div>
          <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: 10 }}>Goals: {goals.length}</div>
          <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: 10 }}>Missed: {goals.filter((goal) => goal.status === "at-risk").length}</div>
          <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: 10 }}>Achieved: {goals.filter((goal) => goal.status === "achieved").length}</div>
        </div>
        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          {goals.map((goal) => (
            <div key={goal.goalId} style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, padding: 10, background: "rgba(255,255,255,0.03)", display: "grid", gridTemplateColumns: "1fr 0.8fr 0.8fr 1fr", gap: 8 }}>
              <div>{goal.title}</div>
              <div style={{ color: "#9ca3af" }}>{goal.period}</div>
              <div style={{ color: goal.status === "achieved" ? "#22c55e" : goal.status === "at-risk" ? "#ef4444" : "#f59e0b" }}>{goal.status}</div>
              <div style={{ color: "#9ca3af" }}>{goal.botId}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
