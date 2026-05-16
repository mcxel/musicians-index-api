/**
 * Karen Stage Engine — Monday Night Stage host.
 * Professional broadcast voice, manages World Release debuts and weekly tone-setting.
 */

export type KarenPhase =
  | 'standby'
  | 'intro'
  | 'debut-announce'
  | 'sponsor-shoutout'
  | 'crowd-read'
  | 'outro';

export type KarenMood = 'neutral' | 'excited' | 'authoritative' | 'warm';

export interface KarenHostState {
  phase: KarenPhase;
  mood: KarenMood;
  currentScript: string;
  sponsorQueue: string[];
  lastActionAt: number;
}

const MONDAY_INTRO_SCRIPTS = [
  "Welcome to Monday Night Stage — where the week's first moves get made.",
  "It's Monday Night. The stage is hot. Let's get it started.",
  "Good evening. The artists are ready. The fans are here. Let's make it count.",
];

const DEBUT_ANNOUNCE_SCRIPTS = [
  "Tonight's World Release — brought to you live, for the first time, by {artist}.",
  "The debut drop. {artist} is on deck. Crowd, make some noise.",
  "First listen, right here, right now. {artist} — this is your moment.",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export class KarenStageEngine {
  private state: KarenHostState;

  constructor(sponsors: string[] = []) {
    this.state = {
      phase: 'standby',
      mood: 'neutral',
      currentScript: '',
      sponsorQueue: [...sponsors],
      lastActionAt: Date.now(),
    };
  }

  getState(): Readonly<KarenHostState> {
    return this.state;
  }

  openShow(): string {
    const script = pickRandom(MONDAY_INTRO_SCRIPTS);
    this.state = {
      ...this.state,
      phase: 'intro',
      mood: 'authoritative',
      currentScript: script,
      lastActionAt: Date.now(),
    };
    return script;
  }

  announceDebut(artistName: string): string {
    const template = pickRandom(DEBUT_ANNOUNCE_SCRIPTS);
    const script = template.replace('{artist}', artistName);
    this.state = {
      ...this.state,
      phase: 'debut-announce',
      mood: 'excited',
      currentScript: script,
      lastActionAt: Date.now(),
    };
    return script;
  }

  callSponsor(): string | null {
    if (this.state.sponsorQueue.length === 0) return null;
    const [sponsor, ...rest] = this.state.sponsorQueue;
    const script = `Tonight's Monday Night Stage is brought to you by ${sponsor}. Show them some love.`;
    this.state = {
      ...this.state,
      phase: 'sponsor-shoutout',
      mood: 'warm',
      currentScript: script,
      sponsorQueue: rest,
      lastActionAt: Date.now(),
    };
    return script;
  }

  readCrowd(heatScore: number): string {
    let script: string;
    let mood: KarenMood;
    if (heatScore >= 80) {
      script = "The crowd is locked in. Keep that energy right there.";
      mood = 'excited';
    } else if (heatScore >= 50) {
      script = "We're building. Artists — give them a reason to stay.";
      mood = 'authoritative';
    } else {
      script = "Let's wake this place up. Monday Night Stage doesn't do quiet.";
      mood = 'authoritative';
    }
    this.state = { ...this.state, phase: 'crowd-read', mood, currentScript: script, lastActionAt: Date.now() };
    return script;
  }

  closeShow(): string {
    const script = "That's Monday Night Stage. Same time next week. Stay sharp.";
    this.state = { ...this.state, phase: 'outro', mood: 'warm', currentScript: script, lastActionAt: Date.now() };
    return script;
  }

  reset() {
    this.state = { ...this.state, phase: 'standby', mood: 'neutral', currentScript: '', lastActionAt: Date.now() };
  }
}
