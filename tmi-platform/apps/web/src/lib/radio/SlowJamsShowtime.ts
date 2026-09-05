/**
 * Sunday Slow Jams — official 🌍 Stream & Win lounge schedule (Rule 21 / 25).
 * All-day Sunday, America/New_York. Casual listening — not dance energy.
 * Parallel to WorldDancePartyShowtime (Friday), separate pool.
 */

const TZ = "America/New_York";
const SUNDAY_WEEKDAY = 0;

const ET_WEEKDAY: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function zonedParts(d: Date, timeZone: string): Record<string, number> {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(d).reduce<Record<string, string>>((acc, p) => {
    if (p.type !== "literal") acc[p.type] = p.value;
    return acc;
  }, {});
  const hour = parts.hour === "24" ? 0 : Number(parts.hour);
  return {
    weekday: ET_WEEKDAY[parts.weekday ?? "Sun"] ?? 0,
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour,
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function zonedWallClockToUtc(
  year: number,
  month1: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const month0 = month1 - 1;
  const utcGuess = new Date(Date.UTC(year, month0, day, hour, minute, 0));
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const rendered = fmt.formatToParts(utcGuess).reduce<Record<string, string>>((acc, p) => {
    if (p.type !== "literal") acc[p.type] = p.value;
    return acc;
  }, {});
  const rh = rendered.hour === "24" ? 0 : Number(rendered.hour);
  const asIfUtc = Date.UTC(
    Number(rendered.year),
    Number(rendered.month) - 1,
    Number(rendered.day),
    rh,
    Number(rendered.minute),
    Number(rendered.second),
  );
  return new Date(utcGuess.getTime() - (asIfUtc - utcGuess.getTime()));
}

/** Canonical week key for the Sunday rotation pool (ET calendar Sunday). */
export function getSlowJamsSundayWeekKey(from: Date = new Date()): string {
  const p = zonedParts(from, TZ);
  const daysUntilSunday = (SUNDAY_WEEKDAY - p.weekday + 7) % 7;
  let targetDay = p.day + daysUntilSunday;
  let targetMonth = p.month;
  let targetYear = p.year;
  if (p.weekday === SUNDAY_WEEKDAY) {
    targetDay = p.day;
  } else if (daysUntilSunday === 0) {
    targetDay = p.day + 7;
  }
  const sundayStart = zonedWallClockToUtc(targetYear, targetMonth, targetDay, 0, 0, TZ);
  const sp = zonedParts(sundayStart, TZ);
  return `SJ-${sp.year}-${String(sp.month).padStart(2, "0")}-${String(sp.day).padStart(2, "0")}`;
}

/**
 * Submit window: Saturday 00:00 ET → Sunday 23:59 ET (Sat→Sun week).
 * Clears after Sunday ends (mirrors WDP weekly clear).
 */
export function getSlowJamsSubmitWindowForWeekKey(weekKey: string): { opensAt: Date; closesAt: Date } {
  const m = weekKey.match(/^SJ-(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) {
    const now = new Date();
    return { opensAt: now, closesAt: now };
  }
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const sundayStart = zonedWallClockToUtc(y, mo, d, 0, 0, TZ);
  const saturdayBefore = new Date(sundayStart.getTime() - 1 * 24 * 60 * 60 * 1000);
  const sat = zonedParts(saturdayBefore, TZ);
  const opensAt = zonedWallClockToUtc(sat.year, sat.month, sat.day, 0, 0, TZ);
  const closesAt = zonedWallClockToUtc(y, mo, d, 23, 59, TZ);
  return { opensAt, closesAt };
}

export type SlowJamsPhase = "CLOSED" | "SUBMIT_OPEN" | "LIVE" | "ARCHIVE";

export interface SlowJamsWindow {
  phase: SlowJamsPhase;
  weekKey: string;
  sundayStartMs: number;
  sundayEndMs: number;
  submitOpensMs: number;
  submitClosesMs: number;
  joinable: boolean;
  label: string;
  hostBotId: "bot-dj-2";
}

export function getSlowJamsWindow(from: Date = new Date()): SlowJamsWindow {
  const weekKey = getSlowJamsSundayWeekKey(from);
  const { opensAt, closesAt } = getSlowJamsSubmitWindowForWeekKey(weekKey);
  const m = weekKey.match(/^SJ-(\d{4})-(\d{2})-(\d{2})$/);
  const y = Number(m?.[1] ?? 2026);
  const mo = Number(m?.[2] ?? 1);
  const d = Number(m?.[3] ?? 1);
  const sundayStart = zonedWallClockToUtc(y, mo, d, 0, 0, TZ);
  const sundayEnd = zonedWallClockToUtc(y, mo, d, 23, 59, TZ);
  const now = from.getTime();
  const p = zonedParts(from, TZ);

  if (now >= sundayEnd.getTime()) {
    return {
      phase: "ARCHIVE",
      weekKey,
      sundayStartMs: sundayStart.getTime(),
      sundayEndMs: sundayEnd.getTime(),
      submitOpensMs: opensAt.getTime(),
      submitClosesMs: closesAt.getTime(),
      joinable: false,
      label: "Slow Jams ended — next Sunday",
      hostBotId: "bot-dj-2",
    };
  }

  if (now >= sundayStart.getTime() && now < sundayEnd.getTime()) {
    return {
      phase: "LIVE",
      weekKey,
      sundayStartMs: sundayStart.getTime(),
      sundayEndMs: sundayEnd.getTime(),
      submitOpensMs: opensAt.getTime(),
      submitClosesMs: closesAt.getTime(),
      joinable: true,
      label: "🌙 Sunday Slow Jams — LIVE all day ET",
      hostBotId: "bot-dj-2",
    };
  }

  if (now >= opensAt.getTime() && now < sundayStart.getTime()) {
    return {
      phase: "SUBMIT_OPEN",
      weekKey,
      sundayStartMs: sundayStart.getTime(),
      sundayEndMs: sundayEnd.getTime(),
      submitOpensMs: opensAt.getTime(),
      submitClosesMs: closesAt.getTime(),
      joinable: false,
      label: `Submissions open · plays Sunday ${mo}/${d}`,
      hostBotId: "bot-dj-2",
    };
  }

  return {
    phase: "CLOSED",
    weekKey,
    sundayStartMs: sundayStart.getTime(),
    sundayEndMs: sundayEnd.getTime(),
    submitOpensMs: opensAt.getTime(),
    submitClosesMs: closesAt.getTime(),
    joinable: false,
    label: p.weekday === 6 ? "Submit for Sunday Slow Jams opens now" : "Slow Jams — next Sunday ET",
    hostBotId: "bot-dj-2",
  };
}

export function isSlowJamsLive(from: Date = new Date()): boolean {
  return getSlowJamsWindow(from).phase === "LIVE";
}
