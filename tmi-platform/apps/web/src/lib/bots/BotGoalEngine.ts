import { getMCAuthorityStatus } from "@/lib/admin/MCAuthorityEngine";
import { ensureBotWorkforceProfile } from "@/lib/bots/BotDepartmentEngine";

export type BotGoalPeriod = "daily" | "weekly" | "monthly" | "yearly";

export type BotGoal = {
  goalId: string;
  botId: string;
  department: string;
  period: BotGoalPeriod;
  title: string;
  type: string;
  target: number;
  progress: number;
  revenueWeight: number;
  assignedRoute: string;
  assignedEngine: string;
  assignedTask: string;
  riskLevel: "low" | "medium" | "high";
  mcStatus: "green" | "yellow" | "red";
  bigAceVisible: boolean;
  dueAt: number;
  createdAt: number;
  updatedAt: number;
  status: "on-track" | "at-risk" | "achieved";
};

const goals = new Map<string, BotGoal>();

export function createBotGoal(input: Omit<BotGoal, "progress" | "status" | "createdAt" | "updatedAt" | "mcStatus" | "department">): BotGoal {
  const profile = ensureBotWorkforceProfile(input.botId);
  const now = Date.now();
  const goal: BotGoal = {
    ...input,
    department: profile.department,
    progress: 0,
    mcStatus: getMCAuthorityStatus(input.goalId, "goal"),
    createdAt: now,
    updatedAt: now,
    status: "on-track",
  };
  goals.set(goal.goalId, goal);
  return goal;
}

export function incrementBotGoal(goalId: string, by = 1): BotGoal | null {
  const goal = goals.get(goalId);
  if (!goal) return null;
  const progress = goal.progress + by;
  const status: BotGoal["status"] =
    progress >= goal.target ? "achieved" : progress >= goal.target * 0.6 ? "on-track" : "at-risk";
  const next = {
    ...goal,
    progress,
    status,
    mcStatus: getMCAuthorityStatus(goal.goalId, "goal"),
    updatedAt: Date.now(),
  };
  goals.set(goalId, next);
  return next;
}

export function listBotGoals(botId?: string): BotGoal[] {
  const all = [...goals.values()];
  return botId ? all.filter((g) => g.botId === botId) : all;
}

export function ensureBotGoals(botId: string): BotGoal[] {
  const existing = listBotGoals(botId);
  if (existing.length > 0) return existing;

  const profile = ensureBotWorkforceProfile(botId);
  const now = Date.now();
  const daily = createBotGoal({
    goalId: `goal-${botId}-daily`,
    botId,
    period: "daily",
    title: "Generate 20 assets today",
    type: "asset-output",
    target: 20,
    revenueWeight: 3,
    assignedRoute: profile.assignedRoute,
    assignedEngine: profile.assignedEngine,
    assignedTask: `task-${botId}-daily`,
    riskLevel: "medium",
    bigAceVisible: true,
    dueAt: now + 24 * 60 * 60 * 1000,
  });

  const weekly = createBotGoal({
    goalId: `goal-${botId}-weekly`,
    botId,
    period: "weekly",
    title: "Clear queue this week",
    type: "queue-clear",
    target: 1,
    revenueWeight: 4,
    assignedRoute: profile.assignedRoute,
    assignedEngine: profile.assignedEngine,
    assignedTask: `task-${botId}-weekly`,
    riskLevel: "high",
    bigAceVisible: true,
    dueAt: now + 7 * 24 * 60 * 60 * 1000,
  });

  const monthly = createBotGoal({
    goalId: `goal-${botId}-monthly`,
    botId,
    period: "monthly",
    title: "Complete venue coverage this month",
    type: "coverage",
    target: 1,
    revenueWeight: 5,
    assignedRoute: "/venues",
    assignedEngine: "VenueSeatRenderer",
    assignedTask: `task-${botId}-monthly`,
    riskLevel: "medium",
    bigAceVisible: true,
    dueAt: now + 30 * 24 * 60 * 60 * 1000,
  });

  const yearly = createBotGoal({
    goalId: `goal-${botId}-yearly`,
    botId,
    period: "yearly",
    title: "Maintain governed workforce compliance",
    type: "compliance",
    target: 12,
    revenueWeight: 6,
    assignedRoute: "/admin/bots/governance",
    assignedEngine: "BotReportingEngine",
    assignedTask: `task-${botId}-yearly`,
    riskLevel: "low",
    bigAceVisible: true,
    dueAt: now + 365 * 24 * 60 * 60 * 1000,
  });

  return [daily, weekly, monthly, yearly];
}
