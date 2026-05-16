/**
 * YearlyDirectiveEngine
 * Generates the platform's annual vision, OKRs, and growth pillars.
 * Year-seeded. Resets on Jan 1. Gives Marcel and bots a north star for the year.
 */

import type { DirectiveRole } from "@/lib/directives/DailyDirectiveEngine";
import { botIntelligenceGrowthEngine } from '@/lib/learning/BotIntelligenceGrowthEngine';

export interface YearlyOKR {
  id: string;
  pillar: "growth" | "revenue" | "content" | "community" | "technology" | "brand";
  objective: string;
  keyResults: string[];
  owner: DirectiveRole | "admin";
  targetYear: number;
}

export interface YearlyBoard {
  year: number;
  okrs: YearlyOKR[];
  artistTargetEOY: number;
  fanTargetEOY: number;
  revenueTargetEOY: number;
  articleTargetEOY: number;
  battleTargetEOY: number;
  platformVersionTarget: string;
}

const GROWTH_OKRS = [
  {
    objective: "Grow artist roster to 500 verified profiles",
    keyResults: [
      "Onboard 100 new artists per quarter",
      "Achieve 80% profile completion rate",
      "Launch artist referral program with 25% uptake",
    ],
  },
  {
    objective: "Expand fan base to 50,000 active monthly users",
    keyResults: [
      "Run 4 viral fan campaigns across social",
      "Hit 10K MAU by Q2",
      "Launch fan loyalty tier with 5K enrolled",
    ],
  },
];

const REVENUE_OKRS = [
  {
    objective: "Hit $500K gross platform revenue",
    keyResults: [
      "Activate 20 sponsor accounts generating $200K",
      "Beat subscriptions generate $150K",
      "NFT/collectible drops generate $100K",
      "Tip revenue reaches $50K",
    ],
  },
  {
    objective: "Achieve $1M ARR run rate by Q4",
    keyResults: [
      "Launch premium fan tier at $9.99/mo",
      "Close 5 venue partnership deals",
      "Activate advertiser dashboard with 10 active buyers",
    ],
  },
];

const CONTENT_OKRS = [
  {
    objective: "Publish 500+ pieces of editorial content",
    keyResults: [
      "Publish 50 articles per month",
      "Produce 12 monthly magazine issues",
      "Generate 100 artist spotlight features",
    ],
  },
];

const COMMUNITY_OKRS = [
  {
    objective: "Build the most engaged music community in the app",
    keyResults: [
      "Run 200+ live battle events",
      "Launch fan chat in all venue rooms",
      "Hit 70% weekly active rate among subscribed fans",
    ],
  },
];

const TECHNOLOGY_OKRS = [
  {
    objective: "Ship a stable, scalable platform with zero P0 outages",
    keyResults: [
      "Achieve 99.5% uptime across all routes",
      "Ship avatar motion system to all 62+ bots",
      "Launch full admin observatory dashboard",
    ],
  },
];

const BRAND_OKRS = [
  {
    objective: "Establish TMI as the #1 music entertainment platform",
    keyResults: [
      "Land 3 press features in music media",
      "Hit 100K social followers combined",
      "Launch TMI brand campaign in Q3",
    ],
  },
];

function yearKey(): number {
  return new Date().getFullYear();
}

function yearHash(): number {
  return (yearKey() * 31) >>> 0;
}

function buildYearlyOKRs(): YearlyOKR[] {
  const year = yearKey();
  const pool: Array<{
    pillar: YearlyOKR["pillar"];
    owner: YearlyOKR["owner"];
    items: Array<{ objective: string; keyResults: string[] }>;
  }> = [
    { pillar: "growth",      owner: "stage_bot",     items: GROWTH_OKRS      },
    { pillar: "revenue",     owner: "sponsor_bot",   items: REVENUE_OKRS     },
    { pillar: "content",     owner: "editorial_bot", items: CONTENT_OKRS     },
    { pillar: "community",   owner: "stage_bot",     items: COMMUNITY_OKRS   },
    { pillar: "technology",  owner: "admin",         items: TECHNOLOGY_OKRS  },
    { pillar: "brand",       owner: "admin",         items: BRAND_OKRS       },
  ];

  return pool.flatMap(({ pillar, owner, items }, pi) =>
    items.map((item, ii) => ({
      id: `${year}-${pillar}-${ii}`,
      pillar,
      objective: item.objective,
      keyResults: item.keyResults,
      owner,
      targetYear: year,
    }))
  );
}

let _cached: YearlyBoard | null = null;
let _cachedYear = 0;

export function getYearlyBoard(): YearlyBoard {
  const year = yearKey();
  if (_cached && _cachedYear === year) return _cached;

  const okrs = buildYearlyOKRs();
  const adaptiveOkrs = botIntelligenceGrowthEngine
    .getPromptEffectiveness(3)
    .map((prompt, index) => ({
      id: `${year}-adaptive-bot-okr-${index}`,
      pillar: 'technology' as const,
      objective: `Evolve bot directive quality for ${prompt.promptId}`,
      keyResults: [
        `Increase prompt success rate from ${prompt.successRate}% to ${Math.min(99, prompt.successRate + 20)}%`,
        `Reduce failed behavior loops for ${prompt.promptId}`,
        'Keep all bot adaptation paths auditable and rollback-safe',
      ],
      owner: 'admin' as const,
      targetYear: year,
    }));
  const h = yearHash();

  _cached = {
    year,
    okrs: [...okrs, ...adaptiveOkrs],
    artistTargetEOY: 500 + (h % 501),
    fanTargetEOY: 50000 + (h % 50000),
    revenueTargetEOY: 500000 + (h % 500000),
    articleTargetEOY: 500 + (h % 200),
    battleTargetEOY: 200 + (h % 100),
    platformVersionTarget: `v${year - 2024 + 2}.0`,
  };
  _cachedYear = year;
  return _cached;
}

export function getOKRsByPillar(pillar: YearlyOKR["pillar"]): YearlyOKR[] {
  return getYearlyBoard().okrs.filter(o => o.pillar === pillar);
}

export function getYearlyBoardSummary(): string {
  const board = getYearlyBoard();
  return `${board.year} · ${board.okrs.length} OKRs · Revenue target: $${board.revenueTargetEOY.toLocaleString()} · Fan target: ${board.fanTargetEOY.toLocaleString()}`;
}
