import Link from "next/link";
import { artistDiscoveryBotEngine, contributorRecruitmentBotEngine } from "@/lib/editorial-economy";

export const metadata = {
  title: "Contributor Dashboard | TMI",
  description: "Editorial contributor performance and discovery dashboard.",
};

export default function ContributorDashboardPage() {
  const artistLeads = artistDiscoveryBotEngine.recommend(4);
  const recruitLeads = contributorRecruitmentBotEngine.suggestLeads(4);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "72px 20px 28px", display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Contributor Dashboard</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
        <section style={{ border: "1px solid rgba(255,45,170,0.4)", borderRadius: 10, padding: 12, background: "rgba(255,45,170,0.08)" }}>
          <div style={{ fontSize: 11, color: "#FF2DAA", fontWeight: 900, letterSpacing: "0.12em", marginBottom: 8 }}>ARTIST DISCOVERY BOT</div>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {artistLeads.map((lead) => (
              <li key={lead.artistId} style={{ marginBottom: 6, fontSize: 12 }}>
                {lead.name} · {lead.genre} · score {lead.score}
              </li>
            ))}
          </ul>
        </section>

        <section style={{ border: "1px solid rgba(0,255,255,0.4)", borderRadius: 10, padding: 12, background: "rgba(0,255,255,0.08)" }}>
          <div style={{ fontSize: 11, color: "#00FFFF", fontWeight: 900, letterSpacing: "0.12em", marginBottom: 8 }}>RECRUITMENT BOT</div>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {recruitLeads.map((lead) => (
              <li key={lead.handle} style={{ marginBottom: 6, fontSize: 12 }}>
                {lead.handle} · {lead.specialty} · confidence {lead.confidence}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link href="/contributors/submissions" style={{ textDecoration: "none", color: "#fff", border: "1px solid rgba(255,255,255,0.32)", padding: "8px 12px", borderRadius: 8, fontSize: 11, fontWeight: 800 }}>SUBMISSIONS</Link>
        <Link href="/editorial/review" style={{ textDecoration: "none", color: "#050510", background: "#00FF88", padding: "8px 12px", borderRadius: 8, fontSize: 11, fontWeight: 900 }}>EDITORIAL REVIEW</Link>
      </div>
    </main>
  );
}
