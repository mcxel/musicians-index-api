import type { Metadata } from "next";
import { getTrendingByState, getAllStatePages } from "@/lib/seo/TrendingSEOEngine";
import { generateTrendingListSchema, generateBreadcrumbSchema } from "@/lib/seo/AiSearchEngine";
import { SEO_BRAND } from "@/lib/seo/SeoBrandConfig";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ state: string }> };

export async function generateStaticParams() {
  return getAllStatePages().map(s => ({ state: s.stateCode.toLowerCase() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params;
  const page = getTrendingByState(state.toUpperCase());
  if (!page) return { title: "Trending | TMI" };
  return {
    title: `${page.label} | The Musician's Index`,
    description: page.description,
    keywords: [`trending artists ${page.label}`, `independent rappers ${state.toUpperCase()}`, `best musicians ${page.label}`, "live music battles", "rising artists 2026"],
    alternates: { canonical: page.canonical },
    openGraph: {
      title: `${page.label} | ${SEO_BRAND.PRODUCT_NAME}`,
      description: page.description,
      type: "website",
      url: page.canonical,
    },
  };
}

export default async function StateTrendingPage({ params }: Props) {
  const { state } = await params;
  const page = getTrendingByState(state.toUpperCase());
  if (!page) notFound();

  const listSchema = generateTrendingListSchema(
    page.entries.map(e => ({ name: e.name, url: `${SEO_BRAND.ROOT_CANONICAL}${e.route}`, position: e.rank }))
  );
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SEO_BRAND.ROOT_CANONICAL },
    { name: "Trending", url: `${SEO_BRAND.ROOT_CANONICAL}/trending` },
    { name: page.label, url: page.canonical },
  ]);

  return (
    <main className="min-h-screen" style={{ background: "#050510", color: "#fff" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: listSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />

      {/* Hero */}
      <section className="px-6 pt-16 pb-10 text-center border-b border-white/5">
        <div className="text-xs font-mono tracking-widest mb-3" style={{ color: "#00FFFF" }}>
          TRENDING · {state.toUpperCase()}
        </div>
        <h1 className="text-3xl font-black mb-3">{page.label}</h1>
        <p className="text-sm text-white/50 max-w-lg mx-auto">{page.description}</p>
        <div className="text-xs text-white/25 mt-3">Updated {new Date(page.updatedAt).toLocaleDateString()}</div>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        {/* Artist + Battle Entries */}
        <section>
          <h2 className="text-xs font-mono tracking-widest text-white/50 mb-5">
            🔥 TOP ARTISTS & EVENTS
          </h2>
          <div className="space-y-2">
            {page.entries.map((entry, i) => (
              <Link
                key={entry.slug}
                href={entry.route}
                className="flex items-center gap-4 rounded-xl p-4 transition-all hover:scale-[1.01]"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <span className="text-xs font-mono w-6 text-center text-white/30">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{entry.name}</span>
                    {entry.badge && <span>{entry.badge}</span>}
                    <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                      style={{
                        background: entry.type === "battle" ? "rgba(255,107,53,0.15)" : "rgba(0,255,255,0.1)",
                        color: entry.type === "battle" ? "#FF6B35" : "#00FFFF",
                      }}>
                      {entry.type === "cypher" ? "Cypher" : entry.genre}
                    </span>
                  </div>
                  <div className="text-xs text-white/40 mt-0.5">{entry.location}</div>
                </div>
                <div className="text-xs font-mono text-white/30 shrink-0">{entry.score.toLocaleString()} pts</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Navigation */}
        <section className="flex flex-wrap gap-3 pt-4 border-t border-white/5">
          <Link href="/trending" className="text-xs px-4 py-2 rounded-full border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-colors">
            ← All States
          </Link>
          <Link href="/leaderboard" className="text-xs px-4 py-2 rounded-full" style={{ background: "#00FFFF", color: "#000", fontWeight: 700 }}>
            Full Leaderboard →
          </Link>
          <Link href="/battles/today" className="text-xs px-4 py-2 rounded-full border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-colors">
            Battles Today →
          </Link>
        </section>
      </div>
    </main>
  );
}
