/**
 * DailyDirectiveEngine
 * Generates the platform's daily work board — tasks, goals, and priorities.
 * Resets every 24h. Date-seeded for consistency across instances.
 * Bots receive assigned tasks. Admins see the full board.
 */

import { botIntelligenceGrowthEngine } from '@/lib/learning/BotIntelligenceGrowthEngine';

export type DirectiveRole =
  | "editorial_bot"
  | "stage_bot"
  | "moderation_bot"
  | "sponsor_bot"
  | "analytics_bot"
  | "camera_bot"
  | "artist"
  | "fan"
  | "venue"
  | "admin";

export type DirectivePriority = "P0" | "P1" | "P2";

export interface Directive {
  id: string;
  role: DirectiveRole;
  priority: DirectivePriority;
  task: string;
  goal: string;
  metric: string;
  resetAt: string;
}

export interface DailyBoard {
  date: string;
  directives: Directive[];
  articleGoal: number;
  engagementTarget: number;
  sponsorActivations: number;
  botTaskCount: number;
  platformHealthScore: number;
}

const EDITORIAL_TASKS = [
  "Publish 3 new artist feature articles",
  "Generate genre editorial for top trending genre",
  "Update article previews on magazine lobby",
  "Rotate homepage headline article",
  "Surface 5 event recap articles from this week",
];

const STAGE_TASKS = [
  "Spin up 2 live battle rooms",
  "Fill audience seats to 80% capacity",
  "Run crowd energy warmup sequence",
  "Queue 3 bot performers for open slots",
  "Trigger venue lighting sequence for prime time",
];

const MODERATION_TASKS = [
  "Scan all active rooms for policy violations",
  "Review 10 pending artist profile submissions",
  "Clear flagged content queue",
  "Audit sponsor placements for brand safety",
  "Verify all new article content passes quality gate",
];

const SPONSOR_TASKS = [
  "Rotate sponsor banners across active venues",
  "Send daily sponsor impression report",
  "Activate 2 scheduled sponsor ad placements",
  "Check sponsor budget pacing",
  "Insert sponsor article into magazine rotation",
];

const ANALYTICS_TASKS = [
  "Calculate daily XP delta for all active users",
  "Update trending artist rankings",
  "Score today's battle outcomes",
  "Push engagement analytics to admin dashboard",
  "Flag underperforming content surfaces",
];

const CAMERA_TASKS = [
  "Set opening camera sweep for prime-time session",
  "Queue crowd cam cuts for 3 active rooms",
  "Activate winner ceremony camera sequence",
  "Run audience reaction camera director",
  "Sync camera to beat drop events in battle rooms",
];

function dayKey(): string {
  return new Date().toISOString().split("T")[0];
}

function dayHash(): number {
  return dayKey().split("-").reduce((h, n) => h * 31 + parseInt(n), 0) >>> 0;
}

function pickTask(tasks: string[], index: number): string {
  return tasks[(dayHash() + index) % tasks.length];
}

function buildDirectives(): Directive[] {
  const date = dayKey();
  const roles: Array<{ role: DirectiveRole; tasks: string[]; priority: DirectivePriority }> = [
    { role: "editorial_bot",   tasks: EDITORIAL_TASKS,  priority: "P0" },
    { role: "stage_bot",       tasks: STAGE_TASKS,      priority: "P0" },
    { role: "moderation_bot",  tasks: MODERATION_TASKS, priority: "P1" },
    { role: "sponsor_bot",     tasks: SPONSOR_TASKS,    priority: "P1" },
    { role: "analytics_bot",   tasks: ANALYTICS_TASKS,  priority: "P1" },
    { role: "camera_bot",      tasks: CAMERA_TASKS,     priority: "P2" },
  ];

  return roles.flatMap(({ role, tasks, priority }, ri) =>
    tasks.slice(0, 3).map((_, ti) => ({
      id: `${date}-${role}-${ti}`,
      role,
      priority,
      task: pickTask(tasks, ri + ti),
      goal: `Complete by end of day`,
      metric: `1 unit`,
      resetAt: `${date}T23:59:59Z`,
    }))
  );
}

let _cached: DailyBoard | null = null;
let _cachedDate = "";

export function getDailyBoard(): DailyBoard {
  const today = dayKey();
  if (_cached && _cachedDate === today) return _cached;

  const directives = buildDirectives();
  const h = dayHash();

  const adaptiveBotTasks = botIntelligenceGrowthEngine
    .getPromptEffectiveness(6)
    .map((prompt, idx) => ({
      id: `${today}-adaptive-bot-${idx}`,
      role: 'analytics_bot' as DirectiveRole,
      priority: (prompt.successRate < 45 ? 'P0' : prompt.successRate < 70 ? 'P1' : 'P2') as DirectivePriority,
      task: `${prompt.recommendation}: ${prompt.promptId}`,
      goal: 'Improve bot runtime outcomes using learned prompt performance',
      metric: `${prompt.successRate}% success rate`,
      resetAt: `${today}T23:59:59Z`,
    }));

  _cached = {
    date: today,
    directives: [...directives, ...adaptiveBotTasks],
    articleGoal: 5 + (h % 6),
    engagementTarget: 80 + (h % 20),
    sponsorActivations: 2 + (h % 4),
    botTaskCount: directives.length,
    platformHealthScore: 85 + (h % 15),
  };
  _cachedDate = today;
  return _cached;
}

export function getDirectivesForRole(role: DirectiveRole): Directive[] {
  return getDailyBoard().directives.filter(d => d.role === role);
}

export function getP0Directives(): Directive[] {
  return getDailyBoard().directives.filter(d => d.priority === "P0");
}

export function getBotTaskSummary(): string {
  const board = getDailyBoard();
  return `${board.date} · ${board.botTaskCount} tasks · Article goal: ${board.articleGoal} · Health: ${board.platformHealthScore}%`;
}
