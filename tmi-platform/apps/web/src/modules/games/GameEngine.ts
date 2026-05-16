export interface Game {
  id: string;
  name: string;
  type: 'dirty-dozens' | 'name-that-tune' | 'deal-or-feud' | 'squares';
  status: 'waiting' | 'active' | 'completed';
  players: string[];
  rounds: GameRound[];
  winnerId?: string;
  prizeAmount?: number;
}

export interface GameRound {
  roundNumber: number;
  question?: string;
  answers: Record<string, string>;
  correctAnswer?: string;
  scores: Record<string, number>;
}

export class GameEngine {
  async createGame(name: string, type: Game['type']): Promise<Game> {
    const game: Game = {
      id: `game_${Date.now()}`,
      name,
      type,
      status: 'waiting',
      players: [],
      rounds: []
    };
    return game;
  }

  async joinGame(gameId: string, userId: string): Promise<boolean> {
    return true;
  }

  async submitAnswer(gameId: string, userId: string, answer: string): Promise<boolean> {
    return true;
  }

  async endGame(gameId: string): Promise<Game> {
    const game: Game = {
      id: gameId,
      name: '',
      type: 'dirty-dozens',
      status: 'completed',
      players: [],
      rounds: []
    };
    return game;
  }
}
