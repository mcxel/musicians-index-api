import { grantXP } from "@/lib/xp/xpEngine";

export type QuestionType = "multiple-choice" | "genre-guess" | "top-song-vote";

export interface GameQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  choices: string[];
  correctIdx: number; // -1 = vote type, all answers correct
  xpReward: number;
  dropEntry: boolean;
}

export interface GameResult {
  correct: boolean;
  xpAwarded: number;
}

const QUESTION_BANK: Omit<GameQuestion, "id">[] = [
  {
    type: "multiple-choice",
    prompt: "Who was #1 on the last leaderboard?",
    choices: ["JayRoc", "LilWave", "KDot"],
    correctIdx: 0,
    xpReward: 20,
    dropEntry: true,
  },
  {
    type: "genre-guess",
    prompt: "Guess the next genre dropping in the queue:",
    choices: ["Hip-Hop", "Afrobeat"],
    correctIdx: 0,
    xpReward: 15,
    dropEntry: false,
  },
  {
    type: "top-song-vote",
    prompt: "Who's got the hardest hook so far tonight?",
    choices: ["Big Ace", "Astra Nova", "Lagos Burst"],
    correctIdx: -1, // vote — all answers earn XP
    xpReward: 10,
    dropEntry: true,
  },
  {
    type: "multiple-choice",
    prompt: "How many songs have played in this session?",
    choices: ["1–3", "4–7", "8+"],
    correctIdx: 1,
    xpReward: 15,
    dropEntry: false,
  },
  {
    type: "genre-guess",
    prompt: "What genre is coming up next?",
    choices: ["R&B", "EDM", "Gospel"],
    correctIdx: 1,
    xpReward: 15,
    dropEntry: false,
  },
  {
    type: "multiple-choice",
    prompt: "What reaction gets a song the most visibility?",
    choices: ["🔥 Hard", "🎧 Replay", "💡 Original"],
    correctIdx: 1, // Replay (listenSeconds) is highest weight
    xpReward: 20,
    dropEntry: true,
  },
  {
    type: "top-song-vote",
    prompt: "Best vibe in the room right now goes to…",
    choices: ["The DJ", "The crowd", "The songs"],
    correctIdx: -1,
    xpReward: 10,
    dropEntry: false,
  },
  {
    type: "multiple-choice",
    prompt: "Which of these earns the MOST XP in Stream & Win?",
    choices: ["Listening 30%+", "Voting", "Reacting"],
    correctIdx: 1, // voting = 20 XP (highest)
    xpReward: 25,
    dropEntry: true,
  },
  {
    type: "genre-guess",
    prompt: "Next artist is dropping — what's their style?",
    choices: ["Trap", "Dancehall", "Neo-soul"],
    correctIdx: 0,
    xpReward: 15,
    dropEntry: false,
  },
  {
    type: "top-song-vote",
    prompt: "What should the DJ play more of tonight?",
    choices: ["Hip-Hop bangers", "Chill R&B", "Afrobeats"],
    correctIdx: -1,
    xpReward: 10,
    dropEntry: false,
  },
];

let activeGame: GameQuestion | null = null;
let idCounter = 0;

export const GameEngine = {
  startGame(): GameQuestion {
    const template = QUESTION_BANK[Math.floor(Math.random() * QUESTION_BANK.length)]!;
    activeGame = { ...template, id: `game-${Date.now()}-${++idCounter}` };
    return activeGame;
  },

  getActiveGame(): GameQuestion | null {
    return activeGame;
  },

  submitAnswer(userId: string, choiceIdx: number): GameResult {
    if (!activeGame) return { correct: false, xpAwarded: 0 };

    const isVote = activeGame.correctIdx === -1;
    const correct = isVote || choiceIdx === activeGame.correctIdx;
    const xpAwarded = correct ? activeGame.xpReward : 0;

    if (correct) {
      grantXP({ source: "vote_cast", amount: xpAwarded, userId });
    }

    return { correct, xpAwarded };
  },

  endGame(): void {
    activeGame = null;
  },
};
