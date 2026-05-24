// api/admin/mail/stats/route.ts — Mail system stats for admin dashboard

import { NextRequest, NextResponse } from "next/server";
import { getSentLog, getSentCount } from "@/lib/mail/TMIMailEngine";
import { getDispatchStats, getDispatchLog } from "@/lib/mail/MailTriggerEngine";
import { getOptInCount } from "@/lib/mail/MailPreferenceEngine";
import { getScheduledJobs } from "@/lib/mail/MailScheduler";
import { getTicketStats } from "@/lib/mail/SupportMailer";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_API_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    sent: getSentCount(),
    dispatch: getDispatchStats(),
    optIns: getOptInCount(),
    recentLog: getDispatchLog(50),
    recentSent: getSentLog(20),
    scheduledJobs: getScheduledJobs(),
    supportTickets: getTicketStats(),
  });
}
