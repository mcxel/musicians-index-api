/**
 * Host Look Evolution Engine
 * Visual style definitions — outfits, colors, hair, accessories, era-based FX per host.
 */

export interface HostLookProfile {
  hostId: string;
  outfitPack: string[];
  colorScheme: {
    primary: string;
    accent: string;
    glow: string;
  };
  hairStyle: string;
  accessoryPack: string[];
  specialEffects: string[];
  era: '80s-neon' | '90s-urban' | '2000s-sleek' | 'timeless';
}

export const HOST_LOOK_PROFILES: Record<string, HostLookProfile> = {
  'big-ace': {
    hostId: 'big-ace',
    outfitPack: ['outfit-bigace-gold-power-suit', 'outfit-bigace-allblack-authority', 'outfit-bigace-ceremonial-robe'],
    colorScheme: { primary: '#FFD700', accent: '#03020b', glow: '#FFD70088' },
    hairStyle: 'close-fade-gold-streaks',
    accessoryPack: ['accessory-overseer-ring', 'accessory-gold-chain-heavy', 'accessory-authority-watch'],
    specialEffects: ['fx-gold-aura-pulse', 'fx-crown-glow-orbit', 'fx-throne-light-beam'],
    era: 'timeless',
  },

  'bobby-stanley': {
    hostId: 'bobby-stanley',
    outfitPack: ['outfit-bobby-velvet-blazer-fuchsia', 'outfit-bobby-streetwear-90s', 'outfit-bobby-showman-white'],
    colorScheme: { primary: '#FF2DAA', accent: '#FFD700', glow: '#FF2DAA66' },
    hairStyle: 'hi-top-fade-sharp',
    accessoryPack: ['accessory-chain-gold', 'accessory-mic-stand-custom', 'accessory-diamond-pinky-ring'],
    specialEffects: ['fx-fuchsia-spotlight', 'fx-crowd-energy-trail', 'fx-golden-mic-glow'],
    era: '90s-urban',
  },

  'kira': {
    hostId: 'kira',
    outfitPack: ['outfit-kira-cyan-cropped-jacket', 'outfit-kira-neon-jumpsuit', 'outfit-kira-street-walkaround'],
    colorScheme: { primary: '#00FFFF', accent: '#FF2DAA', glow: '#00FFFF55' },
    hairStyle: 'braided-ponytail-with-cyan-tips',
    accessoryPack: ['accessory-roving-mic', 'accessory-earpiece', 'accessory-platform-sneakers'],
    specialEffects: ['fx-cyan-step-trail', 'fx-crowd-warmth-glow', 'fx-interview-spotlight'],
    era: '90s-urban',
  },

  'bebo': {
    hostId: 'bebo',
    outfitPack: ['outfit-bebo-vaudeville-neon', 'outfit-bebo-orange-showcoat', 'outfit-bebo-hook-patrol-suit'],
    colorScheme: { primary: '#FF9900', accent: '#FF2DAA', glow: '#FF990066' },
    hairStyle: 'slicked-back-with-part',
    accessoryPack: ['accessory-oversized-hook-cane', 'accessory-bow-tie-neon', 'accessory-top-hat-tipped'],
    specialEffects: ['fx-cane-spark-trail', 'fx-hook-warning-flash', 'fx-crowd-boo-meter-glow'],
    era: '80s-neon',
  },

  'jack-obrien': {
    hostId: 'jack-obrien',
    outfitPack: ['outfit-jack-fitted-cap-chain', 'outfit-jack-battle-wear', 'outfit-jack-judge-blazer'],
    colorScheme: { primary: '#c4b5fd', accent: '#FFD700', glow: '#c4b5fd44' },
    hairStyle: 'low-cut-with-shape-up',
    accessoryPack: ['accessory-fitted-cap', 'accessory-chain-silver', 'accessory-judge-notepad'],
    specialEffects: ['fx-purple-critique-glow', 'fx-dry-wit-text-pop', 'fx-judge-aura-subtle'],
    era: '90s-urban',
  },

  'hector-lvanos': {
    hostId: 'hector-lvanos',
    outfitPack: ['outfit-hector-old-school-leather', 'outfit-hector-historian-blazer', 'outfit-hector-golden-era-tracksuit'],
    colorScheme: { primary: '#00FF88', accent: '#c4b5fd', glow: '#00FF8844' },
    hairStyle: 'natural-locks-grey-streaks',
    accessoryPack: ['accessory-reading-glasses', 'accessory-boom-box-motif-pin', 'accessory-vintage-chain'],
    specialEffects: ['fx-green-authority-pulse', 'fx-history-book-glow', 'fx-golden-era-shimmer'],
    era: '80s-neon',
  },

  'mindy-jean-long': {
    hostId: 'mindy-jean-long',
    outfitPack: ['outfit-mindy-sequin-blazer', 'outfit-mindy-prize-podium-gown', 'outfit-mindy-crowd-connector-suit'],
    colorScheme: { primary: '#FF2DAA', accent: '#FFD700', glow: '#FF2DAA88' },
    hairStyle: 'voluminous-curls-with-highlights',
    accessoryPack: ['accessory-confetti-dispenser', 'accessory-prize-envelope', 'accessory-glitter-heels'],
    specialEffects: ['fx-confetti-burst', 'fx-winner-spotlight-gold', 'fx-sequin-shimmer-trail'],
    era: '90s-urban',
  },

  'julius': {
    hostId: 'julius',
    outfitPack: ['outfit-julius-loud-print-jacket', 'outfit-julius-magician-chaos', 'outfit-julius-wildcard-streetwear'],
    colorScheme: { primary: '#AA2DFF', accent: '#00FFFF', glow: '#AA2DFF66' },
    hairStyle: 'twisted-locs-purple-tips',
    accessoryPack: ['accessory-chaos-deck-cards', 'accessory-magician-wand', 'accessory-fx-earrings-glow'],
    specialEffects: ['fx-purple-chaos-spiral', 'fx-wildcard-flash', 'fx-julius-vanish-smoke'],
    era: '90s-urban',
  },

  'gregory-marcel': {
    hostId: 'gregory-marcel',
    outfitPack: ['outfit-gregory-southern-suit', 'outfit-gregory-fuchsia-tailored', 'outfit-gregory-show-commander'],
    colorScheme: { primary: '#FF2DAA', accent: '#FFD700', glow: '#FF2DAA55' },
    hairStyle: 'tapered-waves-clean',
    accessoryPack: ['accessory-gold-mic', 'accessory-dress-watch', 'accessory-pocket-square-fuchsia'],
    specialEffects: ['fx-fuchsia-crowd-pulse', 'fx-southern-charm-glow', 'fx-prize-aura'],
    era: '90s-urban',
  },

  'record-ralph': {
    hostId: 'record-ralph',
    outfitPack: ['outfit-ralph-neon-windbreaker', 'outfit-ralph-dj-set-fit', 'outfit-ralph-headphone-casual'],
    colorScheme: { primary: '#00FFFF', accent: '#FF2DAA', glow: '#00FFFF44' },
    hairStyle: 'fade-with-curl-top',
    accessoryPack: ['accessory-over-ear-headphones', 'accessory-record-bag', 'accessory-neon-wristbands'],
    specialEffects: ['fx-cyan-beat-pulse', 'fx-dj-waveform-trail', 'fx-bass-drop-shockwave'],
    era: '80s-neon',
  },

  'nova-mc': {
    hostId: 'nova-mc',
    outfitPack: ['outfit-nova-referee-jacket', 'outfit-nova-battle-ref-suit', 'outfit-nova-gold-mc-wear'],
    colorScheme: { primary: '#FFD700', accent: '#FF2DAA', glow: '#FFD70055' },
    hairStyle: 'short-crop-authoritative',
    accessoryPack: ['accessory-referee-whistle', 'accessory-gold-chain', 'accessory-battle-clipboard'],
    specialEffects: ['fx-gold-referee-ring', 'fx-round-start-flash', 'fx-winner-crown-burst'],
    era: 'timeless',
  },

  'aura-pa': {
    hostId: 'aura-pa',
    outfitPack: ['outfit-aura-clean-broadcast', 'outfit-aura-pa-neutral', 'outfit-aura-invisible-presence'],
    colorScheme: { primary: '#00FFFF', accent: '#c4b5fd', glow: '#00FFFF33' },
    hairStyle: 'pulled-back-professional',
    accessoryPack: ['accessory-broadcast-mic', 'accessory-earpiece-pro'],
    specialEffects: ['fx-cyan-voice-wave', 'fx-pa-announcement-ripple'],
    era: 'timeless',
  },
};

export function getLookProfile(hostId: string): HostLookProfile | undefined {
  return HOST_LOOK_PROFILES[hostId];
}
