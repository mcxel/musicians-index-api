import type { Metadata } from "next";
import { getAllCityScenes } from "@/lib/seo/GeoSEOEngine";
import { generateBreadcrumbSchema } from "@/lib/seo/AiSearchEngine";
import { SEO_BRAND } from "@/lib/seo/SeoBrandConfig";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Music Cities — Independent Artists by City | ${SEO_BRAND.PRODUCT_NAME}`,
  description: "Find independent artists, music venues, and live battles in your city. Browse city music scenes on The Musician's Index — Atlanta, NYC, LA, Chicago, Houston, and more.",
  keywords: ["music cities", "local artists", "music scene by city", "independent artists near me", "rap battles by city", "live music venues near me"],
  alternates: { canonical: `${SEO_BRAND.ROOT_CANONICAL}/cities` },
  openGraph: {
    title: `Music Cities | ${SEO_BRAND.PRODUCT_NAME}`,
    description: "Browse city music scenes — artists, venues, and battles in every major US city on TMI.",
    type: "website",
    url: `${SEO_BRAND.ROOT_CANONICAL}/cities`,
  },
};

const REGION_ORDER = ["East Coast", "South", "Midwest", "West Coast"];

export default function CitiesPage() {
  const cities = getAllCityScenes();
  const breadcrumb = generateBreadcrumbSchema([
    { name: "Home", url: SEO_BRAND.ROOT_CANONICAL },
    { name: "Cities", url: `${SEO_BRAND.ROOT_CANONICAL}/cities` },
  ]);

  const byRegion = REGION_ORDER.reduce<Record<string, typeof cities>>((acc, region) => {
    acc[region] = cities.filter(c => c.region === region);
    return acc;
  }, {});

  return (
    <main className="min-h-screen" style={{ background: "#050510", color: "#fff" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />

      {/* Hero */}
      <section className="px-6 pt-16 pb-10 text-center border-b border-white/5">
        <div className="text-xs font-mono tracking-widest mb-3" style={{ color: "#00FFFF" }}>CITY MUSIC SCENES</div>
        <h1 className="text-3xl font-black mb-3">Find Music Near You</h1>
        <p className="text-sm text-white/50 max-w-lg mx-auto">
          Independent artists, open mic venues, and live battles — organized by city across the US.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {REGION_ORDER.filter(r => byRegion[r]?.length > 0).map(region => (
          <section key={region}>
            <h2 className="text-xs font-mono tracking-widest text-white/50 mb-5">
              📍 {region.toUpperCase()}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {byRegion[region].map(city => (
                <Link
                  key={city.slug}
                  href={`/cities/${city.slug}`}
                  className="rounded-xl p-5 transition-all hover:scale-[1.01] block"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-sm font-bold text-white">{city.city}</div>
                      <div className="text-xs text-white/40">{city.state}</div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(0,255,255,0.1)", color: "#00FFFF" }}>
                      {city.dominantGenre.split(" / ")[0]}
                    </span>
                  </div>
                  <div className="text-xs text-white/40 line-clamp-2 mb-3">{city.description.split(".")[0]}.</div>
                  <div className="flex gap-4 text-xs">
                    <span className="text-white/50">{city.activeArtists} artists</span>
                    <span className="text-white/30">·</span>
                    <span className="text-white/50">{city.activeVenues} venues</span>
                    <span className="text-white/30">·</span>
                    <span className="text-white/50">{city.activeBattles} battles</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* Platform Stats */}
        <section className="rounded-xl p-6 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="text-xs font-mono tracking-widest text-white/40 mb-4">ACROSS ALL CITIES</div>
          <div className="flex justify-center gap-8 flex-wrap">
            <div>
              <div className="text-2xl font-black" style={{ color: "#00FFFF" }}>
                {cities.reduce((s, c) => s + c.activeArtists, 0)}
              </div>
              <div className="text-xs text-white/40 mt-1">Artists</div>
            </div>
            <div>
              <div className="text-2xl font-black" style={{ color: "#FF2DAA" }}>
                {cities.reduce((s, c) => s + c.activeVenues, 0)}
              </div>
              <div className="text-xs text-white/40 mt-1">Venues</div>
            </div>
            <div>
              <div className="text-2xl font-black" style={{ color: "#FFD700" }}>
                {cities.reduce((s, c) => s + c.activeBattles, 0)}
              </div>
              <div className="text-xs text-white/40 mt-1">Active Battles</div>
            </div>
          </div>
        </section>

        {/* CTAs */}
        <section className="flex flex-wrap gap-4 justify-center">
          <Link href="/trending" className="px-6 py-3 rounded-full text-sm font-bold" style={{ background: "#00FFFF", color: "#000" }}>
            Trending Artists →
          </Link>
          <Link href="/venues" className="px-6 py-3 rounded-full text-sm font-bold" style={{ background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.3)", color: "#FFD700" }}>
            Browse Venues →
          </Link>
        </section>
      </div>
    </main>
  );
}
