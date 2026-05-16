import { ensureSampleBotIdentityFaces } from "@/lib/bots/BotFaceGenerationEngine";
import { listBotIdentityProfiles } from "@/lib/bots/BotIdentityProfileEngine";

export default function AdminBotIdentitiesPage() {
  ensureSampleBotIdentityFaces();
  const identities = listBotIdentityProfiles();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "24px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Bot Identities</h1>
        <p style={{ color: "rgba(255,255,255,0.55)" }}>
          Full generated identity profiles with syntheticBot and generatedIdentity truth flags.
        </p>

        <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
          {identities.map((identity) => (
            <div key={identity.botId} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, background: "rgba(255,255,255,0.03)", padding: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800 }}>{identity.name}</div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>{identity.botId}</div>
              </div>
              <div style={{ color: "#9ca3af", fontSize: 12 }}>{identity.role}</div>
              <div style={{ color: "#9ca3af", fontSize: 12 }}>{identity.personality}</div>
              <div style={{ color: "#00FF88", fontSize: 11 }}>syntheticBot: {String(identity.syntheticBot)}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
