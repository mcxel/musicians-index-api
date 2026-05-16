/**
 * Host Identity Registry
 * Central registry for all TMI platform hosts — identity, assignments, voice/motion tags.
 */
import type { HostRole } from './hostEngine';

export interface HostIdentity {
  id: string;
  name: string;
  shortName: string;
  role: HostRole;
  colorHex: string;
  accentColorHex: string;
  description: string;
  showAssignments: string[];
  voiceTag: string;
  motionTag: string;
  eraStyle: string;
}

export const HOST_IDENTITY_REGISTRY: HostIdentity[] = [
  {
    id: 'big-ace',
    name: 'Big Ace',
    shortName: 'Big Ace',
    role: 'MAIN_HOST',
    colorHex: '#FFD700',
    accentColorHex: '#03020b',
    description: 'The silent supreme authority — operates the admin/overseer deck and commands every show from above.',
    showAssignments: ['monthly-idol', 'monday-night-stage', 'deal-or-feud', 'name-that-tune', 'circle-squares', 'cypher-arena'],
    voiceTag: 'deep-authority-v1',
    motionTag: 'overseer-stance',
    eraStyle: 'timeless — classic power suit, gold accents',
  },
  {
    id: 'bobby-stanley',
    name: 'Bobby Stanley',
    shortName: 'Bobby',
    role: 'MAIN_HOST',
    colorHex: '#FF2DAA',
    accentColorHex: '#FFD700',
    description: 'Smooth veteran MC who commands any room with equal parts charm and authority — the crowd never loses interest when Bobby speaks.',
    showAssignments: ['monday-night-stage'],
    voiceTag: 'smooth-veteran-v1',
    motionTag: 'commander-strut',
    eraStyle: '90s-urban — sharp blazer, high-top fade, mic in hand',
  },
  {
    id: 'kira',
    name: 'Kira',
    shortName: 'Kira',
    role: 'CO_HOST',
    colorHex: '#00FFFF',
    accentColorHex: '#FF2DAA',
    description: 'Walkaround interviewer who keeps energy alive between acts — warm, quick, the crowd\'s best friend.',
    showAssignments: ['monday-night-stage'],
    voiceTag: 'warm-walkaround-v1',
    motionTag: 'kira-walkaround',
    eraStyle: '90s-neon — cropped jacket, platform sneakers, roving mic',
  },
  {
    id: 'bebo',
    name: 'Bebo',
    shortName: 'Bebo',
    role: 'CO_HOST',
    colorHex: '#FF9900',
    accentColorHex: '#FF2DAA',
    description: 'Physical comedy co-host armed with the legendary hook/cane — yanks bad acts without hesitation, applauds exceptional ones.',
    showAssignments: ['monday-night-stage'],
    voiceTag: 'slapstick-comic-v1',
    motionTag: 'bebo-hook-patrol',
    eraStyle: '80s-neon — vaudeville coat with neon trim, oversized cane prop',
  },
  {
    id: 'jack-obrien',
    name: 'Jack O\'Brien',
    shortName: 'Jack',
    role: 'CYPHER_JUDGE',
    colorHex: '#c4b5fd',
    accentColorHex: '#FFD700',
    description: 'Sharp-witted battle rap veteran whose dry commentary cuts deeper than any punchline.',
    showAssignments: ['cypher-arena'],
    voiceTag: 'sharp-critic-v1',
    motionTag: 'judge-lean',
    eraStyle: '90s-urban — fitted cap, chain, judge\'s notepad always in hand',
  },
  {
    id: 'hector-lvanos',
    name: 'Hector Lvanos',
    shortName: 'Hector',
    role: 'CYPHER_JUDGE',
    colorHex: '#00FF88',
    accentColorHex: '#c4b5fd',
    description: 'Deep hip-hop historian whose authoritative verdicts trace back to every golden era — when Hector speaks, the room goes silent.',
    showAssignments: ['cypher-arena'],
    voiceTag: 'authoritative-historian-v1',
    motionTag: 'judge-deliberate',
    eraStyle: '80s-neon — old-school leather, boom-box motif, reading glasses always on',
  },
  {
    id: 'mindy-jean-long',
    name: 'Mindy Jean Long',
    shortName: 'Mindy',
    role: 'PRIZE_HOST',
    colorHex: '#FF2DAA',
    accentColorHex: '#FFD700',
    description: 'Bubbly prize reveal specialist who transforms every winner announcement into a crowd connection moment.',
    showAssignments: ['monthly-idol'],
    voiceTag: 'bubbly-prize-v1',
    motionTag: 'prize-flourish',
    eraStyle: '90s-urban — sequin blazer, prize-podium energy, always smiling',
  },
  {
    id: 'julius',
    name: 'Julius',
    shortName: 'Julius',
    role: 'CO_HOST',
    colorHex: '#AA2DFF',
    accentColorHex: '#00FFFF',
    description: 'Wild-card co-host with roast-ready instincts, battle-ref energy, and an unpredictable crowd troll streak.',
    showAssignments: ['cypher-arena', 'monday-night-stage'],
    voiceTag: 'cheeky-magician-v1',
    motionTag: 'pop-lock-chaos',
    eraStyle: '90s-neon — loud prints, magician aesthetic, always in motion',
  },
  {
    id: 'gregory-marcel',
    name: 'Gregory Marcel',
    shortName: 'Marcel',
    role: 'MAIN_HOST',
    colorHex: '#FF2DAA',
    accentColorHex: '#FFD700',
    description: 'Smooth southern MC with crowd-first story-driven energy and an instinct for prize moments.',
    showAssignments: ['monday-night-stage', 'monthly-idol'],
    voiceTag: 'smooth-alabama-v1',
    motionTag: 'two-step-hype',
    eraStyle: '90s-urban — tailored suit, southern flair, always crowd-facing',
  },
  {
    id: 'record-ralph',
    name: 'Record Ralph',
    shortName: 'Ralph',
    role: 'CROWD_HYPE',
    colorHex: '#00FFFF',
    accentColorHex: '#FF2DAA',
    description: 'High-BPM DJ hype man with beat-drop intuition and a sixth sense for crowd energy peaks.',
    showAssignments: ['monday-night-stage', 'cypher-arena'],
    voiceTag: 'florida-cool-v1',
    motionTag: 'dj-bounce-full',
    eraStyle: '80s-neon — headphones, neon windbreaker, always behind the decks',
  },
  {
    id: 'nova-mc',
    name: 'Nova MC',
    shortName: 'Nova',
    role: 'BATTLE_REF',
    colorHex: '#FFD700',
    accentColorHex: '#FF2DAA',
    description: 'No-nonsense referee who enforces every rule with fairness and translates crowd energy into official calls.',
    showAssignments: ['cypher-arena', 'monday-night-stage'],
    voiceTag: 'sharp-ref-v1',
    motionTag: 'battle-stance',
    eraStyle: 'timeless — referee jacket, whistle, battle-ready at all times',
  },
  {
    id: 'aura-pa',
    name: 'Aura',
    shortName: 'Aura',
    role: 'PA_ANNOUNCER',
    colorHex: '#00FFFF',
    accentColorHex: '#c4b5fd',
    description: 'The clear and trustworthy PA voice of TMI — official, crowd-friendly, and always on time.',
    showAssignments: ['monday-night-stage', 'cypher-arena', 'monthly-idol', 'deal-or-feud', 'name-that-tune', 'circle-squares'],
    voiceTag: 'smooth-pa-v1',
    motionTag: 'announcer-stand',
    eraStyle: 'timeless — clean broadcaster aesthetic, invisible presence, pure voice',
  },
];

export function getHostById(id: string): HostIdentity | undefined {
  return HOST_IDENTITY_REGISTRY.find((h) => h.id === id);
}

export function getHostsForShow(showId: string): HostIdentity[] {
  return HOST_IDENTITY_REGISTRY.filter((h) => h.showAssignments.includes(showId));
}
