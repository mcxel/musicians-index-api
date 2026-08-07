export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils/require-admin";
import { activateSoftLaunchBots, SOFT_LAUNCH_DUTY_BOT_IDS } from "@/lib/bots/activateSoftLaunchBots";
import { getBotStatus, getHealthSummary } from "@/lib/bots/BotActivationEngine";
import { PERMANENT_BOT_REGISTRY } from "@/lib/bots/botDutyRegistry";
import { getBotOperationsLog } from "@/lib/bots/permanentBotOperationsEngine";
import { getActiveSessions } from "@/lib/broadcast/GlobalLiveSessionRegistry";

export type BotObserveRow = {
  id: string;
  name: string;
  source: "soft-launch-named" | "duty" | "activation";
  status: string;
  health?: string;
  surface?: string | null;
  currentRoom?: string | null;
  currentTask?: string | null;
  lastAction?: string | null;
  lastActionAt?: number | null;
  lastPulseMs?: number | null;
  labeledAsBot: boolean;
  roomLive: boolean;
  roomPreviewUrl?: string | null;
};

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const soft = activateSoftLaunchBots();
  const named = getBotStatus();
  const dutyIds = new Set<string>(SOFT_LAUNCH_DUTY_BOT_IDS);
  const ops = getBotOperationsLog();
  const sessions = getActiveSessions();
  const sessionByRoom = new Map(sessions.map((s) => [s.roomId, s]));

  const lastByBot = new Map<string, (typeof ops)[number]>();
  for (const entry of ops) {
    const prev = lastByBot.get(entry.botId);
    if (!prev || entry.timestamp > prev.timestamp) lastByBot.set(entry.botId, entry);
  }

  const rows: BotObserveRow[] = [];
  const seen = new Set<string>();

  for (const bot of named) {
    seen.add(bot.id);
    const last = lastByBot.get(bot.id);
    const roomId = last?.roomId ?? bot.surface ?? null;
    const live = roomId ? sessionByRoom.get(roomId) : undefined;
    rows.push({
      id: bot.id,
      name: bot.name,
      source: "activation",
      status: bot.isActive ? "on-duty" : "idle",
      health: bot.health,
      surface: bot.surface ?? null,
      currentRoom: roomId,
      currentTask: bot.telemetryTag,
      lastAction: last?.detail ?? null,
      lastActionAt: last?.timestamp ?? bot.lastPulseMs,
      lastPulseMs: bot.lastPulseMs,
      labeledAsBot: true,
      roomLive: Boolean(live),
      roomPreviewUrl: live?.previewUrl ?? live?.thumbnailUrl ?? null,
    });
  }

  for (const duty of PERMANENT_BOT_REGISTRY) {
    if (seen.has(duty.botId)) continue;
    seen.add(duty.botId);
    const last = lastByBot.get(duty.botId);
    const roomId = duty.currentRoom ?? last?.roomId ?? null;
    const live = roomId ? sessionByRoom.get(roomId) : undefined;
    rows.push({
      id: duty.botId,
      name: duty.displayName,
      source: dutyIds.has(duty.botId) ? "duty" : "duty",
      status: duty.status,
      surface: null,
      currentRoom: roomId,
      currentTask: duty.currentTask ?? null,
      lastAction: last?.detail ?? null,
      lastActionAt: last?.timestamp ?? duty.lastActiveAt,
      lastPulseMs: duty.lastActiveAt,
      labeledAsBot: duty.safetyFlags.labeledAsBot,
      roomLive: Boolean(live),
      roomPreviewUrl: live?.previewUrl ?? live?.thumbnailUrl ?? null,
    });
  }

  rows.sort((a, b) => (b.lastActionAt ?? 0) - (a.lastActionAt ?? 0));

  return NextResponse.json({
    ok: true,
    softLaunch: {
      namedCount: soft.namedBots.length,
      dutyBotsActive: soft.dutyBotsActive,
      softLaunchDutyIds: [...SOFT_LAUNCH_DUTY_BOT_IDS],
    },
    health: getHealthSummary(),
    bots: rows,
    recentOps: ops.slice(-40).reverse(),
    updatedAt: Date.now(),
  });
}
