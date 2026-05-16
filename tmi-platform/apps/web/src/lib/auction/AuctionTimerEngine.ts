export interface AuctionTimerState {
  auctionId: string;
  endsAt: string;
  closed: boolean;
}

const TIMERS = new Map<string, AuctionTimerState>();

export class AuctionTimerEngine {
  static setTimer(auctionId: string, endsAt: string): AuctionTimerState {
    const state: AuctionTimerState = {
      auctionId,
      endsAt,
      closed: false,
    };
    TIMERS.set(auctionId, state);
    return state;
  }

  static isExpired(auctionId: string): boolean {
    const timer = TIMERS.get(auctionId);
    if (!timer) return false;
    return new Date(timer.endsAt) <= new Date();
  }

  static closeIfExpired(auctionId: string): AuctionTimerState | null {
    const timer = TIMERS.get(auctionId);
    if (!timer) return null;
    if (this.isExpired(auctionId)) timer.closed = true;
    return timer;
  }

  static getTimer(auctionId: string): AuctionTimerState | null {
    return TIMERS.get(auctionId) || null;
  }
}

export default AuctionTimerEngine;
