import { ensureSampleWorkforceProfiles, listBotWorkforceProfiles } from "@/lib/bots/BotDepartmentEngine";
import { ensureBotDirectives } from "@/lib/bots/BotDirectiveEngine";

export default function AdminBotDirectivesPage() {
  const profiles = ensureSampleWorkforceProfiles();
  profiles.forEach((profile) => ensureBotDirectives(profile.botId));

  const rows = listBotWorkforceProfiles().map((profile) => ({
    botId: profile.botId,
    directives: ensureBotDirectives(profile.botId),
  }));

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: 24 }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Bot Directives</h1>
        <p style={{ color: "rgba(255,255,255,0.58)" }}>Permanent operating laws for each bot worker.</p>
        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          {rows.map((row) => (
            <div key={row.botId} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, background: "rgba(255,255,255,0.03)", padding: 10 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>{row.botId}</div>
              <div style={{ display: "grid", gap: 4 }}>
                {row.directives.map((directive) => (
                  <div key={directive.directiveId} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12 }}>
                    <span>{directive.law}</span>
                    <span style={{ color: directive.priority === "required" ? "#00FF88" : "#FFD700" }}>{directive.priority}</span>
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
