export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getBotStatus } from "@/lib/bots/BotActivationEngine";
import { activateSoftLaunchBots } from "@/lib/bots/activateSoftLaunchBots";
import { getBotOrchestrator } from "@/lib/bots/TMIBotOrchestrator";
import { requireAdmin } from "@/app/api/admin/_utils/require-admin";

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const soft = activateSoftLaunchBots();
  const orchestrator = getBotOrchestrator();
  orchestrator.start();
  const orchStats = orchestrator.getStats();

  return NextResponse.json({
    ok: true,
    message: `Activated ${soft.namedBots.length} named bots + ${orchStats.total} orchestrator bots; ${soft.dutyBotsActive} duty bots on-duty`,
    namedBotCount: soft.namedBots.length,
    dutyBotsActive: soft.dutyBotsActive,
    orchestratorBotCount: orchStats.total,
    health: soft.health,
    phase1: soft.phase1,
    orchestrator: orchStats,
    activatedAt: Date.now(),
  });
}

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const soft = activateSoftLaunchBots();
  const bots = getBotStatus();
  const orchestrator = getBotOrchestrator();
  const orchStats = orchestrator.getStats();

  return NextResponse.json({
    ok: true,
    namedBotCount: bots.length,
    dutyBotsActive: soft.dutyBotsActive,
    orchestratorBotCount: orchStats.total,
    health: soft.health,
    phase1: soft.phase1,
    orchestrator: orchStats,
    bots,
    updatedAt: Date.now(),
  });
}