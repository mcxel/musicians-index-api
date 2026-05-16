import type { Metadata } from "next";
import Link from "next/link";
import { WhatsHappeningTodayEngine } from "@/lib/events/WhatsHappeningTodayEngine";
import { generateBreadcrumbSchema } from "@/lib/seo/AiSearchEngine";
import { SEO_BRAND } from "@/lib/seo/SeoBrandConfig";

export const revalidate = 60;

export const metadata: Metadata = {
  title: `Rap Battles Today — Live Battle Events | ${SEO_BRAND.PRODUCT_NAME}`,
  description: "Tonight's live rap battles and cyphers on The Musician's Index. See who's battling, enter an open battle, or watch live — updated hourly.",
  keywords: ["rap battles today", "live rap battles", "hip-hop battles tonight", "cypher events", "battle rap events", "music battles near me"],
  alternates: { canonical: `${SEO_BRAND.ROOT_CANONICAL}/battles/today` },
  openGraph: {
    title: `Battles Today | ${SEO_BRAND.PRODUCT_NAME}`,
    description: "Live rap battles and cyphers happening tonight on TMI. Watch, vote, or compete.",
    type: "website",
    url: `${SEO_BRAND.ROOT_CANONICAL}/battles/today`,
  },
};

export default function BattlesTodayPage() {
  const battles = WhatsHappeningTodayEngine.listByType("battle");
  const breadcrumb = generateBreadcrumbSchema([
    { name: "Home", url: SEO_BRAND.ROOT_CANONICAL },
    { name: "Battles Today", url: `${SEO_BRAND.ROOT_CANONICAL}/battles/today` },
  ]);

  return (
    <main className="min-h-screen" style={{ background: "#070510", color: "#fff" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />

      {/* Hero */}
      <section className="px-6 pt-16 pb-10 text-center border-b border-white/5">
        <div className="text-xs font-mono tracking-widest mb-3" style={{ color: "#FF6B35" }}>LIVE TONIGHT</div>
        <h1 className="text-3xl font-black mb-3">Tonight&apos;s Battles</h1>
        <p className="text-sm text-white/50 max-w-lg mx-auto">
          Live rap battles, cyphers, and battle events happening now on The Musician's Index.
        </p>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {battles.length > 0 ? (
          <section>
            <h2 className="text-xs font-mono tracking-widest text-white/50 mb-5">⚔️ ACTIVE BATTLES</h2>
            <div className="space-y-2">
              {battles.map((event) => (
                <Link
                  key={event.slug}
                  href={`/events/${event.slug}`}
                  className="flex items-center gap-4 rounded-xl p-4 transition-all hover:scale-[1.01]"
                  style={{ background: "rgba(255,107,53,0.06)", border: "1px solid rgba(255,107,53,0.25)" }}
                >
                  <span className="text-xl">⚔️</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white">{event.title}</div>
                    <div className="text-xs text-white/40 mt-0.5">{event.city} · {event.venueName}</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full font-mono" style={{ background: "rgba(255,107,53,0.15)", color: "#FF6B35" }}>
                    LIVE
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <section className="text-center py-12">
            <div className="text-4xl mb-4">⚔️</div>
            <div className="text-sm text-white/50">No battles running right now — check back tonight.</div>
          </section>
        )}

        {/* CTAs */}
        <section className="flex flex-wrap gap-4 justify-center pt-4 border-t border-white/5">
          <Link href="/cypher/stage" className="px-6 py-3 rounded-full text-sm font-bold" style={{ background: "#FF6B35", color: "#000" }}>
            Open Cypher Stage →
          </Link>
          <Link href="/song-battle/live" className="px-6 py-3 rounded-full text-sm font-bold" style={{ background: "rgba(170,45,255,0.15)", border: "1px solid rgba(170,45,255,0.4)", color: "#AA2DFF" }}>
            Song Battle Live →
          </Link>
          <Link href="/trending" className="px-6 py-3 rounded-full text-sm font-bold" style={{ background: "rgba(0,255,255,0.1)", border: "1px solid rgba(0,255,255,0.3)", color: "#00FFFF" }}>
            Trending Artists →
          </Link>
        </section>
      </div>
    </main>
  );
}
