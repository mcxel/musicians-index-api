import { NextResponse } from "next/server";

const BOTS = [
  { id: "1",  name: "Reporter Bot",   type: "CONTENT",   status: "RUNNING", lastRun: "5 min ago",  jobsToday: 12,  icon: "✍️" },
  { id: "2",  name: "Interview Bot",  type: "CONTENT",   status: "IDLE",    lastRun: "2 hrs ago",  jobsToday: 2,   icon: "🎤" },
  { id: "3",  name: "Sponsor Bot",    type: "BUSINESS",  status: "RUNNING", lastRun: "22 min ago", jobsToday: 4,   icon: "💼" },
  { id: "4",  name: "Booking Bot",    type: "BUSINESS",  status: "RUNNING", lastRun: "8 min ago",  jobsToday: 9,   icon: "📅" },
  { id: "5",  name: "Ranking Bot",    type: "ANALYTICS", status: "RUNNING", lastRun: "15 min ago", jobsToday: 6,   icon: "🏆" },
  { id: "6",  name: "Crown Bot",      type: "CONTEST",   status: "IDLE",    lastRun: "3 days ago", jobsToday: 0,   icon: "👑" },
  { id: "7",  name: "Archive Bot",    type: "CONTENT",   status: "RUNNING", lastRun: "1 hr ago",   jobsToday: 1,   icon: "📦" },
  { id: "8",  name: "Broadcast Bot",  type: "LIVE",      status: "RUNNING", lastRun: "1 min ago",  jobsToday: 47,  icon: "📡" },
  { id: "9",  name: "Analytics Bot",  type: "ANALYTICS", status: "RUNNING", lastRun: "30 min ago", jobsToday: 3,   icon: "📊" },
  { id: "10", name: "Security Bot",   type: "SECURITY",  status: "RUNNING", lastRun: "1 min ago",  jobsToday: 87,  icon: "🛡️" },
  { id: "11", name: "Social Bot",     type: "SOCIAL",    status: "RUNNING", lastRun: "3 min ago",  jobsToday: 234, icon: "🔔" },
  { id: "12", name: "Store Bot",      type: "STORE",     status: "IDLE",    lastRun: "45 min ago", jobsToday: 0,   icon: "🛍️" },
];

export async function GET() {
  return NextResponse.json(BOTS);
}
