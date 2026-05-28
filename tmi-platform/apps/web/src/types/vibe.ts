export type ShaderQuality = 'low' | 'medium' | 'high';

export type VibeState = {
  underlay: string; // e.g., 'stellar-drift', 'neon-pulse', 'city-lights', 'green-screen-virtual'
  overlay: string; // e.g., 'strobe-pulse', 'spotlight-flare', 'holographic-rain'
  strobeIntensity: number; // 0 to 1
  transitionMode: string; // e.g., 'fade', 'scale', 'flip'
  spotlightMode: boolean;
  shaderQuality: ShaderQuality;
};

export type RoomRole = 'performer' | 'fan';

export const VIBE_PRESETS: Record<string, VibeState> = {
  'gospel-lift': {
    underlay: 'gradient-flow',
    overlay: 'spotlight-flare',
    strobeIntensity: 0.2, // Low strobe
    transitionMode: 'fade',
    spotlightMode: true,
    shaderQuality: 'medium'
  },
  'hip-hop-cypher': {
    underlay: 'neon-pulse',
    overlay: 'crowd-particles',
    strobeIntensity: 0.5, // Medium strobe
    transitionMode: 'scale',
    spotlightMode: false,
    shaderQuality: 'medium'
  },
  'lofi-writing': {
    underlay: 'stellar-drift',
    overlay: 'none',
    strobeIntensity: 0, // No strobe
    transitionMode: 'fade',
    spotlightMode: false,
    shaderQuality: 'medium'
  }
};