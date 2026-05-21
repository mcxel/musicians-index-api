// apps/web/src/config/scene-registry.ts
// Every scene available on the platform with its visual config.

export type SceneId =
  | 'magazine' | 'profile' | 'station' | 'live-stage'
  | 'lobby' | 'contest-arena' | 'sponsor-showcase'
  | 'admin-command' | 'studio' | 'backstage'
  | 'neon-club' | 'rooftop-city' | 'underground-cypher'
  | 'concert-arena' | 'space-dome' | 'beach-festival'
  | 'virtual-grid' | 'game-night';

export interface SceneConfig {
  id: SceneId;
  label: string;
  background: string;  // CSS gradient or color
  accentColor: string;
  overlayOpacity: number;  // 0–1
  audioLoop?: string;      // ambient audio file ref
  particleEffect?: 'lightning' | 'confetti' | 'stars' | 'grid' | 'none';
  density: 'compact' | 'standard' | 'immersive' | 'broadcast' | 'editorial';
}

export const SCENE_REGISTRY: Record<SceneId, SceneConfig> = {
  'magazine': {
    id: 'magazine', label: 'Magazine Editorial',
    background: 'linear-gradient(to bottom, #150830, #0D0520)',
    accentColor: '#FFB800', overlayOpacity: 0.6,
    particleEffect: 'lightning', density: 'editorial',
  },
  'profile': {
    id: 'profile', label: 'Artist Profile',
    background: 'linear-gradient(135deg, #2A1452, #0D0520)',
    accentColor: '#FFB800', overlayOpacity: 0.5, density: 'standard',
  },
  'station': {
    id: 'station', label: 'Station Hub',
    background: 'linear-gradient(to bottom, #150830, #1E0D3E, #0D0520)',
    accentColor: '#00E5FF', overlayOpacity: 0.4, density: 'standard',
  },
  'live-stage': {
    id: 'live-stage', label: 'Live Concert Stage',
    background: 'radial-gradient(ellipse at center, #2A1452 0%, #0D0520 70%)',
    accentColor: '#FF2D78', overlayOpacity: 0.3,
    audioLoop: 'crowd-ambient', particleEffect: 'stars', density: 'broadcast',
  },
  'lobby': {
    id: 'lobby', label: 'Live Lobby',
    background: 'linear-gradient(135deg, #150830, #2A1452)',
    accentColor: '#00E5FF', overlayOpacity: 0.4, particleEffect: 'grid', density: 'standard',
  },
  'contest-arena': {
    id: 'contest-arena', label: 'Contest Arena',
    background: 'linear-gradient(to bottom, #3D1E78, #0D0520)',
    accentColor: '#FFB800', overlayOpacity: 0.3,
    particleEffect: 'confetti', density: 'broadcast',
  },
  'sponsor-showcase': {
    id: 'sponsor-showcase', label: 'Sponsor Showcase',
    background: 'linear-gradient(135deg, #2A1452, #150830)',
    accentColor: '#FFB800', overlayOpacity: 0.5, density: 'compact',
  },
  'admin-command': {
    id: 'admin-command', label: 'Admin Command Center',
    background: 'linear-gradient(to bottom, #0A0318, #150830)',
    accentColor: '#FF2D78', overlayOpacity: 0.6, particleEffect: 'grid', density: 'compact',
  },
  'studio': {
    id: 'studio', label: 'Studio Session',
    background: 'linear-gradient(135deg, #1A0D35, #2A1452)',
    accentColor: '#FFB800', overlayOpacity: 0.4, audioLoop: 'studio-ambient', density: 'standard',
  },
  'backstage': {
    id: 'backstage', label: 'Backstage',
    background: 'linear-gradient(to right, #1E0D3E, #0D0520)',
    accentColor: '#C8A8E8', overlayOpacity: 0.5, density: 'standard',
  },
  'neon-club': {
    id: 'neon-club', label: 'Neon Club',
    background: 'radial-gradient(ellipse at top, #3D1E78 0%, #0D0520 60%)',
    accentColor: '#FF2D78', overlayOpacity: 0.2, audioLoop: 'club-ambient', density: 'broadcast',
  },
  'rooftop-city': {
    id: 'rooftop-city', label: 'Rooftop City',
    background: 'linear-gradient(to bottom, #0D1535, #0D0520)',
    accentColor: '#FF8C00', overlayOpacity: 0.3, particleEffect: 'stars', density: 'standard',
  },
  'underground-cypher': {
    id: 'underground-cypher', label: 'Underground Cypher',
    background: 'linear-gradient(to bottom, #1A0D0D, #0D0520)',
    accentColor: '#00E5FF', overlayOpacity: 0.4, density: 'broadcast',
  },
  'concert-arena': {
    id: 'concert-arena', label: 'Concert Arena',
    background: 'radial-gradient(ellipse at top, #1E0D3E 0%, #050210 100%)',
    accentColor: '#FFB800', overlayOpacity: 0.2,
    audioLoop: 'arena-crowd', particleEffect: 'stars', density: 'broadcast',
  },
  'space-dome': {
    id: 'space-dome', label: 'Space Dome',
    background: 'radial-gradient(ellipse at center, #080520 0%, #000308 100%)',
    accentColor: '#00E5FF', overlayOpacity: 0.1, particleEffect: 'stars', density: 'immersive',
  },
  'beach-festival': {
    id: 'beach-festival', label: 'Beach Festival',
    background: 'linear-gradient(to bottom, #FF8C00 0%, #FF2D78 40%, #0D0520 100%)',
    accentColor: '#FFB800', overlayOpacity: 0.4, density: 'broadcast',
  },
  'virtual-grid': {
    id: 'virtual-grid', label: 'Virtual Grid',
    background: 'linear-gradient(to bottom, #000820, #0D0520)',
    accentColor: '#00E5FF', overlayOpacity: 0.5, particleEffect: 'grid', density: 'broadcast',
  },
  'game-night': {
    id: 'game-night', label: 'Game Night',
    background: 'linear-gradient(135deg, #7B2FBE, #FF2D78, #0D0520)',
    accentColor: '#FFB800', overlayOpacity: 0.3, particleEffect: 'confetti', density: 'broadcast',
  },
};

export function getScene(id: SceneId): SceneConfig {
  return SCENE_REGISTRY[id];
}
