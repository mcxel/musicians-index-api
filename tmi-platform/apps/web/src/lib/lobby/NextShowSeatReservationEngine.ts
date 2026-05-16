/**
 * Next Show Seat Reservation Engine
 * Handles reservation lifecycle for the next show and late-entry permissions.
 */

export type SeatIntelligenceState =
  | 'LATE_ENTRY'
  | 'NEXT_SHOW_RESERVED'
  | 'STANDBY_QUEUE'
  | 'PRE_RESET'
  | 'POST_RESET'
  | 'FORFEIT_WINDOW';

export interface LateEntryPermissions {
  watch: boolean;
  chat: boolean;
  vote: boolean;
  tip: boolean;
}

export interface NextShowReservation {
  seatId: string;
  userId: string;
  showId: string;
  reservedAtMs: number;
  expiresAtMs: number;
  state: 'NEXT_SHOW_RESERVED';
  timerVisible: true;
  permissions: LateEntryPermissions;
}

export interface StandbyEntry {
  userId: string;
  showId: string;
  queuedAtMs: number;
  state: 'STANDBY_QUEUE';
}

const DEFAULT_RESERVATION_WINDOW_MS = 5 * 60_000;

export class NextShowSeatReservationEngine {
  private reservations = new Map<string, NextShowReservation>();
  private standbyByShow = new Map<string, StandbyEntry[]>();

  reserveSeatForNextShow(
    seatId: string,
    userId: string,
    showId: string,
    nowMs = Date.now(),
    timeoutMs = DEFAULT_RESERVATION_WINDOW_MS,
  ): NextShowReservation {
    const reservation: NextShowReservation = {
      seatId,
      userId,
      showId,
      reservedAtMs: nowMs,
      expiresAtMs: nowMs + timeoutMs,
      state: 'NEXT_SHOW_RESERVED',
      timerVisible: true,
      // Late-entry users can watch/chat/vote/tip while holding next-show reservation.
      permissions: { watch: true, chat: true, vote: true, tip: true },
    };

    this.reservations.set(seatId, reservation);
    return reservation;
  }

  getReservation(seatId: string): NextShowReservation | null {
    return this.reservations.get(seatId) ?? null;
  }

  releaseReservation(seatId: string): boolean {
    return this.reservations.delete(seatId);
  }

  getTimerRemainingMs(seatId: string, nowMs = Date.now()): number {
    const reservation = this.reservations.get(seatId);
    if (!reservation) return 0;
    return Math.max(0, reservation.expiresAtMs - nowMs);
  }

  consumeExpiredReservations(nowMs = Date.now()): NextShowReservation[] {
    const expired: NextShowReservation[] = [];
    for (const [seatId, reservation] of this.reservations.entries()) {
      if (reservation.expiresAtMs <= nowMs) {
        expired.push(reservation);
        this.reservations.delete(seatId);
      }
    }
    return expired;
  }

  joinStandbyQueue(showId: string, userId: string, nowMs = Date.now()): StandbyEntry {
    const queue = this.standbyByShow.get(showId) ?? [];
    const existing = queue.find((entry) => entry.userId === userId);
    if (existing) return existing;

    const entry: StandbyEntry = {
      userId,
      showId,
      queuedAtMs: nowMs,
      state: 'STANDBY_QUEUE',
    };

    queue.push(entry);
    this.standbyByShow.set(showId, queue);
    return entry;
  }

  popStandby(showId: string): StandbyEntry | null {
    const queue = this.standbyByShow.get(showId);
    if (!queue || queue.length === 0) return null;
    const entry = queue.shift() ?? null;
    this.standbyByShow.set(showId, queue);
    return entry;
  }

  getStandbyQueue(showId: string): StandbyEntry[] {
    return [...(this.standbyByShow.get(showId) ?? [])];
  }
}

export const nextShowSeatReservationEngine = new NextShowSeatReservationEngine();
