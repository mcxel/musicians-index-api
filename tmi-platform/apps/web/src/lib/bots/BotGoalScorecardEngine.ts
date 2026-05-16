import { listBotGoals } from "@/lib/bots/BotGoalEngine";

export interface GoalScorecardRow {
  botId: string;
  goalsTotal: number;
  goalsAchieved: number;
  goalsAtRisk: number;
  goalsOnTrack: number;
  completionPct: number;
  weightedRevenueScore: number;
  grade: "S" | "A" | "B" | "C" | "F";
}

export interface PlatformScorecard {
  generatedAt: string;
  totalBots: number;
  platformCompletionPct: number;
  platformRevenueScore: number;
  topBot: string | null;
  rows: GoalScorecardRow[];
}

function grade(pct: number): GoalScorecardRow["grade"] {
  if (pct >= 95) return "S";
  if (pct >= 80) return "A";
  if (pct >= 65) return "B";
  if (pct >= 45) return "C";
  return "F";
}

export function getScorecardForBot(botId: string): GoalScorecardRow {
  const goals = listBotGoals(botId);
  const achieved = goals.filter((g) => g.status === "achieved").length;
  const atRisk   = goals.filter((g) => g.status === "at-risk").length;
  const onTrack  = goals.filter((g) => g.status === "on-track").length;
  const completionPct = goals.length > 0 ? Math.round((achieved / goals.length) * 100) : 0;
  const weightedRevenueScore = goals.reduce((acc, g) => {
    const ratio = g.target > 0 ? Math.min(g.progress / g.target, 1) : 0;
    return acc + ratio * g.revenueWeight;
  }, 0);

  return {
    botId,
    goalsTotal: goals.length,
    goalsAchieved: achieved,
    goalsAtRisk: atRisk,
    goalsOnTrack: onTrack,
    completionPct,
    weightedRevenueScore,
    grade: grade(completionPct),
  };
}

export function getPlatformScorecard(botIds: string[]): PlatformScorecard {
  const rows = botIds.map(getScorecardForBot);
  const totalGoals = rows.reduce((s, r) => s + r.goalsTotal, 0);
  const totalAchieved = rows.reduce((s, r) => s + r.goalsAchieved, 0);
  const platformCompletionPct = totalGoals > 0 ? Math.round((totalAchieved / totalGoals) * 100) : 0;
  const platformRevenueScore = rows.reduce((s, r) => s + r.weightedRevenueScore, 0);
  const topBot = rows.sort((a, b) => b.completionPct - a.completionPct)[0]?.botId ?? null;

  return {
    generatedAt: new Date().toISOString(),
    totalBots: botIds.length,
    platformCompletionPct,
    platformRevenueScore,
    topBot,
    rows,
  };
}
