export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils/require-admin";
import { activateSoftLaunchBots, SOFT_LAUNCH_DUTY_BOT_IDS } from "@/lib/bots/activateSoftLaunchBots";
import { getBotStatus, getHealthSummary } from "@/lib/bots/BotActivationEngine";
import { PERMANENT_BOT_REGISTRY } from "@/lib/bots/botDutyRegistry";
import { getBotOperationsLog } from "@/lib/bots/permanentBotOperationsEngine";
import { getActiveSessions } from "@/lib/broadcast/GlobalLiveSessionRegistry";

/** Rule 20: real bot roster + public live humans only — never fabricate presence. */
export type LiveSwitcherSubject = {
  id: string;
  kind: "bot" | "human";
  name: string;
  avatarUrl?: string | null;
  source: string;
  status: string;
  health?: string;
  currentRoom?: string | null;
  currentTask?: string | null;
  lastAction?: string | null;
  lastActionAt?: number | null;
  labeledAsBot: boolean;
  roomLive: boolean;
  roomPreviewUrl?: string | null;
  /** Pre-built readable lines from real telemetry. */
  activityLines: string[];
};

function formatAge(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms)) return "unknown";
  const ago = Date.now() - ms;
  if (ago < 60_000) return "just now";
  if (ago < 3_600_000) return `${Math.floor(ago / 60_000)}m ago`;
  if (ago < 86_400_000) return `${Math.floor(ago / 3_600_000)}h ago`;
  return `${Math.floor(ago / 86_400_000)}d ago`;
}

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const soft = activateSoftLaunchBots();
  const named = getBotStatus();
  const dutyIds = new Set<string>(SOFT_LAUNCH_DUTY_BOT_IDS);
  const ops = getBotOperationsLog();
  const sessions = getActiveSessions();
  const sessionByRoom = new Map(sessions.map((s) => [s.roomId, s]));
  const publicSessions = sessions.filter((s) => s.privacy === "PUBLIC");

  const lastByBot = new Map<string, (typeof ops)[number]>();
  for (const entry of ops) {
    const prev = lastByBot.get(entry.botId);
    if (!prev || entry.timestamp > prev.timestamp) lastByBot.set(entry.botId, entry);
  }

  const subjects: LiveSwitcherSubject[] = [];
  const seen = new Set<string>();

  for (const bot of named) {
    seen.add(bot.id);
    const last = lastByBot.get(bot.id);
    const roomId = last?.roomId ?? bot.surface ?? null;
    const live = roomId ? sessionByRoom.get(roomId) : undefined;
    const botOps = ops.filter((o) => o.botId === bot.id).slice(-8).reverse();
    const activityLines = [
      `Status: ${bot.isActive ? "on-duty" : "idle"}${bot.health ? ` · health ${bot.health}` : ""}`,
      bot.telemetryTag ? `Task / tag: ${bot.telemetryTag}` : "Task: none reported",
      roomId ? `Room: ${roomId}${live ? " · LIVE in registry" : " · not in live registry"}` : "Room: none bound",
      last ? `Last action (${formatAge(last.timestamp)}): ${last.detail}` : "Last action: none logged",
      ...botOps.map((o) => `Op · ${formatAge(o.timestamp)}: ${o.detail}${o.roomId ? ` @ ${o.roomId}` : ""}`),
    ];
    subjects.push({
      id: bot.id,
      kind: "bot",
      name: bot.name,
      avatarUrl: null,
      source: "soft-launch-activation",
      status: bot.isActive ? "on-duty" : "idle",
      health: bot.health,
      currentRoom: roomId,
      currentTask: bot.telemetryTag,
      lastAction: last?.detail ?? null,
      lastActionAt: last?.timestamp ?? bot.lastPulseMs,
      labeledAsBot: true,
      roomLive: Boolean(live),
      roomPreviewUrl: live?.previewUrl ?? live?.thumbnailUrl ?? null,
      activityLines,
    });
  }

  for (const duty of PERMANENT_BOT_REGISTRY) {
    if (seen.has(duty.botId)) continue;
    seen.add(duty.botId);
    const last = lastByBot.get(duty.botId);
    const roomId = duty.currentRoom ?? last?.roomId ?? null;
    const live = roomId ? sessionByRoom.get(roomId) : undefined;
    const botOps = ops.filter((o) => o.botId === duty.botId).slice(-8).reverse();
    const isRevenueTeam = duty.botClass === "revenue-business-bot";
    let revenueLines: string[] = [];
    if (isRevenueTeam) {
      try {
        const { buildTeamActivityLines } = await import("@/lib/commerce/RevenueBusinessReports");
        revenueLines = buildTeamActivityLines(duty.botId);
      } catch {
        revenueLines = ["Revenue reports: unavailable"];
      }
    }
    const activityLines = [
      `Duty status: ${duty.status}`,
      duty.currentTask ? `Current task: ${duty.currentTask}` : "Current task: none",
      roomId ? `Room: ${roomId}${live ? " · LIVE in registry" : " · not in live registry"}` : "Room: none bound",
      last ? `Last action (${formatAge(last.timestamp)}): ${last.detail}` : "Last action: none logged",
      dutyIds.has(duty.botId) ? "Soft-launch duty roster: yes" : "Soft-launch duty roster: no",
      ...(isRevenueTeam ? ["Team: Revenue Businessman suite", ...revenueLines] : []),
      ...botOps.map((o) => `Op · ${formatAge(o.timestamp)}: ${o.detail}${o.roomId ? ` @ ${o.roomId}` : ""}`),
    ];
    subjects.push({
      id: duty.botId,
      kind: "bot",
      name: duty.displayName,
      avatarUrl: null,
      source: dutyIds.has(duty.botId) ? "soft-launch-duty" : "duty-registry",
      status: duty.status,
      currentRoom: roomId,
      currentTask: duty.currentTask ?? null,
      lastAction: last?.detail ?? null,
      lastActionAt: last?.timestamp ?? duty.lastActiveAt,
      labeledAsBot: duty.safetyFlags.labeledAsBot,
      roomLive: Boolean(live),
      roomPreviewUrl: live?.previewUrl ?? live?.thumbnailUrl ?? null,
      activityLines,
    });
  }

  for (const session of publicSessions) {
    const hostId = `human-host:${session.userId}`;
    if (seen.has(hostId)) continue;
    seen.add(hostId);
    const activityLines = [
      `Public live host · ${session.displayName}`,
      `Room: ${session.roomId} · ${session.category} · stage ${session.stageState}`,
      `Title: ${session.title || "(untitled)"}`,
      `Stream health: ${session.streamHealth}`,
      typeof session.viewerCount === "number"
        ? `Audience count (registry): ${session.viewerCount}`
        : "Audience count: unavailable",
      session.lastPingAt ? `Last ping: ${formatAge(session.lastPingAt)}` : "Last ping: unknown",
      session.audioOk === false ? "Audio: not OK (telemetry)" : "Audio: OK or unknown",
      ...(session.recentAudienceEntries ?? [])
        .slice(0, 5)
        .map(
          (e) =>
            `Audience entry · ${formatAge(e.at)}: ${e.countryName || e.countryCode}${e.viewerId ? ` · ${e.viewerId}` : ""}`,
        ),
    ];
    subjects.push({
      id: hostId,
      kind: "human",
      name: session.displayName,
      avatarUrl: session.avatarUrl,
      source: "public-live-host",
      status: session.stageState,
      health: session.streamHealth,
      currentRoom: session.roomId,
      currentTask: session.title || null,
      lastAction: `Hosting public ${session.category}`,
      lastActionAt: session.lastPingAt ?? session.startedAt,
      labeledAsBot: false,
      roomLive: true,
      roomPreviewUrl: session.previewUrl ?? session.thumbnailUrl ?? null,
      activityLines,
    });

    for (const entry of session.recentAudienceEntries ?? []) {
      if (!entry.viewerId) continue;
      const audId = `human-audience:${entry.viewerId}:${session.roomId}`;
      if (seen.has(audId)) continue;
      seen.add(audId);
      subjects.push({
        id: audId,
        kind: "human",
        name: entry.viewerId,
        avatarUrl: null,
        source: "public-live-audience",
        status: "in-room",
        currentRoom: session.roomId,
        currentTask: `Audience in ${session.displayName}'s room`,
        lastAction: `Entered ${entry.countryName || entry.countryCode || "unknown"}`,
        lastActionAt: entry.at,
        labeledAsBot: false,
        roomLive: true,
        roomPreviewUrl: session.previewUrl ?? session.thumbnailUrl ?? null,
        activityLines: [
          `Audience member id: ${entry.viewerId}`,
          `Room: ${session.roomId} (public live)`,
          `Host: ${session.displayName}`,
          `Entry: ${formatAge(entry.at)} · ${entry.countryName || entry.countryCode || "region unknown"}`,
          entry.source ? `Source: ${entry.source}` : "Source: audience registry",
          "No camera POV for audience members — room preview only when host stream exists.",
        ],
      });
    }
  }

  subjects.sort((a, b) => {
    if (a.roomLive !== b.roomLive) return a.roomLive ? -1 : 1;
    return (b.lastActionAt ?? 0) - (a.lastActionAt ?? 0);
  });

  return NextResponse.json({
    ok: true,
    softLaunch: {
      namedCount: soft.namedBots.length,
      dutyBotsActive: soft.dutyBotsActive,
      softLaunchDutyIds: [...SOFT_LAUNCH_DUTY_BOT_IDS],
    },
    health: getHealthSummary(),
    publicLiveCount: publicSessions.length,
    subjects,
    recentOps: ops.slice(-40).reverse(),
    updatedAt: Date.now(),
  });
}
