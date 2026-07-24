import { prisma } from "@/lib/prisma";

export interface MatchHistoryRecord {
  id: string;
  matchId: string;
  venueType: string;
  venueId: string;
  competitionType: string;
  challengerId: string;
  opponentId: string;
  challengerScore: number;
  opponentScore: number;
  winnerId: string | null;
  resultType: string;
  ratingBeforeChallenger: number;
  ratingAfterChallenger: number;
  ratingBeforeOpponent: number;
  ratingAfterOpponent: number;
  integrityBeforeChallenger: number;
  integrityAfterChallenger: number;
  integrityBeforeOpponent: number;
  integrityAfterOpponent: number;
  completedAt: Date;
  createdAt: Date;
}

export interface PlayerStats {
  userId: string;
  wins: number;
  losses: number;
  draws: number;
  winStreak: number;
  totalMatches: number;
  history: MatchHistoryRecord[];
}

export class MatchHistoryEngine {
  /**
   * Appends a new immutable match history event to Postgres
   */
  async recordMatchResult(params: Omit<MatchHistoryRecord, "id" | "matchId" | "completedAt" | "createdAt">): Promise<MatchHistoryRecord> {
    const record = await prisma.matchHistory.create({
      data: {
        venueType: params.venueType,
        venueId: params.venueId,
        competitionType: params.competitionType,
        challengerId: params.challengerId,
        opponentId: params.opponentId,
        challengerScore: params.challengerScore,
        opponentScore: params.opponentScore,
        winnerId: params.winnerId,
        resultType: params.resultType,
        ratingBeforeChallenger: params.ratingBeforeChallenger,
        ratingAfterChallenger: params.ratingAfterChallenger,
        ratingBeforeOpponent: params.ratingBeforeOpponent,
        ratingAfterOpponent: params.ratingAfterOpponent,
        integrityBeforeChallenger: params.integrityBeforeChallenger,
        integrityAfterChallenger: params.integrityAfterChallenger,
        integrityBeforeOpponent: params.integrityBeforeOpponent,
        integrityAfterOpponent: params.integrityAfterOpponent,
      },
    });

    return record as MatchHistoryRecord;
  }

  /**
   * Dynamically aggregates wins, losses, draws, and win streaks from the event stream
   */
  async getPlayerStats(userId: string): Promise<PlayerStats> {
    try {
      const history = await prisma.matchHistory.findMany({
        where: {
          OR: [
            { challengerId: userId },
            { opponentId: userId },
          ],
        },
        orderBy: { completedAt: "desc" },
      });

      let wins = 0;
      let losses = 0;
      let draws = 0;
      let winStreak = 0;
      let countingStreak = true;

      for (const match of history) {
        const isChallenger = match.challengerId === userId;
        const isWinner = match.winnerId === userId;
        const isDraw = match.challengerScore === 0.5 && match.opponentScore === 0.5;

        if (isDraw) {
          draws += 1;
          if (countingStreak) {
            countingStreak = false; // streak broken by draw
          }
        } else if (isWinner) {
          wins += 1;
          if (countingStreak) {
            winStreak += 1;
          }
        } else {
          losses += 1;
          if (countingStreak) {
            countingStreak = false; // streak broken by loss
          }
        }
      }

      return {
        userId,
        wins,
        losses,
        draws,
        winStreak,
        totalMatches: history.length,
        history: history as MatchHistoryRecord[],
      };
    } catch (error) {
      console.error(`Failed to calculate player stats for ${userId}:`, error);
      return {
        userId,
        wins: 0,
        losses: 0,
        draws: 0,
        winStreak: 0,
        totalMatches: 0,
        history: [],
      };
    }
  }

  /**
   * Compiles mutual matchups between two competitors
   */
  async getHeadToHead(userIdA: string, userIdB: string): Promise<MatchHistoryRecord[]> {
    const matchups = await prisma.matchHistory.findMany({
      where: {
        OR: [
          { AND: [{ challengerId: userIdA }, { opponentId: userIdB }] },
          { AND: [{ challengerId: userIdB }, { opponentId: userIdA }] },
        ],
      },
      orderBy: { completedAt: "desc" },
    });
    return matchups as MatchHistoryRecord[];
  }
}

export const matchHistoryEngine = new MatchHistoryEngine();
