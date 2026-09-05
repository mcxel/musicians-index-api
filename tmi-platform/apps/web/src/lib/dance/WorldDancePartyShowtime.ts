/**
 * World Dance Party — official 🌍 flagship schedule (Rule 21).
 * All-day Friday, America/New_York. Bot/platform only — humans never create World.
 */

const TZ = "America/New_York";
const FRIDAY_WEEKDAY = 5; // Fri in JS getDay()

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

/** Canonical week key for the Friday rotation pool (ET calendar Friday). */
export function getWorldDanceFridayWeekKey(from: Date = new Date()): string {
  const p = zonedParts(from, TZ);
  const daysUntilFriday = (FRIDAY_WEEKDAY - p.weekday + 7) % 7;
  let targetDay = p.day + daysUntilFriday;
  let targetMonth = p.month;
  let targetYear = p.year;
  if (p.weekday === FRIDAY_WEEKDAY) {
    targetDay = p.day;
  } else if (daysUntilFriday === 0) {
    targetDay = p.day + 7;
  }
  const fridayStart = zonedWallClockToUtc(targetYear, targetMonth, targetDay, 0, 0, TZ);
  const fp = zonedParts(fridayStart, TZ);
  return `WDP-${fp.year}-${String(fp.month).padStart(2, "0")}-${String(fp.day).padStart(2, "0")}`;
}

/** Saturday 00:00 ET after prior Friday — submit window opens for target Friday week key. */
export function getSubmitWindowForWeekKey(weekKey: string): { opensAt: Date; closesAt: Date } {
  const m = weekKey.match(/^WDP-(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) {
    const now = new Date();
    return { opensAt: now, closesAt: now };
  }
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const fridayStart = zonedWallClockToUtc(y, mo, d, 0, 0, TZ);
  const saturdayBefore = new Date(fridayStart.getTime() - 6 * 24 * 60 * 60 * 1000);
  const opensAt = zonedWallClockToUtc(
    zonedParts(saturdayBefore, TZ).year,
    zonedParts(saturdayBefore, TZ).month,
    zonedParts(saturdayBefore, TZ).day,
    0,
    0,
    TZ,
  );
  const closesAt = zonedWallClockToUtc(y, mo, d, 23, 59, TZ);
  return { opensAt, closesAt };
}

export type WorldDancePartyPhase = "CLOSED" | "SUBMIT_OPEN" | "LIVE" | "ARCHIVE";

export interface WorldDancePartyWindow {
  phase: WorldDancePartyPhase;
  weekKey: string;
  /** All-day Friday live window start (00:00 ET). */
  fridayStartMs: number;
  fridayEndMs: number;
  submitOpensMs: number;
  submitClosesMs: number;
  joinable: boolean;
  label: string;
  hostBotId: "record-ralph";
}

export function getWorldDancePartyWindow(from: Date = new Date()): WorldDancePartyWindow {
  const weekKey = getWorldDanceFridayWeekKey(from);
  const { opensAt, closesAt } = getSubmitWindowForWeekKey(weekKey);
  const m = weekKey.match(/^WDP-(\d{4})-(\d{2})-(\d{2})$/);
  const y = Number(m?.[1] ?? 2026);
  const mo = Number(m?.[2] ?? 1);
  const d = Number(m?.[3] ?? 1);
  const fridayStart = zonedWallClockToUtc(y, mo, d, 0, 0, TZ);
  const fridayEnd = zonedWallClockToUtc(y, mo, d, 23, 59, TZ);
  const now = from.getTime();
  const p = zonedParts(from, TZ);

  if (now >= fridayEnd.getTime()) {
    return {
      phase: "ARCHIVE",
      weekKey,
      fridayStartMs: fridayStart.getTime(),
      fridayEndMs: fridayEnd.getTime(),
      submitOpensMs: opensAt.getTime(),
      submitClosesMs: closesAt.getTime(),
      joinable: false,
      label: "World Dance Party ended — next Friday",
      hostBotId: "record-ralph",
    };
  }

  if (now >= fridayStart.getTime() && now < fridayEnd.getTime()) {
    return {
      phase: "LIVE",
      weekKey,
      fridayStartMs: fridayStart.getTime(),
      fridayEndMs: fridayEnd.getTime(),
      submitOpensMs: opensAt.getTime(),
      submitClosesMs: closesAt.getTime(),
      joinable: true,
      label: "🌍 WORLD Dance Party — LIVE all day Friday ET",
      hostBotId: "record-ralph",
    };
  }

  if (now >= opensAt.getTime() && now < fridayStart.getTime()) {
    return {
      phase: "SUBMIT_OPEN",
      weekKey,
      fridayStartMs: fridayStart.getTime(),
      fridayEndMs: fridayEnd.getTime(),
      submitOpensMs: opensAt.getTime(),
      submitClosesMs: closesAt.getTime(),
      joinable: false,
      label: `Submissions open · plays Friday ${mo}/${d}`,
      hostBotId: "record-ralph",
    };
  }

  return {
    phase: "CLOSED",
    weekKey,
    fridayStartMs: fridayStart.getTime(),
    fridayEndMs: fridayEnd.getTime(),
    submitOpensMs: opensAt.getTime(),
    submitClosesMs: closesAt.getTime(),
    joinable: false,
    label: p.weekday === 6 ? "Submit for next Friday opens now" : "World Dance Party — next Friday ET",
    hostBotId: "record-ralph",
  };
}

export function isWorldDancePartyLive(from: Date = new Date()): boolean {
  return getWorldDancePartyWindow(from).phase === "LIVE";
}
