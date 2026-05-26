export type EmoteType = 
  | 'clap' | 'star' | 'heart' | 'fire' | 'rocket' | 'trophy' 
  | 'diamond' | 'crown' | 'lightning' | 'boom' | 'sparkles';

export type UserTier = 'FREE' | 'PREMIUM' | 'VIP' | 'SPONSOR' | 'OVERSEER';

export type DockPosition = 'bottom' | 'left' | 'right' | 'top' | 'floating';

export const DEFAULT_EMOTE_CATALOG: Record<EmoteType, { iconId: string; name: string; color: string }> = {
  clap: { iconId: 'activity', name: 'Applaud', color: '#00FFFF' },      // Neon Cyan waveform/activity
  star: { iconId: 'star', name: 'Highlight', color: '#FFD700' },        // Sharp, unfilled star
  heart: { iconId: 'heart-pulse', name: 'Resonate', color: '#FF2DAA' }, // Electric Pink pulse
  fire: { iconId: 'flame', name: 'Energy', color: '#FF2DAA' },          // Sleek flame
  rocket: { iconId: 'zap', name: 'Boost', color: '#00FFFF' },           // Zap/Lightning instead of rocket
  trophy: { iconId: 'award', name: 'Champion', color: '#FFD700' },      // Minimalist cup
  diamond: { iconId: 'gem', name: 'Diamond', color: '#00FFFF' },        // Geometric gem
  crown: { iconId: 'crown', name: 'Crown', color: '#FFD700' },          // Sharp points crown
  lightning: { iconId: 'zap', name: 'Surge', color: '#00FF88' },        // Neon green surge
  boom: { iconId: 'radio', name: 'Impact', color: '#FF2DAA' },          // Radio wave burst
  sparkles: { iconId: 'sparkles', name: 'Aura', color: '#00FFFF' },     // Clean vector sparkles
};
