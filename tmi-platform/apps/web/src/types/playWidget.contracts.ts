export type EmoteType = 
  | 'clap' | 'star' | 'heart' | 'fire' | 'rocket' | 'trophy' 
  | 'diamond' | 'crown' | 'lightning' | 'boom' | 'sparkles';

export type UserTier = 'FREE' | 'PREMIUM' | 'VIP' | 'SPONSOR' | 'OVERSEER';

export type DockPosition = 'bottom' | 'left' | 'right' | 'top' | 'floating';

export const DEFAULT_EMOTE_CATALOG: Record<EmoteType, { icon: string; name: string }> = {
  clap: { icon: '👏', name: 'Clap' },
  star: { icon: '⭐', name: 'Star' },
  heart: { icon: '❤️', name: 'Heart' },
  fire: { icon: '🔥', name: 'Fire' },
  rocket: { icon: '🚀', name: 'Rocket' },
  trophy: { icon: '🏆', name: 'Trophy' },
  diamond: { icon: '💎', name: 'Diamond' },
  crown: { icon: '👑', name: 'Crown' },
  lightning: { icon: '⚡', name: 'Lightning' },
  boom: { icon: '💥', name: 'Boom' },
  sparkles: { icon: '✨', name: 'Sparkles' },
};
