import type { Metadata } from "next";
import { getCityScene, getAllCityScenes, generateCityMetaTitle, generateCityMetaDescription } from "@/lib/seo/GeoSEOEngine";
import { generateBreadcrumbSchema } from "@/lib/seo/AiSearchEngine";
import { SEO_BRAND } from "@/lib/seo/SeoBrandConfig";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ city: string }> };

export async function generateStaticParams() {
  return getAllCityScenes().map(c => ({ city: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const scene = getCityScene(city);
  if (!scene) return { title: "City | TMI" };
  return {
    title: generateCityMetaTitle(scene),
    description: generateCityMetaDescription(scene),
    keywords: scene.keywords,
    alternates: { canonical: scene.canonicalUrl },
    openGraph: {
      title: generateCityMetaTitle(scene),
      description: generateCityMetaDescription(scene),
      type: "website",
      url: scene.canonicalUrl,
    },
  };
}

export default async function CityPage({ params }: Props) {
  const { city } = await params;
  const scene = getCityScene(city);
  if (!scene) notFound();

  const breadcrumb = generateBreadcrumbSchema([
    { name: "Home", url: SEO_BRAND.ROOT_CANONICAL },
    { name: "Cities", url: `${SEO_BRAND.ROOT_CANONICAL}/cities` },
    { name: scene.city, url: scene.canonicalUrl },
  ]);

  return (
    <main className="min-h-screen" style={{ background: "#050510", color: "#fff" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />

      {/* Hero */}
      <section className="px-6 pt-16 pb-10 text-center border-b border-white/5">
        <div className="text-xs font-mono tracking-widest mb-3" style={{ color: "#00FFFF" }}>
          {scene.region.toUpperCase()} · {scene.stateCode}
        </div>
        <h1 className="text-3xl font-black mb-3">{scene.city} Music Scene</h1>
        <p className="text-sm text-white/50 max-w-xl mx-auto">{scene.description}</p>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* Stats */}
        <section className="grid grid-cols-3 gap-4">
          {[
            { label: "Active Artists", value: scene.activeArtists, color: "#00FFFF" },
            { label: "Active Venues", value: scene.activeVenues, color: "#FF2DAA" },
            { label: "Live Battles", value: scene.activeBattles, color: "#FFD700" },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl p-4 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs text-white/40 mt-1">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Dominant Genre */}
        <section className="rounded-xl p-5" style={{ background: "rgba(0,255,255,0.05)", border: "1px solid rgba(0,255,255,0.15)" }}>
          <div className="text-xs font-mono tracking-widest text-white/40 mb-2">DOMINANT GENRE</div>
          <div className="text-lg font-black" style={{ color: "#00FFFF" }}>{scene.dominantGenre}</div>
          <div className="flex flex-wrap gap-2 mt-3">
            {scene.genres.map(g => (
              <Link
                key={g}
                href={`/genres/${g}`}
                className="px-3 py-1 rounded-full text-xs capitalize transition-all hover:scale-105"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
              >
                {g.replace(/-/g, " ")}
              </Link>
            ))}
          </div>
        </section>

        {/* Search Keywords — SEO Anchor Text Block */}
        <section>
          <h2 className="text-xs font-mono tracking-widest text-white/50 mb-4">🎵 FIND MUSIC IN {scene.city.toUpperCase()}</h2>
          <div className="flex flex-wrap gap-2">
            {scene.keywords.map(kw => (
              <span
                key={kw}
                className="px-3 py-1.5 rounded-full text-xs"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
              >
                {kw}
              </span>
            ))}
          </div>
        </section>

        {/* CTAs */}
        <section className="flex flex-wrap gap-4 justify-center pt-4 border-t border-white/5">
          <Link href="/trending" className="px-6 py-3 rounded-full text-sm font-bold" style={{ background: "#00FFFF", color: "#000" }}>
            Trending Artists →
          </Link>
          <Link href="/venues" className="px-6 py-3 rounded-full text-sm font-bold" style={{ background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.3)", color: "#FFD700" }}>
            Browse Venues →
          </Link>
          <Link href="/battles/today" className="px-6 py-3 rounded-full text-sm font-bold" style={{ background: "rgba(255,107,53,0.15)", border: "1px solid rgba(255,107,53,0.4)", color: "#FF6B35" }}>
            Battles Today →
          </Link>
          <Link href="/cities" className="px-6 py-3 rounded-full text-sm font-bold" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
            All Cities →
          </Link>
        </section>
      </div>
    </main>
  );
}
