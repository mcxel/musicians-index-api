export interface CeremonyScript {
  id: string;
  openingLine: string;
  crownLine: string;
  hypeLines: string[];
  closingLine: string;
  cameraEffect: "spotlight" | "zoom-in" | "pan-reveal" | "orbit" | "flash-reveal";
  confettiStyle: "gold-burst" | "rainbow-fall" | "neon-spray" | "cyan-firework" | "purple-rain";
  holdDurationMs: number;
  recordingBufferMs: number;
  celebrationPhrases: string[];
}

export interface WinnerCeremonyData {
  winnerName: string;
  contestName: string;
  prize: string;
  genre: string;
  rank?: number;
  badge?: string;
  slug?: string;
}

const OPENING_LINES = [
  "The votes are in. The crowd has spoken.",
  "After an epic battle — the moment you've been waiting for.",
  "It all came down to this. One artist. One crown.",
  "The stage has been silent long enough.",
  "From thousands of competitors — one rises above.",
  "The scoreboard doesn't lie. History is being made.",
  "This week, greatness had a name.",
  "Week after week, they pushed. Tonight, they broke through.",
];

const CROWN_LINES = [
  "The crown goes to",
  "Ladies and gentlemen — your champion",
  "The Musician's Index is proud to crown",
  "Step into the spotlight",
  "This week's undisputed champion",
  "History will remember this moment — the winner is",
  "The trophy, the glory, the legacy — all earned by",
];

const HYPE_LINES = [
  ["Undefeated on that stage.", "The crowd could not deny it.", "Battle-tested and crowned."],
  ["They came, they battled, they conquered.", "Every round was a statement.", "The index speaks."],
  ["Genre doesn't matter when you're this sharp.", "That performance? Legendary.", "Remember this moment."],
  ["They earned every single point.", "The room went silent when they stepped up.", "That's what greatness sounds like."],
  ["From the first verse to the final count — they owned it.", "No argument. No debate.", "Just pure talent crowned."],
  ["The fans saw it first.", "The board confirmed it.", "TMI makes it official."],
  ["They wrote the script. They lived it.", "Battles make legends.", "And a legend was made tonight."],
];

const CLOSING_LINES = [
  "Capture this. Save this. Share this. A champion has been crowned.",
  "The record books are updated. The crown is theirs.",
  "Remember where you were when this happened.",
  "The leaderboard moves. The champion stays. Until next time.",
  "Congratulations — and see you at the top.",
  "This is what The Musician's Index was built for.",
  "One win at a time. That's how empires are built.",
];

const CELEBRATION_PHRASES = [
  "CONGRATULATIONS!", "YOU DID IT!", "CHAMPION!", "LEGEND!", "CROWNED!", "UNSTOPPABLE!",
  "THE PEOPLE'S CHAMP!", "HISTORY MADE!", "WE SEE YOU!", "THAT'S A WRAP!",
  "TMI APPROVED!", "CROWN SECURED!", "NEXT LEVEL!", "THE GOAT?", "NO DEBATE!",
];

const CAMERA_EFFECTS: CeremonyScript["cameraEffect"][] = [
  "spotlight", "zoom-in", "pan-reveal", "orbit", "flash-reveal",
];

const CONFETTI_STYLES: CeremonyScript["confettiStyle"][] = [
  "gold-burst", "rainbow-fall", "neon-spray", "cyan-firework", "purple-rain",
];

function pick<T>(arr: T[], seed?: number): T {
  const idx = seed !== undefined
    ? Math.abs(seed) % arr.length
    : Math.floor(Math.random() * arr.length);
  return arr[idx];
}

function pickHypes(seed?: number): string[] {
  const idx = seed !== undefined
    ? Math.abs(seed) % HYPE_LINES.length
    : Math.floor(Math.random() * HYPE_LINES.length);
  return HYPE_LINES[idx];
}

let ceremonyCallCount = 0;

export function generateCeremonyScript(winner: WinnerCeremonyData): CeremonyScript {
  ceremonyCallCount++;
  const seed = ceremonyCallCount + winner.winnerName.length;

  return {
    id: `ceremony-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    openingLine: pick(OPENING_LINES, seed % OPENING_LINES.length),
    crownLine: pick(CROWN_LINES, (seed + 1) % CROWN_LINES.length),
    hypeLines: pickHypes((seed + 2) % HYPE_LINES.length),
    closingLine: pick(CLOSING_LINES, (seed + 3) % CLOSING_LINES.length),
    cameraEffect: pick(CAMERA_EFFECTS, (seed + 4) % CAMERA_EFFECTS.length),
    confettiStyle: pick(CONFETTI_STYLES, (seed + 5) % CONFETTI_STYLES.length),
    holdDurationMs: 4200 + (seed % 3) * 800,
    recordingBufferMs: 6000,
    celebrationPhrases: [
      pick(CELEBRATION_PHRASES, seed % CELEBRATION_PHRASES.length),
      pick(CELEBRATION_PHRASES, (seed + 7) % CELEBRATION_PHRASES.length),
      pick(CELEBRATION_PHRASES, (seed + 11) % CELEBRATION_PHRASES.length),
    ],
  };
}

export function getCeremonyTiming(script: CeremonyScript) {
  return {
    openAt: 0,
    crownAt: 1200,
    hypeLinesAt: 2600,
    celebrationAt: 3800,
    recordingWindowStart: 4500,
    cameraPickAt: 5200,
    cameraPickEnd: script.recordingBufferMs + 2000,
    closingAt: script.recordingBufferMs + 3000,
    fadeOutAt: script.holdDurationMs + script.recordingBufferMs,
    totalDurationMs: script.holdDurationMs + script.recordingBufferMs + 1500,
  };
}
