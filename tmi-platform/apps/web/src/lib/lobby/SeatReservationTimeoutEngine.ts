/**
 * Seat Reservation Timeout Engine
 * Enforces 5-minute timeout windows for seat reservations.
 */

import {
  type NextShowReservation,
  nextShowSeatReservationEngine,
} from './NextShowSeatReservationEngine';

export interface SeatTimeoutSweepResult {
  expired: NextShowReservation[];
  expiredSeatIds: string[];
}

export class SeatReservationTimeoutEngine {
  static readonly RESERVATION_TIMEOUT_MS = 5 * 60_000;

  static isExpired(reservation: NextShowReservation, nowMs = Date.now()): boolean {
    return reservation.expiresAtMs <= nowMs;
  }

  static sweep(nowMs = Date.now()): SeatTimeoutSweepResult {
    const expired = nextShowSeatReservationEngine.consumeExpiredReservations(nowMs);
    return {
      expired,
      expiredSeatIds: expired.map((reservation) => reservation.seatId),
    };
  }

  static getRemainingMs(seatId: string, nowMs = Date.now()): number {
    return nextShowSeatReservationEngine.getTimerRemainingMs(seatId, nowMs);
  }
}
