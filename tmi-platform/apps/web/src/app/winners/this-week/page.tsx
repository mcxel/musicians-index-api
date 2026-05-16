import type { Metadata } from "next";
import { getTrendingWeeklyWinner, getTrendingGlobal } from "@/lib/seo/TrendingSEOEngine";
import { generateTrendingListSchema, generateBreadcrumbSchema } from "@/lib/seo/AiSearchEngine";
import { SEO_BRAND } from "@/lib/seo/SeoBrandConfig";
import Link from "next/link";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `This Week's Winners — Top Artists & Battle Champions | ${SEO_BRAND.PRODUCT_NAME}`,
  description: "Who won this week on The Musician's Index? Weekly battle champions, top-ranked artists, and fan-voted winners — updated every week.",
  keywords: ["this week's winners", "battle champions", "weekly top artists", "rap battle winners", "music contest winners 2026", "TMI weekly crown"],
  alternates: { canonical: `${SEO_BRAND.ROOT_CANONICAL}/winners/this-week` },
  openGraph: {
    title: `This Week's Winners | ${SEO_BRAND.PRODUCT_NAME}`,
    description: "Weekly champions crowned — battle winners, fan vote leaders, and the week's top artist on TMI.",
    type: "website",
    url: `${SEO_BRAND.ROOT_CANONICAL}/winners/this-week`,
  },
};

const WEEK_WINNERS = [
  { rank: 1, name: "Ray Journey",  contest: "Grand Battle Week 16",      prize: "$500",  genre: "Hip-Hop",    badge: "🏆", slug: "ray-journey",  color: "#FFD700" },
  { rank: 2, name: "Lena Sky",     contest: "Vocal Battle Ep.9",         prize: "$250",  genre: "R&B",        badge: "🌟", slug: "lena-sky",     color: "#FF2DAA" },
  { rank: 3, name: "Nova Cipher",  contest: "Monday Night Cypher Ep.12", prize: "$150",  genre: "Trap",       badge: "⚡", slug: "nova-cipher",  color: "#AA2DFF" },
  { rank: 4, name: "Zuri Bloom",   contest: "Global Artist Spotlight",   prize: "$100",  genre: "Afrobeats",  badge: "🌍", slug: "zuri-bloom",   color: "#00FF88" },
  { rank: 5, name: "DJ Storm",     contest: "Beat Battle Vol.5",         prize: "$100",  genre: "Electronic", badge: "🎛️", slug: "dj-storm",     color: "#00FFFF" },
];

export default function WeeklyWinnersPage() {
  const winner = getTrendingWeeklyWinner();
  const trending = getTrendingGlobal();

  const listSchema = generateTrendingListSchema(
    WEEK_WINNERS.map(w => ({
      name: w.name,
      url: `${SEO_BRAND.ROOT_CANONICAL}/artists/${w.slug}`,
      position: w.rank,
    }))
  );
  const breadcrumb = generateBreadcrumbSchema([
    { name: "Home", url: SEO_BRAND.ROOT_CANONICAL },
    { name: "Winners", url: `${SEO_BRAND.ROOT_CANONICAL}/winners` },
    { name: "This Week", url: `${SEO_BRAND.ROOT_CANONICAL}/winners/this-week` },
  ]);

  return (
    <main className="min-h-screen" style={{ background: "#050510", color: "#fff" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: listSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />

      {/* Hero */}
      <section className="px-6 pt-16 pb-10 text-center border-b border-white/5">
        <div className="text-xs font-mono tracking-widest mb-3" style={{ color: "#FFD700" }}>THIS WEEK'S CROWN</div>
        <h1 className="text-3xl font-black mb-3">Weekly Winners</h1>
        <p className="text-sm text-white/50 max-w-lg mx-auto">
          Battle champions, fan-voted leaders, and top artists from the past 7 days on The Musician's Index.
        </p>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        {/* #1 Crown Winner */}
        {winner && (
          <section>
            <h2 className="text-xs font-mono tracking-widest text-white/50 mb-4">👑 #1 THIS WEEK</h2>
            <Link
              href={winner.route}
              className="flex items-center gap-5 rounded-2xl p-6 transition-all hover:scale-[1.01] block"
              style={{ background: "rgba(255,215,0,0.08)", border: "2px solid rgba(255,215,0,0.35)" }}
            >
              <div className="text-4xl">🏆</div>
              <div className="flex-1">
                <div className="text-xl font-black text-white">{winner.name}</div>
                <div className="text-sm text-white/50 mt-1">{winner.location} · {winner.genre}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black" style={{ color: "#FFD700" }}>{winner.score.toLocaleString()}</div>
                <div className="text-xs text-white/30">pts</div>
              </div>
            </Link>
          </section>
        )}

        {/* Full Winner Board */}
        <section>
          <h2 className="text-xs font-mono tracking-widest text-white/50 mb-5">🏅 WEEKLY CHAMPIONS</h2>
          <div className="space-y-2">
            {WEEK_WINNERS.map(w => (
              <Link
                key={w.slug}
                href={`/artists/${w.slug}`}
                className="flex items-center gap-4 rounded-xl p-4 transition-all hover:scale-[1.01]"
                style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${w.color}20` }}
              >
                <span className="text-lg w-8 text-center">{w.badge}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{w.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${w.color}15`, color: w.color }}>{w.genre}</span>
                  </div>
                  <div className="text-xs text-white/40 mt-0.5">{w.contest}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold" style={{ color: "#00FF88" }}>{w.prize}</div>
                  <div className="text-xs text-white/30 mt-0.5">#{w.rank}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending This Week */}
        <section>
          <h2 className="text-xs font-mono tracking-widest text-white/50 mb-5">🔥 TRENDING THIS WEEK</h2>
          <div className="space-y-2">
            {trending.entries.slice(0, 5).map(entry => (
              <Link
                key={entry.slug}
                href={entry.route}
                className="flex items-center gap-4 rounded-xl p-3 transition-all hover:scale-[1.01]"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <span className="text-xs font-mono w-6 text-center text-white/30">#{entry.rank}</span>
                <div className="flex-1">
                  <span className="text-sm font-bold text-white">{entry.name}</span>
                  <span className="text-xs text-white/40 ml-2">{entry.location}</span>
                </div>
                <span className="text-xs font-mono text-white/30">{entry.score.toLocaleString()}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* CTAs */}
        <section className="flex flex-wrap gap-4 justify-center pt-4 border-t border-white/5">
          <Link href="/winners" className="px-6 py-3 rounded-full text-sm font-bold" style={{ background: "#FFD700", color: "#000" }}>
            All Winners →
          </Link>
          <Link href="/leaderboard" className="px-6 py-3 rounded-full text-sm font-bold" style={{ background: "rgba(0,255,255,0.1)", border: "1px solid rgba(0,255,255,0.3)", color: "#00FFFF" }}>
            Full Leaderboard →
          </Link>
          <Link href="/contests" className="px-6 py-3 rounded-full text-sm font-bold" style={{ background: "rgba(255,45,170,0.1)", border: "1px solid rgba(255,45,170,0.3)", color: "#FF2DAA" }}>
            Enter Next Contest →
          </Link>
        </section>
      </div>
    </main>
  );
}
