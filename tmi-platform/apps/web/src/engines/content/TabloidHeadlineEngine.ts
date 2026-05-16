// Tabloid Headline Engine — rotating cover headlines for /home/1

import type { MusicGenre } from "@/engines/home/CoverGenreRotationAuthority";

// Static tabloid headlines (genre-agnostic)
const STATIC_HEADLINES = [
  "WHO TOOK THE CROWN?",
  "BATTLE EXPLODES THIS WEEK",
  "CAN SHE HOLD #1?",
  "WHO STOLE THE SPOTLIGHT?",
  "BIGGEST RISE THIS MONTH",
  "GENRE WAR ACTIVE NOW",
  "NEW CHAMPION CROWNED TONIGHT",
  "THE UPSET NO ONE SAW COMING",
  "RANKINGS SHAKEN — WHO'S NEXT?",
  "LIVE VOTES CHANGING EVERYTHING",
  "THE CROWN IS UP FOR GRABS",
  "THIS WEEK'S BATTLE IS HISTORIC",
  "FANS DECIDE THE THRONE",
  "ONE VOTE SEPARATES THE TOP 3",
  "THE COMEBACK EVERYONE PREDICTED",
] as const;

// Genre-specific headline templates
const GENRE_TEMPLATES: Partial<Record<MusicGenre, string[]>> = {
  "Hip-Hop":     ["HIP-HOP THRONE IS SHAKING", "WHO RUNS THE CYPHER?",        "BARS THAT BROKE THE INTERNET"    ],
  "R&B":         ["R&B ROYALTY IS CROWNED",     "VELVET VOICES TAKE THE STAGE", "WHO OWNS THE HEARTBEAT?"         ],
  "Rock":        ["ROCK TAKES THE CROWN",        "GUITAR GODS IN BATTLE",        "THE HEAVIEST WEEK IN HISTORY"    ],
  "Electronic":  ["THE BEAT DROPS — WHO WINS?",  "WAVE LEADERS THIS WEEK",       "ELECTRONIC THRONE CONTESTED"     ],
  "Trap":        ["TRAP KINGS BATTLE LIVE",      "WHO CONTROLS THE 808?",        "TRAP CROWN CHANGES HANDS"        ],
  "Pop":         ["POP ROYALTY COLLIDES",         "BIGGEST HOOK WINS THE CROWN",  "WHO IS POP'S NEW FACE?"          ],
  "Soul":        ["SOUL SPEAKS — WHO WINS?",      "FEELINGS DECIDE THE THRONE",   "DEEPEST VOICE TAKES #1"          ],
  "Reggae":      ["ISLAND VIBES TAKE OVER",       "ROOTS CROWN THIS WEEK",        "WHO LEADS THE RIDDIM?"           ],
  "Latin":       ["FUEGO IN THE RANKINGS",        "LATIN HEAT EXPLODES",          "THE RHYTHM HAS A NEW KING"       ],
  "Jazz":        ["JAZZ MASTERS COLLIDE",          "IMPROVISATION DECIDES IT ALL", "THE COOLEST CROWN THIS YEAR"     ],
  "Gospel":      ["VOICES ASCEND THIS WEEK",      "THE SPIRIT CHOSE A WINNER",    "HIGHEST HARMONY EARNS THE CROWN" ],
  "Country":     ["BOOTS STOMP TO THE TOP",       "HONKY TONK THRONE CONTESTED",  "SOUTHERN CROWN CHANGES HANDS"    ],
  "Alternative": ["ALTERNATIVE RISES",             "INDIE WAVE TAKES CONTROL",     "UNCONVENTIONAL CHAMPION CROWNED" ],
};

// Callout strip messages (ticker below headline)
export const CALLOUT_STRIPS = [
  "JOIN THIS ISSUE NOW",
  "VOTE LIVE NOW",
  "READ THE FULL STORY",
  "ENTER THE CYPHER",
  "CROWN UPDATING LIVE",
  "YOUR VOTE COUNTS",
  "RANKINGS SHIFT EVERY 30s",
  "NEW ISSUE — NEW BATTLE",
  "TOP 10 INSIDE",
] as const;

export type HeadlineSet = {
  primary:  string;
  secondary: string;
  callout:  string;
};

// Get a deterministic headline set for a given genre and rotation index
export function getHeadlineSet(genre: MusicGenre, rotationIndex: number): HeadlineSet {
  const genreHeadlines = GENRE_TEMPLATES[genre] ?? [];
  const allHeadlines   = [...genreHeadlines, ...STATIC_HEADLINES];

  const primary   = allHeadlines[rotationIndex % allHeadlines.length]!;
  const secondary = allHeadlines[(rotationIndex + 3) % allHeadlines.length]!;
  const callout   = CALLOUT_STRIPS[rotationIndex % CALLOUT_STRIPS.length]!;

  return { primary, secondary, callout };
}

// Get rotation index that advances every N seconds
export function getRotationIndex(intervalSeconds = 4): number {
  return Math.floor(Date.now() / (intervalSeconds * 1000));
}
