import type { Metadata } from "next";
import { getGenrePage, getAllGenrePages, generateGenreMetaTitle, generateGenreMetaDescription } from "@/lib/seo/GenreSEOEngine";
import { generateBreadcrumbSchema, generateArtistSchema } from "@/lib/seo/AiSearchEngine";
import { SEO_BRAND } from "@/lib/seo/SeoBrandConfig";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ genre: string }> };

export async function generateStaticParams() {
  return getAllGenrePages().map(g => ({ genre: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { genre } = await params;
  const page = getGenrePage(genre);
  if (!page) return { title: "Genre | TMI" };
  return {
    title: generateGenreMetaTitle(page),
    description: generateGenreMetaDescription(page),
    keywords: page.keywords,
    alternates: { canonical: page.canonical },
    openGraph: {
      title: generateGenreMetaTitle(page),
      description: generateGenreMetaDescription(page),
      type: "website",
      url: page.canonical,
    },
  };
}

export default async function GenreDetailPage({ params }: Props) {
  const { genre } = await params;
  const page = getGenrePage(genre);
  if (!page) notFound();

  const breadcrumb = generateBreadcrumbSchema([
    { name: "Home", url: SEO_BRAND.ROOT_CANONICAL },
    { name: "Genres", url: `${SEO_BRAND.ROOT_CANONICAL}/genres` },
    { name: page.label, url: page.canonical },
  ]);

  const artistSchemas = page.topArtists.map(a =>
    generateArtistSchema({
      name: a.name,
      genre: page.genre,
      url: `${SEO_BRAND.ROOT_CANONICAL}/artists/${a.slug}`,
    })
  );

  return (
    <main className="min-h-screen" style={{ background: "#050510", color: "#fff" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />
      {artistSchemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
      ))}

      {/* Hero */}
      <section className="px-6 pt-16 pb-10 text-center border-b border-white/5">
        <div className="text-xs font-mono tracking-widest mb-3" style={{ color: "#00FFFF" }}>GENRE HUB</div>
        <h1 className="text-3xl font-black mb-3">{page.label}</h1>
        <p className="text-sm text-white/50 max-w-xl mx-auto">{page.longDescription}</p>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* Stats */}
        <section className="grid grid-cols-3 gap-4">
          {[
            { label: "Artists", value: page.artistCount.toLocaleString(), color: "#00FFFF" },
            { label: "Battles/Week", value: page.battlesThisWeek, color: "#FF6B35" },
            { label: "Active Venues", value: page.venueCount, color: "#FFD700" },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl p-4 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs text-white/40 mt-1">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Top Artists */}
        {page.topArtists.length > 0 && (
          <section>
            <h2 className="text-xs font-mono tracking-widest text-white/50 mb-5">🎤 TOP {page.genre.toUpperCase()} ARTISTS</h2>
            <div className="space-y-2">
              {page.topArtists.map((artist, i) => (
                <Link
                  key={artist.slug}
                  href={`/artists/${artist.slug}`}
                  className="flex items-center gap-4 rounded-xl p-4 transition-all hover:scale-[1.01]"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <span className="text-xs font-mono w-6 text-center text-white/30">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white">{artist.name}</div>
                    <div className="text-xs text-white/40 mt-0.5">{artist.location}</div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(0,255,255,0.1)", color: "#00FFFF" }}>
                    {page.genre}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related Genres */}
        <section>
          <h2 className="text-xs font-mono tracking-widest text-white/50 mb-4">RELATED GENRES</h2>
          <div className="flex flex-wrap gap-2">
            {page.relatedGenres.map(related => (
              <Link
                key={related}
                href={`/genres/${related}`}
                className="px-3 py-1.5 rounded-full text-xs capitalize transition-all hover:scale-105"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
              >
                {related.replace(/-/g, " ")}
              </Link>
            ))}
          </div>
        </section>

        {/* CTAs */}
        <section className="flex flex-wrap gap-4 justify-center pt-4 border-t border-white/5">
          <Link href="/trending" className="px-6 py-3 rounded-full text-sm font-bold" style={{ background: "#00FFFF", color: "#000" }}>
            Trending Artists →
          </Link>
          <Link href="/battles/today" className="px-6 py-3 rounded-full text-sm font-bold" style={{ background: "rgba(255,107,53,0.15)", border: "1px solid rgba(255,107,53,0.4)", color: "#FF6B35" }}>
            Battles Today →
          </Link>
          <Link href="/genres" className="px-6 py-3 rounded-full text-sm font-bold" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
            All Genres →
          </Link>
        </section>
      </div>
    </main>
  );
}
