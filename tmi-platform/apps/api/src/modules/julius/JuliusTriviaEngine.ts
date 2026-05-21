import { Logger } from '@nestjs/common';

export interface TriviaSession {
  sessionId: string;
  roomId: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  startTime: number;
  timeLimitMs: number;
  basePayout: number;
  active: boolean;
}

export interface TriviaSubmission {
  userId: string;
  answerIndex: number;
  submissionTime: number;
}

export class JuliusTriviaEngine {
  private readonly logger = new Logger(JuliusTriviaEngine.name);
  private activeSessions: Map<string, TriviaSession> = new Map();
  private submissions: Map<string, TriviaSubmission[]> = new Map();

  public startTrivia(
    roomId: string,
    question: string,
    options: string[],
    correctAnswerIndex: number,
    timeLimitMs: number = 15000,
    basePayout: number = 50
  ): TriviaSession {
    const sessionId = `TRIVIA_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    
    const session: TriviaSession = {
      sessionId,
      roomId,
      question,
      options,
      correctAnswerIndex,
      startTime: Date.now(),
      timeLimitMs,
      basePayout,
      active: true,
    };

    this.activeSessions.set(sessionId, session);
    this.submissions.set(sessionId, []);
    
    this.logger.log(`[JuliusTrivia] Started trivia ${sessionId} in room ${roomId}`);
    
    // Auto-resolve after timeLimitMs
    setTimeout(() => this.endTrivia(sessionId), timeLimitMs + 500);
    
    return session;
  }

  public submitAnswer(sessionId: string, userId: string, answerIndex: number): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session || !session.active) return false;

    const currentSubmissions = this.submissions.get(sessionId) || [];
    // Prevent duplicate submissions
    if (currentSubmissions.some(sub => sub.userId === userId)) return false;

    currentSubmissions.push({ userId, answerIndex, submissionTime: Date.now() });
    this.submissions.set(sessionId, currentSubmissions);
    return true;
  }

  public endTrivia(sessionId: string) {
    const session = this.activeSessions.get(sessionId);
    if (!session || !session.active) return null;

    session.active = false;
    const sessionSubmissions = this.submissions.get(sessionId) || [];
    
    // Calculate payouts and speed bonuses
    const winners = sessionSubmissions
      .filter(sub => sub.answerIndex === session.correctAnswerIndex)
      .map(sub => {
        const timeTaken = sub.submissionTime - session.startTime;
        const speedBonus = timeTaken < (session.timeLimitMs / 3) ? 2.0 : timeTaken < (session.timeLimitMs / 1.5) ? 1.5 : 1.0;
        const totalPayout = Math.floor(session.basePayout * speedBonus);
        return { userId: sub.userId, timeTaken, speedBonus, payout: totalPayout };
      })
      .sort((a, b) => a.timeTaken - b.timeTaken || a.userId.localeCompare(b.userId));

    this.logger.log(`[JuliusTrivia] Ended trivia ${sessionId}. Winners: ${winners.length}`);
    return { session, winners };
  }
}