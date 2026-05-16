// WeightedRandomSpreadEngine
// Controls "random" page distribution in magazine spreads.
// Balanced — not repetitive. Mix: artist, news, venue, battle, sponsor, poll.

import type { ArticleClass } from "./types";

export interface SpreadSlot {
  position: number;
  articleClass: ArticleClass;
  articleId?: string;
}

// Target proportions per spread cycle (30 slots = full issue section)
const CLASS_TARGET_RATIOS: Record<ArticleClass, number> = {
  artist:          0.22,
  performer:       0.10,
  news:            0.15,
  culture:         0.07,
  industry:        0.05,
  "battle-recap":  0.08,
  "cypher-recap":  0.05,
  venue:           0.06,
  sponsor:         0.06,
  advertiser:      0.04,
  community:       0.04,
  "creator-tools": 0.03,
  "global-news":   0.02,
  interview:       0.02,
  cartoon:         0.01,
  poll:            0.01,
};

// Zone weightings: each zone biases certain article classes
const ZONE_BIAS: Record<"early" | "mid" | "late", Partial<Record<ArticleClass, number>>> = {
  early: {
    artist:         1.5,
    "battle-recap": 1.4,
    news:           1.3,
  },
  mid: {
    performer:       1.4,
    "cypher-recap":  1.4,
    culture:         1.3,
    venue:           1.2,
  },
  late: {
    sponsor:         1.3,
    advertiser:      1.2,
    community:       1.3,
    "creator-tools": 1.2,
    poll:            1.4,
    cartoon:         1.4,
  },
};

function getZone(position: number, totalSlots: number): "early" | "mid" | "late" {
  const pct = position / totalSlots;
  if (pct < 0.33) return "early";
  if (pct < 0.66) return "mid";
  return "late";
}

export function buildSpreadPlan(
  totalSlots: number,
  availableArticles: { id: string; articleClass: ArticleClass }[],
): SpreadSlot[] {
  const slots: SpreadSlot[] = [];
  const usedIds = new Set<string>();

  // Build a weighted bucket per position
  for (let i = 0; i < totalSlots; i++) {
    const zone = getZone(i, totalSlots);
    const bias = ZONE_BIAS[zone];

    // Compute effective weights for this position
    const weights: Array<{ articleClass: ArticleClass; w: number }> = (
      Object.keys(CLASS_TARGET_RATIOS) as ArticleClass[]
    ).map(cls => ({
      articleClass: cls,
      w: CLASS_TARGET_RATIOS[cls] * (bias[cls] ?? 1.0),
    }));

    const total = weights.reduce((s, x) => s + x.w, 0);
    let rng = Math.random() * total;

    let chosenClass: ArticleClass = "news";
    for (const { articleClass, w } of weights) {
      rng -= w;
      if (rng <= 0) {
        chosenClass = articleClass;
        break;
      }
    }

    // Pick an article of that class that hasn't been used yet
    const candidates = availableArticles.filter(
      a => a.articleClass === chosenClass && !usedIds.has(a.id),
    );

    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    if (chosen) {
      usedIds.add(chosen.id);
      slots.push({ position: i, articleClass: chosenClass, articleId: chosen.id });
    } else {
      // Fallback: any unused article
      const fallback = availableArticles.find(a => !usedIds.has(a.id));
      if (fallback) {
        usedIds.add(fallback.id);
        slots.push({ position: i, articleClass: fallback.articleClass, articleId: fallback.id });
      } else {
        slots.push({ position: i, articleClass: chosenClass });
      }
    }
  }

  return slots;
}
