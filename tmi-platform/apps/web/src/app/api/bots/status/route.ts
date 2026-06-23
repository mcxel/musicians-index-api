export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { activateDefaultBots, getHealthSummary } from '@/lib/bots/BotActivationEngine';
import { getBotOrchestrator } from '@/lib/bots/TMIBotOrchestrator';

const NAMED_AGENTS = [
  { id: "big-ace",          name: "Big Ace",          type: "COMMAND",     status: "ONLINE",   icon: "🎯", description: "AI Umbrella CEO — BerntoutGlobal" },
  { id: "michael-charlie",  name: "MC Michael Charlie",type: "CONDUCTOR",   status: "ONLINE",   icon: "🎤", description: "TMI CEO — 24/7 operations" },
  { id: "chatguard",        name: "ChatGuard",         type: "SECURITY",    status: "ONLINE",   icon: "🛡️", description: "Real-time chat moderation" },
  { id: "revenuebot",       name: "RevenueBot",        type: "ANALYTICS",   status: "ONLINE",   icon: "💰", description: "Revenue routing and payout scheduling" },
  { id: "bookingbot",       name: "BookingBot",        type: "BUSINESS",    status: "ONLINE",   icon: "📅", description: "Artist and venue booking automation" },
  { id: "adbot",            name: "AdBot",             type: "BUSINESS",    status: "ONLINE",   icon: "📢", description: "Sponsor and advertiser placements" },
  { id: "designbot",        name: "DesignBot",         type: "VISUAL",      status: "ONLINE",   icon: "🎨", description: "Visual asset creation and placement" },
  { id: "launchbot",        name: "LaunchBot",         type: "ONBOARDING",  status: "ONLINE",   icon: "🚀", description: "Onboarding flows and user activation" },
  { id: "securitybot",      name: "SecurityBot",       type: "SECURITY",    status: "ONLINE",   icon: "🔐", description: "Account and payment security monitoring" },
  { id: "qabot",            name: "QABot",             type: "TESTING",     status: "ONLINE",   icon: "🧪", description: "Automated quality assurance" },
];

export async function GET() {
  // activateDefaultBots() is idempotent — ensures bots are live before reporting status
  const allBots = activateDefaultBots();
  const health = getHealthSummary();

  const orchestrator = getBotOrchestrator();
  const orchStats = orchestrator.getStats();

  // Build per-category summary from real BotActivationEngine data
  const categoryMap = new Map<string, { count: number; healthy: number; degraded: number; offline: number }>();
  for (const bot of allBots) {
    const entry = categoryMap.get(bot.category) ?? { count: 0, healthy: 0, degraded: 0, offline: 0 };
    entry.count++;
    if (bot.health === 'HEALTHY') entry.healthy++;
    else if (bot.health === 'DEGRADED') entry.degraded++;
    else if (bot.health === 'OFFLINE') entry.offline++;
    categoryMap.set(bot.category, entry);
  }

  const categories = Array.from(categoryMap.entries()).map(([category, stats]) => ({
    category,
    ...stats,
  }));

  return NextResponse.json({
    total: health.total,
    active: health.active,
    namedAgentCount: NAMED_AGENTS.length,
    orchestratorBotCount: orchStats.total,
    allActive: health.active === health.total,
    summary: {
      healthy: health.healthy,
      degraded: health.degraded,
      offline: health.offline,
      restarting: health.restarting,
    },
    categories,
    namedAgents: NAMED_AGENTS,
    orchestrator: orchStats,
    updatedAt: Date.now(),
  });
}
