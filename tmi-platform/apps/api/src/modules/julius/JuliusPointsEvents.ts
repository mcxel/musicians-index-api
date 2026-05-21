import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import type { JuliusPointAction } from './actions';

export interface JuliusEventPayload {
  userId: string;
  action: JuliusPointAction;
  contextId?: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

@Injectable()
export class JuliusPointsEvents {
  private readonly logger = new Logger(JuliusPointsEvents.name);
  private readonly storageRoot = path.resolve(process.cwd(), 'data', 'julius', 'points', 'events');

  private getEventsPath(userId: string) {
    return path.join(this.storageRoot, `${userId}.json`);
  }

  private async readEvents(userId: string): Promise<JuliusEventPayload[]> {
    const eventsPath = this.getEventsPath(userId);
    try {
      const raw = await fs.readFile(eventsPath, 'utf8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      this.logger.error(`[PointsEvent] Failed to read events for ${userId}`, error);
      return [];
    }
  }

  public async getEvents(userId: string, limit = 100): Promise<JuliusEventPayload[]> {
    const events = await this.readEvents(userId);
    return events.slice(0, Math.max(1, limit));
  }

  /**
   * Emits a raw action event. To be picked up by the Engine and Ledger.
   */
  public async emitPointEvent(payload: JuliusEventPayload) {
    const eventsPath = this.getEventsPath(payload.userId);
    const existing = await this.readEvents(payload.userId);
    const normalizedPayload: JuliusEventPayload = {
      ...payload,
      timestamp: payload.timestamp ?? new Date().toISOString(),
    };

    await fs.mkdir(path.dirname(eventsPath), { recursive: true });
    await fs.writeFile(eventsPath, JSON.stringify([normalizedPayload, ...existing], null, 2), 'utf8');
    this.logger.debug(`[PointsEvent] Emitted ${payload.action} for ${payload.userId}`);
    return normalizedPayload;
  }

  /**
   * Hooks for external systems (like Copilot's wiring targets)
   */
  public emitBattleComplete(userId: string, matchId: string, isWin: boolean) {
    return this.emitPointEvent({
      userId,
      action: isWin ? 'BATTLE_WIN' : 'BATTLE_LOSS',
      contextId: matchId,
    });
  }

  public emitBattleVote(userId: string, matchId: string) {
    return this.emitPointEvent({ userId, action: 'FAN_VOTE_CAST', contextId: matchId });
  }

  public emitCypherComplete(userId: string, cypherId: string, isWin: boolean) {
    return this.emitPointEvent({
      userId,
      action: isWin ? 'CYPHER_WIN' : 'CYPHER_JOIN',
      contextId: cypherId,
    });
  }

  public emitPollComplete(userId: string, pollId: string) {
    return this.emitPointEvent({ userId, action: 'POLL_PARTICIPATION', contextId: pollId });
  }

  public emitQuizComplete(userId: string, quizId: string, isWin: boolean) {
    return this.emitPointEvent({
      userId,
      action: isWin ? 'QUIZ_WIN' : 'POLL_PARTICIPATION',
      contextId: quizId,
    });
  }

  public emitTicketPurchase(userId: string, ticketId: string) {
    return this.emitPointEvent({ userId, action: 'TICKET_PURCHASE', contextId: ticketId });
  }

  public emitBeatPurchase(userId: string, beatId: string) {
    return this.emitPointEvent({ userId, action: 'BEAT_PURCHASE', contextId: beatId });
  }

  public emitNftPurchase(userId: string, nftId: string) {
    return this.emitPointEvent({ userId, action: 'NFT_PURCHASE', contextId: nftId });
  }

  public emitWatchTimeMilestone(userId: string, roomId: string, minutes: number) {
    return this.emitPointEvent({
      userId,
      action: 'WATCH_TIME_MINUTE',
      contextId: roomId,
      metadata: { minutes },
    });
  }

  public emitAttendanceStreak(userId: string, roomId: string, days: number) {
    return this.emitPointEvent({
      userId,
      action: 'ATTENDANCE_STREAK_DAY',
      contextId: roomId,
      metadata: { days },
    });
  }

  public emitDailyLogin(userId: string) {
    return this.emitPointEvent({ userId, action: 'DAILY_LOGIN' });
  }
}