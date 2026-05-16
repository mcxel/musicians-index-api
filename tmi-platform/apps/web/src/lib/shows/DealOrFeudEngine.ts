/**
 * Deal or Feud 1000 Engine
 * Survey-style feud board with deal threshold system.
 */
import { ShowRuntimeEngine, ShowResult } from './ShowRuntimeEngine';

export type FeudCategory = string;

export interface FeudBoard {
  category: FeudCategory;
  answers: Array<{ text: string; points: number; revealed: boolean }>;
  totalPoints: number;
}

const DEAL_THRESHOLD_POINTS = 200;

export class DealOrFeudEngine extends ShowRuntimeEngine {
  private boards: FeudBoard[];
  private currentBoardIndex: number;

  constructor() {
    super('deal-or-feud', 3);
    this.boards = [];
    this.currentBoardIndex = 0;
  }

  loadBoard(board: FeudBoard): void {
    // Recompute totalPoints from answers in case caller forgot
    const total = board.answers.reduce((sum, a) => sum + a.points, 0);
    this.boards.push({ ...board, totalPoints: total });
  }

  revealAnswer(index: number): number {
    const board = this.boards[this.currentBoardIndex];
    if (!board) return 0;
    const answer = board.answers[index];
    if (!answer || answer.revealed) return 0;
    answer.revealed = true;

    // Award points to the active contestant if one exists
    const active = this.getActiveContestants();
    if (active.length > 0) {
      active[0].score += answer.points;
    }

    return answer.points;
  }

  getActiveBoardPoints(): number {
    const board = this.boards[this.currentBoardIndex];
    if (!board) return 0;
    return board.answers
      .filter((a) => a.revealed)
      .reduce((sum, a) => sum + a.points, 0);
  }

  getDealThreshold(): number {
    return DEAL_THRESHOLD_POINTS;
  }

  triggerDeal(): ShowResult | null {
    const active = this.getActiveContestants();
    if (active.length === 0) return null;

    const topContestant = active.sort((a, b) => b.score - a.score)[0];
    if (topContestant.score < DEAL_THRESHOLD_POINTS) return null;

    return this.setWinner(topContestant.id, ['prize-deal-cash', 'prize-store-credit']);
  }

  getActiveBoard(): FeudBoard | null {
    return this.boards[this.currentBoardIndex] ?? null;
  }
}
