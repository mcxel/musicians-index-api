export interface GenreConfigEntry {
  name: string;
  emoji: string;
  accent: string;
  bg: string;
  tagline: string;
}

export const GENRE_CONFIG: Record<string, GenreConfigEntry> = {
  'hip-hop':  { name: 'Hip-Hop',  emoji: '🎤', accent: '#FF2DAA', bg: '#0a0010', tagline: 'The culture lives here' },
  'rnb':      { name: 'R&B',      emoji: '🎷', accent: '#AA2DFF', bg: '#08000f', tagline: 'Feel every note' },
  'rap':      { name: 'Rap',      emoji: '🔥', accent: '#FFD700', bg: '#0f0a00', tagline: 'Bars on bars' },
  'edm':      { name: 'EDM',      emoji: '⚡', accent: '#00FFFF', bg: '#000f10', tagline: 'Drop the frequency' },
  'gospel':   { name: 'Gospel',   emoji: '✨', accent: '#FFD700', bg: '#0a0800', tagline: 'Lift every voice' },
  'jazz':     { name: 'Jazz',     emoji: '🎺', accent: '#FF6B35', bg: '#0f0700', tagline: 'Improvise. Elevate.' },
  'pop':      { name: 'Pop',      emoji: '🌟', accent: '#FF2DAA', bg: '#0a000a', tagline: 'Chart-toppers only' },
  'soul':     { name: 'Soul',     emoji: '🎸', accent: '#AA2DFF', bg: '#06000d', tagline: 'Raw. Real. Resonant.' },
  'cypher':   { name: 'Cypher',   emoji: '🎯', accent: '#00FFFF', bg: '#000a10', tagline: 'Step in the circle' },
  'open-mic': { name: 'Open Mic', emoji: '🎭', accent: '#00FF88', bg: '#000f08', tagline: 'Your stage, your story' },
};
