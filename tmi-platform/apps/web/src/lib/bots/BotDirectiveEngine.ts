import { BotDepartment, ensureBotWorkforceProfile } from "@/lib/bots/BotDepartmentEngine";

export type BotDirective = {
  directiveId: string;
  botId: string;
  department: BotDepartment;
  law: string;
  priority: "required" | "high" | "normal";
  active: boolean;
  createdAt: number;
  updatedAt: number;
};

const directiveMap = new Map<string, BotDirective[]>();

const coreLaws = [
  "complete assigned tasks",
  "report failures",
  "follow department priorities",
  "retry failed work",
  "escalate blockers",
];

function generateDirectiveId(botId: string, index: number) {
  return `directive-${botId}-${index + 1}`;
}

export function setBotDirective(input: {
  botId: string;
  department?: BotDepartment;
  law: string;
  priority?: "required" | "high" | "normal";
  active?: boolean;
}): BotDirective {
  const profile = ensureBotWorkforceProfile(input.botId);
  const now = Date.now();
  const directive: BotDirective = {
    directiveId: `directive-${input.botId}-${now}`,
    botId: input.botId,
    department: input.department ?? profile.department,
    law: input.law,
    priority: input.priority ?? "normal",
    active: input.active ?? true,
    createdAt: now,
    updatedAt: now,
  };
  const list = directiveMap.get(input.botId) ?? [];
  directiveMap.set(input.botId, [...list, directive]);
  return directive;
}

export function ensureBotDirectives(botId: string): BotDirective[] {
  const existing = directiveMap.get(botId);
  if (existing && existing.length > 0) return existing;

  const profile = ensureBotWorkforceProfile(botId);
  const now = Date.now();
  const seeded = coreLaws.map((law, index) => ({
    directiveId: generateDirectiveId(botId, index),
    botId,
    department: profile.department,
    law,
    priority: index === 0 ? "required" : "high",
    active: true,
    createdAt: now,
    updatedAt: now,
  })) as BotDirective[];

  directiveMap.set(botId, seeded);
  return seeded;
}

export function listBotDirectives(botId?: string): BotDirective[] {
  if (botId) return ensureBotDirectives(botId);
  return [...directiveMap.values()].flat();
}

export function hasUnguidedBots(botIds: string[]): boolean {
  return botIds.some((botId) => ensureBotDirectives(botId).length === 0);
}
