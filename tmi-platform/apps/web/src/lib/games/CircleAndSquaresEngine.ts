export type CellOwner = "X" | "O" | null;
export type GamePhase = "lobby" | "question" | "answer" | "result" | "ended";
export type AnswerMode = "true-false" | "multiple-choice";

export interface Question {
  id: string;
  text: string;
  mode: AnswerMode;
  options: string[];
  correctIndex: number;
  cellIndex: number; // 0–8 which square is at stake
}

export interface Player {
  id: string;
  name: string;
  mark: "X" | "O";
  wins: number;
}

export interface GameState {
  board: CellOwner[];         // 9 cells
  phase: GamePhase;
  currentQuestion: Question | null;
  currentPlayer: "X" | "O";
  playerX: Player | null;
  playerO: Player | null;
  crowdAssistUsed: boolean;
  winner: "X" | "O" | "draw" | null;
  winLine: number[] | null;
}

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkWinner(board: CellOwner[]): { winner: "X" | "O" | null; line: number[] | null } {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return { winner: board[a] as "X" | "O", line };
    }
  }
  return { winner: null, line: null };
}

export class CircleAndSquaresEngine {
  private static _instance: CircleAndSquaresEngine | null = null;
  private _state: GameState;
  private _listeners: Set<(state: GameState) => void> = new Set();

  private constructor() {
    this._state = this._fresh();
  }

  static getInstance(): CircleAndSquaresEngine {
    if (!CircleAndSquaresEngine._instance) {
      CircleAndSquaresEngine._instance = new CircleAndSquaresEngine();
    }
    return CircleAndSquaresEngine._instance;
  }

  private _fresh(): GameState {
    return {
      board: Array(9).fill(null),
      phase: "lobby",
      currentQuestion: null,
      currentPlayer: "X",
      playerX: null,
      playerO: null,
      crowdAssistUsed: false,
      winner: null,
      winLine: null,
    };
  }

  registerPlayers(x: { id: string; name: string }, o: { id: string; name: string }): void {
    this._state.playerX = { ...x, mark: "X", wins: 0 };
    this._state.playerO = { ...o, mark: "O", wins: 0 };
    this._state.phase = "question";
    this._emit();
  }

  askQuestion(q: Question): void {
    if (this._state.phase !== "question" && this._state.phase !== "answer") return;
    this._state.currentQuestion = q;
    this._state.phase = "answer";
    this._emit();
  }

  submitAnswer(mark: "X" | "O", answerIndex: number): "correct" | "wrong" {
    const q = this._state.currentQuestion;
    if (!q || this._state.phase !== "answer") return "wrong";
    const correct = answerIndex === q.correctIndex;

    if (correct) {
      this._state.board[q.cellIndex] = mark;
      const { winner, line } = checkWinner(this._state.board);
      if (winner) {
        this._state.winner = winner;
        this._state.winLine = line;
        this._state.phase = "ended";
        const player = winner === "X" ? this._state.playerX : this._state.playerO;
        if (player) player.wins++;
      } else if (this._state.board.every((c) => c !== null)) {
        this._state.winner = "draw";
        this._state.phase = "ended";
      } else {
        this._state.phase = "question";
        this._state.currentPlayer = mark === "X" ? "O" : "X";
      }
    } else {
      this._state.phase = "question";
      this._state.currentPlayer = mark === "X" ? "O" : "X";
    }

    this._state.currentQuestion = null;
    this._emit();
    return correct ? "correct" : "wrong";
  }

  useCrowdAssist(): number | null {
    if (this._state.crowdAssistUsed || !this._state.currentQuestion) return null;
    this._state.crowdAssistUsed = true;
    this._emit();
    return this._state.currentQuestion.correctIndex;
  }

  resetGame(): void {
    const px = this._state.playerX;
    const po = this._state.playerO;
    this._state = this._fresh();
    if (px) { this._state.playerX = { ...px }; }
    if (po) { this._state.playerO = { ...po }; }
    if (px && po) this._state.phase = "question";
    this._emit();
  }

  getState(): GameState { return this._state; }

  onChange(cb: (s: GameState) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private _emit(): void {
    for (const cb of this._listeners) cb({ ...this._state, board: [...this._state.board] });
  }
}

export const circleAndSquaresEngine = CircleAndSquaresEngine.getInstance();
