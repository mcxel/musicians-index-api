/**
 * HostVoicePersonalityEngine
 * Voice style profiles for different host personalities: funny, sarcastic, serious, hype, mentor.
 */

export type VoicePersonality =
  | "funny"
  | "sarcastic"
  | "serious"
  | "hype"
  | "mentor"
  | "chaotic"
  | "smooth"
  | "dramatic";

export interface VoiceStyle {
  personality: VoicePersonality;
  pitchShift: number;       // semitones, 0 = no shift
  speedMultiplier: number;  // 1.0 = normal
  energyLevel: number;      // 0–1
  useSlang: boolean;
  pauseFrequency: number;   // 0–1, how often dramatic pauses
  exaggeration: number;     // 0–1
}

export interface SpeechLine {
  text: string;
  personality: VoicePersonality;
  tone: "neutral" | "excited" | "deadpan" | "warm" | "intense";
  suggestedPausesMs: number[];
  emphasisWords: string[];
}

export type SpeechContext =
  | "contestant-enter"
  | "score-reveal"
  | "elimination"
  | "winner-announce"
  | "crowd-hype"
  | "commercial-tease"
  | "show-open"
  | "show-close"
  | "vote-open"
  | "vote-close"
  | "countdown"
  | "tie-breaker";

const VOICE_STYLES: Record<VoicePersonality, VoiceStyle> = {
  funny:     { personality: "funny",     pitchShift: 1,   speedMultiplier: 1.1,  energyLevel: 0.8, useSlang: true,  pauseFrequency: 0.2, exaggeration: 0.8 },
  sarcastic: { personality: "sarcastic", pitchShift: -1,  speedMultiplier: 0.9,  energyLevel: 0.4, useSlang: false, pauseFrequency: 0.6, exaggeration: 0.3 },
  serious:   { personality: "serious",   pitchShift: -2,  speedMultiplier: 0.85, energyLevel: 0.5, useSlang: false, pauseFrequency: 0.4, exaggeration: 0.1 },
  hype:      { personality: "hype",      pitchShift: 2,   speedMultiplier: 1.25, energyLevel: 1.0, useSlang: true,  pauseFrequency: 0.1, exaggeration: 1.0 },
  mentor:    { personality: "mentor",    pitchShift: 0,   speedMultiplier: 0.95, energyLevel: 0.6, useSlang: false, pauseFrequency: 0.3, exaggeration: 0.2 },
  chaotic:   { personality: "chaotic",   pitchShift: 3,   speedMultiplier: 1.3,  energyLevel: 0.95, useSlang: true, pauseFrequency: 0.05,exaggeration: 1.0 },
  smooth:    { personality: "smooth",    pitchShift: -1,  speedMultiplier: 0.9,  energyLevel: 0.5, useSlang: false, pauseFrequency: 0.5, exaggeration: 0.3 },
  dramatic:  { personality: "dramatic",  pitchShift: -2,  speedMultiplier: 0.8,  energyLevel: 0.7, useSlang: false, pauseFrequency: 0.8, exaggeration: 0.9 },
};

const SPEECH_TEMPLATES: Record<SpeechContext, Record<VoicePersonality, string[]>> = {
  "contestant-enter": {
    funny:     ["Oh here they come, everyone act surprised!", "Well SOMEBODY decided to show up!"],
    sarcastic: ["Wow. You actually made it. Fascinating.", "Oh great. More contestants."],
    serious:   ["Please welcome our next contestant to the stage.", "Contestant number {n} takes their position."],
    hype:      ["YO LET'S GOOO! {name} IS IN THE BUILDING!", "EVERYBODY SCREAM FOR {name}!"],
    mentor:    ["Take a breath. You've trained for this. Welcome, {name}.", "All eyes on {name}. Let's see what you've got."],
    chaotic:   ["THEY'RE HEEERE! WHO ARE THEY?! DOESN'T MATTER! YAAAA!", "CONTESTANT DETECTED! INITIATING CHAOS!"],
    smooth:    ["And gliding onto the stage... {name}. Smooth as ever.", "The one, the only... {name}."],
    dramatic:  ["From the shadows... they emerge. {name}.", "The moment we've all been waiting for..."],
  },
  "elimination": {
    funny:     ["Byeeeee! Don't let the door hit ya!", "We've seen better. We've seen worse. Mostly worse."],
    sarcastic: ["Oh no. Anyway.", "Shocking. Truly. Nobody saw that coming. At all."],
    serious:   ["That concludes their time in the competition. Thank you for participating.", "They've been eliminated. Best of luck going forward."],
    hype:      ["BUZZZZZZ! OUT! DONE! SEE YA!", "THE CROWD HAS SPOKEN! THEY'RE GONE!"],
    mentor:    ["There are no failures here, only lessons. Hold your head up.", "The journey doesn't end here. Learn from this and come back stronger."],
    chaotic:   ["GONE! POOF! WHERE'D THEY GO?! DOESN'T MATTER! NEXT!", "ELIMINATION ACTIVATED! TRAPDOOR TIME!"],
    smooth:    ["And just like that... the curtain falls.", "A smooth exit for a smooth competitor."],
    dramatic:  ["..........eliminated.", "The. Vote. Has. Been. Cast."],
  },
  "winner-announce": {
    funny:     ["They actually won! I'm as shocked as you are!", "I can't believe it but the numbers don't lie, {name} WINS!"],
    sarcastic: ["Fine. {name} wins. Happy now?", "After all that... {name} wins. Sure. Why not."],
    serious:   ["The winner, with a final score of {score}, is {name}.", "Congratulations to {name} on a well-earned victory."],
    hype:      ["OH MY GOD OH MY GOD OH MY GOD {name} WINS!! LET'S GOOOOO!!", "THE CHAMPION! THE LEGEND! {name}!!"],
    mentor:    ["You put in the work, and it showed. {name}, this is yours.", "{name}, this victory is the result of dedication and heart. Wear it proudly."],
    chaotic:   ["WINNER DETECTED! {name}! CONFETTI CANNON ARMED! FIRE!", "THE ALGORITHM PICKED {name}! WE'RE ALL WINNERS! EXCEPT THE LOSERS!"],
    smooth:    ["And the winner is... exactly who you expected. {name}.", "Victory looks good on {name}. Very smooth."],
    dramatic:  ["...and the WINNER........is......... {name}.", "After everything... {name} stands ALONE."],
  },
  "crowd-hype": {
    funny:     ["I need everyone to scream like their Wi-Fi just came back!", "Make some noise or I'm going home!"],
    sarcastic: ["Clap. Please. I'm begging.", "Sure, applaud. We're all contractually obligated to be here."],
    serious:   ["Show your support for our contestants tonight.", "Your energy matters. Let them hear you."],
    hype:      ["EVERYBODY MAKE SOME NOOOISE!! LET'S HEAR IT!", "IF YOU'RE HYPE SAY YOOOO! YOOOO! YOOO!"],
    mentor:    ["Your support means everything to them. Show it.", "Energy is contagious. Give them yours right now."],
    chaotic:   ["MAKE NOISE! MAKE CHAOS! WHAT IS HAPPENING?! BEAUTIFUL!", "SCREAM INTO THE VOID! THE VOID SCREAMS BACK!"],
    smooth:    ["Let the energy flow. You know what to do.", "Real smooth energy from this crowd tonight."],
    dramatic:  ["The crowd...... rises.", "Feel it. The electricity in the air."],
  },
  "show-open": {
    funny:     ["Welcome to the show nobody asked for but everyone showed up to!", "I'm your host, somehow still employed!"],
    sarcastic: ["Welcome. You're here. So are we. Let's get this over with.", "Another night, another show. You love to see it. I assume."],
    serious:   ["Welcome to TMI. Tonight, we find out who has what it takes.", "Good evening. The competition begins now."],
    hype:      ["LET'S GET THIS PARTY STARTED!! WELCOME TO TMI!! ARE YOU READYYYY?!", "THE SHOW IS LIVE! THE CROWD IS LIVE! EVERYTHING IS LIVE!"],
    mentor:    ["Welcome, everyone. Tonight is not just entertainment — it's an opportunity.", "Good evening. Every great performer started somewhere. Tonight, we witness beginnings."],
    chaotic:   ["WE'RE ALIVE! THE SHOW IS LIVE! I DON'T KNOW WHAT'S HAPPENING! LET'S FIND OUT!", "WELCOME TO ORGANIZED CHAOS ALSO KNOWN AS TMI!"],
    smooth:    ["Good evening, beautiful people. Welcome to the show.", "Tonight is going to be something special. I can feel it."],
    dramatic:  ["In the beginning... there was silence. Then... THE SHOW.", "What you are about to witness... will change everything."],
  },
  "show-close":      { funny: [], sarcastic: [], serious: [], hype: [], mentor: [], chaotic: [], smooth: [], dramatic: [] },
  "vote-open":       { funny: [], sarcastic: [], serious: [], hype: [], mentor: [], chaotic: [], smooth: [], dramatic: [] },
  "vote-close":      { funny: [], sarcastic: [], serious: [], hype: [], mentor: [], chaotic: [], smooth: [], dramatic: [] },
  "countdown":       { funny: [], sarcastic: [], serious: [], hype: [], mentor: [], chaotic: [], smooth: [], dramatic: [] },
  "tie-breaker":     { funny: [], sarcastic: [], serious: [], hype: [], mentor: [], chaotic: [], smooth: [], dramatic: [] },
  "score-reveal":    { funny: [], sarcastic: [], serious: [], hype: [], mentor: [], chaotic: [], smooth: [], dramatic: [] },
  "commercial-tease":{ funny: [], sarcastic: [], serious: [], hype: [], mentor: [], chaotic: [], smooth: [], dramatic: [] },
};

function findEmphasisWords(text: string): string[] {
  return text.match(/\b[A-Z]{2,}\b/g) ?? [];
}

function suggestPauses(text: string, pauseFrequency: number): number[] {
  const pauses: number[] = [];
  const dots = (text.match(/\.\.\./g) ?? []).length;
  const commas = (text.match(/,/g) ?? []).length;
  for (let i = 0; i < dots; i++) pauses.push(600 + Math.random() * 400);
  if (pauseFrequency > 0.5 && commas > 0) pauses.push(200);
  return pauses;
}

export class HostVoicePersonalityEngine {
  private static _instance: HostVoicePersonalityEngine | null = null;

  private _hostPersonalities: Map<string, VoicePersonality> = new Map();

  static getInstance(): HostVoicePersonalityEngine {
    if (!HostVoicePersonalityEngine._instance) {
      HostVoicePersonalityEngine._instance = new HostVoicePersonalityEngine();
    }
    return HostVoicePersonalityEngine._instance;
  }

  assignPersonality(hostId: string, personality: VoicePersonality): void {
    this._hostPersonalities.set(hostId, personality);
  }

  getPersonality(hostId: string): VoicePersonality {
    return this._hostPersonalities.get(hostId) ?? "hype";
  }

  getStyle(hostId: string): VoiceStyle {
    return VOICE_STYLES[this.getPersonality(hostId)];
  }

  generateLine(
    hostId: string,
    context: SpeechContext,
    vars: Record<string, string> = {},
  ): SpeechLine {
    const personality = this.getPersonality(hostId);
    const style = VOICE_STYLES[personality];
    const templates = SPEECH_TEMPLATES[context]?.[personality] ?? [];

    let text = templates.length > 0
      ? templates[Math.floor(Math.random() * templates.length)]
      : `[${context}]`;

    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, v);
    }

    const tone =
      style.energyLevel > 0.8 ? "excited"
      : style.pauseFrequency > 0.6 ? "intense"
      : personality === "sarcastic" ? "deadpan"
      : personality === "mentor" ? "warm"
      : "neutral";

    return {
      text,
      personality,
      tone,
      suggestedPausesMs: suggestPauses(text, style.pauseFrequency),
      emphasisWords: findEmphasisWords(text),
    };
  }

  getAllStyles(): Record<VoicePersonality, VoiceStyle> {
    return { ...VOICE_STYLES };
  }
}

export const hostVoicePersonalityEngine = HostVoicePersonalityEngine.getInstance();
