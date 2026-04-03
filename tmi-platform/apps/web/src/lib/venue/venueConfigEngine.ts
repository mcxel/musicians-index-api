/**
 * Venue Config Engine — Extended Venue System
 *
 * Extends the basic VenueSkin with a full JSON world-config model that supports:
 *  - Terrain (water, cliffs, ground type)
 *  - Islands (add / remove floating platforms)
 *  - Structures (DJ booth, VIP area, stage, bar, etc.)
 *  - Lighting presets from lightingEngine
 *  - Visualizer config
 *  - Screens (video wall, jumbotron, side panels)
 *  - Spawn points
 *  - Camera paths for the Camera Director Engine
 *  - Decorations (props, trees, signs, billboards)
 *  - Effects (fog, confetti, fireworks, rain)
 *  - Color overrides on top of a base VenueSkin template
 *
 * A VenueConfig references a VenueSkin by ID for baseline aesthetics
 * and then layers custom changes on top.  The venue editor at /venues/editor
 * reads and writes this shape.
 */

import type { VenueSkin, VenueColorPalette, StageLayout, CrowdLayout } from './venueSkinEngine';
import type { LightMode } from '../lighting/lightingEngine';
import type { VisualizerType } from '../visualizer/musicVisualizerEngine';
import type { CameraMode } from '../camera/cameraDirectorEngine';

// ─── Sub-types ────────────────────────────────────────────────────────────

export type TerrainType =
  | 'flat'       // Standard flat ground
  | 'hills'      // Rolling terrain
  | 'island'     // Surrounded by water
  | 'rooftop'    // Skyscraper rooftop
  | 'canyon'     // Rocky canyon walls
  | 'beach';     // Sandy beach + ocean edge

export type GroundMaterial =
  | 'neon-grid'  | 'wood-floor'  | 'marble'   | 'carpet-red'
  | 'concrete'   | 'sand'        | 'grass'     | 'metal-grate'
  | 'led-tiles'  | 'mirror'      | 'glass';

export type IslandShape = 'circle' | 'oval' | 'square' | 'hexagon' | 'freeform';

export type StructureType =
  | 'dj-booth'   | 'stage'      | 'bar'       | 'vip-booth'
  | 'photo-wall' | 'sponsor-banner' | 'merch-stand' | 'screen-tower'
  | 'dance-cage' | 'speaker-stack' | 'light-rig' | 'trophy-case'
  | 'graffiti-wall' | 'catwalk';

export type ScreenType = 'jumbotron' | 'side-panel' | 'floor-screen' | 'ceiling-screen' | 'backdrop';
export type DecorationCategory = 'nature' | 'urban' | 'futuristic' | 'retro' | 'luxury' | 'street';
export type EffectType =
  | 'confetti' | 'fireworks' | 'fog' | 'smoke' | 'rain' | 'snow'
  | 'laser-beams' | 'spotlight-rays' | 'glitter-fall' | 'bubbles'
  | 'neon-sparks' | 'solar-flare' | 'money-shower' | 'rose-petals';

// ─── Positioned element base ───────────────────────────────────────────────

export interface PositionedElement {
  id: string;
  x: number;       // 0–1 normalized within venue plane
  y: number;       // 0–1 normalized
  rotation: number; // degrees
  scale: number;   // 0.5–3.0
  zIndex: number;  // Layer order
}

// ─── Island config ─────────────────────────────────────────────────────────

export interface IslandConfig extends PositionedElement {
  shape: IslandShape;
  width: number;      // 0–1 relative width
  height: number;     // 0–1 relative height
  color: string;      // Ground/surface color
  elevation: number;  // 0–1 floating height
  label?: string;     // Display name (e.g. "VIP Island", "DJ Booth")
  accessible: boolean; // Crowd can enter
}

// ─── Structure config ──────────────────────────────────────────────────────

export interface StructureConfig extends PositionedElement {
  type: StructureType;
  label: string;
  primaryColor: string;
  accentColor: string;
  glowColor?: string;
  interactive: boolean;  // Has click events in venue
  iconEmoji?: string;
}

// ─── Screen config ─────────────────────────────────────────────────────────

export interface ScreenConfig extends PositionedElement {
  type: ScreenType;
  width: number;
  height: number;
  content: 'live-feed' | 'visualizer' | 'leaderboard' | 'sponsor-ad' | 'replay' | 'off';
  borderColor: string;
  glowColor: string;
  visible: boolean;
}

// ─── Spawn point ───────────────────────────────────────────────────────────

export interface SpawnPoint {
  id: string;
  x: number;
  y: number;
  label: string;
  role: 'guest' | 'vip' | 'artist' | 'host' | 'spectator';
  maxCapacity: number;
}

// ─── Camera path (for auto-director flyover routes) ───────────────────────

export interface CameraWaypoint {
  mode: CameraMode;
  x: number;
  y: number;
  zoom: number;
  tiltDeg: number;
  holdMs: number;        // How long to hold at this waypoint
}

export interface CameraPath {
  id: string;
  name: string;
  trigger: 'intro' | 'drop' | 'winner' | 'flyover' | 'manual';
  waypoints: CameraWaypoint[];
  loop: boolean;
}

// ─── Terrain config ────────────────────────────────────────────────────────

export interface TerrainConfig {
  type: TerrainType;
  groundMaterial: GroundMaterial;
  waterLevel: number;    // 0–1, 0 = no water, 1 = fully flooded
  waterColor: string;
  cliffHeight: number;   // 0–1 wall height for canyon/cliffs style
  fogDensity: number;    // 0–1
  skyGradientTop: string;
  skyGradientBottom: string;
  gridVisible: boolean;
  gridColor: string;
}

// ─── Decoration config ─────────────────────────────────────────────────────

export interface DecorationConfig extends PositionedElement {
  category: DecorationCategory;
  name: string;         // e.g. "Palm Tree", "Graffiti Wall", "Neon Sign"
  iconEmoji: string;
  color: string;
  glowColor?: string;
  animated: boolean;
}

// ─── Effects config ────────────────────────────────────────────────────────

export interface VenueEffectsConfig {
  enabled: EffectType[];
  intensity: number;      // 0–1 global effects intensity
  bloomStrength: number;  // 0–1 glow bloom on neon elements
  vignetteOpacity: number;
  particleDensity: number; // 0–1
}

// ─── Lighting config (ties to lightingEngine) ─────────────────────────────

export interface VenueLightingConfig {
  defaultMode: LightMode;
  ambientIntensity: number;  // 0–1
  spotlightCount: number;    // 0–6
  beamCount: number;         // 0–8
  beamColor: string;
  crowdWashColor: string;
  followSpotlight: boolean;  // Track active artist/host
  reactiveToBeat: boolean;
}

// ─── Venue Visualizer sub-config ──────────────────────────────────────────

export interface VenueVisualizerConfig {
  enabled: boolean;
  type: VisualizerType;
  displayOn: ScreenType[];   // Which screens show vizualizer
  bpmSync: boolean;          // Sync to room BPM
  color1: string;
  color2: string;
}

// ─── Full Venue Config ─────────────────────────────────────────────────────

export interface VenueConfig {
  id: string;
  name: string;
  description: string;
  skinTemplateId: string;          // References a VenueSkin.id for base aesthetics
  colorOverrides: Partial<VenueColorPalette>;  // Overrides on top of base skin
  stageLayout: StageLayout;
  crowdLayout: CrowdLayout;
  terrain: TerrainConfig;
  islands: IslandConfig[];
  structures: StructureConfig[];
  screens: ScreenConfig[];
  spawnPoints: SpawnPoint[];
  cameraPaths: CameraPath[];
  decorations: DecorationConfig[];
  effects: VenueEffectsConfig;
  lighting: VenueLightingConfig;
  visualizer: VenueVisualizerConfig;
  tags: string[];
  capacity: number;
  isPublic: boolean;
  userId?: string;              // Creator (for user-built venues)
  createdAt: string;
  updatedAt: string;
  version: number;
}

// ─── Factory: blank venue from a skin template ───────────────────────────

export function createVenueFromSkin(skin: VenueSkin, userId?: string): VenueConfig {
  const now = new Date().toISOString();
  return {
    id: `venue_${Date.now()}`,
    name: `My ${skin.name} Venue`,
    description: `Custom venue based on ${skin.name}`,
    skinTemplateId: skin.id,
    colorOverrides: {},
    stageLayout: skin.stageLayout,
    crowdLayout: skin.crowdLayout,
    terrain: defaultTerrain(skin),
    islands: [],
    structures: defaultStructures(skin),
    screens: defaultScreens(skin),
    spawnPoints: defaultSpawnPoints(),
    cameraPaths: defaultCameraPaths(),
    decorations: [],
    effects: defaultEffects(skin),
    lighting: defaultLighting(skin),
    visualizer: defaultVisualizer(skin),
    tags: [...skin.tags],
    capacity: 500,
    isPublic: false,
    userId,
    createdAt: now,
    updatedAt: now,
    version: 1,
  };
}

// ─── Default sub-config factories ────────────────────────────────────────

function defaultTerrain(skin: VenueSkin): TerrainConfig {
  const isBeach = skin.tags.includes('beach') || skin.id.includes('beach');
  return {
    type: isBeach ? 'beach' : 'flat',
    groundMaterial: skin.floorPattern.includes('grid') ? 'neon-grid'
                  : skin.floorPattern.includes('velvet') ? 'carpet-red'
                  : skin.floorPattern.includes('led') ? 'led-tiles'
                  : 'wood-floor',
    waterLevel: isBeach ? 0.15 : 0,
    waterColor: '#0055AA',
    cliffHeight: 0,
    fogDensity: skin.tags.includes('mystic') ? 0.4 : 0.0,
    skyGradientTop: '#050510',
    skyGradientBottom: skin.colorPalette.primary + '33',
    gridVisible: skin.floorPattern.includes('grid'),
    gridColor: skin.colorPalette.primary,
  };
}

function defaultStructures(skin: VenueSkin): StructureConfig[] {
  return [
    {
      id: 'dj-booth-main',
      type: 'dj-booth',
      label: 'DJ Booth',
      x: 0.5, y: 0.25,
      rotation: 0, scale: 1.0, zIndex: 10,
      primaryColor: skin.colorPalette.primary,
      accentColor: skin.colorPalette.accent,
      glowColor: skin.colorPalette.glow,
      interactive: true,
      iconEmoji: '🎛️',
    },
    {
      id: 'stage-main',
      type: 'stage',
      label: 'Main Stage',
      x: 0.5, y: 0.2,
      rotation: 0, scale: 1.2, zIndex: 5,
      primaryColor: skin.colorPalette.floor,
      accentColor: skin.colorPalette.glow,
      interactive: false,
      iconEmoji: '🎤',
    },
    {
      id: 'vip-area',
      type: 'vip-booth',
      label: 'VIP Area',
      x: 0.85, y: 0.5,
      rotation: 0, scale: 1.0, zIndex: 8,
      primaryColor: '#FFD700',
      accentColor: '#AA2DFF',
      glowColor: '#FFD700',
      interactive: true,
      iconEmoji: '👑',
    },
  ];
}

function defaultScreens(skin: VenueSkin): ScreenConfig[] {
  return [
    {
      id: 'backdrop-main',
      type: 'backdrop',
      x: 0.5, y: 0.05,
      rotation: 0, scale: 1.0, zIndex: 1,
      width: 0.8, height: 0.3,
      content: 'visualizer',
      borderColor: skin.colorPalette.accent,
      glowColor: skin.colorPalette.glow,
      visible: true,
    },
    {
      id: 'leaderboard-left',
      type: 'side-panel',
      x: 0.02, y: 0.3,
      rotation: 0, scale: 1.0, zIndex: 6,
      width: 0.12, height: 0.35,
      content: 'leaderboard',
      borderColor: skin.colorPalette.primary,
      glowColor: skin.colorPalette.glow,
      visible: true,
    },
  ];
}

function defaultSpawnPoints(): SpawnPoint[] {
  return [
    { id: 'spawn-guest-main', x: 0.5, y: 0.8, label: 'Main Entry', role: 'guest', maxCapacity: 200 },
    { id: 'spawn-vip', x: 0.85, y: 0.6, label: 'VIP Entry', role: 'vip', maxCapacity: 50 },
    { id: 'spawn-artist', x: 0.5, y: 0.15, label: 'Artist Stage Entry', role: 'artist', maxCapacity: 10 },
  ];
}

function defaultCameraPaths(): CameraPath[] {
  return [
    {
      id: 'intro-sweep',
      name: 'Intro Flyover',
      trigger: 'intro',
      loop: false,
      waypoints: [
        { mode: 'WIDE', x: 0.5, y: 0.5, zoom: 0.7, tiltDeg: -20, holdMs: 2000 },
        { mode: 'FLYOVER', x: 0.2, y: 0.3, zoom: 0.8, tiltDeg: -15, holdMs: 1500 },
        { mode: 'STAGE', x: 0.5, y: 0.25, zoom: 1.0, tiltDeg: 0, holdMs: 3000 },
      ],
    },
    {
      id: 'drop-cinematic',
      name: 'Drop Cut',
      trigger: 'drop',
      loop: false,
      waypoints: [
        { mode: 'TOP_DOWN', x: 0.5, y: 0.5, zoom: 0.6, tiltDeg: -45, holdMs: 1000 },
        { mode: 'CROWD', x: 0.5, y: 0.75, zoom: 1.2, tiltDeg: 5, holdMs: 1000 },
        { mode: 'STAGE', x: 0.5, y: 0.2, zoom: 1.5, tiltDeg: -5, holdMs: 2000 },
      ],
    },
  ];
}

function defaultEffects(skin: VenueSkin): VenueEffectsConfig {
  const effects: EffectType[] = skin.particleEffects.includes('confetti') ? ['confetti'] : [];
  if (skin.particleEffects.includes('laser-beams')) effects.push('laser-beams');
  if (skin.particleEffects.includes('smoke')) effects.push('smoke');
  return {
    enabled: effects,
    intensity: 0.7,
    bloomStrength: 0.6,
    vignetteOpacity: 0.4,
    particleDensity: 0.6,
  };
}

function defaultLighting(skin: VenueSkin): VenueLightingConfig {
  return {
    defaultMode: skin.lightingPreset,
    ambientIntensity: 0.4,
    spotlightCount: 2,
    beamCount: skin.particleEffects.includes('laser-beams') ? 6 : 4,
    beamColor: skin.colorPalette.glow,
    crowdWashColor: skin.colorPalette.crowd,
    followSpotlight: true,
    reactiveToBeat: true,
  };
}

function defaultVisualizer(skin: VenueSkin): VenueVisualizerConfig {
  const isDance = skin.tags.includes('dance') || skin.tags.includes('club');
  return {
    enabled: true,
    type: isDance ? 'particle-explosion' : 'equalizer-bars',
    displayOn: ['backdrop', 'floor-screen'],
    bpmSync: true,
    color1: skin.colorPalette.primary,
    color2: skin.colorPalette.accent,
  };
}

// ─── Persistence helpers ──────────────────────────────────────────────────

export function saveVenueConfig(config: VenueConfig): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`venue_config_${config.id}`, JSON.stringify(config));
      // Track saved IDs list
      const raw = localStorage.getItem('venue_config_ids') ?? '[]';
      const ids: string[] = JSON.parse(raw);
      if (!ids.includes(config.id)) ids.push(config.id);
      localStorage.setItem('venue_config_ids', JSON.stringify(ids));
    }
  } catch { /* ignore */ }
}

export function loadVenueConfig(id: string): VenueConfig | null {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(`venue_config_${id}`);
      if (raw) return JSON.parse(raw) as VenueConfig;
    }
  } catch { /* ignore */ }
  return null;
}

export function listSavedVenueConfigs(): string[] {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('venue_config_ids') ?? '[]';
      return JSON.parse(raw) as string[];
    }
  } catch { /* ignore */ }
  return [];
}

export function deleteVenueConfig(id: string): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`venue_config_${id}`);
      const raw = localStorage.getItem('venue_config_ids') ?? '[]';
      const ids: string[] = JSON.parse(raw);
      localStorage.setItem('venue_config_ids', JSON.stringify(ids.filter(i => i !== id)));
    }
  } catch { /* ignore */ }
}

// ─── Color utility ────────────────────────────────────────────────────────

/** Apply VenueConfig color overrides merged on top of skin palette */
export function resolveVenueColors(
  config: VenueConfig,
  baseSkin: VenueSkin,
): VenueColorPalette {
  return { ...baseSkin.colorPalette, ...config.colorOverrides };
}
