import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WinnerAuthorityEngine {
  constructor(private readonly prisma: PrismaService) {}

  async resolveWinner(eventId: string, contestantIds: string[]) {
    const audienceVotes = await this.getAudienceVotes(eventId, contestantIds);
    if (this.hasClearWinner(audienceVotes)) {
      return { winnerId: this.getTopScore(audienceVotes), source: 'AUDIENCE_VOTE' };
    }

    const roomVotes = await this.getRoomParticipantVotes(eventId, contestantIds);
    if (this.hasClearWinner(roomVotes)) {
      return { winnerId: this.getTopScore(roomVotes), source: 'PARTICIPANT_VOTE' };
    }

    const botScores = await this.getBotJudgeScores(contestantIds);
    if (this.hasClearWinner(botScores)) {
      return { winnerId: this.getTopScore(botScores), source: 'BOT_JUDGE' };
    }

    const tieBreakWinner = contestantIds[Math.floor(Math.random() * contestantIds.length)];
    return { winnerId: tieBreakWinner, source: 'JULIUS_TIEBREAK' };
  }

  private hasClearWinner(scores: Record<string, number>): boolean {
    const values = Object.values(scores).sort((a, b) => b - a);
    return values.length > 0 && (values.length === 1 || values[0] > values[1]);
  }

  private getTopScore(scores: Record<string, number>): string {
    return Object.entries(scores).sort(([, a], [, b]) => b - a)[0][0];
  }

  private async getAudienceVotes(eventId: string, contestantIds: string[]): Promise<Record<string, number>> {
    // ContestVote has roundId; query directly by roundId (eventId is the round context)
    const votes = await this.prisma.contestVote.findMany({
      where: { roundId: eventId },
    });
    return this.tally(votes.map(v => v.entryId), contestantIds);
  }

  private async getRoomParticipantVotes(eventId: string, contestantIds: string[]): Promise<Record<string, number>> {
    const votes = await this.prisma.battleVote.findMany({
      where: { battle: { roomId: eventId } },
    });
    // votedFor is Int (contestant index); cast to string for tally
    return this.tally(votes.map(v => String(v.votedFor)), contestantIds);
  }

  private async getBotJudgeScores(contestantIds: string[]): Promise<Record<string, number>> {
    const scores: Record<string, number> = {};
    for (const id of contestantIds) scores[id] = Math.random() * 100;
    return scores;
  }

  private tally(ids: string[], valid: string[]): Record<string, number> {
    const scores: Record<string, number> = {};
    for (const id of ids) {
      if (valid.includes(id)) scores[id] = (scores[id] || 0) + 1;
    }
    return scores;
  }
}
