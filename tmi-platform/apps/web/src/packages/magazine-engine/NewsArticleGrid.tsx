"use client";

import { ImageSlotWrapper } from '@/components/visual-enforcement';
/**
 * NewsArticleGrid
 *
 * Pulls articles from the news registry (or accepts a prop override).
 * Renders a magazine-style news grid with category-coded cards.
 * Every card routes to its article page.
 */

import Link from "next/link";

export type NewsArticleEntry = {
  id: string;
  headline: string;
  subhead?: string;
  category: "ranking" | "battle" | "cypher" | "event" | "interview" | "announce";
  publishedAt: string;
  href: string;
  image?: string;
  featured?: boolean;
};

const FALLBACK_NEWS: NewsArticleEntry[] = [
  {
    id: "news-crown-update",
    headline: "New #1 Crowned — Ranking Update",
    subhead: "The votes are in. See who took the top spot this week.",
    category: "ranking",
    publishedAt: "Today",
    href: "/magazine/news/crown-update",
    featured: true,
  },
  {
    id: "news-battle-recap",
    headline: "Guitar vs Guitar Battle Recap",
    subhead: "Highlights from last night's showdown.",
    category: "battle",
    publishedAt: "Yesterday",
    href: "/magazine/news/guitar-battle-recap",
  },
  {
    id: "news-cypher-night",
    headline: "Late Night Cypher Room Results",
    subhead: "Top 5 performers of the week.",
    category: "cypher",
    publishedAt: "2 days ago",
    href: "/magazine/news/cypher-results",
  },
  {
    id: "news-artist-talk",
    headline: "Artist Talk Show Premiere Tonight",
    subhead: "Watch live at 8PM on TMI.",
    category: "event",
    publishedAt: "Today",
    href: "/shows/talk",
  },
  {
    id: "news-world-dance",
    headline: "World Dance Party — All Genres Welcome",
    subhead: "Join 2000+ fans dancing live.",
    category: "event",
    publishedAt: "Today",
    href: "/shows/dance",
  },
  {
    id: "news-comedy-night",
    headline: "Comedy Night: Rising Comedians",
    subhead: "TMI presents the best new comedy acts.",
    category: "event",
    publishedAt: "Tomorrow",
    href: "/shows/comedy",
  },
];

const CATEGORY_STYLE: Record<string, { bg: string; label: string }> = {
  ranking: { bg: "bg-yellow-600", label: "📊 Ranking" },
  battle: { bg: "bg-red-700", label: "⚔️ Battle" },
  cypher: { bg: "bg-purple-700", label: "🎤 Cypher" },
  event: { bg: "bg-emerald-700", label: "🎪 Event" },
  interview: { bg: "bg-cyan-700", label: "🎙️ Interview" },
  announce: { bg: "bg-slate-700", label: "📢 Announce" },
};

export type NewsArticleGridProps = {
  articles?: NewsArticleEntry[];
  columns?: 2 | 3 | 4;
  title?: string;
  showFeaturedFirst?: boolean;
  "data-testid"?: string;
};

export default function NewsArticleGrid({
  articles = FALLBACK_NEWS,
  columns = 3,
  title = "TMI Magazine News",
  showFeaturedFirst = true,
  "data-testid": testId,
}: NewsArticleGridProps) {
  const sorted = showFeaturedFirst
    ? [...articles].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    : articles;

  const colMap = { 2: "grid-cols-2", 3: "grid-cols-2 md:grid-cols-3", 4: "grid-cols-2 md:grid-cols-4" };

  return (
    <section
      className="news-article-grid"
      data-testid={testId ?? "news-article-grid"}
      aria-label={title}
    >
      <h2 className="news-grid__title mb-3 text-lg font-black text-white">{title}</h2>
      <div className={`grid gap-3 ${colMap[columns]}`}>
        {sorted.map((article) => {
          const cat = CATEGORY_STYLE[article.category] ?? { bg: "bg-slate-700", label: article.category };
          return (
            <Link
              key={article.id}
              href={article.href}
              className={`news-card group relative overflow-hidden rounded-lg bg-white/5 p-3 transition hover:bg-white/10 ${article.featured ? "col-span-2 md:col-span-1" : ""}`}
              data-testid={`news-card-${article.id}`}
            >
              {article.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <ImageSlotWrapper imageId="img-b1zlxb" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
              )}
              <span className={`mb-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold text-white ${cat.bg}`}>
                {cat.label}
              </span>
              <h3 className="line-clamp-2 text-sm font-bold text-white group-hover:text-cyan-300">
                {article.headline}
              </h3>
              {article.subhead && (
                <p className="mt-0.5 line-clamp-2 text-xs text-white/60">{article.subhead}</p>
              )}
              <p className="mt-1 text-[10px] text-white/40">{article.publishedAt}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
