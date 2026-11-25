/**
 * Canonical Event Taxonomy Registry
 * Hierarchy: CATEGORY → STYLE/GENRE → EVENT FORMAT → EXPERIENCE
 *
 * Designed to power:
 * 1. Creation Surface: extensible style selection (never hard-coded or closed).
 * 2. Explorer: Shows & Events + dedicated Concerts discovery filters.
 * 3. Lobby Wall & Hub Monitors: multi-stage event presentation.
 */

export type EventMasterCategory =
  | 'DANCE'
  | 'COMEDY'
  | 'MUSIC'
  | 'SPEAKING'
  | 'COMPETITION'
  | 'GAMING'
  | 'FESTIVAL';

export interface EventStyleDefinition {
  id: string;
  name: string;
  category: EventMasterCategory;
  description?: string;
}

export interface EventFormatDefinition {
  id: string;
  name: string;
  category: EventMasterCategory;
  description?: string;
  allowedScopes: Array<'mini' | 'world'>;
}

export interface EventTaxonomyNode {
  category: EventMasterCategory;
  label: string;
  description: string;
  styles: EventStyleDefinition[];
  formats: EventFormatDefinition[];
}

export const CANONICAL_EVENT_TAXONOMY: Record<EventMasterCategory, EventTaxonomyNode> = {
  DANCE: {
    category: 'DANCE',
    label: 'Dance & Movement',
    description: 'Live dance showcases, competitions, workshops, and social dances.',
    styles: [
      { id: 'line-dance', name: 'Line Dance', category: 'DANCE' },
      { id: 'ballet', name: 'Ballet', category: 'DANCE' },
      { id: 'hip-hop-dance', name: 'Hip-Hop', category: 'DANCE' },
      { id: 'breaking', name: 'Breaking / B-Boy / B-Girl', category: 'DANCE' },
      { id: 'choreography', name: 'Choreography', category: 'DANCE' },
      { id: 'contemporary', name: 'Contemporary', category: 'DANCE' },
      { id: 'jazz-dance', name: 'Jazz', category: 'DANCE' },
      { id: 'tap-dance', name: 'Tap', category: 'DANCE' },
      { id: 'ballroom', name: 'Ballroom', category: 'DANCE' },
      { id: 'salsa', name: 'Salsa', category: 'DANCE' },
      { id: 'bachata', name: 'Bachata', category: 'DANCE' },
      { id: 'east-coast-swing', name: 'East Coast Swing', category: 'DANCE' },
      { id: 'west-coast-swing', name: 'West Coast Swing', category: 'DANCE' },
      { id: 'country-western', name: 'Country / Western', category: 'DANCE' },
      { id: 'two-step', name: 'Country Two-Step', category: 'DANCE' },
      { id: 'country-swing', name: 'Country Swing', category: 'DANCE' },
      { id: 'cha-cha', name: 'Cha-Cha', category: 'DANCE' },
      { id: 'waltz', name: 'Waltz', category: 'DANCE' },
      { id: 'polka', name: 'Polka', category: 'DANCE' },
      { id: 'dancehall', name: 'Dancehall', category: 'DANCE' },
      { id: 'stepping', name: 'Stepping', category: 'DANCE' },
      { id: 'afro-african', name: 'Afro / African Styles', category: 'DANCE' },
      { id: 'extensible-custom', name: 'Custom / Other Style', category: 'DANCE' },
    ],
    formats: [
      { id: 'showcase', name: 'Showcase', category: 'DANCE', allowedScopes: ['mini', 'world'] },
      { id: 'competition', name: 'Competition / Battle', category: 'DANCE', allowedScopes: ['mini', 'world'] },
      { id: 'workshop', name: 'Workshop / Masterclass', category: 'DANCE', allowedScopes: ['mini', 'world'] },
      { id: 'social-dance', name: 'Social Dance Party', category: 'DANCE', allowedScopes: ['mini', 'world'] },
      { id: 'multi-stage-festival', name: 'Multi-Stage Festival', category: 'DANCE', allowedScopes: ['world'] },
    ],
  },

  COMEDY: {
    category: 'COMEDY',
    label: 'Comedy & Entertainment',
    description: 'Stand-up, improv, roast battles, storytelling, and comedy specials.',
    styles: [
      { id: 'stand-up', name: 'Stand-up', category: 'COMEDY' },
      { id: 'improv', name: 'Improv', category: 'COMEDY' },
      { id: 'sketch', name: 'Sketch Comedy', category: 'COMEDY' },
      { id: 'roast', name: 'Roast / Battle', category: 'COMEDY' },
      { id: 'observational', name: 'Observational', category: 'COMEDY' },
      { id: 'storytelling', name: 'Storytelling', category: 'COMEDY' },
      { id: 'musical-comedy', name: 'Musical Comedy', category: 'COMEDY' },
      { id: 'clean-family', name: 'Clean / Family Comedy', category: 'COMEDY' },
      { id: 'open-mic', name: 'Open Mic', category: 'COMEDY' },
      { id: 'joke-off', name: 'Joke-Off Challenge', category: 'COMEDY' },
    ],
    formats: [
      { id: 'comedy-special', name: 'Headline Special', category: 'COMEDY', allowedScopes: ['world'] },
      { id: 'comedy-club-room', name: 'Live Comedy Club', category: 'COMEDY', allowedScopes: ['mini', 'world'] },
      { id: 'roast-battle', name: 'Roast Match', category: 'COMEDY', allowedScopes: ['mini', 'world'] },
      { id: 'open-mic-night', name: 'Open Mic Room', category: 'COMEDY', allowedScopes: ['mini'] },
    ],
  },

  MUSIC: {
    category: 'MUSIC',
    label: 'Concerts & Music',
    description: 'Solo stages, headline world concerts, listening parties, and premieres.',
    styles: [
      { id: 'hip-hop-music', name: 'Hip-Hop / Rap', category: 'MUSIC' },
      { id: 'r-and-b', name: 'R&B / Soul', category: 'MUSIC' },
      { id: 'pop', name: 'Pop', category: 'MUSIC' },
      { id: 'rock', name: 'Rock / Alternative', category: 'MUSIC' },
      { id: 'country-music', name: 'Country / Americana', category: 'MUSIC' },
      { id: 'electronic-edm', name: 'Electronic / EDM / DJ', category: 'MUSIC' },
      { id: 'jazz-music', name: 'Jazz / Blues', category: 'MUSIC' },
      { id: 'gospel', name: 'Gospel / Inspirational', category: 'MUSIC' },
      { id: 'latin-music', name: 'Latin / Reggaeton', category: 'MUSIC' },
      { id: 'afrobeat', name: 'Afrobeat', category: 'MUSIC' },
      { id: 'reggae-dancehall', name: 'Reggae / Dancehall', category: 'MUSIC' },
      { id: 'classical', name: 'Classical / Instrumental', category: 'MUSIC' },
    ],
    formats: [
      { id: 'mini-concert', name: 'Mini Concert (On-Demand)', category: 'MUSIC', allowedScopes: ['mini'] },
      { id: 'world-concert', name: 'World Concert (Scheduled)', category: 'MUSIC', allowedScopes: ['world'] },
      { id: 'mini-release', name: 'Mini Release (Listening Party)', category: 'MUSIC', allowedScopes: ['mini'] },
      { id: 'world-release', name: 'World Release (Album Premiere)', category: 'MUSIC', allowedScopes: ['world'] },
      { id: 'mini-premiere', name: 'Mini Premiere (Video Screening)', category: 'MUSIC', allowedScopes: ['mini'] },
      { id: 'world-premiere', name: 'World Premiere (Global Broadcast)', category: 'MUSIC', allowedScopes: ['world'] },
      { id: 'music-festival', name: 'Multi-Stage Music Festival', category: 'MUSIC', allowedScopes: ['world'] },
    ],
  },

  SPEAKING: {
    category: 'SPEAKING',
    label: 'Conferences & Talks',
    description: 'Keynotes, panels, workshops, masterclasses, and conventions.',
    styles: [
      { id: 'keynote', name: 'Keynote Speech', category: 'SPEAKING' },
      { id: 'panel', name: 'Panel Discussion', category: 'SPEAKING' },
      { id: 'workshop-speaking', name: 'Hands-on Workshop', category: 'SPEAKING' },
      { id: 'lecture', name: 'Lecture / Masterclass', category: 'SPEAKING' },
      { id: 'interview', name: 'Interview / Fireside Chat', category: 'SPEAKING' },
      { id: 'creator-conference', name: 'Creator Convention', category: 'SPEAKING' },
    ],
    formats: [
      { id: 'hybrid-summit', name: 'Hybrid Global Summit', category: 'SPEAKING', allowedScopes: ['world'] },
      { id: 'fireside-stage', name: 'Fireside Stage', category: 'SPEAKING', allowedScopes: ['mini', 'world'] },
      { id: 'breakout-room', name: 'Breakout Session Room', category: 'SPEAKING', allowedScopes: ['mini', 'world'] },
    ],
  },

  COMPETITION: {
    category: 'COMPETITION',
    label: 'Battles & Cyphers',
    description: 'Head-to-head performance battles, gauntlets, and freestyle rotations.',
    styles: [
      { id: 'rap-battle', name: 'Rap Battle', category: 'COMPETITION' },
      { id: 'dance-battle', name: 'Dance Battle', category: 'COMPETITION' },
      { id: 'beat-battle', name: 'Beat Producer Battle', category: 'COMPETITION' },
      { id: 'singer-showdown', name: 'Vocal Showdown', category: 'COMPETITION' },
    ],
    formats: [
      { id: 'battle-1v1', name: '1v1 Match', category: 'COMPETITION', allowedScopes: ['mini', 'world'] },
      { id: 'battle-gauntlet', name: 'Gauntlet Ladder', category: 'COMPETITION', allowedScopes: ['mini', 'world'] },
      { id: 'cypher-circle', name: 'Freestyle Cypher', category: 'COMPETITION', allowedScopes: ['mini', 'world'] },
    ],
  },

  GAMING: {
    category: 'GAMING',
    label: 'Game Shows & Trivia',
    description: 'Live audience trivia, music knowledge contests, and interactive games.',
    styles: [
      { id: 'music-trivia', name: 'Music Trivia', category: 'GAMING' },
      { id: 'bracket-game', name: 'Live Bracket Challenge', category: 'GAMING' },
      { id: 'fan-gameshow', name: 'Fan Game Show', category: 'GAMING' },
    ],
    formats: [
      { id: 'interactive-stage', name: 'Interactive Game Stage', category: 'GAMING', allowedScopes: ['mini', 'world'] },
    ],
  },

  FESTIVAL: {
    category: 'FESTIVAL',
    label: 'Festivals & Multi-Stage',
    description: 'Unified multi-stage programs (Main Stage, Workshop Stage, Interview Lounge).',
    styles: [
      { id: 'multi-discipline-fest', name: 'Music & Dance Festival', category: 'FESTIVAL' },
      { id: 'creator-fest', name: 'Creator Convention', category: 'FESTIVAL' },
      { id: 'dance-convention', name: 'World Dance Showdown / Convention', category: 'FESTIVAL' },
    ],
    formats: [
      { id: 'multi-stage-world-event', name: 'Multi-Stage Hub Event', category: 'FESTIVAL', allowedScopes: ['world'] },
    ],
  },
};

/**
 * Resolve styles for a category, supporting extensible / organizer custom styles.
 */
export function getStylesForCategory(category: EventMasterCategory): EventStyleDefinition[] {
  return CANONICAL_EVENT_TAXONOMY[category]?.styles ?? [];
}

/**
 * Resolve formats for a category and scope.
 */
export function getFormatsForCategory(
  category: EventMasterCategory,
  scope?: 'mini' | 'world'
): EventFormatDefinition[] {
  const formats = CANONICAL_EVENT_TAXONOMY[category]?.formats ?? [];
  if (!scope) return formats;
  return formats.filter((f) => f.allowedScopes.includes(scope));
}
