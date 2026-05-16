import { getMCAuthorityStatus } from "@/lib/admin/MCAuthorityEngine";
import {
  ensureBotWorkforceProfile,
  getBotCommandChain,
  listBotWorkforceProfiles,
  setBotWorkforceRisk,
} from "@/lib/bots/BotDepartmentEngine";
import { ensureBotTasks, listBotTasks } from "@/lib/bots/BotTaskEngine";
import { ensureBotGoals, listBotGoals } from "@/lib/bots/BotGoalEngine";

export type BotReportingNode = "bot" | "supervisor" | "department-lead" | "mc" | "big-ace";

export type BotWorkReport = {
  reportId: string;
  botId: string;
  department: string;
  assignedRoute: string;
  assignedEngine: string;
  assignedTask: string;
  riskLevel: "low" | "medium" | "high";
  mcStatus: "green" | "yellow" | "red";
  bigAceVisible: boolean;
  completedWork: number;
  failedWork: number;
  blockedWork: number;
  retryWork: number;
  performanceScore: number;
  missedGoals: number;
  chain: BotReportingNode[];
  auditNote: string;
  createdAt: number;
};

const reportMap = new Map<string, BotWorkReport[]>();

function toChainNodes(botId: string): BotReportingNode[] {
  return getBotCommandChain(botId).map((node) => node.role as BotReportingNode);
}

export function publishBotWorkReport(input: {
  botId: string;
  assignedTask: string;
  completedWork: number;
  failedWork: number;
  blockedWork: number;
  retryWork: number;
  performanceScore: number;
  missedGoals?: number;
  auditNote?: string;
}): BotWorkReport {
  const profile = ensureBotWorkforceProfile(input.botId);
  const mcStatus = getMCAuthorityStatus(input.assignedTask, "task");
  const report: BotWorkReport = {
    reportId: `report-${input.botId}-${Date.now()}`,
    botId: input.botId,
    department: profile.department,
    assignedRoute: profile.assignedRoute,
    assignedEngine: profile.assignedEngine,
    assignedTask: input.assignedTask,
    riskLevel: profile.riskLevel,
    mcStatus,
    bigAceVisible: true,
    completedWork: input.completedWork,
    failedWork: input.failedWork,
    blockedWork: input.blockedWork,
    retryWork: input.retryWork,
    performanceScore: input.performanceScore,
    missedGoals: input.missedGoals ?? 0,
    chain: toChainNodes(input.botId),
    auditNote: input.auditNote ?? "governance report generated",
    createdAt: Date.now(),
  };

  const list = reportMap.get(input.botId) ?? [];
  reportMap.set(input.botId, [report, ...list]);

  if (report.failedWork > 0 || report.blockedWork > 0) setBotWorkforceRisk(input.botId, "high");
  else if (report.retryWork > 0) setBotWorkforceRisk(input.botId, "medium");
  else setBotWorkforceRisk(input.botId, "low");

  return report;
}

export function listBotReports(botId?: string): BotWorkReport[] {
  if (botId) return reportMap.get(botId) ?? [];
  return [...reportMap.values()].flat().sort((a, b) => b.createdAt - a.createdAt);
}

export function ensureBotReports(botId: string): BotWorkReport[] {
  const existing = listBotReports(botId);
  if (existing.length > 0) return existing;

  const tasks = ensureBotTasks(botId);
  ensureBotGoals(botId);
  const goals = listBotGoals(botId);
  const missedGoals = goals.filter((goal) => goal.status === "at-risk").length;

  const seeded = tasks.map((task, index) =>
    publishBotWorkReport({
      botId,
      assignedTask: task.taskId,
      completedWork: index === 0 ? 7 : 3,
      failedWork: index === 0 ? 0 : 1,
      blockedWork: 0,
      retryWork: index === 0 ? 1 : 2,
      performanceScore: index === 0 ? 91 : 72,
      missedGoals,
      auditNote: "seeded governance report",
    }),
  );

  return seeded;
}

export function summarizeGovernanceReports() {
  const reports = listBotReports();
  const workers = listBotWorkforceProfiles();

  const workingBots = new Set(reports.filter((report) => report.completedWork > 0).map((report) => report.botId));
  const failingBots = new Set(reports.filter((report) => report.failedWork > 0 || report.blockedWork > 0).map((report) => report.botId));
  const completedBots = new Set(reports.filter((report) => report.performanceScore >= 85).map((report) => report.botId));
  const missedGoalBots = new Set(reports.filter((report) => report.missedGoals > 0).map((report) => report.botId));
  const reassignmentBots = new Set(reports.filter((report) => report.performanceScore < 60 || report.riskLevel === "high").map((report) => report.botId));

  return {
    totalBots: workers.length,
    totalReports: reports.length,
    working: workingBots.size,
    failing: failingBots.size,
    completed: completedBots.size,
    missedGoals: missedGoalBots.size,
    needsReassignment: reassignmentBots.size,
    green: reports.filter((report) => report.mcStatus === "green").length,
    yellow: reports.filter((report) => report.mcStatus === "yellow").length,
    red: reports.filter((report) => report.mcStatus === "red").length,
  };
}

export function ensureGovernanceDataset() {
  const profiles = listBotWorkforceProfiles();
  const botIds = profiles.map((profile) => profile.botId);
  botIds.forEach((botId) => {
    ensureBotTasks(botId);
    ensureBotGoals(botId);
    ensureBotReports(botId);
  });
  return {
    tasks: listBotTasks(),
    goals: listBotGoals(),
    reports: listBotReports(),
  };
}
