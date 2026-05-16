/**
 * Host Sarcasm Engine
 * Generates sarcastic, funny, and serious host feedback lines
 * for judge reactions, eliminations, and casual banter.
 */
import type { JudgeThreshold } from './HostJudgeMeterEngine';

const FEEDBACK_LINES: Record<JudgeThreshold, string[]> = {
  bad: [
    "That's a no from me. Actually — that's a no from everyone.",
    "I've seen better performances at a school talent show. In 1987.",
    "I want those two minutes of my life back.",
    "The courage is appreciated. The execution is not.",
    "We'll remember you for bravery. Not skill.",
  ],
  okay: [
    "You're not bad. You're just... not memorable.",
    "Technically present. Emotionally? We're still waiting.",
    "There's something there. It just hasn't arrived yet.",
    "You survived. The crowd is politely not booing.",
    "Exists. Which is a start.",
  ],
  hot: [
    "Now THAT'S something.",
    "I felt that one. The crowd felt that one.",
    "Don't let it go to your head — but go off.",
    "That's the level this stage demands. Keep it there.",
    "Okay. You showed up tonight.",
  ],
  elite: [
    "THAT is what this stage was built for.",
    "This platform doesn't miss — and neither did you.",
    "Frame that. Seal it. That's a moment.",
    "Every person in this room just got what they paid for.",
    "The meter is full. The crowd is yours.",
  ],
};

const ELIMINATION_LINES: string[] = [
  "The meter has spoken. Time's up.",
  "I don't make the rules. Actually — I do. You're done.",
  "The cutoff isn't personal. Your performance was.",
  "This is Monthly Idol. The bar doesn't lower itself.",
  "We thank you for your time. The stage thanks you less.",
  "The door's right there. The mic stays here.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export class HostSarcasmEngine {
  static generateFeedback(threshold: JudgeThreshold): string {
    return pick(FEEDBACK_LINES[threshold]);
  }

  static generateEliminationLine(): string {
    return pick(ELIMINATION_LINES);
  }
}
