/**
 * AttendanceStreakEngine
 * Tracks consecutive weekly event attendance.
 * "Attendance" = entering any live room, battle, cypher, or concert.
 *
 * Week boundaries: Monday 00:00 UTC.
 * Miss a week → streak resets to 0.
 * Attend once per week → streak increments.
 */

export interface AttendanceRecord {
  userId: string;
  /** Consecutive weeks attended */
  currentStreak: number;
  longestStreak: number;
  totalEventsAttended: number;
  /** ISO week keys already credited (prevents double-count) */
  weeksAttended: string[];
  lastAttendanceAt: number;
  updatedAt: number;
}

function getISOWeekKey(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

class AttendanceStreakEngine {
  private records = new Map<string, AttendanceRecord>();

  private get(userId: string): AttendanceRecord {
    return this.records.get(userId) ?? {
      userId,
      currentStreak: 0,
      longestStreak: 0,
      totalEventsAttended: 0,
      weeksAttended: [],
      lastAttendanceAt: 0,
      updatedAt: Date.now(),
    };
  }

  /**
   * Record an attendance event for a user.
   * One credit per week. Streak increments once per week key.
   */
  recordAttendance(userId: string): AttendanceRecord {
    const r = this.get(userId);
    const thisWeek = getISOWeekKey();

    if (r.weeksAttended.includes(thisWeek)) {
      // Already credited this week — just bump total event count
      const updated = { ...r, totalEventsAttended: r.totalEventsAttended + 1, updatedAt: Date.now() };
      this.records.set(userId, updated);
      return updated;
    }

    // Check if last week was attended (for streak continuity)
    const lastWeekDate = new Date();
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);
    const lastWeekKey = getISOWeekKey(lastWeekDate);
    const consecutive = r.weeksAttended.includes(lastWeekKey) || r.weeksAttended.length === 0;
    const newStreak = consecutive ? r.currentStreak + 1 : 1;

    const updated: AttendanceRecord = {
      ...r,
      currentStreak:      newStreak,
      longestStreak:      Math.max(r.longestStreak, newStreak),
      totalEventsAttended: r.totalEventsAttended + 1,
      weeksAttended:      [...r.weeksAttended.slice(-52), thisWeek], // keep last 52 weeks
      lastAttendanceAt:   Date.now(),
      updatedAt:          Date.now(),
    };
    this.records.set(userId, updated);
    return updated;
  }

  getRecord(userId: string): AttendanceRecord | undefined {
    return this.records.get(userId);
  }

  seed(userId: string, streak: number, totalEvents: number): void {
    // Build a fake week history
    const weeks: string[] = [];
    for (let i = streak; i >= 1; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * 7);
      weeks.push(getISOWeekKey(d));
    }
    this.records.set(userId, {
      userId,
      currentStreak: streak,
      longestStreak: Math.max(streak, Math.floor(streak * 1.3)),
      totalEventsAttended: totalEvents,
      weeksAttended: weeks,
      lastAttendanceAt: Date.now() - 86400000,
      updatedAt: Date.now(),
    });
  }
}

export const attendanceStreakEngine = new AttendanceStreakEngine();
