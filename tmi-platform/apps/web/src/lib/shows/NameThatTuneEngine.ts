/**
 * Name That Tune Engine
 * Music trivia challenge with difficulty tiers, hints, and leaderboard tracking.
 */
import { ShowRuntimeEngine } from './ShowRuntimeEngine';

export interface TuneChallenge {
  id: string;
  title: string;
  artist: string;
  genre: string;
  difficulty: 'easy' | 'medium' | 'hard';
  pointValue: number;
  hintUnlocked: boolean;
  correctAnswer: string;
}

export class NameThatTuneEngine extends ShowRuntimeEngine {
  private challenges: TuneChallenge[];
  private currentIndex: number;

  constructor() {
    super('name-that-tune', 3);
    this.challenges = [];
    this.currentIndex = 0;
  }

  loadChallenges(challenges: TuneChallenge[]): void {
    this.challenges = challenges.map((c) => ({ ...c, hintUnlocked: false }));
    this.currentIndex = 0;
  }

  unlockHint(): void {
    const challenge = this.challenges[this.currentIndex];
    if (!challenge) return;
    challenge.hintUnlocked = true;
    // Penalty: halve the point value when hint is unlocked
    challenge.pointValue = Math.max(1, Math.floor(challenge.pointValue / 2));
  }

  submitAnswer(contestantId: string, answer: string): boolean {
    const challenge = this.challenges[this.currentIndex];
    if (!challenge) return false;

    const contestant = this.state.contestants.find((c) => c.id === contestantId);
    if (!contestant) return false;

    const isCorrect =
      answer.trim().toLowerCase() === challenge.correctAnswer.trim().toLowerCase();

    if (isCorrect) {
      contestant.score += challenge.pointValue;
    }

    return isCorrect;
  }

  advanceChallenge(): void {
    if (this.currentIndex < this.challenges.length - 1) {
      this.currentIndex += 1;
    } else {
      // All challenges done — move to finals phase
      this.state.phase = 'FINALS';
    }
  }

  getCurrentChallenge(): TuneChallenge | null {
    return this.challenges[this.currentIndex] ?? null;
  }

  getLeaderboard(): Array<{ contestantId: string; score: number }> {
    return this.state.contestants
      .slice()
      .sort((a, b) => b.score - a.score)
      .map((c) => ({ contestantId: c.id, score: c.score }));
  }
}
