import { BotDepartment, ensureBotWorkforceProfile } from "@/lib/bots/BotDepartmentEngine";

export type BotObjectiveStatus = "planned" | "active" | "blocked" | "completed";

export type BotObjective = {
  objectiveId: string;
  botId: string;
  department: BotDepartment;
  title: string;
  description: string;
  targetRoute: string;
  targetEngine: string;
  status: BotObjectiveStatus;
  progress: number;
  createdAt: number;
  updatedAt: number;
};

const objectiveMap = new Map<string, BotObjective[]>();

export function createBotObjective(input: {
  botId: string;
  title: string;
  description: string;
  targetRoute?: string;
  targetEngine?: string;
  status?: BotObjectiveStatus;
}): BotObjective {
  const profile = ensureBotWorkforceProfile(input.botId);
  const now = Date.now();
  const objective: BotObjective = {
    objectiveId: `objective-${input.botId}-${now}`,
    botId: input.botId,
    department: profile.department,
    title: input.title,
    description: input.description,
    targetRoute: input.targetRoute ?? profile.assignedRoute,
    targetEngine: input.targetEngine ?? profile.assignedEngine,
    status: input.status ?? "planned",
    progress: 0,
    createdAt: now,
    updatedAt: now,
  };

  const list = objectiveMap.get(input.botId) ?? [];
  objectiveMap.set(input.botId, [...list, objective]);
  return objective;
}

export function updateBotObjectiveProgress(objectiveId: string, progress: number): BotObjective | null {
  for (const [botId, objectives] of objectiveMap.entries()) {
    const index = objectives.findIndex((objective) => objective.objectiveId === objectiveId);
    if (index < 0) continue;
    const current = objectives[index];
    const nextProgress = Math.max(0, Math.min(100, progress));
    const next: BotObjective = {
      ...current,
      progress: nextProgress,
      status: nextProgress >= 100 ? "completed" : nextProgress > 0 ? "active" : current.status,
      updatedAt: Date.now(),
    };
    const copy = [...objectives];
    copy[index] = next;
    objectiveMap.set(botId, copy);
    return next;
  }
  return null;
}

export function listBotObjectives(botId?: string): BotObjective[] {
  if (botId) return objectiveMap.get(botId) ?? [];
  return [...objectiveMap.values()].flat();
}

export function ensureBotObjectives(botId: string): BotObjective[] {
  const existing = objectiveMap.get(botId);
  if (existing && existing.length > 0) return existing;
  const profile = ensureBotWorkforceProfile(botId);
  const seeded = [
    createBotObjective({
      botId,
      title: "Reach full profile coverage",
      description: "Complete profile surface coverage for assigned department routes.",
      targetRoute: profile.assignedRoute,
      targetEngine: profile.assignedEngine,
    }),
    createBotObjective({
      botId,
      title: "Complete all ticket visuals",
      description: "Maintain complete ticket visual chain without gaps.",
      targetRoute: "/tickets",
      targetEngine: "TicketEngine",
    }),
    createBotObjective({
      botId,
      title: "Fill all venue assets",
      description: "Maintain venue shell and stage visual readiness.",
      targetRoute: "/venues",
      targetEngine: "VenueSeatRenderer",
    }),
  ];
  objectiveMap.set(botId, seeded);
  return seeded;
}
