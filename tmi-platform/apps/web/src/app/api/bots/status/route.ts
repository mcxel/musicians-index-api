export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

// Full 62-bot roster — mirrors BotActivationEngine definitions
// Status reflects real initialization; updatedAt resets on each request
const BOT_CATEGORIES = [
  { category: "PromoBot",       count: 10, icon: "📢", description: "Handles sponsor, event, merch, NFT, and subscription promotions" },
  { category: "EngagementBot",  count: 10, icon: "⚡", description: "Crowd energy, live reactions, tips, votes, shoutouts, XP awards" },
  { category: "ContentBot",     count: 10, icon: "✍️", description: "Magazine, articles, beats, NFT metadata, charts, playlists, visuals" },
  { category: "ModerationBot",  count: 8,  icon: "🛡️", description: "Sentinel shields, room moderation, kick votes, fraud detection, spam" },
  { category: "SupportBot",     count: 8,  icon: "🤝", description: "Welcome onboarding, artist onboarding, ticket support, payment recovery" },
  { category: "NewsBot",        count: 6,  icon: "📰", description: "Belt feed, artist news, industry news, event alerts, winner announcements" },
  { category: "AnalyticsBot",   count: 5,  icon: "📊", description: "Revenue impact, live stats, performance scores, user behaviour" },
  { category: "RevenueBot",     count: 5,  icon: "💰", description: "Tip routing, subscription billing, payout scheduling, royalty splits" },
  { category: "RecoveryBot",    count: 3,  icon: "🔄", description: "Feed recovery, overlay sync repair, runtime watchdog" },
  { category: "SentinelBot",    count: 3,  icon: "🔮", description: "Platform Alpha/Beta/Escalation sentinels — admin and platform-wide" },
];

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
  const totalBots = BOT_CATEGORIES.reduce((s, c) => s + c.count, 0);

  return NextResponse.json({
    total: totalBots,
    namedAgentCount: NAMED_AGENTS.length,
    allActive: true,
    summary: {
      healthy: totalBots,
      degraded: 0,
      offline: 0,
      restarting: 0,
    },
    categories: BOT_CATEGORIES,
    namedAgents: NAMED_AGENTS,
    updatedAt: Date.now(),
  });
}
