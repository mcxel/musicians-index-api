// Cover Story Hook Engine
// Generates rotating tabloid-style story hooks for magazine cover
// Themes: feud, surprise drop, battle challenge, crown defense

import type { MusicGenre } from "../home/CoverGenreRotationAuthority";

export interface StoryHook {
  theme: "feud" | "surprise_drop" | "battle_challenge" | "crown_defense";
  hook: string;
  eyebrow: string;
}

// Feud story angles
const FEUD_HOOKS: StoryHook[] = [
  { theme: "feud", hook: "BEEF ERUPTS IN THE CIPHER", eyebrow: "Two titans clash" },
  { theme: "feud", hook: "RIVALRY HEATS UP LIVE", eyebrow: "Old enemies collide" },
  { theme: "feud", hook: "BATTLE LINES DRAWN", eyebrow: "Who will back down?" },
  { theme: "feud", hook: "DRAMA HITS THE STAGE", eyebrow: "Subliminal shots fired" },
  { theme: "feud", hook: "THE FEUD ESCALATES", eyebrow: "No apologies coming" },
];

// Surprise drop story angles
const SURPRISE_DROP_HOOKS: StoryHook[] = [
  { theme: "surprise_drop", hook: "SHADOW DROP SHOCKS WORLD", eyebrow: "Nobody saw it coming" },
  { theme: "surprise_drop", hook: "UNEXPECTED COLLAB ARRIVES", eyebrow: "Dream team assembled" },
  { theme: "surprise_drop", hook: "SECRET PROJECT REVEALED", eyebrow: "Whispers were true" },
  { theme: "surprise_drop", hook: "COMEBACK ALBUM HITS", eyebrow: "The wait is over" },
  { theme: "surprise_drop", hook: "LEAKED TRACK GOES OFFICIAL", eyebrow: "Fans demand more" },
];

// Battle challenge story angles
const BATTLE_CHALLENGE_HOOKS: StoryHook[] = [
  { theme: "battle_challenge", hook: "OPEN CHALLENGE ACCEPTED", eyebrow: "Tonight might change everything" },
  { theme: "battle_challenge", hook: "UNDERDOG CALLS OUT KING", eyebrow: "Respect or revolution?" },
  { theme: "battle_challenge", hook: "16s THAT COULD BE LEGENDARY", eyebrow: "Are you ready?" },
  { theme: "battle_challenge", hook: "CHAMPIONSHIP MATCH SET", eyebrow: "Winner takes all" },
  { theme: "battle_challenge", hook: "WHO WILL ANSWER?", eyebrow: "The gauntlet is down" },
];

// Crown defense story angles
const CROWN_DEFENSE_HOOKS: StoryHook[] = [
  { theme: "crown_defense", hook: "REIGNING CHAMPION TESTED", eyebrow: "Throne under siege" },
  { theme: "crown_defense", hook: "CAN THE KING HOLD IT?", eyebrow: "Challengers circling" },
  { theme: "crown_defense", hook: "CROWN HOLDER SPEAKS", eyebrow: "I'm not going anywhere" },
  { theme: "crown_defense", hook: "DYNASTY OR DISRUPTION?", eyebrow: "The answer lies here" },
  { theme: "crown_defense", hook: "LEGACY ON THE LINE", eyebrow: "One battle to prove it" },
];

const ALL_HOOKS = [
  ...FEUD_HOOKS,
  ...SURPRISE_DROP_HOOKS,
  ...BATTLE_CHALLENGE_HOOKS,
  ...CROWN_DEFENSE_HOOKS,
];

// Get a hook by index (for deterministic rotation)
export function getStoryHook(index: number): StoryHook {
  return ALL_HOOKS[index % ALL_HOOKS.length]!;
}

// Get hooks for a specific theme
export function getHooksByTheme(theme: StoryHook["theme"]): StoryHook[] {
  return ALL_HOOKS.filter((h) => h.theme === theme);
}

// Get rotating hooks for current week (via genre + week index)
export function getWeeklyStoryHooks(genre: MusicGenre, weekIndex: number): StoryHook[] {
  const genreHash = genre.charCodeAt(0) + genre.charCodeAt(genre.length - 1);
  const seed = (genreHash + weekIndex) % ALL_HOOKS.length;
  
  // Return 3 hooks in rotation order from this seed
  return [
    ALL_HOOKS[seed % ALL_HOOKS.length]!,
    ALL_HOOKS[(seed + 5) % ALL_HOOKS.length]!,
    ALL_HOOKS[(seed + 10) % ALL_HOOKS.length]!,
  ];
}

// Get a random hook (for session variation)
export function getRandomStoryHook(): StoryHook {
  return ALL_HOOKS[Math.floor(Math.random() * ALL_HOOKS.length)]!;
}

// Get the current week's primary story hook
export function getCoverStoryHook(genre: MusicGenre, weekIndex: number, rotationIndex: number = 0): StoryHook {
  const hooks = getWeeklyStoryHooks(genre, weekIndex);
  return hooks[rotationIndex % hooks.length]!;
}
