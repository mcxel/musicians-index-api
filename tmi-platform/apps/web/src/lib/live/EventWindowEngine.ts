import { resolveCurrentOrNextWeeklyWindow, resolveFlexibleMondayHour } from "@/lib/live/CycleScheduler";
import { pickNextGenre } from "@/lib/live/GenreRotationEngine";
import type { LiveEventTemplate, LiveEventWindow } from "@/lib/live/LiveEventRegistry";

export function buildEventWindow(args: {
  now: Date;
  template: LiveEventTemplate;
  genreHistory: string[];
  activityByGenre?: Partial<Record<string, number>>;
}): LiveEventWindow {
  const { now, template, genreHistory, activityByGenre } = args;

  const hour = template.scheduleType === "weekly-flex"
    ? resolveFlexibleMondayHour({ now, options: template.flexHours ?? [template.hour] })
    : template.hour;

  const cycle = resolveCurrentOrNextWeeklyWindow({
    now,
    weekday: template.weekday,
    hour,
    minute: template.minute,
    durationMinutes: template.durationMinutes,
  });

  const activeGenre = pickNextGenre({
    genrePool: template.genrePool,
    history: genreHistory,
    activity: activityByGenre,
  });

  const cooldownMinutes = template.cooldownMinutes ?? Math.max(30, template.durationMinutes / 2);
  const cooldownEndsAt = new Date(cycle.endsAt.getTime() + cooldownMinutes * 60 * 1000);

  return {
    id: template.id,
    title: template.title,
    category: template.category,
    startsAt: cycle.startsAt,
    endsAt: cycle.endsAt,
    cooldownEndsAt,
    nextRotationAt: cycle.nextStartsAt,
    genrePool: template.genrePool,
    activeGenre,
    autoRestart: template.autoRestart,
    visibility: template.visibility,
  };
}
