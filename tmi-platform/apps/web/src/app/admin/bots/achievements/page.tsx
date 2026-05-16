import { ensureSampleWorkforceProfiles } from "@/lib/bots/BotDepartmentEngine";
import { ensureBotAchievements, listBotAchievements } from "@/lib/bots/BotAchievementEngine";

export default function AdminBotAchievementsPage() {
  const profiles = ensureSampleWorkforceProfiles();
  profiles.forEach((profile) => ensureBotAchievements(profile.botId));
  const achievements = listBotAchievements();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: 24 }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Bot Achievements</h1>
        <p style={{ color: "rgba(255,255,255,0.58)" }}>Reward milestones for governed worker performance.</p>
        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          {achievements.map((achievement) => (
            <div key={achievement.achievementId} style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, padding: 10, background: "rgba(255,255,255,0.03)", display: "grid", gridTemplateColumns: "1fr 1fr 0.8fr 0.8fr", gap: 8 }}>
              <div>{achievement.title}</div>
              <div style={{ color: "#9ca3af" }}>{achievement.botId}</div>
              <div style={{ color: "#00FFFF" }}>{achievement.value}/{achievement.threshold}</div>
              <div style={{ color: achievement.unlocked ? "#22c55e" : "#f59e0b" }}>{achievement.unlocked ? "unlocked" : "locked"}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
