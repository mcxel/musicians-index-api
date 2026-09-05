/**
 * Real, timezone-correct "next Monday 8PM Eastern" calculation, plus the
 * submission window (opens 2 hours before showtime, closes at showtime).
 *
 * lib/competition/MondayNightStageEngine.ts's getNextMonday() does the same
 * thing using the server's local timezone (setHours(20,0,0,0)) — on Vercel
 * that's UTC, so it silently computes 8PM UTC, not 8PM Eastern. Uses
 * Intl's real timezone data (America/New_York, handles DST automatically)
 * instead of a fixed UTC offset, so no third-party timezone library needed.
 */

const SHOW_HOUR_ET = 20; // 8 PM Eastern
const SUBMISSION_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 hours before showtime

function zonedWallClockToUtc(year: number, month0: number, day: number, hour: number, minute: number, timeZone: string): Date {
  const utcGuess = new Date(Date.UTC(year, month0, day, hour, minute, 0));
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const parts = fmt.formatToParts(utcGuess).reduce<Record<string, string>>((acc, p) => {
    if (p.type !== 'literal') acc[p.type] = p.value;
    return acc;
  }, {});
  const renderedHour = parts.hour === '24' ? 0 : Number(parts.hour);
  const asIfUtc = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), renderedHour, Number(parts.minute), Number(parts.second));
  const driftMs = asIfUtc - utcGuess.getTime();
  return new Date(utcGuess.getTime() - driftMs);
}

const ET_WEEKDAY: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Next Monday 8PM America/New_York, as a real UTC instant. If it's already
 * Monday past 8PM ET, rolls to the following Monday. */
export function getNextMondayShowtimeET(from: Date = new Date()): Date {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
  });
  const parts = fmt.formatToParts(from).reduce<Record<string, string>>((acc, p) => {
    if (p.type !== 'literal') acc[p.type] = p.value;
    return acc;
  }, {});
  const nyWeekday = ET_WEEKDAY[parts.weekday] ?? 1;
  const y = Number(parts.year);
  const m0 = Number(parts.month) - 1;
  const d = Number(parts.day);

  const daysUntilMonday = (1 - nyWeekday + 7) % 7;
  let candidate = zonedWallClockToUtc(y, m0, d + daysUntilMonday, SHOW_HOUR_ET, 0, 'America/New_York');
  if (candidate.getTime() <= from.getTime()) {
    candidate = zonedWallClockToUtc(y, m0, d + daysUntilMonday + 7, SHOW_HOUR_ET, 0, 'America/New_York');
  }
  return candidate;
}

export interface SubmissionWindow {
  showtime: Date;
  opensAt: Date;
  isOpen: boolean;
}

export function getSubmissionWindow(from: Date = new Date()): SubmissionWindow {
  const showtime = getNextMondayShowtimeET(from);
  const opensAt = new Date(showtime.getTime() - SUBMISSION_WINDOW_MS);
  const isOpen = from.getTime() >= opensAt.getTime() && from.getTime() < showtime.getTime();
  return { showtime, opensAt, isOpen };
}

/** Canonical broadcast window for Monday Night Stage (America/New_York). */
const SHOW_LIVE_DURATION_MS = 3 * 60 * 60 * 1000;
const PRESHOW_WINDOW_MS = 45 * 60 * 1000;

export type MondayNightStagePhase = "CLOSED" | "PRESHOW" | "LIVE" | "ARCHIVE";

export interface MondayNightStageWindow {
  phase: MondayNightStagePhase;
  /** Next scheduled 8PM ET showtime (current or upcoming Monday). */
  showtime: Date;
  /** Ms until showtime when CLOSED/PRESHOW; ms until window ends when LIVE. */
  countdownMs: number;
  /** True only during Monday LIVE window — bots + UI must agree on this gate. */
  joinable: boolean;
  label: string;
}

function getCurrentMondayShowtimeET(from: Date): Date | null {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(from).reduce<Record<string, string>>((acc, p) => {
    if (p.type !== "literal") acc[p.type] = p.value;
    return acc;
  }, {});
  if ((ET_WEEKDAY[parts.weekday] ?? -1) !== 1) return null;
  const y = Number(parts.year);
  const m0 = Number(parts.month) - 1;
  const d = Number(parts.day);
  return zonedWallClockToUtc(y, m0, d, SHOW_HOUR_ET, 0, "America/New_York");
}

export function getMondayNightStageWindow(from: Date = new Date()): MondayNightStageWindow {
  const nextShow = getNextMondayShowtimeET(from);
  const thisMonday = getCurrentMondayShowtimeET(from);

  if (!thisMonday) {
    return {
      phase: "CLOSED",
      showtime: nextShow,
      countdownMs: Math.max(0, nextShow.getTime() - from.getTime()),
      joinable: false,
      label: "Next Monday 8PM ET",
    };
  }

  const liveEnd = thisMonday.getTime() + SHOW_LIVE_DURATION_MS;
  const preshowStart = thisMonday.getTime() - PRESHOW_WINDOW_MS;
  const now = from.getTime();

  if (now >= liveEnd) {
    return {
      phase: "ARCHIVE",
      showtime: nextShow,
      countdownMs: Math.max(0, nextShow.getTime() - from.getTime()),
      joinable: false,
      label: "Show ended — next Monday",
    };
  }

  if (now >= thisMonday.getTime() && now < liveEnd) {
    return {
      phase: "LIVE",
      showtime: thisMonday,
      countdownMs: Math.max(0, liveEnd - now),
      joinable: true,
      label: "Live now",
    };
  }

  if (now >= preshowStart && now < thisMonday.getTime()) {
    return {
      phase: "PRESHOW",
      showtime: thisMonday,
      countdownMs: Math.max(0, thisMonday.getTime() - now),
      joinable: false,
      label: "Preshow — doors open at 8PM ET",
    };
  }

  return {
    phase: "CLOSED",
    showtime: thisMonday,
    countdownMs: Math.max(0, preshowStart - now),
    joinable: false,
    label: "Monday Night Stage opens 8PM ET",
  };
}
