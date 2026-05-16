export type BlankSeatState = "inactive" | "listening" | "testing" | "reporting";

export type BlankSeatPerformerBot = {
  id: string;
  label: string;
  status: "active" | "idle" | "paused";
  state: BlankSeatState;
  currentLobbyId?: string;
  currentRoute: string;
  currentTask: string;
  feedHealth: {
    video: "ok" | "degraded" | "down";
    audio: "ok" | "degraded" | "down";
    chat: "ok" | "degraded" | "down";
  };
  sandboxWallet: {
    mode: "sandbox-only";
    balance: number;
    payoutsEnabled: false;
  };
  telemetry: {
    lastActionAt: number;
    checksRun: number;
    errors: number;
  };
  privacy: {
    publicOnly: true;
    noPrivateRoomAccess: true;
    noImpersonation: true;
    noMinorPrivateAccess: true;
  };
};

export type BlankSeatActionLog = {
  id: string;
  botId: string;
  action: string;
  lobbyId?: string;
  route?: string;
  success: boolean;
  blocked: boolean;
  reason?: string;
  timestamp: number;
};

let actionCounter = 1;
const actionLog: BlankSeatActionLog[] = [];

export const BLANK_SEAT_PERFORMER_BOTS: BlankSeatPerformerBot[] = [
  {
    id: "blank-seat-bot-001",
    label: "[BOT][TEST] BlankSeat Alpha",
    status: "active",
    state: "inactive",
    currentRoute: "/lobby",
    currentTask: "awaiting-inspection-task",
    feedHealth: { video: "ok", audio: "ok", chat: "ok" },
    sandboxWallet: { mode: "sandbox-only", balance: 100, payoutsEnabled: false },
    telemetry: { lastActionAt: Date.now(), checksRun: 0, errors: 0 },
    privacy: {
      publicOnly: true,
      noPrivateRoomAccess: true,
      noImpersonation: true,
      noMinorPrivateAccess: true,
    },
  },
  {
    id: "blank-seat-bot-002",
    label: "[BOT][TEST] BlankSeat Beta",
    status: "active",
    state: "listening",
    currentRoute: "/lobby",
    currentTask: "listening-state-monitor",
    feedHealth: { video: "ok", audio: "ok", chat: "ok" },
    sandboxWallet: { mode: "sandbox-only", balance: 100, payoutsEnabled: false },
    telemetry: { lastActionAt: Date.now(), checksRun: 0, errors: 0 },
    privacy: {
      publicOnly: true,
      noPrivateRoomAccess: true,
      noImpersonation: true,
      noMinorPrivateAccess: true,
    },
  },
];

function emitBotEvent(name: string, detail: unknown) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }
}

function pushLog(entry: Omit<BlankSeatActionLog, "id" | "timestamp">) {
  const record: BlankSeatActionLog = {
    ...entry,
    id: `BLANK-BOT-LOG-${String(actionCounter++).padStart(5, "0")}`,
    timestamp: Date.now(),
  };
  actionLog.push(record);
  emitBotEvent("tmi:blank-seat-action", record);
  return record;
}

export function getBlankSeatBots(): BlankSeatPerformerBot[] {
  return [...BLANK_SEAT_PERFORMER_BOTS];
}

export function getBlankSeatBotById(botId: string): BlankSeatPerformerBot | undefined {
  return BLANK_SEAT_PERFORMER_BOTS.find((b) => b.id === botId);
}

export function getBlankSeatActionLog(): BlankSeatActionLog[] {
  return [...actionLog];
}

export function setBlankSeatState(botId: string, state: BlankSeatState, task: string): boolean {
  const bot = getBlankSeatBotById(botId);
  if (!bot) return false;
  bot.state = state;
  bot.currentTask = task;
  bot.telemetry.lastActionAt = Date.now();
  bot.telemetry.checksRun += 1;
  pushLog({ botId, action: `state:${state}`, route: bot.currentRoute, success: true, blocked: false });
  return true;
}

export function updateBlankSeatFeedHealth(
  botId: string,
  feed: "video" | "audio" | "chat",
  health: "ok" | "degraded" | "down"
): boolean {
  const bot = getBlankSeatBotById(botId);
  if (!bot) return false;
  bot.feedHealth[feed] = health;
  bot.telemetry.lastActionAt = Date.now();
  if (health !== "ok") bot.telemetry.errors += 1;
  pushLog({ botId, action: `feed:${feed}:${health}`, route: bot.currentRoute, success: true, blocked: false });
  return true;
}

export function moveBlankSeatBot(botId: string, route: string, lobbyId?: string): boolean {
  const bot = getBlankSeatBotById(botId);
  if (!bot) return false;
  bot.currentRoute = route;
  bot.currentLobbyId = lobbyId;
  bot.telemetry.lastActionAt = Date.now();
  pushLog({ botId, action: "move", lobbyId, route, success: true, blocked: false });
  return true;
}

export function blockBlankSeatAction(
  botId: string,
  action: string,
  reason: string,
  route?: string,
  lobbyId?: string
): void {
  const bot = getBlankSeatBotById(botId);
  if (bot) {
    bot.telemetry.errors += 1;
    bot.telemetry.lastActionAt = Date.now();
  }
  pushLog({ botId, action, route, lobbyId, success: false, blocked: true, reason });
}
