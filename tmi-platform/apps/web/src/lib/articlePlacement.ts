/**
 * Article Placement Engine
 * Maps article categories → homepage belt slots automatically.
 * Powers the Magazine CMS auto-layout system.
 */

export type ArticleCategory =
  | 'FEATURED'
  | 'NEWS'
  | 'INTERVIEW'
  | 'REVIEW'
  | 'EVENTS'
  | 'SPONSOR'
  | 'ARTIST'
  | 'CHART'
  | 'RANDOM';

export type BeltKey =
  | 'cover'
  | 'news'
  | 'interviews'
  | 'reviews'
  | 'events'
  | 'sponsor'
  | 'artist'
  | 'chart'
  | 'random';

/** Auto-placement rules: article category → homepage belt */
export const CATEGORY_TO_BELT: Record<string, BeltKey> = {
  FEATURED:  'cover',      // → Home Page 1 magazine cover
  NEWS:      'news',       // → Latest News ticker belt
  INTERVIEW: 'interviews', // → Interviews belt
  REVIEW:    'reviews',    // → Reviews belt
  EVENTS:    'events',     // → Events belt
  SPONSOR:   'sponsor',    // → Sponsored content belt
  ARTIST:    'artist',     // → Artist profile pages
  CHART:     'chart',      // → Charts belt
  RANDOM:    'random',     // → Random magazine pages
};

/** Resolve which belt an article belongs to based on its category */
export function getArticleBelt(category: string | null | undefined): BeltKey {
  if (!category) return 'random';
  return CATEGORY_TO_BELT[category.toUpperCase()] ?? 'random';
}

/** Group an array of articles by their target belt */
export function groupArticlesByBelt<T extends { category?: string | null }>(
  articles: T[],
): Record<BeltKey, T[]> {
  const grouped: Record<BeltKey, T[]> = {
    cover: [], news: [], interviews: [], reviews: [],
    events: [], sponsor: [], artist: [], chart: [], random: [],
  };
  for (const article of articles) {
    const belt = getArticleBelt(article.category);
    grouped[belt].push(article);
  }
  return grouped;
}

/** Filter articles for a specific belt */
export function getArticlesForBelt<T extends { category?: string | null }>(
  belt: BeltKey,
  articles: T[],
): T[] {
  return articles.filter((a) => getArticleBelt(a.category) === belt);
}

/** All valid belt keys in display order */
export const BELT_ORDER: BeltKey[] = [
  'cover', 'news', 'interviews', 'reviews', 'events',
  'sponsor', 'artist', 'chart', 'random',
];
