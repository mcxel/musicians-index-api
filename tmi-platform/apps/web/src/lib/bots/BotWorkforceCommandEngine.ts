export type BotCommand =
  | "deploy" | "recall" | "pause" | "resume" | "reassign" | "escalate" | "retire";

export type CommandPriority = "routine" | "urgent" | "critical" | "override";

export interface BotCommandRecord {
  commandId: string;
  issuedBy: string;
  botId: string;
  command: BotCommand;
  priority: CommandPriority;
  payload?: Record<string, string | number | boolean>;
  issuedAt: string;
  acknowledgedAt?: string;
  status: "issued" | "acknowledged" | "executed" | "rejected";
}

const commandLog: BotCommandRecord[] = [];
const commandIndex = new Map<string, BotCommandRecord>();

function gen(): string {
  return `cmd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function issueCommand(
  issuedBy: string,
  botId: string,
  command: BotCommand,
  priority: CommandPriority = "routine",
  payload?: Record<string, string | number | boolean>,
): BotCommandRecord {
  const record: BotCommandRecord = {
    commandId: gen(),
    issuedBy,
    botId,
    command,
    priority,
    payload,
    issuedAt: new Date().toISOString(),
    status: "issued",
  };
  commandLog.unshift(record);
  commandIndex.set(record.commandId, record);
  return record;
}

export function acknowledgeCommand(commandId: string): BotCommandRecord | null {
  const record = commandIndex.get(commandId);
  if (!record) return null;
  record.acknowledgedAt = new Date().toISOString();
  record.status = "acknowledged";
  return record;
}

export function executeCommand(commandId: string): BotCommandRecord | null {
  const record = commandIndex.get(commandId);
  if (!record) return null;
  record.status = "executed";
  return record;
}

export function rejectCommand(commandId: string): BotCommandRecord | null {
  const record = commandIndex.get(commandId);
  if (!record) return null;
  record.status = "rejected";
  return record;
}

export function getCommandLog(botId?: string, limit = 50): BotCommandRecord[] {
  const log = botId ? commandLog.filter((c) => c.botId === botId) : commandLog;
  return log.slice(0, limit);
}

export function getPendingCommands(botId: string): BotCommandRecord[] {
  return commandLog.filter((c) => c.botId === botId && c.status === "issued");
}

export function broadcastCommand(
  issuedBy: string,
  botIds: string[],
  command: BotCommand,
  priority: CommandPriority = "routine",
): BotCommandRecord[] {
  return botIds.map((botId) => issueCommand(issuedBy, botId, command, priority));
}
