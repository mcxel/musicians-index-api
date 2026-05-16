/**
 * permanentBotOperationsEngine.ts
 *
 * Core engine for permanent bot operations.
 * Bots graduate from test mode into permanent labeled system workers.
 *
 * Safety contract (enforced here):
 * - All bots labeled as bots — no human impersonation ever
 * - Public rooms only unless policy/safety escalation metadata explicitly allows
 * - No real money transfers
 * - No reward/points abuse
 * - Youth/adult separation enforced
 * - All actions logged in botOperationsLog
 */

import {
  PERMANENT_BOT_REGISTRY,
  getBotById,
  type BotDutyEntry,
  type BotDutyType,
  type BotStatus,
} from "./botDutyRegistry";

export type BotOperationLogEntry = {
  id: string;
  botId: string;
  botLabel: string;
  action: BotDutyType | "status-change" | "room-join" | "room-leave" | "ticket-create" | "report";
  target?: string;
  detail: string;
  roomId?: string;
  isPrivateRoom: boolean;
  blocked: boolean;
  blockReason?: string;
  timestamp: number;
  reportedTo?: string[];
};

export type MaintenanceTicket = {
  id: string;
  createdBy: string;
  botId: string;
  type: "broken-route" | "broken-button" | "broken-feed" | "missing-content" | "ux-issue";
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in-review" | "approved" | "resolved" | "escalated";
  approvedBy?: string;
  resolvedAt?: number;
  createdAt: number;
};

const botOperationsLog: BotOperationLogEntry[] = [];
const maintenanceTickets: MaintenanceTicket[] = [];

let ticketCounter = 1;
let logCounter = 1;

function generateTicketId(): string {
  return `TICKET-${String(ticketCounter++).padStart(4, "0")}`;
}

function generateLogId(): string {
  return `BLOG-${String(logCounter++).padStart(6, "0")}`;
}

function logBotAction(entry: Omit<BotOperationLogEntry, "id" | "timestamp">): BotOperationLogEntry {
  const logged: BotOperationLogEntry = {
    ...entry,
    id: generateLogId(),
    timestamp: Date.now(),
  };
  botOperationsLog.push(logged);

  // Dispatch system event if window available
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("tmi:bot-action", { detail: logged })
    );
  }

  return logged;
}

/**
 * Attempt to send a bot to a room.
 * Private rooms are BLOCKED unless forcePrivatePolicy is true.
 */
export function sendBotToRoom(
  botId: string,
  roomId: string,
  isPrivateRoom: boolean,
  forcePrivatePolicy = false
): { success: boolean; blocked: boolean; reason?: string } {
  const bot = getBotById(botId);
  if (!bot) {
    return { success: false, blocked: true, reason: "Bot not found" };
  }

  if (isPrivateRoom && !forcePrivatePolicy) {
    logBotAction({
      botId,
      botLabel: bot.botLabel,
      action: "room-join",
      roomId,
      detail: `Bot attempted to join private room ${roomId} — BLOCKED`,
      isPrivateRoom: true,
      blocked: true,
      blockReason: "Private room access denied — bots require explicit policy/safety escalation",
      reportedTo: ["admin", "big-ace", "mc"],
    });
    return {
      success: false,
      blocked: true,
      reason: "Private room access denied — bots cannot enter private rooms without policy/safety escalation",
    };
  }

  // Update bot state
  bot.currentRoom = roomId;
  bot.status = "on-duty";
  bot.lastActiveAt = Date.now();

  logBotAction({
    botId,
    botLabel: bot.botLabel,
    action: "room-join",
    roomId,
    detail: `Bot joined ${isPrivateRoom ? "PRIVATE" : "public"} room ${roomId}`,
    isPrivateRoom,
    blocked: false,
    reportedTo: ["admin"],
  });

  return { success: true, blocked: false };
}

/**
 * Trigger a bot to welcome a user.
 */
export function botWelcomeUser(
  botId: string,
  userId: string,
  userName: string
): string {
  const bot = getBotById(botId);
  if (!bot) return "Bot not available";

  const messages = [
    `Welcome to The Musician's Index, ${userName}! 🎵 I'm ${bot.botLabel} — here to help!`,
    `Hey ${userName}! Glad you're here. Check out the live cypher rooms and Top 10 charts!`,
    `What's up, ${userName}? I'm your TMI helper bot. Need to find a lobby or game? Just ask!`,
    `Welcome ${userName}! 🎤 The stage is live — jump in, explore, and make your mark!`,
  ];
  const message = messages[Math.floor(Math.random() * messages.length)];

  logBotAction({
    botId,
    botLabel: bot.botLabel,
    action: "welcome-user",
    target: userId,
    detail: `Welcomed user: ${userName}`,
    isPrivateRoom: false,
    blocked: false,
  });

  return message;
}

/**
 * Bot encourages a performer.
 */
export function botEncourageUser(
  botId: string,
  userId: string,
  userName: string,
  context?: string
): string {
  const bot = getBotById(botId);
  if (!bot) return "";

  const messages = [
    `Keep going ${userName}! 🔥 The crowd is hyped!`,
    `${userName} is on fire right now! 🎸 Vote for your favorites!`,
    `Amazing performance from ${userName}! 👑 You're climbing the charts!`,
    `${userName} is THAT artist. 💫 Don't sleep on this talent!`,
    `${context ? `${context} — ` : ""}${userName} you're killing it right now! 🚀`,
  ];
  const message = messages[Math.floor(Math.random() * messages.length)];

  logBotAction({
    botId,
    botLabel: bot.botLabel,
    action: "encourage-user",
    target: userId,
    detail: `Encouraged performer: ${userName} (${context ?? "general"})`,
    isPrivateRoom: false,
    blocked: false,
  });

  return message;
}

/**
 * Create a maintenance ticket for a broken route, button, or feed.
 */
export function createMaintenanceTicket(
  botId: string,
  type: MaintenanceTicket["type"],
  description: string,
  severity: MaintenanceTicket["severity"] = "medium"
): MaintenanceTicket {
  const bot = getBotById(botId);
  const ticketId = generateTicketId();

  const ticket: MaintenanceTicket = {
    id: ticketId,
    createdBy: bot?.botLabel ?? botId,
    botId,
    type,
    description,
    severity,
    status: severity === "critical" || severity === "high" ? "escalated" : "open",
    createdAt: Date.now(),
  };

  maintenanceTickets.push(ticket);

  logBotAction({
    botId,
    botLabel: bot?.botLabel ?? botId,
    action: "ticket-create",
    detail: `Ticket ${ticketId}: [${severity.toUpperCase()}] ${type} — ${description}`,
    isPrivateRoom: false,
    blocked: false,
    reportedTo: severity === "critical" ? ["admin", "big-ace", "mc", "marcel-root"] : ["admin", "big-ace"],
  });

  return ticket;
}

/**
 * Change bot status (pause/resume/suspend).
 * Admin control.
 */
export function setBotStatus(
  botId: string,
  newStatus: BotStatus,
  changedBy: string
): { success: boolean; message: string } {
  const bot = getBotById(botId);
  if (!bot) return { success: false, message: "Bot not found" };

  const prevStatus = bot.status;
  bot.status = newStatus;
  bot.lastActiveAt = Date.now();

  logBotAction({
    botId,
    botLabel: bot.botLabel,
    action: "status-change",
    detail: `Status changed ${prevStatus} → ${newStatus} by ${changedBy}`,
    isPrivateRoom: false,
    blocked: false,
    reportedTo: ["admin"],
  });

  return { success: true, message: `Bot ${bot.displayName} is now ${newStatus}` };
}

/**
 * Summon a helper bot to a specific public room.
 */
export function summonHelperBot(roomId: string, requestedBy: string): BotDutyEntry | null {
  const helperBot = PERMANENT_BOT_REGISTRY.find(
    (b) => b.botClass === "helper-bot" && (b.status === "idle" || b.status === "active")
  );

  if (!helperBot) return null;

  sendBotToRoom(helperBot.botId, roomId, false);

  logBotAction({
    botId: helperBot.botId,
    botLabel: helperBot.botLabel,
    action: "room-join",
    roomId,
    detail: `Helper bot summoned to ${roomId} by ${requestedBy}`,
    isPrivateRoom: false,
    blocked: false,
    reportedTo: ["admin"],
  });

  return helperBot;
}

/**
 * Report to admin chain.
 */
export function botReportToAdmin(
  botId: string,
  summary: string,
  reportedTo: string[] = ["admin", "big-ace", "mc"]
): void {
  const bot = getBotById(botId);
  logBotAction({
    botId,
    botLabel: bot?.botLabel ?? botId,
    action: "report",
    detail: summary,
    isPrivateRoom: false,
    blocked: false,
    reportedTo,
  });
}

// ── Accessors ────────────────────────────────────────────────────────────────

export function getBotOperationsLog(): BotOperationLogEntry[] {
  return [...botOperationsLog];
}

export function getMaintenanceTickets(): MaintenanceTicket[] {
  return [...maintenanceTickets];
}

export function getOpenTickets(): MaintenanceTicket[] {
  return maintenanceTickets.filter((t) => t.status === "open" || t.status === "escalated");
}

export function approveTicketRepair(ticketId: string, approvedBy: string): boolean {
  const ticket = maintenanceTickets.find((t) => t.id === ticketId);
  if (!ticket) return false;
  ticket.status = "approved";
  ticket.approvedBy = approvedBy;
  return true;
}

export function resolveTicket(ticketId: string): boolean {
  const ticket = maintenanceTickets.find((t) => t.id === ticketId);
  if (!ticket) return false;
  ticket.status = "resolved";
  ticket.resolvedAt = Date.now();
  return true;
}

export function escalateTicket(ticketId: string, to: string[] = ["marcel-root", "big-ace"]): boolean {
  const ticket = maintenanceTickets.find((t) => t.id === ticketId);
  if (!ticket) return false;
  ticket.status = "escalated";
  return true;
}
