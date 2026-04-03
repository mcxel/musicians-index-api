import type { LightMode } from '@/lib/lighting/lightingEngine';

export type StageLayout = 'center' | 'raised' | 'runway' | 'circle' | 'corner' | 'none';
export type CrowdLayout = 'theater' | 'standing' | 'circle' | 'scattered' | 'pit' | 'none';
export type SponsorPlacement = 'top' | 'sides' | 'backdrop' | 'floor' | 'none';

export interface VenueColorPalette {
  primary: string;
  accent: string;
  floor: string;
  crowd: string;
  ui: string;
  glow: string;
  text: string;
}

export interface VenueSkin {
  id: string;
  name: string;
  description: string;
  backgroundImage: string;   // path under /venue-skins/[id]/background.png
  colorPalette: VenueColorPalette;
  lightingPreset: LightMode;
  stageLayout: StageLayout;
  crowdLayout: CrowdLayout;
  sponsorWallPlacement: SponsorPlacement;
  cameraAngles: string[];
  particleEffects: string[];
  floorPattern: string;
  ambientSound?: string;
  tags: string[];
}

export const VENUE_SKINS: Record<string, VenueSkin> = {
  'neon-club': {
    id: 'neon-club',
    name: 'Neon Club',
    description: 'Underground club with pulsing neon grid floors and cyan/pink strobes',
    backgroundImage: '/venue-skins/neon-club/background.png',
    colorPalette: {
      primary: '#00FFFF',
      accent: '#FF2DAA',
      floor: '#0A001A',
      crowd: '#1A0033',
      ui: '#00FFFF',
      glow: '#FF2DAA',
      text: '#FFFFFF',
    },
    lightingPreset: 'DANCE',
    stageLayout: 'raised',
    crowdLayout: 'standing',
    sponsorWallPlacement: 'sides',
    cameraAngles: ['front-wide', 'stage-left', 'crowd-reverse', 'overhead'],
    particleEffects: ['confetti', 'laser-beams', 'smoke'],
    floorPattern: 'neon-grid',
    ambientSound: 'club-ambient',
    tags: ['dance', 'club', 'neon', '18+'],
  },

  'red-theater': {
    id: 'red-theater',
    name: 'Red Theater',
    description: 'Classic crimson velvet theater with raised stage and tiered seating',
    backgroundImage: '/venue-skins/red-theater/background.png',
    colorPalette: {
      primary: '#CC0000',
      accent: '#FFD700',
      floor: '#1A0000',
      crowd: '#2A0000',
      ui: '#FFD700',
      glow: '#FF4444',
      text: '#FFF5E0',
    },
    lightingPreset: 'INTRO',
    stageLayout: 'raised',
    crowdLayout: 'theater',
    sponsorWallPlacement: 'backdrop',
    cameraAngles: ['front-wide', 'balcony', 'stage-left', 'stage-right'],
    particleEffects: ['spotlight-dust', 'curtain-drop'],
    floorPattern: 'velvet-aisle',
    ambientSound: 'theater-ambient',
    tags: ['theater', 'formal', 'performance'],
  },

  'festival': {
    id: 'festival',
    name: 'Outdoor Festival',
    description: 'Massive outdoor festival stage with crowd pits and giant screens',
    backgroundImage: '/venue-skins/festival/background.png',
    colorPalette: {
      primary: '#FF9500',
      accent: '#00FF88',
      floor: '#1A1A00',
      crowd: '#0A0A00',
      ui: '#FF9500',
      glow: '#FFD700',
      text: '#FFFFFF',
    },
    lightingPreset: 'LIVE',
    stageLayout: 'runway',
    crowdLayout: 'pit',
    sponsorWallPlacement: 'top',
    cameraAngles: ['helicopter', 'front-wide', 'crowd-aerial', 'pit-cam', 'stage-cam'],
    particleEffects: ['confetti', 'fireworks', 'crowd-glow', 'smoke-cannons'],
    floorPattern: 'grass',
    ambientSound: 'crowd-roar',
    tags: ['festival', 'outdoor', 'concert', 'massive'],
  },

  'warehouse': {
    id: 'warehouse',
    name: 'Warehouse Cypher',
    description: 'Raw concrete warehouse with flood lights and circle battle setup',
    backgroundImage: '/venue-skins/warehouse/background.png',
    colorPalette: {
      primary: '#FFFFFF',
      accent: '#FF2200',
      floor: '#111111',
      crowd: '#0A0A0A',
      ui: '#FFFFFF',
      glow: '#FF2200',
      text: '#FFFFFF',
    },
    lightingPreset: 'BATTLE',
    stageLayout: 'circle',
    crowdLayout: 'circle',
    sponsorWallPlacement: 'sides',
    cameraAngles: ['circle-overhead', 'ground-level', 'crowd-fisheye'],
    particleEffects: ['dust-particles', 'steam'],
    floorPattern: 'concrete-cracked',
    ambientSound: 'warehouse-ambient',
    tags: ['cypher', 'battle', 'raw', 'underground'],
  },

  'underground-battle': {
    id: 'underground-battle',
    name: 'Underground Battle Arena',
    description: 'Dark minimal basement arena, two spotlights face-off, no mercy',
    backgroundImage: '/venue-skins/underground-battle/background.png',
    colorPalette: {
      primary: '#AA2DFF',
      accent: '#FF2DAA',
      floor: '#050505',
      crowd: '#080808',
      ui: '#AA2DFF',
      glow: '#FF2DAA',
      text: '#CCCCCC',
    },
    lightingPreset: 'BATTLE',
    stageLayout: 'none',
    crowdLayout: 'circle',
    sponsorWallPlacement: 'none',
    cameraAngles: ['two-shot', 'left-profile', 'right-profile', 'overhead-down'],
    particleEffects: ['smoke', 'purple-haze'],
    floorPattern: 'bare-concrete',
    ambientSound: 'underground-bass',
    tags: ['battle', 'underground', 'dark', 'intense'],
  },

  'luxury-lounge': {
    id: 'luxury-lounge',
    name: 'Luxury Lounge',
    description: 'Gold and black intimate lounge for top-tier VIP performances',
    backgroundImage: '/venue-skins/luxury-lounge/background.png',
    colorPalette: {
      primary: '#FFD700',
      accent: '#C0A020',
      floor: '#0A0800',
      crowd: '#1A1200',
      ui: '#FFD700',
      glow: '#FFA500',
      text: '#FFF5CC',
    },
    lightingPreset: 'IDLE',
    stageLayout: 'corner',
    crowdLayout: 'scattered',
    sponsorWallPlacement: 'backdrop',
    cameraAngles: ['intimate-close', 'wide-lounge', 'overhead-soft'],
    particleEffects: ['gold-sparkle', 'ambient-smoke'],
    floorPattern: 'marble-gold',
    ambientSound: 'lounge-jazz',
    tags: ['vip', 'luxury', 'intimate', 'gold'],
  },

  'beach': {
    id: 'beach',
    name: 'Beach Stage',
    description: 'Sunset ocean shore stage with shimmering water reflections',
    backgroundImage: '/venue-skins/beach/background.png',
    colorPalette: {
      primary: '#FF6B00',
      accent: '#00CFFF',
      floor: '#C8A060',
      crowd: '#D4B070',
      ui: '#FF6B00',
      glow: '#FFB300',
      text: '#FFFFFF',
    },
    lightingPreset: 'LIVE',
    stageLayout: 'raised',
    crowdLayout: 'standing',
    sponsorWallPlacement: 'sides',
    cameraAngles: ['ocean-wide', 'sunset-angle', 'crowd-pull-back', 'drone-fly'],
    particleEffects: ['ocean-spray', 'sunset-rays', 'fireflies'],
    floorPattern: 'sand',
    ambientSound: 'waves',
    tags: ['beach', 'outdoor', 'summer', 'chill'],
  },

  'street-corner': {
    id: 'street-corner',
    name: 'Street Corner Cypher',
    description: 'Urban night, single streetlight, pavement cracks, pure cipher energy',
    backgroundImage: '/venue-skins/street-corner/background.png',
    colorPalette: {
      primary: '#FFFF00',
      accent: '#FF4400',
      floor: '#1A1A1A',
      crowd: '#111111',
      ui: '#FFFF00',
      glow: '#FF4400',
      text: '#FFFFFF',
    },
    lightingPreset: 'BATTLE',
    stageLayout: 'none',
    crowdLayout: 'circle',
    sponsorWallPlacement: 'none',
    cameraAngles: ['circle-ground', 'looking-up', 'alley-wide'],
    particleEffects: ['breath-vapor', 'concrete-dust'],
    floorPattern: 'cracked-pavement',
    ambientSound: 'city-night',
    tags: ['street', 'cypher', 'authentic', 'raw'],
  },

  'tv-studio': {
    id: 'tv-studio',
    name: 'TV Studio',
    description: 'Broadcast-grade studio set with logo walls, camera rigs, live light board',
    backgroundImage: '/venue-skins/tv-studio/background.png',
    colorPalette: {
      primary: '#0088FF',
      accent: '#FF2200',
      floor: '#101010',
      crowd: '#0A0A0A',
      ui: '#0088FF',
      glow: '#0088FF',
      text: '#FFFFFF',
    },
    lightingPreset: 'LIVE',
    stageLayout: 'center',
    crowdLayout: 'theater',
    sponsorWallPlacement: 'backdrop',
    cameraAngles: ['camera-1', 'camera-2', 'camera-3', 'jib-overhead', 'robotic-crane'],
    particleEffects: ['broadcast-haze'],
    floorPattern: 'studio-white',
    ambientSound: 'studio-hum',
    tags: ['studio', 'broadcast', 'professional', 'tv'],
  },

  'concert-hall': {
    id: 'concert-hall',
    name: 'Concert Hall',
    description: 'Grand arched hall with beam sweeps, full orchestra pit, premiere stage',
    backgroundImage: '/venue-skins/concert-hall/background.png',
    colorPalette: {
      primary: '#E0C060',
      accent: '#FFFFFF',
      floor: '#0A0600',
      crowd: '#15100A',
      ui: '#E0C060',
      glow: '#FFD700',
      text: '#FFF8E0',
    },
    lightingPreset: 'PREMIERE',
    stageLayout: 'raised',
    crowdLayout: 'theater',
    sponsorWallPlacement: 'top',
    cameraAngles: ['grand-wide', 'orchestra-pit', 'balcony-right', 'stage-front', 'dome-aerial'],
    particleEffects: ['beam-sweeps', 'chandelier-sparkle', 'rose-drop'],
    floorPattern: 'hardwood-polished',
    ambientSound: 'concert-hall-reverb',
    tags: ['concert', 'grand', 'premiere', 'classical'],
  },
};

export function getVenueSkin(id: string): VenueSkin {
  return VENUE_SKINS[id] ?? VENUE_SKINS['neon-club'];
}

export function listVenueSkins(): VenueSkin[] {
  return Object.values(VENUE_SKINS);
}

export function getVenueSkinsByTag(tag: string): VenueSkin[] {
  return Object.values(VENUE_SKINS).filter(s => s.tags.includes(tag));
}

/** Apply venue skin CSS variables to a DOM element (works client-side only) */
export function applyVenueSkin(el: HTMLElement, skin: VenueSkin): void {
  const p = skin.colorPalette;
  el.style.setProperty('--venue-primary', p.primary);
  el.style.setProperty('--venue-accent', p.accent);
  el.style.setProperty('--venue-floor', p.floor);
  el.style.setProperty('--venue-crowd', p.crowd);
  el.style.setProperty('--venue-ui', p.ui);
  el.style.setProperty('--venue-glow', p.glow);
  el.style.setProperty('--venue-text', p.text);
  el.dataset.venueSkin = skin.id;
}
