/**
 * Host Personality Engine
 * Defines personality matrices, catchphrase pools, and emotional state tracking per host.
 */

export type EmotionalState =
  | 'neutral'
  | 'hyped'
  | 'amused'
  | 'authoritative'
  | 'playful'
  | 'serious'
  | 'triumphant';

export interface HostPersonalityMatrix {
  hostId: string;
  energyLevel: number; // 1–10
  humorStyle: 'dry' | 'slapstick' | 'roast' | 'warm' | 'hype' | 'authoritative';
  crowdReadSpeed: 'fast' | 'medium' | 'slow';
  improvisationRating: number; // 1–10
  catchphrasePool: string[];
  emotionalStates: EmotionalState[];
}

export const HOST_PERSONALITY_MAP: Record<string, HostPersonalityMatrix> = {
  'big-ace': {
    hostId: 'big-ace',
    energyLevel: 10,
    humorStyle: 'authoritative',
    crowdReadSpeed: 'slow',
    improvisationRating: 8,
    catchphrasePool: [
      'The verdict is final.',
      'This platform doesn\'t miss.',
      'I don\'t repeat myself.',
      'Everything runs through me.',
      'The stage is mine to give.',
    ],
    emotionalStates: ['neutral', 'authoritative', 'triumphant'],
  },

  'bobby-stanley': {
    hostId: 'bobby-stanley',
    energyLevel: 9,
    humorStyle: 'roast',
    crowdReadSpeed: 'fast',
    improvisationRating: 9,
    catchphrasePool: [
      'Somebody\'s about to be famous tonight!',
      'Monday Night — ain\'t no better night.',
      'Bobby Stanley is in the building!',
      'The stage don\'t lie — let\'s see what you got.',
      'That\'s showbiz, baby!',
    ],
    emotionalStates: ['hyped', 'amused', 'triumphant', 'playful'],
  },

  'kira': {
    hostId: 'kira',
    energyLevel: 8,
    humorStyle: 'warm',
    crowdReadSpeed: 'fast',
    improvisationRating: 9,
    catchphrasePool: [
      'I\'m right here with you — let\'s talk about it.',
      'The crowd has SPOKEN.',
      'Kira on the floor — who\'s got something to say?',
      'Every face in this room matters to me.',
    ],
    emotionalStates: ['neutral', 'hyped', 'playful', 'amused'],
  },

  'bebo': {
    hostId: 'bebo',
    energyLevel: 10,
    humorStyle: 'slapstick',
    crowdReadSpeed: 'fast',
    improvisationRating: 7,
    catchphrasePool: [
      'HOOK EM!',
      'The cane doesn\'t lie!',
      'Boo me once, shame on you. Boo me twice — HOOK!',
      'The crowd wants you gone, and so does my cane.',
      'Redemption arc? Let\'s see it!',
    ],
    emotionalStates: ['amused', 'playful', 'hyped', 'neutral'],
  },

  'jack-obrien': {
    hostId: 'jack-obrien',
    energyLevel: 7,
    humorStyle: 'dry',
    crowdReadSpeed: 'medium',
    improvisationRating: 10,
    catchphrasePool: [
      'That bar was mid at best.',
      'Technically proficient, spiritually absent.',
      'I\'ve heard better on the subway.',
      'Don\'t look at me like that — you know what you did.',
      'The craft is there. The hunger? Questionable.',
    ],
    emotionalStates: ['neutral', 'amused', 'serious', 'authoritative'],
  },

  'hector-lvanos': {
    hostId: 'hector-lvanos',
    energyLevel: 6,
    humorStyle: 'authoritative',
    crowdReadSpeed: 'slow',
    improvisationRating: 8,
    catchphrasePool: [
      'Hip-hop was built on respect. Show some.',
      'I\'ve watched legends come and go. This? This is a start.',
      'Every syllable is a decision — own yours.',
      'The culture is watching.',
      'That\'s the kind of line that echoes.',
    ],
    emotionalStates: ['authoritative', 'serious', 'neutral', 'triumphant'],
  },

  'mindy-jean-long': {
    hostId: 'mindy-jean-long',
    energyLevel: 10,
    humorStyle: 'hype',
    crowdReadSpeed: 'fast',
    improvisationRating: 7,
    catchphrasePool: [
      'And the prize goes TO…!',
      'Somebody is about to have the best day of their LIFE!',
      'Mindy Jean Long, bringing you the moment!',
      'The reveal you\'ve been waiting for — right now!',
      'Darling, you just WON!',
    ],
    emotionalStates: ['hyped', 'triumphant', 'playful', 'amused'],
  },

  'julius': {
    hostId: 'julius',
    energyLevel: 9,
    humorStyle: 'roast',
    crowdReadSpeed: 'fast',
    improvisationRating: 10,
    catchphrasePool: [
      'Julius said what Julius said.',
      'Did I do that? Yes. Yes I did.',
      'Chaos is just energy with no directions.',
      'The ref doesn\'t pick sides — but Julius does.',
      'Wild card? No — I\'m the whole deck.',
    ],
    emotionalStates: ['amused', 'playful', 'hyped', 'neutral'],
  },
};

export function getHostPersonality(hostId: string): HostPersonalityMatrix | undefined {
  return HOST_PERSONALITY_MAP[hostId];
}

export function getRandomCatchphrase(hostId: string): string {
  const matrix = HOST_PERSONALITY_MAP[hostId];
  if (!matrix || matrix.catchphrasePool.length === 0) return '';
  const idx = Math.floor(Math.random() * matrix.catchphrasePool.length);
  return matrix.catchphrasePool[idx];
}
