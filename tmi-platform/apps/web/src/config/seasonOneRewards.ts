// Season 1 rewards config — dual-track: Fan cosmetics & Artist career
// Guitar 🎸 is the Season 1 instrument (SeasonPassInstrumentEngine: "guitar")

export type SeasonTrack = 'fan' | 'artist';

export type SeasonOneReward = {
  id: string;
  track: SeasonTrack;
  tier: number;          // XP tier required (1-5)
  xpRequired: number;
  icon: string;
  title: string;
  description: string;
  promotionCredits?: number; // artist track: livestream promo credit units
  isLimited: boolean;
};

export const SEASON_ONE_REWARDS: SeasonOneReward[] = [
  // ── FAN TRACK ──────────────────────────────────────────────────────────────
  {
    id: 'fan-t1-shades',
    track: 'fan',
    tier: 1,
    xpRequired: 100,
    icon: '🕶️',
    title: 'Neon Chico Shades',
    description: 'Iridescent cyan shades for your avatar — Season 1 Fan exclusive.',
    isLimited: true,
  },
  {
    id: 'fan-t2-action-icon',
    track: 'fan',
    tier: 2,
    xpRequired: 300,
    icon: '⚡',
    title: 'Stage Rush Action Icon',
    description: 'Animated lightning icon that fires when you react in a live room.',
    isLimited: false,
  },
  {
    id: 'fan-t3-companion',
    track: 'fan',
    tier: 3,
    xpRequired: 700,
    icon: '🤖',
    title: 'TMI Breathing Companion Bot',
    description: 'A personalised bot buddy that pulses on stage next to your seat.',
    isLimited: false,
  },
  {
    id: 'fan-t4-spin-emote',
    track: 'fan',
    tier: 4,
    xpRequired: 1500,
    icon: '💎',
    title: 'Lorenzo Diamond Spin Emote',
    description: 'Diamond spinning emote — fires a gold-and-cyan burst in chat.',
    isLimited: true,
  },

  // ── ARTIST TRACK ───────────────────────────────────────────────────────────
  {
    id: 'artist-t1-billboard',
    track: 'artist',
    tier: 1,
    xpRequired: 150,
    icon: '📋',
    title: '30-Min Billboard Promo Push',
    description: 'Your name appears on the Live World billboard for 30 continuous minutes.',
    promotionCredits: 30,
    isLimited: false,
  },
  {
    id: 'artist-t2-bandwidth',
    track: 'artist',
    tier: 2,
    xpRequired: 400,
    icon: '📡',
    title: 'HD WebRTC Bandwidth Key',
    description: 'Unlocks 1080p stream quality upgrade for your next 3 live sessions.',
    promotionCredits: 0,
    isLimited: false,
  },
  {
    id: 'artist-t3-liveworld',
    track: 'artist',
    tier: 3,
    xpRequired: 900,
    icon: '🌍',
    title: '2-Hour Live World Promo Burst',
    description: 'Featured placement in the Live World lobby for 2 hours — maximum visibility.',
    promotionCredits: 120,
    isLimited: false,
  },
  {
    id: 'artist-t4-magazine',
    track: 'artist',
    tier: 4,
    xpRequired: 2000,
    icon: '🎤',
    title: 'Monthly Magazine Feature',
    description: 'Full artist feature article on TMI Magazine — your story, your stage.',
    promotionCredits: 0,
    isLimited: true,
  },
];

export const SEASON_ONE_META = {
  seasonId: 's1',
  seasonNumber: 1,
  seasonName: 'The Rise',
  instrument: 'guitar' as const,
  instrumentEmoji: '🎸',
  primaryColor: '#AA2DFF',
  accentColor: '#FFD700',
  startDate: '2026-04-01',
  endDate: '2027-03-31',
  maxTier: 5,
  xpForMaxTier: 5000,
};
