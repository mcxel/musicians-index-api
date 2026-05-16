/**
 * BattleChallengeEconomyEngine
 * Handles point eligibility, reservation, charge, and refunds for challenge entry.
 */

export const CHALLENGE_ENTRY_FEE_POINTS = 15;

interface LedgerEntry {
  availableEarnedPoints: number;
  reservedPoints: number;
}

export class BattleChallengeEconomyEngine {
  private ledger: Map<string, LedgerEntry> = new Map();
  private reservationByChallenge: Map<string, { userId: string; points: number }> = new Map();

  seedUser(userId: string, earnedPoints: number): void {
    this.ledger.set(userId, {
      availableEarnedPoints: Math.max(0, Math.floor(earnedPoints)),
      reservedPoints: 0,
    });
  }

  getBalance(userId: string): { availableEarnedPoints: number; reservedPoints: number } {
    const existing = this.ledger.get(userId);
    if (!existing) {
      this.seedUser(userId, 0);
      return { availableEarnedPoints: 0, reservedPoints: 0 };
    }
    return { ...existing };
  }

  canSpendChallengeEntry(userId: string): boolean {
    const b = this.getBalance(userId);
    return b.availableEarnedPoints >= CHALLENGE_ENTRY_FEE_POINTS;
  }

  spendPoints(userId: string, points: number): { ok: boolean; reason?: string } {
    const spend = Math.max(1, Math.floor(points));
    const entry = this.ledger.get(userId) ?? { availableEarnedPoints: 0, reservedPoints: 0 };
    if (entry.availableEarnedPoints < spend) {
      return { ok: false, reason: "insufficient-earned-points" };
    }
    entry.availableEarnedPoints -= spend;
    this.ledger.set(userId, entry);
    return { ok: true };
  }

  reserveChallengeEntry(challengeId: string, userId: string): { ok: boolean; reason?: string } {
    const entry = this.ledger.get(userId) ?? { availableEarnedPoints: 0, reservedPoints: 0 };
    if (entry.availableEarnedPoints < CHALLENGE_ENTRY_FEE_POINTS) {
      return { ok: false, reason: "insufficient-earned-points" };
    }
    entry.availableEarnedPoints -= CHALLENGE_ENTRY_FEE_POINTS;
    entry.reservedPoints += CHALLENGE_ENTRY_FEE_POINTS;
    this.ledger.set(userId, entry);
    this.reservationByChallenge.set(challengeId, { userId, points: CHALLENGE_ENTRY_FEE_POINTS });
    return { ok: true };
  }

  chargeReservedEntry(challengeId: string): { ok: boolean; chargedPoints: number } {
    const reservation = this.reservationByChallenge.get(challengeId);
    if (!reservation) return { ok: false, chargedPoints: 0 };
    const entry = this.ledger.get(reservation.userId);
    if (!entry || entry.reservedPoints < reservation.points) {
      return { ok: false, chargedPoints: 0 };
    }
    entry.reservedPoints -= reservation.points;
    this.ledger.set(reservation.userId, entry);
    this.reservationByChallenge.delete(challengeId);
    return { ok: true, chargedPoints: reservation.points };
  }

  refundReservedEntry(challengeId: string): { ok: boolean; refundedPoints: number } {
    const reservation = this.reservationByChallenge.get(challengeId);
    if (!reservation) return { ok: false, refundedPoints: 0 };
    const entry = this.ledger.get(reservation.userId);
    if (!entry || entry.reservedPoints < reservation.points) {
      return { ok: false, refundedPoints: 0 };
    }
    entry.reservedPoints -= reservation.points;
    entry.availableEarnedPoints += reservation.points;
    this.ledger.set(reservation.userId, entry);
    this.reservationByChallenge.delete(challengeId);
    return { ok: true, refundedPoints: reservation.points };
  }

  awardPoints(userId: string, points: number): void {
    const entry = this.ledger.get(userId) ?? { availableEarnedPoints: 0, reservedPoints: 0 };
    entry.availableEarnedPoints += Math.max(0, Math.floor(points));
    this.ledger.set(userId, entry);
  }
}

export const battleChallengeEconomyEngine = new BattleChallengeEconomyEngine();
