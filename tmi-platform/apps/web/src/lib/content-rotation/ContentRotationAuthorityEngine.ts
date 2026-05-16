// ContentRotationAuthorityEngine
// Decides where content appears. Not random chaos — weighted, scored, surface-correct.

import type { ArticleClass, PlacementSurface, RotationEntry, SurfaceClassRule } from "./types";

// Surface → permitted article classes
const SURFACE_CLASS_RULES: SurfaceClassRule[] = [
  {
    surface: "homepage-2",
    allowedClasses: ["news", "culture", "industry", "global-news", "community"],
    forbiddenClasses: ["sponsor", "advertiser"],
  },
  {
    surface: "homepage-4",
    allowedClasses: ["sponsor", "advertiser", "venue"],
    forbiddenClasses: ["artist", "performer"],
  },
  {
    surface: "homepage-5",
    allowedClasses: ["battle-recap", "cypher-recap", "news", "artist"],
    forbiddenClasses: ["advertiser"],
  },
  {
    surface: "magazine-spread",
    allowedClasses: [
      "news", "artist", "performer", "sponsor", "advertiser", "venue",
      "battle-recap", "cypher-recap", "community", "culture", "industry",
      "creator-tools", "global-news", "interview", "cartoon", "poll",
    ],
    forbiddenClasses: [],
  },
  {
    surface: "artist-page",
    allowedClasses: ["artist", "interview", "news", "culture"],
    forbiddenClasses: ["sponsor", "advertiser", "venue"],
  },
  {
    surface: "performer-page",
    allowedClasses: ["performer", "battle-recap", "cypher-recap", "interview"],
    forbiddenClasses: ["sponsor", "advertiser"],
  },
  {
    surface: "battle-page",
    allowedClasses: ["battle-recap", "artist", "performer", "news"],
    forbiddenClasses: ["sponsor", "advertiser", "venue"],
  },
  {
    surface: "sponsor-page",
    allowedClasses: ["sponsor", "news", "culture"],
    forbiddenClasses: ["advertiser", "battle-recap"],
  },
  {
    surface: "venue-page",
    allowedClasses: ["venue", "news", "culture", "community"],
    forbiddenClasses: ["sponsor", "advertiser"],
  },
  {
    surface: "trending-rail",
    allowedClasses: ["news", "artist", "performer", "battle-recap", "culture"],
    forbiddenClasses: ["sponsor", "advertiser"],
  },
  {
    surface: "news-rail",
    allowedClasses: ["news", "industry", "culture", "global-news"],
    forbiddenClasses: ["sponsor", "advertiser"],
  },
  {
    surface: "discovery-rail",
    allowedClasses: ["artist", "performer", "venue", "community"],
    forbiddenClasses: ["sponsor", "advertiser", "news"],
  },
];

export function getRulesForSurface(surface: PlacementSurface): SurfaceClassRule | undefined {
  return SURFACE_CLASS_RULES.find(r => r.surface === surface);
}

export function isArticleAllowedOnSurface(
  articleClass: ArticleClass,
  surface: PlacementSurface,
): boolean {
  const rule = getRulesForSurface(surface);
  if (!rule) return true; // permissive default for unlisted surfaces
  if (rule.forbiddenClasses.includes(articleClass)) return false;
  if (rule.allowedClasses.length === 0) return true;
  return rule.allowedClasses.includes(articleClass);
}

export function filterEntriesForSurface(
  entries: RotationEntry[],
  surface: PlacementSurface,
): RotationEntry[] {
  return entries.filter(e => isArticleAllowedOnSurface(e.articleClass, surface));
}

export function selectWeightedEntry(entries: RotationEntry[]): RotationEntry | null {
  if (!entries.length) return null;
  const totalWeight = entries.reduce((sum, e) => sum + e.weight * e.score, 0);
  if (totalWeight <= 0) return entries[0] ?? null;
  let rng = Math.random() * totalWeight;
  for (const entry of entries) {
    rng -= entry.weight * entry.score;
    if (rng <= 0) return entry;
  }
  return entries[entries.length - 1] ?? null;
}

export function selectArticleForSurface(
  pool: RotationEntry[],
  surface: PlacementSurface,
): RotationEntry | null {
  const allowed = filterEntriesForSurface(pool, surface);
  return selectWeightedEntry(allowed);
}
