// Tabloid headline generator + magazine issue rotation engine.
// Pure data — no side effects, no React, no singletons.

export type Genre = 'Hip Hop' | 'Pop' | 'Rock' | 'R&B' | 'Electronic' | 'Jazz';

export interface MagazineIssue {
  issueNumber: number;
  theme: Genre;
  editorialFocus: string;
  accentColor: string;
  bgGradient: string;
}

export interface PlatformEvent {
  type: 'battle-win' | 'crown-swap' | 'new-beat' | 'milestone' | 'leak' | 'collab';
  actor: string;
  detail?: string;
  value?: number;
}

// ─── Issue registry ────────────────────────────────────────────────────────────

const ISSUES: MagazineIssue[] = [
  {
    issueNumber: 1,
    theme: 'Hip Hop',
    editorialFocus: 'THE CROWN WARS',
    accentColor: '#AA2DFF',
    bgGradient: 'radial-gradient(ellipse at 20% 30%, rgba(120,0,255,0.6) 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(0,200,180,0.4) 0%, transparent 55%), linear-gradient(160deg, #12043a 0%, #080c2a 50%, #061018 100%)',
  },
  {
    issueNumber: 2,
    theme: 'R&B',
    editorialFocus: 'VELVET SEASON',
    accentColor: '#00FF88',
    bgGradient: 'radial-gradient(ellipse at 30% 20%, rgba(0,120,80,0.55) 0%, transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(255,50,170,0.3) 0%, transparent 55%), linear-gradient(160deg, #031a0e 0%, #080d18 50%, #06100d 100%)',
  },
  {
    issueNumber: 3,
    theme: 'Pop',
    editorialFocus: 'THE TAKEOVER',
    accentColor: '#FFD700',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(255,180,0,0.5) 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(255,80,200,0.35) 0%, transparent 55%), linear-gradient(160deg, #1a1000 0%, #120e00 50%, #0a0800 100%)',
  },
  {
    issueNumber: 4,
    theme: 'Electronic',
    editorialFocus: 'MACHINE SOUL',
    accentColor: '#FF2DAA',
    bgGradient: 'radial-gradient(ellipse at 80% 20%, rgba(255,0,150,0.5) 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(0,200,255,0.35) 0%, transparent 55%), linear-gradient(160deg, #1a0010 0%, #0d0818 50%, #030810 100%)',
  },
  {
    issueNumber: 5,
    theme: 'Rock',
    editorialFocus: 'VOLTAGE UPRISING',
    accentColor: '#00FFFF',
    bgGradient: 'radial-gradient(ellipse at 10% 50%, rgba(0,200,255,0.5) 0%, transparent 55%), radial-gradient(ellipse at 90% 50%, rgba(255,120,0,0.35) 0%, transparent 55%), linear-gradient(160deg, #001a1a 0%, #080c10 50%, #040606 100%)',
  },
  {
    issueNumber: 6,
    theme: 'Jazz',
    editorialFocus: 'BLUE HOUR',
    accentColor: '#4488FF',
    bgGradient: 'radial-gradient(ellipse at 30% 40%, rgba(30,80,255,0.5) 0%, transparent 55%), radial-gradient(ellipse at 70% 60%, rgba(255,180,0,0.25) 0%, transparent 55%), linear-gradient(160deg, #000a1a 0%, #040810 50%, #020608 100%)',
  },
];

export function getCurrentIssue(): MagazineIssue {
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return ISSUES[weekNumber % ISSUES.length];
}

export function getIssueByGenre(genre: Genre): MagazineIssue {
  return ISSUES.find(i => i.theme === genre) ?? ISSUES[0];
}

// ─── Tabloid headline templates ────────────────────────────────────────────────

const BATTLE_WIN_HOOKS = [
  (actor: string, detail?: string) => `${actor.toUpperCase()} CLEANS HOUSE — ${detail ?? 'CROWD GOES NUCLEAR'}`,
  (actor: string) => `NOBODY SAW IT COMING: ${actor.toUpperCase()} RUNS THE TABLE`,
  (actor: string) => `SWEEP. ${actor.toUpperCase()} DOESN'T LOSE.`,
  (actor: string, detail?: string) => `THE ${detail?.toUpperCase() ?? 'ARENA'} BELONGS TO ${actor.toUpperCase()} NOW`,
];

const CROWN_SWAP_HOOKS = [
  (actor: string) => `👑 DETHRONE — ${actor.toUpperCase()} SNATCHES THE CROWN`,
  (actor: string) => `NEW KING IN THE INDEX. ${actor.toUpperCase()} TAKES IT.`,
  (actor: string) => `THE CROWN JUST CHANGED HANDS. ${actor.toUpperCase()}. REMEMBER THAT.`,
];

const NEW_BEAT_HOOKS = [
  (actor: string, detail?: string) => `${actor.toUpperCase()} DROPS "${detail?.toUpperCase() ?? 'UNTITLED'}" — EVERYONE LOSES IT`,
  (actor: string) => `THIS BEAT FROM ${actor.toUpperCase()} DOESN'T PLAY FAIR`,
  (actor: string) => `${actor.toUpperCase()}'S NEW PRODUCTION IS BREAKING THINGS`,
];

const MILESTONE_HOOKS = [
  (actor: string, value?: number) => `${actor.toUpperCase()} HITS ${value?.toLocaleString() ?? '10K'} — THE ALGORITHM NOTICED`,
  (actor: string) => `BIG NUMBER: ${actor.toUpperCase()} CROSSES ANOTHER THRESHOLD`,
];

const COLLAB_HOOKS = [
  (actor: string, detail?: string) => `THEY'RE LINKING: ${actor.toUpperCase()} + ${detail?.toUpperCase() ?? '???'}`,
  (actor: string) => `${actor.toUpperCase()} JUST CHANGED THE GAME WITH THAT COLLAB`,
];

const LEAK_HOOKS = [
  (actor: string, detail?: string) => `LEAKED: ${actor.toUpperCase()} — "${detail ?? 'UNRELEASED'}"`,
  (actor: string) => `EXCLUSIVE: ${actor.toUpperCase()} DIDN'T WANT THIS OUT YET`,
];

export function generateTableidHeadline(event: PlatformEvent): string {
  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  switch (event.type) {
    case 'battle-win':  return pick(BATTLE_WIN_HOOKS)(event.actor, event.detail);
    case 'crown-swap':  return pick(CROWN_SWAP_HOOKS)(event.actor);
    case 'new-beat':    return pick(NEW_BEAT_HOOKS)(event.actor, event.detail);
    case 'milestone':   return pick(MILESTONE_HOOKS)(event.actor, event.value);
    case 'collab':      return pick(COLLAB_HOOKS)(event.actor, event.detail);
    case 'leak':        return pick(LEAK_HOOKS)(event.actor, event.detail);
    default:            return `${event.actor.toUpperCase()} IS MAKING MOVES`;
  }
}

// ─── Static viral hook dictionary (seed until live events flow) ────────────────

export const STATIC_TEASERS: string[] = [
  "👑 THE CROWN SWAPPED HANDS TWICE THIS WEEK — WHO'S NEXT?",
  "🔥 ASTRA NOVA'S NEW DROP HAS ARTISTS SCRAMBLING",
  "💀 BATTLE RESULTS ARE IN — THE INDEX IS SHOOK",
  "📼 LEAKED: SOMEBODY'S UNRELEASED IS ALREADY CIRCULATING",
  "💰 BEAT SALES UP 340% AFTER LAST NIGHT'S CYPHER",
  "🎤 NOBODY WANTED TO BATTLE HIM. HE SHOWED UP ANYWAY.",
  "⚡ THREE CROWNS LOST IN ONE NIGHT — INDEX HISTORY MADE",
  "👀 NEW COLLAB DROP. NOBODY PREDICTED THIS PAIRING.",
  "🚨 ARENA GOES DARK: THE HEADLINER JUST WALKED OUT",
  "🏆 UNDEFEATED STREAK ENDS. THE KING IS DEAD.",
  "🔮 ALGORITHM FLAGGED THIS ARTIST — THEY'RE ABOUT TO BLOW",
  "🎯 THE VOTE WAS RIGGED? FANS ARE DEMANDING ANSWERS",
];

export const STATIC_LEAKS: string[] = [
  "EXCLUSIVE: NEW COLLAB CONFIRMED",
  "LEAKED SETLIST JUST DROPPED",
  "SOURCES SAY: CROWN DRAMA TONIGHT",
  "UNCONFIRMED: SURPRISE HEADLINER",
  "ALERT: SOMEONE'S GOING ALL-IN",
  "RUMOR: BEEF JUST WENT PUBLIC",
  "BREAKING: VOTE NUMBERS DON'T ADD UP",
  "JUST IN: ARTIST PULLED FROM LINEUP",
];
