// ─── YoPho Portrait Composition Engine ────────────────────────────────────────
// Canonical identity composition framework for Fans and Performers.
// Supports Single Portrait, Double Exposure, Opposing Portrait, Multi-Portrait Montage,
// Object Composites (Cup, TV, Vinyl, Mic, Speaker, Helmet, Trophy, Guitar, Arena),
// Hair/Edge Refinement, Blend Modes, Texture Presets & Subscription Entitlements.

export type PortraitCompositionMode =
  | 'single'
  | 'double_exposure'
  | 'opposing'
  | 'multi_montage'
  | 'object_composite'
  | 'live_cutout';

export type ObjectMaskType =
  | 'coffee_cup'
  | 'tv_screen'
  | 'vinyl_record'
  | 'microphone'
  | 'speaker'
  | 'helmet'
  | 'trophy'
  | 'guitar'
  | 'arena_door';

export type BlendMode =
  | 'normal'
  | 'screen'
  | 'overlay'
  | 'multiply'
  | 'color-dodge'
  | 'soft-light'
  | 'luminosity';

export type TexturePreset =
  | 'none'
  | 'grain'
  | 'glow'
  | 'halftone'
  | 'film_texture'
  | '80s_airbrush'
  | 'vintage_album'
  | 'cyber_glow'
  | 'gold_foil';

export type FacingDirection = 'left' | 'right' | 'center';

export interface PortraitLayer {
  id: string;
  imageUrl: string;
  label: string;
  role: 'primary' | 'secondary' | 'background' | 'cutout';
  facing: FacingDirection;
  scale: number; // 0.2 .. 3.0
  xOffset: number; // -100 .. 100
  yOffset: number; // -100 .. 100
  rotation: number; // -180 .. 180 deg
  blendMode: BlendMode;
  opacity: number; // 0 .. 1
  edgeSoftness: number; // 0 .. 20px
  preserveHairEdges: boolean;
  zIndex: number;
}

export interface YoPhoPortraitBlueprint {
  id: string;
  title: string;
  userRole: 'fan' | 'performer';
  mode: PortraitCompositionMode;
  activePortraitsCount: number; // 1 .. 10
  primaryLayer: PortraitLayer;
  secondaryLayers: PortraitLayer[];
  objectMask?: ObjectMaskType;
  secondaryFillType: 'image' | 'city' | 'stage' | 'ocean' | 'arena' | 'gradient';
  secondaryFillUrl?: string;
  texturePreset: TexturePreset;
  colorPalette: {
    primaryAccent: string;
    secondaryAccent: string;
    ambientGlow: string;
  };
  lightingDirection: 'top-left' | 'top-right' | 'center-stage' | 'bottom-up';
  isAnimated: boolean;
  exportResolution: 'standard' | 'hd' | '4k' | '4k_tv';
  updatedAt: string;
}

export interface SubscriptionPortraitEntitlement {
  tier: 'FREE' | 'PRO' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
  maxActivePortraits: number;
  allowBasicCutout: boolean;
  allowDoubleExposure: boolean | 'preview';
  objectMaskAccess: 'basic' | 'full' | 'advanced';
  allowAnimatedComposition: boolean | 'limited';
  liveScenePlacement: 'none' | 'preview' | 'basic' | 'full' | 'advanced';
  allowCustomMasks: boolean;
  maxSavedEditions: number;
  maxResolution: 'standard' | 'hd' | '4k' | '4k_tv';
}

// ─── Canonical Subscription Entitlement Table ─────────────────────────────
export const SUBSCRIPTION_PORTRAIT_ENTITLEMENTS: Record<string, SubscriptionPortraitEntitlement> = {
  FREE: {
    tier: 'FREE',
    maxActivePortraits: 1,
    allowBasicCutout: true,
    allowDoubleExposure: 'preview',
    objectMaskAccess: 'basic',
    allowAnimatedComposition: false,
    liveScenePlacement: 'none',
    allowCustomMasks: false,
    maxSavedEditions: 1,
    maxResolution: 'standard',
  },
  PRO: {
    tier: 'PRO',
    maxActivePortraits: 2,
    allowBasicCutout: true,
    allowDoubleExposure: true,
    objectMaskAccess: 'basic',
    allowAnimatedComposition: 'limited',
    liveScenePlacement: 'preview',
    allowCustomMasks: false,
    maxSavedEditions: 3,
    maxResolution: 'hd',
  },
  SILVER: {
    tier: 'SILVER',
    maxActivePortraits: 3,
    allowBasicCutout: true,
    allowDoubleExposure: true,
    objectMaskAccess: 'full',
    allowAnimatedComposition: true,
    liveScenePlacement: 'basic',
    allowCustomMasks: false,
    maxSavedEditions: 10,
    maxResolution: 'hd',
  },
  GOLD: {
    tier: 'GOLD',
    maxActivePortraits: 4,
    allowBasicCutout: true,
    allowDoubleExposure: true,
    objectMaskAccess: 'full',
    allowAnimatedComposition: true,
    liveScenePlacement: 'full',
    allowCustomMasks: true,
    maxSavedEditions: 25,
    maxResolution: '4k',
  },
  PLATINUM: {
    tier: 'PLATINUM',
    maxActivePortraits: 6,
    allowBasicCutout: true,
    allowDoubleExposure: true,
    objectMaskAccess: 'advanced',
    allowAnimatedComposition: true,
    liveScenePlacement: 'advanced',
    allowCustomMasks: true,
    maxSavedEditions: 50,
    maxResolution: '4k',
  },
  DIAMOND: {
    tier: 'DIAMOND',
    maxActivePortraits: 10,
    allowBasicCutout: true,
    allowDoubleExposure: true,
    objectMaskAccess: 'advanced',
    allowAnimatedComposition: true,
    liveScenePlacement: 'full',
    allowCustomMasks: true,
    maxSavedEditions: 999,
    maxResolution: '4k_tv',
  },
};

export function getPortraitEntitlement(tierName: string): SubscriptionPortraitEntitlement {
  const normalized = (tierName || 'FREE').toUpperCase();
  return SUBSCRIPTION_PORTRAIT_ENTITLEMENTS[normalized] || SUBSCRIPTION_PORTRAIT_ENTITLEMENTS.FREE;
}

// ─── Object Mask Definitions (SVG Paths for Render Composite) ─────────────────
export interface ObjectMaskDefinition {
  id: ObjectMaskType;
  name: string;
  icon: string;
  category: 'basic' | 'full' | 'advanced';
  svgPath: string; // SVG viewbox path 0 0 100 100
  viewBox: string;
  description: string;
}

export const OBJECT_MASK_CATALOG: ObjectMaskDefinition[] = [
  {
    id: 'coffee_cup',
    name: 'Coffee Mug Silhouette',
    icon: '☕',
    category: 'basic',
    viewBox: '0 0 100 100',
    svgPath: 'M 20 25 L 25 80 C 25 90 75 90 75 80 L 80 25 Z M 80 35 C 95 35 95 65 80 65 Z',
    description: 'Surreal portrait composite emerging inside a steaming coffee cup',
  },
  {
    id: 'vinyl_record',
    name: 'Vinyl Disc Center',
    icon: '🎧',
    category: 'basic',
    viewBox: '0 0 100 100',
    svgPath: 'M 50 5 A 45 45 0 1 0 50 95 A 45 45 0 1 0 50 5 M 50 35 A 15 15 0 1 1 50 65 A 15 15 0 1 1 50 35',
    description: 'Classic LP vinyl record silhouette with artwork inside groove ring',
  },
  {
    id: 'tv_screen',
    name: 'Retro Television Screen',
    icon: '📺',
    category: 'full',
    viewBox: '0 0 100 100',
    svgPath: 'M 10 20 H 90 V 80 H 10 Z M 30 10 L 50 20 L 70 10',
    description: '80s CRT Television framing with scanline noise texture overlay',
  },
  {
    id: 'microphone',
    name: 'Vintage Studio Mic',
    icon: '🎙️',
    category: 'full',
    viewBox: '0 0 100 100',
    svgPath: 'M 35 15 C 35 5 65 5 65 15 L 65 50 C 65 60 35 60 35 50 Z M 20 45 C 20 75 80 75 80 45 M 50 75 L 50 95',
    description: 'Broadcast condenser microphone outline with portrait inner fill',
  },
  {
    id: 'speaker',
    name: 'Bass Speaker Cone',
    icon: '🔊',
    category: 'full',
    viewBox: '0 0 100 100',
    svgPath: 'M 10 30 H 30 L 70 10 V 90 L 30 70 H 10 Z M 80 30 C 90 40 90 60 80 70',
    description: 'Pulse-on-beat speaker cone composite with audio-reactive glow',
  },
  {
    id: 'helmet',
    name: 'Cyber Helmet Visor',
    icon: '🪖',
    category: 'advanced',
    viewBox: '0 0 100 100',
    svgPath: 'M 20 15 C 20 0 80 0 80 15 L 85 55 C 85 85 15 85 15 55 Z M 25 35 H 75 V 50 H 25 Z',
    description: 'Futuristic visor reflection with double-exposure memory portrait',
  },
  {
    id: 'trophy',
    name: 'Championship Trophy',
    icon: '🏆',
    category: 'advanced',
    viewBox: '0 0 100 100',
    svgPath: 'M 20 10 H 80 L 70 50 C 70 70 30 70 30 50 Z M 40 70 H 60 V 90 H 40 Z M 25 90 H 75 V 100 H 25 Z',
    description: 'Golden trophy cup framing showcasing headline performance moment',
  },
  {
    id: 'guitar',
    name: 'Electric Guitar Body',
    icon: '🎸',
    category: 'advanced',
    viewBox: '0 0 100 100',
    svgPath: 'M 40 10 C 40 0 60 0 60 10 L 60 35 C 75 45 75 75 50 95 C 25 75 25 45 40 35 Z',
    description: 'Stratocaster / Les Paul body silhouette filled with stage lighting',
  },
  {
    id: 'arena_door',
    name: 'Arena Stage Entrance',
    icon: '🏟️',
    category: 'advanced',
    viewBox: '0 0 100 100',
    svgPath: 'M 10 95 V 30 C 10 10 90 10 90 30 V 95 Z',
    description: 'Colosseum stadium portal framing with audience crowd background',
  },
];

// ─── Default Initial Blueprint Factory ────────────────────────────────────────
export function createDefaultYoPhoBlueprint(
  userRole: 'fan' | 'performer' = 'fan',
  displayName: string = 'User',
  imageUrl?: string
): YoPhoPortraitBlueprint {
  const defaultImg = imageUrl || '/bot-images/Bot image 1.png';
  return {
    id: `yopho_blueprint_${Date.now()}`,
    title: `${displayName}'s Living YoPho Card`,
    userRole,
    mode: 'double_exposure',
    activePortraitsCount: 2,
    primaryLayer: {
      id: 'layer_primary',
      imageUrl: defaultImg,
      label: 'Main Profile Silhouette',
      role: 'primary',
      facing: 'left',
      scale: 1.0,
      xOffset: 0,
      yOffset: 0,
      rotation: 0,
      blendMode: 'normal',
      opacity: 1.0,
      edgeSoftness: 4,
      preserveHairEdges: true,
      zIndex: 2,
    },
    secondaryLayers: [
      {
        id: 'layer_secondary_1',
        imageUrl: '/yopho/Yoho Canvas base 2.mp4',
        label: 'Inner Scene Memory',
        role: 'secondary',
        facing: 'right',
        scale: 1.15,
        xOffset: 10,
        yOffset: -5,
        rotation: 0,
        blendMode: 'screen',
        opacity: 0.85,
        edgeSoftness: 6,
        preserveHairEdges: true,
        zIndex: 1,
      },
    ],
    objectMask: 'coffee_cup',
    secondaryFillType: 'stage',
    secondaryFillUrl: '/banners/lightning/204835-925552445_medium Battle of the chapions lightning.mp4',
    texturePreset: 'cyber_glow',
    colorPalette: {
      primaryAccent: '#00E5FF',
      secondaryAccent: '#FF2DAA',
      ambientGlow: 'rgba(0, 229, 255, 0.4)',
    },
    lightingDirection: 'top-left',
    isAnimated: true,
    exportResolution: 'hd',
    updatedAt: new Date().toISOString(),
  };
}
