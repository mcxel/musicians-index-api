export type FanTier = 'free' | 'pro' | 'ruby' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface RetroVisionBackdrop {
  id: string;
  name: string;
  category: 'classic' | 'surreal' | 'artist' | 'seasonal';
  tier: FanTier;
  description: string;
  gradient: string;
  accent: string;
  border: string;
  motion: boolean;
}

const TIER_ORDER: FanTier[] = ['free', 'pro', 'ruby', 'silver', 'gold', 'platinum', 'diamond'];

export const RETRO_VISION_BACKDROPS: RetroVisionBackdrop[] = [
  {
    id: 'soft-clouds',
    name: 'Soft Clouds',
    category: 'classic',
    tier: 'free',
    description: 'One Hour Photo nostalgia with airy clouds and soft light.',
    gradient: 'radial-gradient(circle at 20% 15%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 42%), linear-gradient(160deg, #dbeafe 0%, #c7d2fe 45%, #93c5fd 100%)',
    accent: '#00E5FF',
    border: 'rgba(0,229,255,0.35)',
    motion: false,
  },
  {
    id: 'marble-pillar',
    name: 'Floating Marble Pillar',
    category: 'classic',
    tier: 'free',
    description: 'Studio portrait polish with marble, glass, and gold highlights.',
    gradient: 'radial-gradient(circle at 70% 22%, rgba(255,215,0,0.22) 0%, rgba(255,215,0,0) 38%), linear-gradient(155deg, #ede9fe 0%, #d8b4fe 48%, #c4b5fd 100%)',
    accent: '#FFD700',
    border: 'rgba(255,215,0,0.35)',
    motion: false,
  },
  {
    id: 'pastel-swirl',
    name: 'Abstract Pastel Swirl',
    category: 'classic',
    tier: 'pro',
    description: 'Dreamy pastel curvature with a soft retro finish.',
    gradient: 'radial-gradient(circle at 22% 25%, rgba(255,45,170,0.22) 0%, rgba(255,45,170,0) 35%), radial-gradient(circle at 75% 65%, rgba(0,255,255,0.22) 0%, rgba(0,255,255,0) 36%), linear-gradient(150deg, #fde68a 0%, #fbcfe8 50%, #c4b5fd 100%)',
    accent: '#FF2DAA',
    border: 'rgba(255,45,170,0.35)',
    motion: false,
  },
  {
    id: 'vinyl-throne',
    name: 'Giant Vinyl Throne',
    category: 'surreal',
    tier: 'ruby',
    description: 'Surreal pop backdrop for bold collectors and superfans.',
    gradient: 'radial-gradient(circle at 50% 35%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 25%), linear-gradient(160deg, #111827 0%, #312e81 45%, #4c1d95 100%)',
    accent: '#AA2DFF',
    border: 'rgba(170,45,255,0.35)',
    motion: true,
  },
  {
    id: 'walking-sky',
    name: 'Walking in the Sky',
    category: 'surreal',
    tier: 'silver',
    description: 'Dreamscape composition with clouds and horizon glow.',
    gradient: 'radial-gradient(circle at 25% 18%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 30%), linear-gradient(155deg, #e0f2fe 0%, #bae6fd 46%, #7dd3fc 100%)',
    accent: '#00FFFF',
    border: 'rgba(0,255,255,0.35)',
    motion: true,
  },
  {
    id: 'artist-stage',
    name: 'Artist Stage',
    category: 'artist',
    tier: 'gold',
    description: 'Favorite performer stage backdrop for fan tribute images.',
    gradient: 'radial-gradient(circle at 50% 10%, rgba(255,45,170,0.2) 0%, rgba(255,45,170,0) 34%), linear-gradient(160deg, #050510 0%, #111827 45%, #1f2937 100%)',
    accent: '#FF2DAA',
    border: 'rgba(255,45,170,0.35)',
    motion: true,
  },
  {
    id: 'award-red-carpet',
    name: 'Red Carpet Awards',
    category: 'seasonal',
    tier: 'platinum',
    description: 'Seasonal event backdrop with spotlight and trophy energy.',
    gradient: 'radial-gradient(circle at 80% 16%, rgba(255,215,0,0.28) 0%, rgba(255,215,0,0) 28%), linear-gradient(155deg, #111827 0%, #7f1d1d 45%, #111827 100%)',
    accent: '#FFD700',
    border: 'rgba(255,215,0,0.35)',
    motion: true,
  },
  {
    id: 'holiday-glow',
    name: 'Holiday Glow',
    category: 'seasonal',
    tier: 'diamond',
    description: 'Animated holiday backdrop for premium motion exports.',
    gradient: 'radial-gradient(circle at 20% 20%, rgba(34,197,94,0.22) 0%, rgba(34,197,94,0) 30%), radial-gradient(circle at 78% 72%, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0) 30%), linear-gradient(155deg, #020617 0%, #0f172a 48%, #111827 100%)',
    accent: '#22C55E',
    border: 'rgba(34,197,94,0.35)',
    motion: true,
  },
];

export function canUseRetroVisionBackdrop(tier: FanTier, backdropTier: FanTier): boolean {
  return TIER_ORDER.indexOf(tier) >= TIER_ORDER.indexOf(backdropTier);
}

export function getAccessibleRetroVisionBackdrops(tier: FanTier): RetroVisionBackdrop[] {
  return RETRO_VISION_BACKDROPS.filter((backdrop) => canUseRetroVisionBackdrop(tier, backdrop.tier));
}

export function getDefaultRetroVisionBackdrop(tier: FanTier): RetroVisionBackdrop {
  return getAccessibleRetroVisionBackdrops(tier)[0] ?? RETRO_VISION_BACKDROPS[0]!;
}