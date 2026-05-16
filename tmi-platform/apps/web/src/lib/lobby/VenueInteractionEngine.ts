import {
  nextShowSeatReservationEngine,
  type NextShowReservation,
  type StandbyEntry,
} from './NextShowSeatReservationEngine';
import { SeatReservationTimeoutEngine } from './SeatReservationTimeoutEngine';
import { showResetEngine, type ShowResetSnapshot } from '@/lib/shows/ShowResetEngine';
import {
  contestantForfeitEngine,
  type ContestantPresence,
  type ForfeitDecision,
} from '@/lib/shows/ContestantForfeitEngine';
import { hostFallbackEngine, type HostRuntimePresence, type HostFallbackAssignment } from '@/lib/shows/HostFallbackEngine';

export class VenueInteractionEngine {
  static interactWithSeat(seatId: string) {
    console.log(`Interacting with physical seat: ${seatId}`);
    // Seat Context logic trigger
  }

  static reserveSeatForNextShow(
    seatId: string,
    userId: string,
    showId: string,
  ): NextShowReservation {
    return nextShowSeatReservationEngine.reserveSeatForNextShow(
      seatId,
      userId,
      showId,
      Date.now(),
      SeatReservationTimeoutEngine.RESERVATION_TIMEOUT_MS,
    );
  }

  static queueStandby(showId: string, userId: string): StandbyEntry {
    return nextShowSeatReservationEngine.joinStandbyQueue(showId, userId);
  }

  static getSeatTimerRemainingMs(seatId: string): number {
    return SeatReservationTimeoutEngine.getRemainingMs(seatId);
  }

  static sweepExpiredSeatReservations(): string[] {
    return SeatReservationTimeoutEngine.sweep().expiredSeatIds;
  }

  static markShowPreReset(showId: string, reason = 'scheduled-reset'): ShowResetSnapshot {
    return showResetEngine.markPreReset(showId, reason);
  }

  static markShowPostReset(showId: string, reason = 'reset-finished'): ShowResetSnapshot {
    return showResetEngine.markPostReset(showId, reason);
  }

  static openForfeitWindow(contestantId: string, showId: string): ContestantPresence {
    return contestantForfeitEngine.startForfeitWindow(contestantId, showId);
  }

  static evaluateForfeit(window: ContestantPresence): ForfeitDecision {
    return contestantForfeitEngine.evaluate(window);
  }

  static resolveHostFallback(
    showId: string,
    hostId: string,
    presence: HostRuntimePresence,
  ): HostFallbackAssignment {
    return hostFallbackEngine.assign(showId, hostId, presence);
  }

  static interactWithStageQueue() {
    console.log(`Interacting with stage queue terminal`);
    // Open interactive Queue Terminal modal
  }

  static triggerReaction(reaction: string) {
    console.log(`Triggering global reaction burst: ${reaction}`);
  }
}