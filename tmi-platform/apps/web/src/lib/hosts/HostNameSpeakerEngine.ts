/**
 * Host Name Speaker Engine
 * Reads contestant names aloud with contextual host phrasing.
 * Supports hype intro, round callout, elimination, and winner announce modes.
 */
import { HostSpeechTimingEngine } from './HostSpeechTimingEngine';

export type NameReadMode =
  | 'intro'        // bringing a contestant on stage
  | 'round_call'   // calling them for their round
  | 'eliminated'   // announcing elimination
  | 'winner';      // announcing winner

export interface NameReadCue {
  hostId: string;
  contestantName: string;
  mode: NameReadMode;
  line: string;
  durationMs: number;
}

const MODE_TEMPLATES: Record<NameReadMode, (name: string) => string[]> = {
  intro: (name) => [
    `Put your hands together — ${name} is in the building!`,
    `Next up, coming to the stage — ${name}!`,
    `You know the name — give it up for ${name}!`,
    `The moment you've been waiting for — ${name}, take the stage.`,
  ],
  round_call: (name) => [
    `${name} — you're up. Let's go.`,
    `Round time. ${name}, center stage.`,
    `${name}, this is your moment. Own it.`,
    `Eyes on ${name}. Clock starts now.`,
  ],
  eliminated: (name) => [
    `${name}, the platform has made its decision. Thank you for coming.`,
    `That's a tough one — ${name}, your journey ends here tonight.`,
    `${name} — we salute the courage. The stage says goodbye.`,
    `The meter doesn't lie. ${name}, we'll see you next time.`,
  ],
  winner: (name) => [
    `LADIES AND GENTLEMEN — your winner — ${name}!!`,
    `The crowd has spoken. The stage agrees. ${name} WINS!`,
    `${name}! ${name}! ${name}! Say it loud — that's your Monthly Idol!`,
    `No debate. No question. ${name} is your champion tonight!`,
  ],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export class HostNameSpeakerEngine {
  static buildCue(
    hostId: string,
    contestantName: string,
    mode: NameReadMode,
  ): NameReadCue {
    const templates = MODE_TEMPLATES[mode](contestantName);
    const line = pick(templates);
    return {
      hostId,
      contestantName,
      mode,
      line,
      durationMs: HostSpeechTimingEngine.calculateDurationMs(line),
    };
  }

  /**
   * Build a full intro-to-round sequence for a contestant entering the stage.
   */
  static buildEntrySequence(hostId: string, contestantName: string): NameReadCue[] {
    return [
      HostNameSpeakerEngine.buildCue(hostId, contestantName, 'intro'),
      HostNameSpeakerEngine.buildCue(hostId, contestantName, 'round_call'),
    ];
  }
}
