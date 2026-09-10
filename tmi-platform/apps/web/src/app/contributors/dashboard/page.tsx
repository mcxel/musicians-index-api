import Link from "next/link";
import {
  artistDiscoveryBotEngine,
  contributorRecruitmentBotEngine,
  contributorAccountEngine,
  editorialSubmissionEngine,
} from "@/lib/editorial-economy";
import { scoreWriter, getWriterTierLabel, updateScore } from "@/lib/writer/WriterRankEngine";
import { checkAndAwardMilestones, getBadges } from "@/lib/writer/WriterBadgeSystem";

export const metadata = {
  title: "Contributor Dashboard | TMI",
  description: "Editorial contributor performance and discovery dashboard.",
};

/**
 * Harvests WriterRankEngine + WriterBadgeSystem into the canonical /contributors
 * surface (LEGACY /hub/writer remains harvest-only — do not delete yet).
 * Rank XP here is reputation display only — reading XP stays MagazineShell →
 * /api/magazine/read-xp → XpActionRegistry.read_article (no second reward economy).
 */
export default async function ContributorDashboardPage() {
  const artistLeads = artistDiscoveryBotEngine.recommend(4);
  const recruitLeads = contributorRecruitmentBotEngine.suggestLeads(4);
  const roster = await contributorAccountEngine.list();
  const allSubmissions = await editorialSubmissionEngine.list();

  const rankedRoster = roster.map((account) => {
    const mine = allSubmissions.filter((s) => s.contributorId === account.contributorId);
    const publishedCount = mine.filter((s) => s.status === "published").length;
    const current = scoreWriter(account.contributorId);
    const articlesDelta = Math.max(0, publishedCount - current.articlesPublished);
    if (articlesDelta > 0) {
      updateScore(account.contributorId, { articles: articlesDelta });
      checkAndAwardMilestones(account.contributorId, {
        articlesPublished: publishedCount,
        totalViews: current.totalViews,
        assignmentsCompleted: current.assignmentsCompleted,
      });
    }
    const score = scoreWriter(account.contributorId);
    const badges = getBadges(account.contributorId);
    return { account, score, badges, publishedCount, submissionCount: mine.length };
  });

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "72px 20px 28px", display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Contributor Dashboard</h1>
      <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
        Canonical lane: /contributors · Legacy writer hub (/hub/writer) is harvest-only.
      </p>

      <section style={{ border: "1px solid rgba(255,215,0,0.35)", borderRadius: 10, padding: 12, background: "rgba(255,215,0,0.06)" }}>
        <div style={{ fontSize: 11, color: "#FFD700", fontWeight: 900, letterSpacing: "0.12em", marginBottom: 8 }}>
          WRITER RANK · BADGES (harvested)
        </div>
        {rankedRoster.length === 0 ? (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
            No contributor accounts yet. Apply at /contributors/apply — ranks stay empty until real publishes land.
          </div>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
            {rankedRoster.map(({ account, score, badges, publishedCount, submissionCount }) => (
              <li
                key={account.contributorId}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 12,
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  paddingBottom: 8,
                }}
              >
                <span>
                  {account.displayName} · {account.level} · Trust {account.trustScore}
                </span>
                <span style={{ color: score.tierColor }}>
                  {getWriterTierLabel(score.tier)} · {score.xp} XP · {publishedCount}/{submissionCount} published
                </span>
                <span style={{ color: "rgba(255,255,255,0.55)" }}>
                  {badges.length === 0 ? "No badges yet" : badges.map((b) => b.icon + b.name).join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

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
        <Link href="/hub/writer" style={{ textDecoration: "none", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.2)", padding: "8px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700 }}>LEGACY WRITER HUB</Link>
      </div>
    </main>
  );
}
