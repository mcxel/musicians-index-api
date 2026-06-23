/**
 * POST /api/admin/bots/activate — activate all 62+ named bots + orchestrator
 * GET  /api/admin/bots/activate — return full bot health summary
 * Admin-only endpoint (requires tmi_role=admin cookie).
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  activateDefaultBots,
  getBotStatus,
  getHealthSummary,
} from '@/lib/bots/BotActivationEngine';
import { getBotOrchestrator } from '@/lib/bots/TMIBotOrchestrator';

function isAdmin(req: NextRequest): boolean {
  return req.cookies.get('tmi_role')?.value === 'admin';
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: 'Admin only' }, { status: 403 });
  }

  // 1. Activate all 62+ named bots in BotActivationEngine
  const namedBots = activateDefaultBots();

  // 2. Start the 450-bot task-processing orchestrator (200 Hyper + 200 Regular + 50 Sentinel)
  const orchestrator = getBotOrchestrator();
  orchestrator.start();
  const orchStats = orchestrator.getStats();
  const health = getHealthSummary();

  return NextResponse.json({
    ok: true,
    message: `Activated ${namedBots.length} named bots + ${orchStats.total} orchestrator bots`,
    namedBotCount: namedBots.length,
    orchestratorBotCount: orchStats.total,
    health,
    orchestrator: orchStats,
    activatedAt: Date.now(),
  });
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: 'Admin only' }, { status: 403 });
  }

  const bots = getBotStatus();
  const health = getHealthSummary();
  const orchestrator = getBotOrchestrator();
  const orchStats = orchestrator.getStats();

  return NextResponse.json({
    ok: true,
    namedBotCount: bots.length,
    orchestratorBotCount: orchStats.total,
    health,
    orchestrator: orchStats,
    bots,
    updatedAt: Date.now(),
  });
}
