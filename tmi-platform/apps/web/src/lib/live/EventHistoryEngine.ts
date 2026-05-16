type WinnerRecord = {
  eventId: string;
  winner: string;
  at: Date;
};

export type EventHistoryRecord = {
  eventId: string;
  title: string;
  genre: string;
  startedAt: Date;
  endedAt: Date;
  roomOccupancy: number;
};

const history: EventHistoryRecord[] = [];
const winners: WinnerRecord[] = [];

export function recordEventHistory(entry: EventHistoryRecord): void {
  history.unshift(entry);
  if (history.length > 120) history.length = 120;
}

export function recordWinner(eventId: string, winner: string, at: Date = new Date()): void {
  winners.unshift({ eventId, winner, at });
  if (winners.length > 120) winners.length = 120;
}

export function getEventHistory(limit = 20): EventHistoryRecord[] {
  return history.slice(0, limit);
}

export function getGenreHistory(limit = 24): string[] {
  return history.slice(0, limit).map((h) => h.genre);
}

export function getLastWinner(eventId: string): string | null {
  return winners.find((w) => w.eventId === eventId)?.winner ?? null;
}
