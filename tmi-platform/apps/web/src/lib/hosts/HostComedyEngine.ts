/**
 * Host Comedy Engine
 * Comedy mode lines for Bebo, Bobby Stanley, and Kira.
 * Categories: funny | sarcastic | survival
 * Emotional states: smirk | laugh | shock | serious | celebrate | disappointed
 */
import type { HostEmotionalState } from './HostEmotionReactionEngine';

export type ComedyCategory = 'funny' | 'sarcastic' | 'survival';

export interface ComedyLine {
  hostId: string;
  category: ComedyCategory;
  line: string;
  emotionalState: HostEmotionalState;
}

const COMEDY_LINES: Record<string, Record<ComedyCategory, { line: string; emotionalState: HostEmotionalState }[]>> = {
  bebo: {
    funny: [
      { line: "HOOK 'EM! The cane don't miss!", emotionalState: 'laugh' },
      { line: "I tripped coming out here — nobody saw that. Nobody.", emotionalState: 'laugh' },
      { line: "This cane has more talent than half the acts tonight.", emotionalState: 'smirk' },
      { line: "I've been doing this since before your parents met. I'm tired. But here we are.", emotionalState: 'laugh' },
      { line: "The crowd is louder than my doctor told me to allow. I love it.", emotionalState: 'celebrate' },
    ],
    sarcastic: [
      { line: "Outstanding. Truly. That was something.", emotionalState: 'smirk' },
      { line: "Five rounds of applause. Wait — one. One and a half.", emotionalState: 'smirk' },
      { line: "I've seen better exits from a grocery store.", emotionalState: 'smirk' },
      { line: "The bar was here. You were... somewhere else.", emotionalState: 'disappointed' },
      { line: "If confidence counted as skill, you'd be dangerous.", emotionalState: 'smirk' },
    ],
    survival: [
      { line: "Still standing. That's the job. Do NOT ask me how.", emotionalState: 'serious' },
      { line: "The cane is structural support at this point.", emotionalState: 'serious' },
      { line: "I survived three format changes and a network reboot. You can survive one bad score.", emotionalState: 'serious' },
      { line: "Pain is temporary. The show is eternal. Unfortunately.", emotionalState: 'serious' },
    ],
  },
  'bobby-stanley': {
    funny: [
      { line: "Bobby Stanley is in the building — and the building is NOT ready!", emotionalState: 'laugh' },
      { line: "I got dressed for this. Twice. First outfit wasn't it.", emotionalState: 'laugh' },
      { line: "Monday night? More like GET RIGHT night.", emotionalState: 'celebrate' },
      { line: "My hype man called in sick. So I am my own hype man. BOBBY!", emotionalState: 'laugh' },
      { line: "The crowd is doing better than the performers and I'm LIVING for it.", emotionalState: 'laugh' },
    ],
    sarcastic: [
      { line: "That's showbiz, baby. Specifically — the part nobody likes.", emotionalState: 'smirk' },
      { line: "We've all performed better. In our heads. At 2am.", emotionalState: 'smirk' },
      { line: "The audience is still here. That's... something.", emotionalState: 'smirk' },
      { line: "The stage don't lie — and tonight it's telling the truth loudly.", emotionalState: 'disappointed' },
      { line: "Room temperature performance. Not hot, not cold. Just... there.", emotionalState: 'smirk' },
    ],
    survival: [
      { line: "Every show, somebody tries to break me. Nobody has. Tonight won't be different.", emotionalState: 'serious' },
      { line: "The mic stays on whether you're ready or not. That's the contract.", emotionalState: 'serious' },
      { line: "Thirty years in this business. The crowd respects the work. So do the work.", emotionalState: 'serious' },
      { line: "We move. We always move. That's Monday Night.", emotionalState: 'serious' },
    ],
  },
  kira: {
    funny: [
      { line: "KIRA ON THE FLOOR! The crowd always looks better from down here.", emotionalState: 'laugh' },
      { line: "I asked someone in row seven how they feel. They said 'chaotic.' Relatable.", emotionalState: 'laugh' },
      { line: "My earpiece is playing the wrong show right now. I'm improvising. Can you tell?", emotionalState: 'laugh' },
      { line: "The energy in this room right now? That's a controlled substance in twelve states.", emotionalState: 'celebrate' },
      { line: "I found someone in the crowd who's been here since 4pm. Security is checking on them. They're fine.", emotionalState: 'laugh' },
    ],
    sarcastic: [
      { line: "I checked the crowd. They have opinions. Strong ones. About everything.", emotionalState: 'smirk' },
      { line: "Interesting choice. The audience has also made an interesting choice — to remain seated.", emotionalState: 'smirk' },
      { line: "I interviewed three fans. They all said 'it was okay.' The bar!", emotionalState: 'smirk' },
      { line: "The floor mic doesn't lie. And right now it's saying 'is that it?'", emotionalState: 'disappointed' },
    ],
    survival: [
      { line: "Every face in this room matters to me. Even the skeptical ones.", emotionalState: 'serious' },
      { line: "I'm going to keep moving through this crowd until somebody feels something.", emotionalState: 'serious' },
      { line: "The show doesn't stop until the show stops. Keep going.", emotionalState: 'serious' },
      { line: "It's hard out here. The crowd knows it. Keep giving them something real.", emotionalState: 'serious' },
    ],
  },
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export class HostComedyEngine {
  static getLine(hostId: string, category: ComedyCategory): ComedyLine | null {
    const hostLines = COMEDY_LINES[hostId];
    if (!hostLines) return null;
    const options = hostLines[category];
    if (!options || options.length === 0) return null;
    const picked = pick(options);
    return { hostId, category, ...picked };
  }

  static getRandomLine(hostId: string): ComedyLine | null {
    const categories: ComedyCategory[] = ['funny', 'sarcastic', 'survival'];
    return HostComedyEngine.getLine(hostId, pick(categories));
  }

  /** Returns all comedy host IDs that have lines registered. */
  static supportedHosts(): string[] {
    return Object.keys(COMEDY_LINES);
  }
}
