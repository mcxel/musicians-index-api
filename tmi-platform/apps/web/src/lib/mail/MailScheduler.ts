// lib/mail/MailScheduler.ts — Scheduled mail jobs (daily recaps, weekly digests, re-engagement)

import { trigger } from "./MailTriggerEngine";
import { getAllPreferences } from "./MailPreferenceEngine";

export type ScheduledJobId =
  | "weekly_recap"
  | "re_engagement_7d"
  | "re_engagement_30d";

export interface ScheduledJob {
  id: ScheduledJobId;
  label: string;
  cronLabel: string; // human-readable schedule description
  lastRunAt: number | null;
  nextRunAt: number;
  enabled: boolean;
}

// In-memory job registry
const jobs = new Map<ScheduledJobId, ScheduledJob>();

function nextFriday(): number {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 5=Fri
  const daysUntilFriday = (5 - day + 7) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilFriday);
  next.setHours(9, 0, 0, 0);
  return next.getTime();
}

function nextMidnight(): number {
  const next = new Date();
  next.setDate(next.getDate() + 1);
  next.setHours(0, 0, 0, 0);
  return next.getTime();
}

// Initialize default jobs
jobs.set("weekly_recap", {
  id: "weekly_recap",
  label: "Weekly Recap Email",
  cronLabel: "Every Friday at 9am",
  lastRunAt: null,
  nextRunAt: nextFriday(),
  enabled: true,
});

jobs.set("re_engagement_7d", {
  id: "re_engagement_7d",
  label: "Re-engagement (7 day inactive)",
  cronLabel: "Daily at midnight",
  lastRunAt: null,
  nextRunAt: nextMidnight(),
  enabled: true,
});

jobs.set("re_engagement_30d", {
  id: "re_engagement_30d",
  label: "Re-engagement (30 day inactive)",
  cronLabel: "Daily at midnight",
  lastRunAt: null,
  nextRunAt: nextMidnight(),
  enabled: true,
});

export function getScheduledJobs(): ScheduledJob[] {
  return Array.from(jobs.values());
}

export function toggleJob(id: ScheduledJobId, enabled: boolean): void {
  const job = jobs.get(id);
  if (job) jobs.set(id, { ...job, enabled });
}

// Called by cron/scheduled API route
export async function runDueJobs(
  getUserActivity: (userId: string) => { lastActiveAt: number; plays: number; tips: number; followers: number }
): Promise<{ jobId: ScheduledJobId; emailsTriggered: number }[]> {
  const now = Date.now();
  const results: { jobId: ScheduledJobId; emailsTriggered: number }[] = [];
  const allPrefs = getAllPreferences();

  for (const [jobId, job] of jobs) {
    if (!job.enabled || job.nextRunAt > now) continue;

    let count = 0;

    if (jobId === "weekly_recap") {
      for (const pref of allPrefs) {
        const activity = getUserActivity(pref.userId);
        await trigger("WEEKLY_RECAP", {
          userId: pref.userId,
          email: pref.email,
          vars: {
            userName: pref.userId,
            recapStats: {
              plays: activity.plays,
              tips: activity.tips,
              followers: activity.followers,
            },
            ctaUrl: "https://themusiciansindex.com/hub/performer",
          },
          dedupKey: `weekly_recap_${pref.userId}_${Math.floor(now / (7 * 24 * 3600000))}`,
        });
        count++;
      }
    }

    if (jobId === "re_engagement_7d") {
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
      for (const pref of allPrefs) {
        const activity = getUserActivity(pref.userId);
        if (activity.lastActiveAt < sevenDaysAgo && activity.lastActiveAt > now - 8 * 24 * 60 * 60 * 1000) {
          await trigger("RE_ENGAGEMENT", {
            userId: pref.userId,
            email: pref.email,
            vars: {
              userName: pref.userId,
              ctaUrl: "https://themusiciansindex.com/home/1",
              ctaLabel: "Get Back In",
            },
            dedupKey: `reengage_7d_${pref.userId}_${Math.floor(now / (24 * 3600000))}`,
          });
          count++;
        }
      }
    }

    if (jobId === "re_engagement_30d") {
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
      for (const pref of allPrefs) {
        const activity = getUserActivity(pref.userId);
        if (activity.lastActiveAt < thirtyDaysAgo && activity.lastActiveAt > now - 31 * 24 * 60 * 60 * 1000) {
          await trigger("RE_ENGAGEMENT", {
            userId: pref.userId,
            email: pref.email,
            vars: {
              userName: pref.userId,
              ctaUrl: "https://themusiciansindex.com/home/1",
              ctaLabel: "Your Stage Is Waiting",
            },
            dedupKey: `reengage_30d_${pref.userId}_${Math.floor(now / (24 * 3600000))}`,
          });
          count++;
        }
      }
    }

    const updatedJob: ScheduledJob = {
      ...job,
      lastRunAt: now,
      nextRunAt: jobId === "weekly_recap" ? nextFriday() : nextMidnight(),
    };
    jobs.set(jobId, updatedJob);
    results.push({ jobId, emailsTriggered: count });
  }

  return results;
}
