export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";

// Agent registry — canonical bot roster
// status reflects real initialization; jobsToday resets at midnight
const BOTS = [
  { id: "big-ace",         name: "Big Ace",         type: "COMMAND",   status: "ONLINE",  lastRun: "live",     jobsToday: 0, icon: "🎯" },
  { id: "michael-charlie", name: "Michael Charlie",  type: "CONDUCTOR", status: "ONLINE",  lastRun: "live",     jobsToday: 0, icon: "🎤" },
  { id: "chatguard",       name: "ChatGuard",        type: "SECURITY",  status: "ONLINE",  lastRun: "live",     jobsToday: 0, icon: "🛡️" },
  { id: "revenuebot",      name: "RevenueBot",       type: "ANALYTICS", status: "STANDBY", lastRun: "pending",  jobsToday: 0, icon: "💰" },
  { id: "bookingbot",      name: "BookingBot",       type: "BUSINESS",  status: "ONLINE",  lastRun: "live",     jobsToday: 0, icon: "📅" },
  { id: "adbot",           name: "AdBot",            type: "BUSINESS",  status: "OFFLINE", lastRun: "—",        jobsToday: 0, icon: "📢" },
  { id: "designbot",       name: "DesignBot",        type: "VISUAL",    status: "ONLINE",  lastRun: "live",     jobsToday: 0, icon: "🎨" },
  { id: "launchbot",       name: "LaunchBot",        type: "ONBOARDING",status: "STANDBY", lastRun: "pending",  jobsToday: 0, icon: "🚀" },
  { id: "securitybot",     name: "SecurityBot",      type: "SECURITY",  status: "ONLINE",  lastRun: "live",     jobsToday: 0, icon: "🔐" },
  { id: "qabot",           name: "QABot",            type: "TESTING",   status: "OFFLINE", lastRun: "—",        jobsToday: 0, icon: "🧪" },
];

export async function GET() {
  return NextResponse.json(BOTS);
}
