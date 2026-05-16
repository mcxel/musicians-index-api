export function startOfWeekday(base: Date, weekday: number, hour: number, minute = 0): Date {
  const d = new Date(base);
  d.setSeconds(0, 0);
  const dayOffset = weekday - d.getDay();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export function resolveCurrentOrNextWeeklyWindow(args: {
  now: Date;
  weekday: number;
  hour: number;
  minute?: number;
  durationMinutes: number;
}): { startsAt: Date; endsAt: Date; nextStartsAt: Date } {
  const { now, weekday, hour, minute = 0, durationMinutes } = args;
  const thisWeekStart = startOfWeekday(now, weekday, hour, minute);

  let startsAt = thisWeekStart;
  if (now > thisWeekStart) {
    const elapsed = now.getTime() - thisWeekStart.getTime();
    const liveMs = durationMinutes * 60 * 1000;
    if (elapsed > liveMs) {
      startsAt = new Date(thisWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
  }

  if (now < thisWeekStart) {
    startsAt = thisWeekStart;
  }

  const endsAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);
  const nextStartsAt = new Date(startsAt.getTime() + 7 * 24 * 60 * 60 * 1000);

  return { startsAt, endsAt, nextStartsAt };
}

export function resolveFlexibleMondayHour(args: {
  now: Date;
  options: number[];
}): number {
  const { now, options } = args;
  if (!options.length) return 18;

  // Deterministic weekly rotation of Monday slot (6/7/8 PM) without manual intervention.
  const weekKey = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000));
  return options[Math.abs(weekKey) % options.length] ?? options[0] ?? 18;
}
