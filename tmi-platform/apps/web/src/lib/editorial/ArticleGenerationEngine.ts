/**
 * ArticleGenerationEngine
 * Generates a large pool of article surfaces from artist, event, and genre data.
 * Extends MAGAZINE_ISSUE_1 into a 100+ article registry.
 */

import { MAGAZINE_ISSUE_1, type MagazineArticle } from "@/lib/magazine/magazineIssueData";
import { ARTIST_SEED } from "@/lib/artists/artistSeed";
import { contentInterestEngine } from '@/lib/learning/ContentInterestEngine';

const GENRE_LIST = ["Hip-Hop", "R&B", "Pop", "Electronic", "Afrobeats", "Trap", "EDM", "Jazz", "Soul", "Rock"] as const;

const ARTICLE_TEMPLATES = {
  feature:    { prefix: "Inside", suffix: "World",      color: "#FFD700" },
  interview:  { prefix: "Talking With", suffix: "",     color: "#FF2DAA" },
  news:       { prefix: "Breaking:", suffix: "Latest",  color: "#00FFFF" },
  editorial:  { prefix: "The Truth About", suffix: "",  color: "#AA2DFF" },
  review:     { prefix: "We Heard", suffix: "EP",       color: "#00FF88" },
} as const;

type GeneratedCategory = keyof typeof ARTICLE_TEMPLATES;

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function dateOffset(daysBack: number): string {
  const d = new Date("2026-05-10");
  d.setDate(d.getDate() - daysBack);
  return d.toISOString().split("T")[0];
}

function pickCategory(index: number): GeneratedCategory {
  const cats: GeneratedCategory[] = ["feature", "interview", "news", "editorial", "review"];
  return cats[index % cats.length];
}

function buildArticleBlocks(artistName: string, genre: string): MagazineArticle["blocks"] {
  return [
    {
      type: "paragraph",
      text: `${artistName} has been making waves across the ${genre} scene with a relentless work ethic and a sound that cuts through noise. This week, TMI sits down to break down the journey in full.`,
    },
    {
      type: "pullquote",
      text: `"The platform gave me a stage when I had none. Now I'm building my own." — ${artistName}`,
    },
    {
      type: "paragraph",
      text: `From underground cyphers to the main stage, ${artistName}'s trajectory is a case study in what TMI was built to support. Fans are voting. The numbers are moving. The crown is in play.`,
    },
    {
      type: "paragraph",
      text: `With new beats dropping and a battle record that speaks for itself, the next chapter is already written. TMI readers get exclusive access before the wider world catches on.`,
    },
  ];
}

function generateArtistArticles(): MagazineArticle[] {
  return ARTIST_SEED.slice(0, 40).map((artist, i) => {
    const cat = pickCategory(i);
    const tmpl = ARTICLE_TEMPLATES[cat];
    const title = `${tmpl.prefix} ${artist.name}${tmpl.suffix ? " " + tmpl.suffix : ""}`;
    const slug = slugify(`${cat}-${artist.name}-${i}`);
    return {
      slug,
      title,
      subtitle: `${artist.genre} · TMI Profile Feature`,
      author: "TMI Editorial Team",
      publishedAt: dateOffset(i * 2),
      category: cat,
      tags: [artist.genre, "TMI", "artist", cat],
      heroColor: ARTICLE_TEMPLATES[cat].color,
      icon: "🎤",
      blocks: buildArticleBlocks(artist.name, artist.genre),
    };
  });
}

function generateGenreArticles(): MagazineArticle[] {
  return GENRE_LIST.map((genre, i) => ({
    slug: slugify(`genre-deep-dive-${genre}`),
    title: `The ${genre} Movement on TMI`,
    subtitle: `Inside the culture, the artists, and the battles shaping ${genre} this season.`,
    author: "TMI Editorial Team",
    publishedAt: dateOffset(3 + i * 3),
    category: "editorial" as const,
    tags: [genre, "TMI", "genre", "editorial"],
    heroColor: ["#FFD700", "#FF2DAA", "#00FFFF", "#AA2DFF", "#00FF88", "#FF6B35", "#00FFFF", "#FFD700", "#FF2DAA", "#00FF88"][i % 10],
    icon: "🎵",
    blocks: [
      {
        type: "paragraph" as const,
        text: `${genre} is having a moment on TMI. Artists are battling, fans are voting, and the numbers don't lie — the genre is surging.`,
      },
      {
        type: "paragraph" as const,
        text: `With multiple TMI battles resolved in ${genre} categories this month, the editorial desk breaks down who's rising, who's falling, and what the data says about the future.`,
      },
    ],
  }));
}

function generateEventArticles(): MagazineArticle[] {
  const events = [
    "Grand Contest Season 1",
    "Monday Night Cypher",
    "Beat Battle Vol.5",
    "Monthly Idol March",
    "World Party Host Cup",
    "DJ Showcase Cup",
    "Name That Tune",
    "Fan Bracket Tournament",
  ];
  return events.map((event, i) => ({
    slug: slugify(`event-recap-${event}`),
    title: `${event}: Full Recap`,
    subtitle: `Everything that happened, everyone who won, and what comes next.`,
    author: "TMI Events Desk",
    publishedAt: dateOffset(1 + i * 4),
    category: "news" as const,
    tags: ["event", "recap", "TMI", "contest"],
    heroColor: ["#00FFFF", "#FFD700", "#FF2DAA", "#AA2DFF", "#00FF88", "#FF6B35", "#00FFFF", "#FF2DAA"][i % 8],
    icon: "🏆",
    blocks: [
      {
        type: "paragraph" as const,
        text: `${event} wrapped with a night nobody is going to forget. TMI's editorial desk was there from setup to final announcement. Here's the full play-by-play.`,
      },
      {
        type: "paragraph" as const,
        text: `The judges scored. The fans voted. The crown changed hands. Get the full breakdown, winner profiles, and what this result means for the season standings.`,
      },
    ],
  }));
}

const GENERATED_ARTICLES: MagazineArticle[] = [
  ...MAGAZINE_ISSUE_1,
  ...generateArtistArticles(),
  ...generateGenreArticles(),
  ...generateEventArticles(),
];

export function getArticlePool(): MagazineArticle[] {
  return GENERATED_ARTICLES;
}

export function getAdaptiveArticlePool(limit = GENERATED_ARTICLES.length): MagazineArticle[] {
  const signals = contentInterestEngine.getTopContent(limit * 2);
  const signalMap = new Map(signals.map((signal) => [signal.contentId, signal.score]));

  return [...GENERATED_ARTICLES]
    .sort((a, b) => {
      const scoreA = signalMap.get(a.slug) ?? 0;
      const scoreB = signalMap.get(b.slug) ?? 0;
      return scoreB - scoreA;
    })
    .slice(0, limit);
}

export function getArticlesByCategory(category: string): MagazineArticle[] {
  return GENERATED_ARTICLES.filter(a => a.category === category);
}

export function getArticleBySlugFromPool(slug: string): MagazineArticle | undefined {
  return GENERATED_ARTICLES.find(a => a.slug === slug);
}

export function getRecentArticles(count: number): MagazineArticle[] {
  return GENERATED_ARTICLES.slice(0, count);
}

export function getArticlesForGenre(genre: string, count: number): MagazineArticle[] {
  const matching = GENERATED_ARTICLES.filter(a =>
    a.tags.some(t => t.toLowerCase() === genre.toLowerCase())
  );
  return matching.slice(0, count);
}

export function getTotalArticleCount(): number {
  return GENERATED_ARTICLES.length;
}
