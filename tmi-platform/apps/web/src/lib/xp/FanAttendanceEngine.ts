/**
 * FanAttendanceEngine.ts
 *
 * Tracks fan event attendance history, statistics, loyalty.
 * Purpose: Reward loyal fans and track engagement patterns.
 */

export interface FanAttendanceRecord {
  recordId: string;
  fanId: string;
  eventId: string;
  eventType: 'live' | 'premiere' | 'concert' | 'cypher' | 'battle' | 'meet-and-greet';
  attendedAt: number;
  durationMinutes: number;
  artistIds: string[]; // multiple if cypher or battle
  venue?: string;
}

export interface FanAttendanceStats {
  fanId: string;
  totalEventsAttended: number;
  totalLiveMinutesWatched: number;
  eventsByType: Record<string, number>;
  favoriteArtists: { artistId: string; count: number }[];
}

// In-memory registry
const attendanceRecords = new Map<string, FanAttendanceRecord>();
const attendanceStats = new Map<string, FanAttendanceStats>();
let recordCounter = 0;

/**
 * Records fan attendance.
 */
export function recordFanAttendance(input: {
  fanId: string;
  eventId: string;
  eventType: FanAttendanceRecord['eventType'];
  durationMinutes: number;
  artistIds: string[];
  venue?: string;
}): FanAttendanceRecord {
  const recordId = `attend-${recordCounter++}`;

  const record: FanAttendanceRecord = {
    recordId,
    fanId: input.fanId,
    eventId: input.eventId,
    eventType: input.eventType,
    attendedAt: Date.now(),
    durationMinutes: input.durationMinutes,
    artistIds: input.artistIds,
    venue: input.venue,
  };

  attendanceRecords.set(recordId, record);

  // Update stats
  let stats = attendanceStats.get(input.fanId);
  if (!stats) {
    stats = {
      fanId: input.fanId,
      totalEventsAttended: 0,
      totalLiveMinutesWatched: 0,
      eventsByType: {},
      favoriteArtists: [],
    };
    attendanceStats.set(input.fanId, stats);
  }

  stats.totalEventsAttended += 1;
  stats.totalLiveMinutesWatched += input.durationMinutes;
  stats.eventsByType[input.eventType] = (stats.eventsByType[input.eventType] ?? 0) + 1;

  // Track favorite artists
  const artistCounts: Record<string, number> = {};
  input.artistIds.forEach((id) => {
    artistCounts[id] = (artistCounts[id] ?? 0) + 1;
  });

  // Merge into existing favorites
  stats.favoriteArtists = stats.favoriteArtists.filter((fa) => !(fa.artistId in artistCounts));
  Object.entries(artistCounts).forEach(([artistId, count]) => {
    const existing = stats!.favoriteArtists.find((fa) => fa.artistId === artistId);
    if (existing) {
      existing.count += count;
    } else {
      stats!.favoriteArtists.push({ artistId, count });
    }
  });

  stats.favoriteArtists.sort((a, b) => b.count - a.count);

  return record;
}

/**
 * Gets attendance stats for fan.
 */
export function getAttendanceStats(fanId: string): FanAttendanceStats | null {
  return attendanceStats.get(fanId) ?? null;
}

/**
 * Gets attendance record.
 */
export function getAttendanceRecord(recordId: string): FanAttendanceRecord | null {
  return attendanceRecords.get(recordId) ?? null;
}

/**
 * Lists all attendances by fan.
 */
export function listAttendancesByFan(fanId: string): FanAttendanceRecord[] {
  return Array.from(attendanceRecords.values()).filter((r) => r.fanId === fanId);
}

/**
 * Gets most loyal fans (by attendance).
 */
export function getMostLoyalFans(limit: number = 10): FanAttendanceStats[] {
  return Array.from(attendanceStats.values())
    .sort((a, b) => b.totalEventsAttended - a.totalEventsAttended)
    .slice(0, limit);
}

/**
 * Gets fans watching most live minutes.
 */
export function getTopTimeWatchers(limit: number = 10): FanAttendanceStats[] {
  return Array.from(attendanceStats.values())
    .sort((a, b) => b.totalLiveMinutesWatched - a.totalLiveMinutesWatched)
    .slice(0, limit);
}
