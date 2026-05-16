/**
 * LivingEditorialEngine
 * Master orchestrator for which articles appear on which surface.
 * Uses date-seeded rotation so content feels fresh every day without being random.
 *
 * ROUTE      → SURFACE KEY
 * /           → "homepage"
 * /magazine   → "lobby"
 * /articles   → "archive"
 * /home/1     → "home1"
 * /live       → "live"
 * sidebar     → "sidebar"
 */

import { getArticlePool } from "@/lib/editorial/ArticleGenerationEngine";
import type { MagazineArticle } from "@/lib/magazine/magazineIssueData";
import { contentInterestEngine } from '@/lib/learning/ContentInterestEngine';

export type EditorialSurface =
  | "homepage"
  | "lobby"
  | "archive"
  | "home1"
  | "home2"
  | "live"
  | "sidebar"
  | "winner"
  | "artist"
  | "battle";

const SURFACE_WEIGHTS: Record<EditorialSurface, { categories: string[]; count: number }> = {
  homepage:  { categories: ["feature", "news"],        count: 4  },
  lobby:     { categories: ["feature", "interview"],   count: 6  },
  archive:   { categories: ["feature", "interview", "review", "editorial", "news"], count: 20 },
  home1:     { categories: ["feature"],                count: 3  },
  home2:     { categories: ["news", "editorial"],      count: 4  },
  live:      { categories: ["news", "feature"],        count: 3  },
  sidebar:   { categories: ["news"],                   count: 5  },
  winner:    { categories: ["feature", "interview"],   count: 3  },
  artist:    { categories: ["feature", "interview", "review"], count: 4 },
  battle:    { categories: ["news", "editorial"],      count: 3  },
};

function daysSinceEpoch(): number {
  return Math.floor(Date.now() / 86_400_000);
}

function stableShuffleSlice<T>(arr: T[], seed: number, count: number): T[] {
  const copy = [...arr];
  let s = seed;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

export function getArticlesForSurface(surface: EditorialSurface): MagazineArticle[] {
  const config = SURFACE_WEIGHTS[surface];
  const pool = getArticlePool().filter(a => config.categories.includes(a.category));
  const seed = daysSinceEpoch() + surface.split("").reduce((h, c) => h + c.charCodeAt(0), 0);
  const shuffled = stableShuffleSlice(pool, seed, config.count * 2);
  const interest = contentInterestEngine.getTopContent(200);
  const interestScore = new Map(interest.map((item) => [item.contentId, item.score]));

  return shuffled
    .sort((a, b) => {
      const scoreA = interestScore.get(a.slug) ?? 0;
      const scoreB = interestScore.get(b.slug) ?? 0;
      return scoreB - scoreA;
    })
    .slice(0, config.count);
}

export function getHomepageHeroArticle(): MagazineArticle | null {
  const articles = getArticlesForSurface("homepage");
  const ranked = contentInterestEngine.getTopContent(20);
  const hero = ranked.find((item) => articles.some((article) => article.slug === item.contentId));
  if (hero) {
    return articles.find((article) => article.slug === hero.contentId) ?? articles[0] ?? null;
  }
  return articles[0] ?? null;
}

export function getSidebarArticles(): MagazineArticle[] {
  return getArticlesForSurface("sidebar");
}

export function getWinnerContextArticles(winnerSlug: string): MagazineArticle[] {
  const pool = getArticlePool().filter(a =>
    a.tags.some(t => t.toLowerCase().includes(winnerSlug.replace("-", " ")))
  );
  return pool.length >= 2 ? pool.slice(0, 2) : getArticlesForSurface("winner").slice(0, 2);
}

export function getArtistContextArticles(artistSlug: string): MagazineArticle[] {
  const name = artistSlug.replace(/-/g, " ");
  const pool = getArticlePool().filter(a =>
    a.title.toLowerCase().includes(name.toLowerCase()) ||
    a.tags.some(t => t.toLowerCase().includes(name.toLowerCase()))
  );
  return pool.length >= 2 ? pool.slice(0, 3) : getArticlesForSurface("artist").slice(0, 3);
}
