/**
 * MonthlyDirectiveEngine
 * Generates the platform's monthly goals, campaigns, and growth targets.
 * Month-seeded for consistency. Resets on the 1st of each month.
 * Admins see full board. Bots receive their assigned monthly mission.
 */

import type { DirectiveRole, DirectivePriority } from "@/lib/directives/DailyDirectiveEngine";
import { botIntelligenceGrowthEngine } from '@/lib/learning/BotIntelligenceGrowthEngine';

export interface MonthlyDirective {
  id: string;
  role: DirectiveRole;
  priority: DirectivePriority;
  campaign: string;
  goal: string;
  metric: string;
  target: number;
  resetAt: string;
}

export interface MonthlyBoard {
  month: string;
  directives: MonthlyDirective[];
  artistGrowthTarget: number;
  fanGrowthTarget: number;
  revenueTarget: number;
  battleGoal: number;
  articlePublishTarget: number;
  platformHealthFloor: number;
}

const EDITORIAL_CAMPAIGNS = [
  "Launch Monthly Music Spotlight Series",
  "Publish 30 artist deep-dive features",
  "Run genre-of-the-month editorial arc",
  "Curate top 10 rising artists feature",
  "Produce monthly venue highlight package",
];

const STAGE_CAMPAIGNS = [
  "Host 20 live battle events",
  "Fill 10 new venue rooms to capacity",
  "Run monthly championship bracket",
  "Launch weekly open-mic series",
  "Activate 5 new venue partnerships",
];

const MODERATION_CAMPAIGNS = [
  "Full platform content audit",
  "Review and approve 50 artist submissions",
  "Implement updated community guidelines",
  "Reduce violation rate by 15%",
  "Complete sponsor brand safety review",
];

const SPONSOR_CAMPAIGNS = [
  "Activate 5 new sponsor partnerships",
  "Deliver monthly sponsor performance reports",
  "Launch co-branded artist campaign",
  "Hit sponsor impression quota for month",
  "Onboard 2 new advertiser accounts",
];

const ANALYTICS_CAMPAIGNS = [
  "Deliver monthly platform health report",
  "Identify top 20 performing content surfaces",
  "Score monthly battle champion leaderboard",
  "Produce artist growth trend analysis",
  "Benchmark engagement vs prior month",
];

const CAMERA_CAMPAIGNS = [
  "Build monthly highlight reel package",
  "Set camera protocols for all prime-time events",
  "Produce 3 cinematic venue flythrough sequences",
  "Capture monthly crown ceremony footage",
  "Archive best crowd reaction moments",
];

function monthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthHash(): number {
  return monthKey().split("-").reduce((h, n) => h * 31 + parseInt(n), 0) >>> 0;
}

function lastDayOfMonth(): string {
  const d = new Date();
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return last.toISOString().split("T")[0] + "T23:59:59Z";
}

function pickCampaign(campaigns: string[], index: number): string {
  return campaigns[(monthHash() + index) % campaigns.length];
}

function buildMonthlyDirectives(): MonthlyDirective[] {
  const month = monthKey();
  const roles: Array<{ role: DirectiveRole; campaigns: string[]; priority: DirectivePriority; targets: number[] }> = [
    { role: "editorial_bot",   campaigns: EDITORIAL_CAMPAIGNS,  priority: "P0", targets: [30, 25, 20, 15, 10] },
    { role: "stage_bot",       campaigns: STAGE_CAMPAIGNS,      priority: "P0", targets: [20, 15, 10, 8, 5]  },
    { role: "moderation_bot",  campaigns: MODERATION_CAMPAIGNS, priority: "P1", targets: [50, 40, 30, 20, 10] },
    { role: "sponsor_bot",     campaigns: SPONSOR_CAMPAIGNS,    priority: "P1", targets: [5, 4, 3, 2, 1]    },
    { role: "analytics_bot",   campaigns: ANALYTICS_CAMPAIGNS,  priority: "P1", targets: [1, 1, 1, 1, 1]    },
    { role: "camera_bot",      campaigns: CAMERA_CAMPAIGNS,     priority: "P2", targets: [10, 8, 6, 4, 2]   },
  ];

  const resetAt = lastDayOfMonth();

  return roles.flatMap(({ role, campaigns, priority, targets }, ri) =>
    campaigns.slice(0, 3).map((_, ci) => ({
      id: `${month}-${role}-${ci}`,
      role,
      priority,
      campaign: pickCampaign(campaigns, ri + ci),
      goal: `Complete by end of month`,
      metric: `${targets[ci % targets.length]} units`,
      target: targets[ci % targets.length],
      resetAt,
    }))
  );
}

let _cached: MonthlyBoard | null = null;
let _cachedMonth = "";

export function getMonthlyBoard(): MonthlyBoard {
  const month = monthKey();
  if (_cached && _cachedMonth === month) return _cached;

  const directives = buildMonthlyDirectives();
  const h = monthHash();

  const adaptiveCampaigns = botIntelligenceGrowthEngine
    .getPromptEffectiveness(4)
    .map((prompt, index) => ({
      id: `${month}-adaptive-campaign-${index}`,
      role: 'analytics_bot' as DirectiveRole,
      priority: (prompt.successRate < 45 ? 'P0' : prompt.successRate < 70 ? 'P1' : 'P2') as DirectivePriority,
      campaign: `${prompt.recommendation}: ${prompt.promptId}`,
      goal: 'Scale high-performing bot prompt behavior into monthly operations',
      metric: `${prompt.successRate}% success`,
      target: Math.max(1, Math.round(prompt.successRate / 10)),
      resetAt: lastDayOfMonth(),
    }));

  _cached = {
    month,
    directives: [...directives, ...adaptiveCampaigns],
    artistGrowthTarget: 50 + (h % 51),
    fanGrowthTarget: 500 + (h % 500),
    revenueTarget: 10000 + (h % 40000),
    battleGoal: 20 + (h % 11),
    articlePublishTarget: 30 + (h % 21),
    platformHealthFloor: 80 + (h % 15),
  };
  _cachedMonth = month;
  return _cached;
}

export function getMonthlyDirectivesForRole(role: DirectiveRole): MonthlyDirective[] {
  return getMonthlyBoard().directives.filter(d => d.role === role);
}

export function getMonthlyP0Directives(): MonthlyDirective[] {
  return getMonthlyBoard().directives.filter(d => d.priority === "P0");
}

export function getMonthlyBoardSummary(): string {
  const board = getMonthlyBoard();
  return `${board.month} · ${board.directives.length} campaigns · Revenue target: $${board.revenueTarget.toLocaleString()} · Artist growth: +${board.artistGrowthTarget}`;
}
