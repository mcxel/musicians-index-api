/**
 * WinnerCeremonyEngine
 * Orchestrates the winner reveal sequence: announcement lines, confetti flags, prize assignment.
 */
import type { ShowResult } from "./ShowRuntimeEngine";

export type CeremonyPhase =
  | "drumroll"
  | "reveal"
  | "celebration"
  | "prize_display"
  | "crowd_reaction"
  | "hall_of_fame"
  | "closing";

export type CeremonyEvent = {
  phase: CeremonyPhase;
  durationMs: number;
  announcementLine: string;
  confettiActive: boolean;
  spotlightOnWinner: boolean;
};

export type CeremonyScript = {
  showId: string;
  winnerId: string;
  winnerName: string;
  prizeIds: string[];
  events: CeremonyEvent[];
  totalDurationMs: number;
};

const REVEAL_LINES = [
  "And the winner is...",
  "Tonight's champion...",
  "The crowd has spoken — the winner is...",
  "After an incredible performance, we crown...",
  "It's official — tonight's idol is...",
];

const CELEBRATION_LINES = [
  "Congratulations! You've earned it!",
  "The crowd is on their feet — incredible!",
  "That was a historic performance!",
  "Champion level. The TMI crown is yours!",
];

const PRIZE_LINES = [
  "You've won the ultimate prize package!",
  "Your prizes are waiting — claim them now!",
  "Legendary win. Prizes unlocked!",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export class WinnerCeremonyEngine {
  buildCeremonyScript(result: ShowResult): CeremonyScript {
    const events: CeremonyEvent[] = [
      {
        phase: "drumroll",
        durationMs: 3000,
        announcementLine: "The moment you've all been waiting for...",
        confettiActive: false,
        spotlightOnWinner: false,
      },
      {
        phase: "reveal",
        durationMs: 2500,
        announcementLine: `${pick(REVEAL_LINES)} ${result.winnerName}!`,
        confettiActive: false,
        spotlightOnWinner: true,
      },
      {
        phase: "celebration",
        durationMs: 5000,
        announcementLine: pick(CELEBRATION_LINES),
        confettiActive: true,
        spotlightOnWinner: true,
      },
      {
        phase: "prize_display",
        durationMs: 4000,
        announcementLine: pick(PRIZE_LINES),
        confettiActive: true,
        spotlightOnWinner: true,
      },
      {
        phase: "crowd_reaction",
        durationMs: 3000,
        announcementLine: "The crowd is going wild!",
        confettiActive: true,
        spotlightOnWinner: false,
      },
      {
        phase: "hall_of_fame",
        durationMs: 3500,
        announcementLine: `${result.winnerName} is now permanently in the TMI Hall of Fame!`,
        confettiActive: false,
        spotlightOnWinner: true,
      },
      {
        phase: "closing",
        durationMs: 2000,
        announcementLine: "Thanks for watching. See you next time!",
        confettiActive: false,
        spotlightOnWinner: false,
      },
    ];

    const totalDurationMs = events.reduce((sum, e) => sum + e.durationMs, 0);

    return {
      showId: result.showId,
      winnerId: result.winnerId,
      winnerName: result.winnerName,
      prizeIds: result.prizeIds,
      events,
      totalDurationMs,
    };
  }

  getCueTimeline(script: CeremonyScript): Array<{ phase: CeremonyPhase; startMs: number; endMs: number }> {
    let cursor = 0;
    return script.events.map((event) => {
      const start = cursor;
      cursor += event.durationMs;
      return { phase: event.phase, startMs: start, endMs: cursor };
    });
  }

  getCurrentPhase(script: CeremonyScript, elapsedMs: number): CeremonyEvent | null {
    let cursor = 0;
    for (const event of script.events) {
      if (elapsedMs >= cursor && elapsedMs < cursor + event.durationMs) {
        return event;
      }
      cursor += event.durationMs;
    }
    return null;
  }
}

export const winnerCeremonyEngine = new WinnerCeremonyEngine();
