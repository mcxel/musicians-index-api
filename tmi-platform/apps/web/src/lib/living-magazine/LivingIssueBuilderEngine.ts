// LivingIssueBuilderEngine
// Assembles a magazine issue from best articles, interviews, cartoons,
// battle recaps, sponsors, world pulse, and new artist discovery.
// No static layout — each issue generated from content pool.

import type { MagazineIssue, MagazineSpread, SpreadLayout, MagazineModule } from "./types";

const ISSUE_TEMPLATE: Array<{
  slotType: MagazineSpread["slotType"];
  zone: MagazineSpread["zone"];
  layout: SpreadLayout;
}> = [
  // Early zone (spreads 0–9)
  { slotType: "editorial",      zone: "early", layout: "full-spread"    },
  { slotType: "discovery",      zone: "early", layout: "editorial-A"    },
  { slotType: "battle-recap",   zone: "early", layout: "battle-recap"   },
  { slotType: "editorial",      zone: "early", layout: "split-70-30"    },
  { slotType: "discovery",      zone: "early", layout: "discovery-grid" },
  { slotType: "sponsored-boost",zone: "early", layout: "promo-banner"   },
  { slotType: "editorial",      zone: "early", layout: "editorial-B"    },
  { slotType: "discovery",      zone: "early", layout: "collage-4"      },
  { slotType: "battle-recap",   zone: "early", layout: "split-50-50"    },
  { slotType: "editorial",      zone: "early", layout: "editorial-A"    },

  // Mid zone (spreads 10–29)
  { slotType: "discovery",      zone: "mid", layout: "discovery-grid"  },
  { slotType: "editorial",      zone: "mid", layout: "editorial-A"     },
  { slotType: "editorial",      zone: "mid", layout: "editorial-B"     },
  { slotType: "discovery",      zone: "mid", layout: "collage-6"       },
  { slotType: "editorial",      zone: "mid", layout: "split-70-30"     },
  { slotType: "venue-promo",    zone: "mid", layout: "promo-banner"    },
  { slotType: "discovery",      zone: "mid", layout: "collage-4"       },
  { slotType: "editorial",      zone: "mid", layout: "editorial-A"     },
  { slotType: "wildcard",       zone: "mid", layout: "community-wall"  },
  { slotType: "editorial",      zone: "mid", layout: "editorial-B"     },
  { slotType: "discovery",      zone: "mid", layout: "discovery-grid"  },
  { slotType: "editorial",      zone: "mid", layout: "split-50-50"     },
  { slotType: "battle-recap",   zone: "mid", layout: "battle-recap"    },
  { slotType: "editorial",      zone: "mid", layout: "editorial-A"     },
  { slotType: "sponsored-boost",zone: "mid", layout: "promo-banner"    },
  { slotType: "discovery",      zone: "mid", layout: "collage-6"       },
  { slotType: "editorial",      zone: "mid", layout: "editorial-B"     },
  { slotType: "wildcard",       zone: "mid", layout: "collage-4"       },
  { slotType: "editorial",      zone: "mid", layout: "full-spread"     },
  { slotType: "discovery",      zone: "mid", layout: "split-70-30"     },

  // Late zone (spreads 30+)
  { slotType: "wildcard",       zone: "late", layout: "community-wall" },
  { slotType: "venue-promo",    zone: "late", layout: "promo-banner"   },
  { slotType: "sponsored-boost",zone: "late", layout: "split-50-50"    },
  { slotType: "editorial",      zone: "late", layout: "editorial-A"    },
  { slotType: "wildcard",       zone: "late", layout: "collage-4"      },
  { slotType: "editorial",      zone: "late", layout: "editorial-B"    },
  { slotType: "venue-promo",    zone: "late", layout: "split-70-30"    },
  { slotType: "wildcard",       zone: "late", layout: "collage-6"      },
];

export function buildIssue(
  issueNumber: number,
  modules: MagazineModule[],
  contributorIds: string[],
): MagazineIssue {
  const spreads: MagazineSpread[] = ISSUE_TEMPLATE.map((template, idx) => ({
    spreadIndex: idx,
    layout: template.layout,
    zone: template.zone,
    slotType: template.slotType,
    modules: [], // populated by InteractiveMagazineModuleEngine
  }));

  return {
    id: `issue-${issueNumber}`,
    issueNumber,
    title: `TMI Magazine — Issue ${issueNumber}`,
    publishedAt: new Date().toISOString(),
    spreads,
    totalSpreads: spreads.length,
    contributorIds,
    revenueAttributed: 0,
  };
}

export function injectModulesIntoIssue(
  issue: MagazineIssue,
  modules: MagazineModule[],
): MagazineIssue {
  const moduleQueue = [...modules];
  const spreads = issue.spreads.map(spread => ({
    ...spread,
    modules: moduleQueue.splice(0, getModuleCountForLayout(spread.layout)),
  }));
  return { ...issue, spreads };
}

function getModuleCountForLayout(layout: SpreadLayout): number {
  const counts: Record<SpreadLayout, number> = {
    "full-spread":    1,
    "split-50-50":    2,
    "split-70-30":    2,
    "collage-4":      4,
    "collage-6":      6,
    "editorial-A":    1,
    "editorial-B":    1,
    "promo-banner":   1,
    "community-wall": 3,
    "discovery-grid": 6,
    "battle-recap":   2,
  };
  return counts[layout] ?? 1;
}
