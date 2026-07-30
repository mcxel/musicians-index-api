/**
 * Presence Frame Registry — Decouples Content from Presentation Frame.
 * Content = Photo / Video / Motion / Identity
 * Frame = Shell, Bezel, Glass, Glow, Nameplate, Sponsor Skin
 */

export type UnlockMethod =
  | 'FREE'
  | 'PURCHASE'
  | 'MEMBERSHIP'
  | 'SEASON_PASS'
  | 'ACHIEVEMENT'
  | 'EVENT_REWARD'
  | 'SPONSOR_GIFT'
  | 'LIMITED_TIME';

export type SkinTarget =
  | 'LOUNGE_FRAME'
  | 'VENUE'
  | 'STAGE'
  | 'DJ_BOOTH'
  | 'MONITOR'
  | 'SEAT'
  | 'AVATAR_OUTFIT'
  | 'AVATAR_PROP'
  | 'SPONSOR_RAIL'
  | 'CONTROL_PANEL';

export interface PresenceFrameSkin {
  id: string;
  name: string;
  description: string;
  targets: SkinTarget[];
  bezelStyle: 'OBSIDIAN' | 'CHROME_GOLD' | 'NEON_VIOLET' | 'DIAMOND_GLASS' | 'RETRO_TV' | 'BOOMBOX' | 'HOLOGRAM_POD';
  outerColor: string;
  glowColor: string;
  tallyLightColor: string;
  unlockMethod: UnlockMethod;
  priceUsd?: number;
  seasonPassTier?: number;
  sponsorName?: string;
  isCustomizable: boolean;
}

export const DEFAULT_PRESENCE_FRAMES: PresenceFrameSkin[] = [
  {
    id: 'frame-obsidian-free',
    name: 'Obsidian Matte',
    description: 'Clean, neutral dark glass frame for stealth presence.',
    targets: ['LOUNGE_FRAME', 'MONITOR'],
    bezelStyle: 'OBSIDIAN',
    outerColor: '#12131A',
    glowColor: 'rgba(255, 255, 255, 0.1)',
    tallyLightColor: '#00FF88',
    unlockMethod: 'FREE',
    isCustomizable: true,
  },
  {
    id: 'frame-neon-violet',
    name: 'Neon Cyberpunk',
    description: 'Vibrant neon purple bezel with pulse light synchronization.',
    targets: ['LOUNGE_FRAME', 'VENUE', 'MONITOR'],
    bezelStyle: 'NEON_VIOLET',
    outerColor: '#2D0A3D',
    glowColor: '#FF00FF',
    tallyLightColor: '#00FFFF',
    unlockMethod: 'PURCHASE',
    priceUsd: 4.99,
    isCustomizable: true,
  },
  {
    id: 'frame-chrome-gold',
    name: '24K VIP Gold',
    description: 'Ultra-luxurious polished gold bezel with diamond corner studs.',
    targets: ['LOUNGE_FRAME', 'STAGE', 'SEAT'],
    bezelStyle: 'CHROME_GOLD',
    outerColor: '#3A2E00',
    glowColor: '#FFD700',
    tallyLightColor: '#FFD700',
    unlockMethod: 'MEMBERSHIP',
    isCustomizable: true,
  },
  {
    id: 'frame-retro-tv',
    name: 'Vintage CRT 1980',
    description: 'Classic cathode-ray tube television display box with scanlines.',
    targets: ['LOUNGE_FRAME', 'MONITOR'],
    bezelStyle: 'RETRO_TV',
    outerColor: '#2A1F18',
    glowColor: '#00FF88',
    tallyLightColor: '#FF3333',
    unlockMethod: 'SEASON_PASS',
    seasonPassTier: 15,
    isCustomizable: false,
  },
];

export function getPresenceFrameById(id: string): PresenceFrameSkin {
  return DEFAULT_PRESENCE_FRAMES.find((f) => f.id === id) || DEFAULT_PRESENCE_FRAMES[0];
}
