/**
 * WorldConcertXPEngine.ts
 *
 * Rewards world concert creation, attendance, and global reach.
 * Purpose: Make large events valuable and rewarding.
 */

export interface WorldConcert {
  concertId: string;
  artistId: string;
  title: string;
  startedAt: number;
  endedAt?: number;
  globalAttendance: number;
  countriesRepresented: number;
  totalTicketsSold: number;
  xpEarned: number;
  globalReachBonus: number;
}

// In-memory registry
const worldConcerts = new Map<string, WorldConcert>();
let concertCounter = 0;

/**
 * Creates world concert event.
 */
export function createWorldConcert(input: { artistId: string; title: string }): string {
  const concertId = `concert-${concertCounter++}-${input.artistId}`;

  const concert: WorldConcert = {
    concertId,
    artistId: input.artistId,
    title: input.title,
    startedAt: Date.now(),
    globalAttendance: 0,
    countriesRepresented: 0,
    totalTicketsSold: 0,
    xpEarned: 0,
    globalReachBonus: 0,
  };

  worldConcerts.set(concertId, concert);
  return concertId;
}

/**
 * Records concert completion with metrics.
 */
export function recordConcertMetrics(input: {
  concertId: string;
  globalAttendance: number;
  countriesRepresented: number;
  totalTicketsSold: number;
}): void {
  const concert = worldConcerts.get(input.concertId);
  if (!concert) return;

  concert.endedAt = Date.now();
  concert.globalAttendance = input.globalAttendance;
  concert.countriesRepresented = input.countriesRepresented;
  concert.totalTicketsSold = input.totalTicketsSold;

  // XP calculation
  const attendanceXP = Math.min(input.globalAttendance * 0.5, 500); // Up to 500 XP
  const reachXP = input.countriesRepresented * 10; // 10 XP per country
  const ticketXP = input.totalTicketsSold * 2; // 2 XP per ticket

  // Global reach bonus (if reaches 20+ countries)
  concert.globalReachBonus = input.countriesRepresented >= 20 ? 200 : 0;

  concert.xpEarned = attendanceXP + reachXP + ticketXP + concert.globalReachBonus;
}

/**
 * Gets concert (non-mutating).
 */
export function getWorldConcert(concertId: string): WorldConcert | null {
  return worldConcerts.get(concertId) ?? null;
}

/**
 * Lists concerts by artist.
 */
export function listConcertsByArtist(artistId: string): WorldConcert[] {
  return Array.from(worldConcerts.values()).filter((c) => c.artistId === artistId);
}

/**
 * Gets most global concert.
 */
export function getMostGlobalConcert(): WorldConcert | null {
  const all = Array.from(worldConcerts.values()).filter((c) => c.endedAt !== undefined);
  if (all.length === 0) return null;
  return all.reduce((a, b) => (b.countriesRepresented > a.countriesRepresented ? b : a));
}
