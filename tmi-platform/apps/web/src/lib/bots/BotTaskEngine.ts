import { getMCAuthorityStatus } from "@/lib/admin/MCAuthorityEngine";
import { ensureBotWorkforceProfile } from "@/lib/bots/BotDepartmentEngine";

export type BotTaskStatus =
  | "pending"
  | "active"
  | "blocked"
  | "completed"
  | "failed"
  | "retrying"
  | "escalated"
  | "signed_off";

export type BotTask = {
  taskId: string;
  type: string;
  priority: "low" | "medium" | "high" | "critical";
  assignedBot: string;
  riskLevel: "low" | "medium" | "high";
  department: string;
  assignedRoute: string;
  assignedEngine: string;
  objective: string;
  progress: number;
  startTime: number;
  deadline?: number;
  checkpointList: string[];
  successCriteria: string[];
  failureCriteria: string[];
  completedWork: number;
  failedWork: number;
  blockedWork: number;
  retryWork: number;
  performanceScore: number;
  mcStatus: "green" | "yellow" | "red";
  bigAceVisible: boolean;
  status: BotTaskStatus;
  nextAction?: string;
  repeatSchedule?: "hourly" | "daily" | "weekly" | "monthly";
};

const tasks = new Map<string, BotTask>();

export function createBotTask(input: Omit<BotTask, "startTime" | "status" | "mcStatus" | "department"> & { status?: BotTaskStatus }): BotTask {
  const profile = ensureBotWorkforceProfile(input.assignedBot);
  const task: BotTask = {
    ...input,
    department: profile.department,
    startTime: Date.now(),
    mcStatus: getMCAuthorityStatus(input.taskId, "task"),
    status: input.status ?? "pending",
  };
  tasks.set(task.taskId, task);
  return task;
}

export function getBotTask(taskId: string): BotTask | null {
  return tasks.get(taskId) ?? null;
}

export function listBotTasks(botId?: string): BotTask[] {
  const all = [...tasks.values()];
  return botId ? all.filter((t) => t.assignedBot === botId) : all;
}

export function updateBotTaskStatus(taskId: string, status: BotTaskStatus, nextAction?: string): BotTask | null {
  const task = tasks.get(taskId);
  if (!task) return null;
  const next = {
    ...task,
    status,
    nextAction: nextAction ?? task.nextAction,
    progress: status === "completed" ? 100 : task.progress,
    mcStatus: getMCAuthorityStatus(taskId, "task"),
  };
  tasks.set(taskId, next);
  return next;
}

export function updateBotTaskProgress(taskId: string, progress: number): BotTask | null {
  const task = tasks.get(taskId);
  if (!task) return null;
  const safeProgress = Math.max(0, Math.min(100, progress));
  const nextStatus: BotTaskStatus = safeProgress >= 100 ? "completed" : safeProgress > 0 ? "active" : task.status;
  const next = {
    ...task,
    progress: safeProgress,
    status: nextStatus,
    mcStatus: getMCAuthorityStatus(taskId, "task"),
  };
  tasks.set(taskId, next);
  return next;
}

export function ensureBotTasks(botId: string): BotTask[] {
  const existing = listBotTasks(botId);
  if (existing.length > 0) return existing;

  const profile = ensureBotWorkforceProfile(botId);
  const tasksForBot = [
    createBotTask({
      taskId: `task-${botId}-directive`,
      type: "directive-compliance",
      priority: "high",
      assignedBot: botId,
      riskLevel: "medium",
      assignedRoute: profile.assignedRoute,
      assignedEngine: profile.assignedEngine,
      objective: "complete assigned tasks",
      progress: 0,
      deadline: Date.now() + 6 * 60 * 60 * 1000,
      checkpointList: ["daily"],
      successCriteria: ["task complete"],
      failureCriteria: ["missed deadline"],
      completedWork: 0,
      failedWork: 0,
      blockedWork: 0,
      retryWork: 0,
      performanceScore: 80,
      bigAceVisible: true,
      repeatSchedule: "daily",
    }),
    createBotTask({
      taskId: `task-${botId}-queue`,
      type: "queue-clear",
      priority: "critical",
      assignedBot: botId,
      riskLevel: "high",
      assignedRoute: profile.assignedRoute,
      assignedEngine: profile.assignedEngine,
      objective: "clear queue",
      progress: 0,
      deadline: Date.now() + 24 * 60 * 60 * 1000,
      checkpointList: ["daily", "weekly"],
      successCriteria: ["queue zero"],
      failureCriteria: ["backlog spike"],
      completedWork: 0,
      failedWork: 0,
      blockedWork: 0,
      retryWork: 0,
      performanceScore: 70,
      bigAceVisible: true,
      repeatSchedule: "weekly",
    }),
  ];

  return tasksForBot;
}
