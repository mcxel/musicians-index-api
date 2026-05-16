/**
 * LiveEliminationEngine
 * Drives the live elimination broadcast + next-contestant queue.
 */

export type EliminationReason =
  | "low_score"
  | "timeout_forfeit"
  | "judge_veto"
  | "crowd_vote_out"
  | "manual_removal"
  | "rule_violation";

export type EliminationRecord = {
  contestantId: string;
  contestantName: string;
  reason: EliminationReason;
  finalScore: number;
  eliminatedAtMs: number;
  eliminatedInRound: number;
  broadcastLine: string;
};

export type EliminationQueueEntry = {
  contestantId: string;
  contestantName: string;
  score: number;
  joinedAtMs: number;
};

const BROADCAST_LINES: Record<EliminationReason, string[]> = {
  low_score: [
    "The numbers don't lie — you're out.",
    "We appreciate the effort, but the score says it all.",
    "Not your night — eliminated.",
    "The crowd has spoken. Step down.",
  ],
  timeout_forfeit: [
    "Time's up and you weren't here — forfeit.",
    "The clock ran out. Moving on.",
    "No-show — automatic forfeit.",
  ],
  judge_veto: [
    "The judges have seen enough. You're done.",
    "Judge's final call — eliminated.",
    "Unanimous decision from the judges. Out.",
  ],
  crowd_vote_out: [
    "The crowd voted — they want you gone.",
    "Audience decision — you're eliminated.",
    "The people have spoken. Time to go.",
  ],
  manual_removal: [
    "Eliminated by host decision.",
    "Host intervention — stepping down.",
  ],
  rule_violation: [
    "Rule violation — immediate elimination.",
    "You broke the rules. You're out.",
    "Code of conduct breach — eliminated.",
  ],
};

function pickLine(reason: EliminationReason): string {
  const lines = BROADCAST_LINES[reason];
  return lines[Math.floor(Math.random() * lines.length)];
}

export class LiveEliminationEngine {
  private readonly eliminated: EliminationRecord[] = [];
  private readonly queue: EliminationQueueEntry[] = [];
  private currentRound: number = 1;

  setRound(round: number): void {
    this.currentRound = round;
  }

  enqueue(entry: EliminationQueueEntry): void {
    if (!this.queue.find((q) => q.contestantId === entry.contestantId)) {
      this.queue.push(entry);
    }
  }

  dequeue(): EliminationQueueEntry | null {
    return this.queue.shift() ?? null;
  }

  peekNext(): EliminationQueueEntry | null {
    return this.queue[0] ?? null;
  }

  eliminate(
    contestantId: string,
    contestantName: string,
    finalScore: number,
    reason: EliminationReason,
  ): EliminationRecord {
    const record: EliminationRecord = {
      contestantId,
      contestantName,
      reason,
      finalScore,
      eliminatedAtMs: Date.now(),
      eliminatedInRound: this.currentRound,
      broadcastLine: pickLine(reason),
    };

    this.eliminated.push(record);
    // Remove from active queue if present
    const idx = this.queue.findIndex((q) => q.contestantId === contestantId);
    if (idx !== -1) this.queue.splice(idx, 1);

    return record;
  }

  isEliminated(contestantId: string): boolean {
    return this.eliminated.some((r) => r.contestantId === contestantId);
  }

  getEliminatedInRound(round: number): EliminationRecord[] {
    return this.eliminated.filter((r) => r.eliminatedInRound === round);
  }

  getAllEliminated(): EliminationRecord[] {
    return [...this.eliminated];
  }

  getQueue(): EliminationQueueEntry[] {
    return [...this.queue];
  }

  reset(): void {
    this.eliminated.length = 0;
    this.queue.length = 0;
    this.currentRound = 1;
  }
}

export const liveEliminationEngine = new LiveEliminationEngine();
