import type { Metadata } from "next";
import Link from "next/link";
import { ArtistPromotionLoopEngine } from "@/lib/promotion/ArtistPromotionLoopEngine";
import { ArtistKnowledgePanelEngine } from "@/lib/seo/ArtistKnowledgePanelEngine";

type ArtistCampaignsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function autoProgress(slug: string): void {
  ArtistPromotionLoopEngine.completeStep(slug, "rank");
  ArtistPromotionLoopEngine.completeStep(slug, "publish");
  ArtistPromotionLoopEngine.completeStep(slug, "promote");
}

export async function generateMetadata({ params }: ArtistCampaignsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const knowledge = ArtistKnowledgePanelEngine.build(slug.toLowerCase());

  return {
    title: `${knowledge.metadata.title} | Campaign Dashboard`,
    description: `Campaign observatory for ${knowledge.slug}.`,
    alternates: { canonical: `${knowledge.canonical}/campaigns` },
    keywords: [...knowledge.metadata.keywords, "artist campaigns", "promotion dashboard"],
  };
}

export default async function ArtistCampaignsPage({ params }: ArtistCampaignsPageProps) {
  const { slug } = await params;
  const normalized = slug.toLowerCase();

  autoProgress(normalized);
  const loop = ArtistPromotionLoopEngine.getLoop(normalized);
  const completion = ArtistPromotionLoopEngine.getCompletionRate(normalized);
  const graph = ArtistPromotionLoopEngine.buildAutomationGraph(normalized);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "28px 16px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 42 }}>Campaign Dashboard</h1>
        <p style={{ color: "#bdbdd3", marginTop: 8 }}>Promotion history, step state, and exposure loop output.</p>

        <div style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href={`/artists/${normalized}`} style={{ color: "#00FFFF", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>Artist Profile</Link>
          <Link href={`/artists/${normalized}/press-kit`} style={{ color: "#FF2DAA", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>Press Kit</Link>
          <Link href="/artists" style={{ color: "#FFD700", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>Artists Index</Link>
        </div>

        <section style={{ marginTop: 18, border: "1px solid rgba(0,255,255,0.3)", borderRadius: 12, padding: 12, background: "rgba(0,255,255,0.06)" }}>
          <strong>Completion</strong>
          <div style={{ marginTop: 6, fontSize: 30, fontWeight: 800, color: "#00FFFF" }}>{completion}%</div>
          <div style={{ marginTop: 8, height: 8, borderRadius: 999, background: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
            <div style={{ width: `${completion}%`, height: "100%", background: "linear-gradient(90deg,#00FFFF,#FF2DAA)" }} />
          </div>
        </section>

        <section style={{ marginTop: 14, display: "grid", gap: 10 }}>
          {loop.steps.map((step) => (
            <div key={step.stage} style={{ border: "1px solid rgba(255,45,170,0.34)", borderRadius: 10, padding: 12, background: "rgba(255,45,170,0.08)" }}>
              <strong style={{ textTransform: "uppercase" }}>{step.stage}</strong>
              <div style={{ marginTop: 4, color: step.completed ? "#8fffcf" : "#ffd699" }}>{step.completed ? "Completed" : "Pending"}</div>
              <div style={{ marginTop: 4, color: "#c8c8de" }}>{step.detail}</div>
            </div>
          ))}
        </section>

        <section style={{ marginTop: 14, border: "1px solid rgba(255,215,0,0.34)", borderRadius: 12, padding: 12, background: "rgba(255,215,0,0.08)" }}>
          <strong>Automation Graph</strong>
          <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
            {Object.entries(graph).map(([stage, routes]) => (
              <div key={stage}>
                <div style={{ color: "#ffe7a8", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.12em" }}>{stage}</div>
                <div style={{ marginTop: 4, display: "grid", gap: 4 }}>
                  {routes.map((route) => (
                    <Link key={`${stage}-${route}`} href={route} style={{ color: "#fff3cd", textDecoration: "none" }}>{route}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
