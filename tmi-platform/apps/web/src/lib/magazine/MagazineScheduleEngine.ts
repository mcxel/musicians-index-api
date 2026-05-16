/**
 * MagazineScheduleEngine
 * Weekly and monthly scheduling for issue lifecycle and rotation timing.
 */

export type MagazineSchedulePlan = {
  scheduleId: string;
  timezone: string;
  monthlyIssueDayOfMonth: number;
  weeklyBoostDayOfWeek: number;
  featureTiming: {
    featuredArtistRefreshHours: number;
    featuredVenueRefreshHours: number;
    featuredEventRefreshHours: number;
    featuredSponsorRefreshHours: number;
  };
  rotationTiming: {
    articleRotationMinutes: number;
    homepageArticleRotationMinutes: number;
    adRotationMinutes: number;
    sponsorRotationMinutes: number;
    rankRotationMinutes: number;
    eventRotationMinutes: number;
  };
  createdAtMs: number;
  updatedAtMs: number;
};

const plans = new Map<string, MagazineSchedulePlan>();
let planCounter = 0;

export function createMagazineSchedulePlan(input?: {
  timezone?: string;
  monthlyIssueDayOfMonth?: number;
  weeklyBoostDayOfWeek?: number;
  featureTiming?: Partial<MagazineSchedulePlan["featureTiming"]>;
  rotationTiming?: Partial<MagazineSchedulePlan["rotationTiming"]>;
}): MagazineSchedulePlan {
  const now = Date.now();
  const scheduleId = `mag-schedule-${++planCounter}`;

  const plan: MagazineSchedulePlan = {
    scheduleId,
    timezone: input?.timezone ?? "UTC",
    monthlyIssueDayOfMonth: input?.monthlyIssueDayOfMonth ?? 1,
    weeklyBoostDayOfWeek: input?.weeklyBoostDayOfWeek ?? 1,
    featureTiming: {
      featuredArtistRefreshHours: input?.featureTiming?.featuredArtistRefreshHours ?? 24,
      featuredVenueRefreshHours: input?.featureTiming?.featuredVenueRefreshHours ?? 24,
      featuredEventRefreshHours: input?.featureTiming?.featuredEventRefreshHours ?? 24,
      featuredSponsorRefreshHours: input?.featureTiming?.featuredSponsorRefreshHours ?? 12,
    },
    rotationTiming: {
      articleRotationMinutes: input?.rotationTiming?.articleRotationMinutes ?? 30,
      homepageArticleRotationMinutes: input?.rotationTiming?.homepageArticleRotationMinutes ?? 15,
      adRotationMinutes: input?.rotationTiming?.adRotationMinutes ?? 10,
      sponsorRotationMinutes: input?.rotationTiming?.sponsorRotationMinutes ?? 20,
      rankRotationMinutes: input?.rotationTiming?.rankRotationMinutes ?? 60,
      eventRotationMinutes: input?.rotationTiming?.eventRotationMinutes ?? 30,
    },
    createdAtMs: now,
    updatedAtMs: now,
  };

  plans.set(scheduleId, plan);
  return plan;
}

export function updateMagazineSchedulePlan(input: {
  scheduleId: string;
  monthlyIssueDayOfMonth?: number;
  weeklyBoostDayOfWeek?: number;
  featureTiming?: Partial<MagazineSchedulePlan["featureTiming"]>;
  rotationTiming?: Partial<MagazineSchedulePlan["rotationTiming"]>;
}): MagazineSchedulePlan {
  const existing = plans.get(input.scheduleId);
  if (!existing) throw new Error(`Schedule ${input.scheduleId} not found`);

  const updated: MagazineSchedulePlan = {
    ...existing,
    monthlyIssueDayOfMonth: input.monthlyIssueDayOfMonth ?? existing.monthlyIssueDayOfMonth,
    weeklyBoostDayOfWeek: input.weeklyBoostDayOfWeek ?? existing.weeklyBoostDayOfWeek,
    featureTiming: {
      ...existing.featureTiming,
      ...input.featureTiming,
    },
    rotationTiming: {
      ...existing.rotationTiming,
      ...input.rotationTiming,
    },
    updatedAtMs: Date.now(),
  };

  plans.set(updated.scheduleId, updated);
  return updated;
}

export function getMagazineSchedulePlan(scheduleId: string): MagazineSchedulePlan | null {
  return plans.get(scheduleId) ?? null;
}

export function listMagazineSchedulePlans(): MagazineSchedulePlan[] {
  return [...plans.values()].sort((a, b) => b.updatedAtMs - a.updatedAtMs);
}

function nextWeekdayAtUtc(dayOfWeek: number, fromMs: number): number {
  const date = new Date(fromMs);
  date.setUTCHours(0, 0, 0, 0);
  const current = date.getUTCDay();
  const delta = (dayOfWeek - current + 7) % 7 || 7;
  date.setUTCDate(date.getUTCDate() + delta);
  return date.getTime();
}

export function getNextWeeklyBoostAtMs(schedule: MagazineSchedulePlan, fromMs = Date.now()): number {
  return nextWeekdayAtUtc(schedule.weeklyBoostDayOfWeek, fromMs);
}

export function getNextMonthlyIssueAtMs(schedule: MagazineSchedulePlan, fromMs = Date.now()): number {
  const date = new Date(fromMs);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();

  const candidate = new Date(Date.UTC(year, month, schedule.monthlyIssueDayOfMonth, 0, 0, 0, 0));
  if (candidate.getTime() > fromMs) return candidate.getTime();

  return new Date(Date.UTC(year, month + 1, schedule.monthlyIssueDayOfMonth, 0, 0, 0, 0)).getTime();
}
