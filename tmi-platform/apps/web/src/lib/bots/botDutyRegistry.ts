/**
 * botDutyRegistry.ts
 *
 * Defines all bot duty types, classes, and the duty assignment registry.
 * Each bot has a role, class, duties, and current assignment.
 */

export type BotClass =
  | "welcome-bot"
  | "hype-bot"
  | "helper-bot"
  | "mod-bot"
  | "route-watcher-bot"
  | "maintenance-bot"
  | "host-bot"
  | "dev-audit-bot"
  | "discovery-bot"
  | "cypher-bot";

export type BotDutyType =
  | "join-public-room"
  | "welcome-user"
  | "encourage-user"
  | "find-lobby"
  | "find-game"
  | "find-concert"
  | "find-article"
  | "keep-room-active"
  | "host-event"
  | "moderate-public-space"
  | "detect-broken-route"
  | "detect-broken-button"
  | "detect-broken-feed"
  | "create-maintenance-ticket"
  | "support-developer-workflow"
  | "audit-report"
  | "report-to-admin";

export type BotStatus = "idle" | "active" | "paused" | "suspended" | "on-duty";

export type BotSafetyFlags = {
  /** Always shown as bot, never as human */
  labeledAsBot: boolean;
  /** Cannot impersonate humans */
  noHumanImpersonation: boolean;
  /** Cannot enter private rooms unless explicitly invited */
  publicRoomsOnly: boolean;
  /** Cannot send or receive real money */
  noRealMoneyTransfer: boolean;
  /** Cannot abuse reward/points systems */
  noRewardAbuse: boolean;
  /** Obeys youth/adult content separation */
  ageSeperationEnforced: boolean;
  /** All actions logged */
  allActionsLogged: boolean;
};

export type BotDutyEntry = {
  botId: string;
  botClass: BotClass;
  displayName: string;
  /** MUST always be shown in UI as a bot label */
  botLabel: string;
  duties: BotDutyType[];
  status: BotStatus;
  currentRoom?: string;
  currentTask?: string;
  safetyFlags: BotSafetyFlags;
  createdAt: number;
  lastActiveAt: number;
};

const DEFAULT_SAFETY: BotSafetyFlags = {
  labeledAsBot: true,
  noHumanImpersonation: true,
  publicRoomsOnly: true,
  noRealMoneyTransfer: true,
  noRewardAbuse: true,
  ageSeperationEnforced: true,
  allActionsLogged: true,
};

const BOT_DUTY_MAP: Record<BotClass, BotDutyType[]> = {
  "welcome-bot": ["join-public-room", "welcome-user", "find-lobby"],
  "hype-bot": ["join-public-room", "encourage-user", "keep-room-active"],
  "helper-bot": ["join-public-room", "find-lobby", "find-game", "find-concert", "find-article"],
  "mod-bot": ["moderate-public-space", "report-to-admin"],
  "route-watcher-bot": ["detect-broken-route", "detect-broken-button", "detect-broken-feed", "create-maintenance-ticket"],
  "maintenance-bot": ["create-maintenance-ticket", "support-developer-workflow", "report-to-admin"],
  "host-bot": ["join-public-room", "host-event", "keep-room-active"],
  "dev-audit-bot": ["audit-report", "support-developer-workflow", "report-to-admin"],
  "discovery-bot": ["find-article", "find-game", "find-concert", "find-lobby"],
  "cypher-bot": ["join-public-room", "host-event", "encourage-user"],
};

// Permanent bot registry — seeded at startup
export const PERMANENT_BOT_REGISTRY: BotDutyEntry[] = [
  {
    botId: "welcome-bot-001",
    botClass: "welcome-bot",
    displayName: "TMI Welcome Bot",
    botLabel: "[BOT] Welcome",
    duties: BOT_DUTY_MAP["welcome-bot"],
    status: "active",
    currentRoom: "main-lobby",
    currentTask: "welcome-user",
    safetyFlags: DEFAULT_SAFETY,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  },
  {
    botId: "hype-bot-001",
    botClass: "hype-bot",
    displayName: "Hype Bot Alpha",
    botLabel: "[BOT] Hype",
    duties: BOT_DUTY_MAP["hype-bot"],
    status: "active",
    currentRoom: "cypher-arena",
    currentTask: "keep-room-active",
    safetyFlags: DEFAULT_SAFETY,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  },
  {
    botId: "helper-bot-001",
    botClass: "helper-bot",
    displayName: "TMI Helper Bot",
    botLabel: "[BOT] Helper",
    duties: BOT_DUTY_MAP["helper-bot"],
    status: "active",
    currentRoom: "discovery-lobby",
    currentTask: "find-lobby",
    safetyFlags: DEFAULT_SAFETY,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  },
  {
    botId: "mod-bot-001",
    botClass: "mod-bot",
    displayName: "Sentinel Mod Bot",
    botLabel: "[BOT] Mod",
    duties: BOT_DUTY_MAP["mod-bot"],
    status: "active",
    currentRoom: "public-stage",
    currentTask: "moderate-public-space",
    safetyFlags: DEFAULT_SAFETY,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  },
  {
    botId: "route-watcher-001",
    botClass: "route-watcher-bot",
    displayName: "Route Watcher Bot",
    botLabel: "[BOT] RouteWatch",
    duties: BOT_DUTY_MAP["route-watcher-bot"],
    status: "active",
    currentTask: "detect-broken-route",
    safetyFlags: DEFAULT_SAFETY,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  },
  {
    botId: "maintenance-bot-001",
    botClass: "maintenance-bot",
    displayName: "Maintenance Bot",
    botLabel: "[BOT] Maintenance",
    duties: BOT_DUTY_MAP["maintenance-bot"],
    status: "idle",
    safetyFlags: DEFAULT_SAFETY,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  },
  {
    botId: "host-bot-001",
    botClass: "host-bot",
    displayName: "Event Host Bot",
    botLabel: "[BOT] Host",
    duties: BOT_DUTY_MAP["host-bot"],
    status: "idle",
    safetyFlags: DEFAULT_SAFETY,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  },
  {
    botId: "dev-audit-bot-001",
    botClass: "dev-audit-bot",
    displayName: "Dev Audit Bot",
    botLabel: "[BOT] DevAudit",
    duties: BOT_DUTY_MAP["dev-audit-bot"],
    status: "active",
    currentTask: "audit-report",
    safetyFlags: DEFAULT_SAFETY,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  },
];

export function getBotById(botId: string): BotDutyEntry | undefined {
  return PERMANENT_BOT_REGISTRY.find((b) => b.botId === botId);
}

export function getBotsByClass(botClass: BotClass): BotDutyEntry[] {
  return PERMANENT_BOT_REGISTRY.filter((b) => b.botClass === botClass);
}

export function getActiveBots(): BotDutyEntry[] {
  return PERMANENT_BOT_REGISTRY.filter((b) => b.status === "active" || b.status === "on-duty");
}

export function getDutyDescription(duty: BotDutyType): string {
  const map: Record<BotDutyType, string> = {
    "join-public-room": "Joins public rooms as a labeled bot",
    "welcome-user": "Sends welcome messages to new users",
    "encourage-user": "Encourages and cheers for performers",
    "find-lobby": "Helps users find active lobbies",
    "find-game": "Helps users discover games",
    "find-concert": "Helps users find upcoming concerts",
    "find-article": "Guides users to relevant magazine articles",
    "keep-room-active": "Keeps public rooms lively and active",
    "host-event": "Hosts cypher and event rooms",
    "moderate-public-space": "Monitors and moderates public spaces",
    "detect-broken-route": "Scans for broken navigation routes",
    "detect-broken-button": "Detects non-functional UI buttons",
    "detect-broken-feed": "Monitors live feed integrity",
    "create-maintenance-ticket": "Creates tickets for broken items",
    "support-developer-workflow": "Assists developer audit workflows",
    "audit-report": "Generates audit reports for oversight",
    "report-to-admin": "Reports issues to admin chain",
  };
  return map[duty] ?? duty;
}
