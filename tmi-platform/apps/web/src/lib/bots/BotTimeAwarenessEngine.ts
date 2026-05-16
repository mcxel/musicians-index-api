export type TimeZoneRegion = "US-East" | "US-West" | "EU" | "UK" | "Africa-West" | "Asia-South";

export type DayPhase = "overnight" | "morning" | "midday" | "afternoon" | "prime-time" | "late-night";

export type AudienceWindow = "low" | "medium" | "high" | "peak";

export interface TimeContext {
  utcHour: number;
  utcDayOfWeek: number;
  dayPhase: DayPhase;
  audienceWindow: AudienceWindow;
  isWeekend: boolean;
  isPrimeTime: boolean;
  recommendedActions: string[];
}

const DAY_PHASES: Array<[number, number, DayPhase]> = [
  [0,  5,  "overnight"],
  [5,  9,  "morning"],
  [9,  12, "midday"],
  [12, 17, "afternoon"],
  [17, 22, "prime-time"],
  [22, 24, "late-night"],
];

const AUDIENCE_WINDOWS: Array<[number, number, AudienceWindow]> = [
  [0,  7,  "low"],
  [7,  12, "medium"],
  [12, 15, "medium"],
  [15, 18, "high"],
  [18, 23, "peak"],
  [23, 24, "medium"],
];

export function getCurrentTimeContext(): TimeContext {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcDayOfWeek = now.getUTCDay();
  const isWeekend = utcDayOfWeek === 0 || utcDayOfWeek === 6;

  const dayPhase = DAY_PHASES.find(([s, e]) => utcHour >= s && utcHour < e)?.[2] ?? "overnight";
  const audienceWindow = AUDIENCE_WINDOWS.find(([s, e]) => utcHour >= s && utcHour < e)?.[2] ?? "low";
  const isPrimeTime = dayPhase === "prime-time" || (isWeekend && dayPhase === "afternoon");

  const recommendedActions: string[] = [];
  if (isPrimeTime)          recommendedActions.push("schedule-battles", "push-live-rooms", "send-audience-invites");
  if (audienceWindow === "peak")    recommendedActions.push("publish-content", "trigger-contests");
  if (audienceWindow === "low")     recommendedActions.push("run-maintenance", "process-analytics", "queue-outreach");
  if (isWeekend)            recommendedActions.push("boost-social", "activate-weekend-events");
  if (dayPhase === "morning")       recommendedActions.push("send-daily-briefing", "reset-daily-goals");

  return { utcHour, utcDayOfWeek, dayPhase, audienceWindow, isWeekend, isPrimeTime, recommendedActions };
}

export function shouldBotAct(botDepartment: string): boolean {
  const ctx = getCurrentTimeContext();
  if (botDepartment === "maintenance" || botDepartment === "analytics") {
    return ctx.audienceWindow === "low" || ctx.dayPhase === "overnight";
  }
  if (botDepartment === "outreach") {
    return ctx.audienceWindow !== "low";
  }
  if (botDepartment === "audience") {
    return ctx.isPrimeTime || ctx.audienceWindow === "peak";
  }
  return true;
}

export function getOptimalBatchTime(): string {
  const now = new Date();
  const nextLow = new Date(now);
  const currentHour = now.getUTCHours();
  if (currentHour >= 23 || currentHour < 4) {
    return now.toISOString();
  }
  nextLow.setUTCHours(23, 0, 0, 0);
  return nextLow.toISOString();
}

export function getAudiencePeakHours(): number[] {
  return [18, 19, 20, 21, 22];
}

export function formatDayPhase(phase: DayPhase): string {
  const labels: Record<DayPhase, string> = {
    overnight:   "Overnight (0–5 UTC)",
    morning:     "Morning (5–9 UTC)",
    midday:      "Midday (9–12 UTC)",
    afternoon:   "Afternoon (12–17 UTC)",
    "prime-time":"Prime Time (17–22 UTC)",
    "late-night":"Late Night (22–24 UTC)",
  };
  return labels[phase];
}
