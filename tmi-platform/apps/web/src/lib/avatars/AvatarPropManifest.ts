/**
 * AvatarPropManifest — data-driven prop definitions.
 *
 * Every prop is a JSON manifest. The PropLoader reads the manifest and handles:
 *   - 3D model loading (modelUrl → .glb)
 *   - Socket attachment (via AvatarSocketSystem)
 *   - Particle effect trigger (particleEffect)
 *   - PointLight/SpotLight injection (lightEffect)
 *   - Audio trigger (audioEffect)
 *   - LOD gating (lod.disableLightingAfterAudienceSize)
 *
 * Adding a new prop = adding one entry here. No new code.
 *
 * Props are disabled until their model/effect assets are real.
 * A disabled prop NEVER renders a fake placeholder — it renders nothing.
 * Per Rule 20 (Launch Certification Standard / Reality Rule).
 *
 * Economy fields (price, tier, unlock) are locked here; purchase flow and
 * Marketplace wiring come in Phase C6 — not built yet.
 *
 * Universal Prop Runtime directive — locked 2026-06-24.
 */

import type { AvatarSocketId, AvatarClass } from '@/lib/avatars/AvatarSocketSystem';

// ─── Light effect spec ────────────────────────────────────────────────────────

export interface PropLightEffect {
  type:       'point' | 'spot' | 'ambient';
  color:      string;   // hex
  intensity:  number;   // 0–10
  radius?:    number;   // point light distance
  angle?:     number;   // spot light cone angle (radians)
  flicker?:   boolean;  // candle/flame style
  flickerHz?: number;   // flicker frequency
}

// ─── LOD / performance gates ──────────────────────────────────────────────────

export interface PropLODConfig {
  maxVisibleInstances?:          number; // hard cap on concurrent rendered instances
  disableLightingAfterCount?:    number; // disable PointLight when audience > this
  disableParticlesAfterDistance?: number; // camera-normalized 0-1
}

// ─── Economy ──────────────────────────────────────────────────────────────────

export interface PropEconomy {
  pricePoints?:    number;  // platform points cost (0 = free)
  priceCash?:      number;  // USD (Phase 3 cash mode only, per Rule 23)
  unlockXP?:       number;  // XP threshold to unlock
  tierRequired?:   string;  // e.g. 'gold'
}

// ─── The manifest ─────────────────────────────────────────────────────────────

export interface AvatarPropManifest {
  propId:          string;
  name:            string;
  category:        'concert' | 'battle' | 'dance' | 'currency' | 'celebration' | 'ambient';
  socket:          AvatarSocketId;
  modelUrl:        string | null; // null = asset not yet available; prop stays disabled
  animationState?: string;        // AvatarAnimationState to switch to when equipped
  particleEffect?: string | null; // particle emitter definition ID; null = none
  lightEffect?:    PropLightEffect | null;
  audioEffect?:    string | null; // sound effect path
  allowedClasses?: AvatarClass[]; // if absent, allowed for all classes
  economy?:        PropEconomy;
  lod?:            PropLODConfig;
  certified:       boolean; // true = real assets verified; false = disabled in production
}

// ─── Prop registry ────────────────────────────────────────────────────────────

const _manifests = new Map<string, AvatarPropManifest>();

export function registerPropManifest(manifest: AvatarPropManifest): void {
  _manifests.set(manifest.propId, manifest);
}

export function getPropManifest(propId: string): AvatarPropManifest | undefined {
  return _manifests.get(propId);
}

export function listPropManifests(filter?: { certified?: boolean; category?: string }): AvatarPropManifest[] {
  return Array.from(_manifests.values()).filter(m => {
    if (filter?.certified !== undefined && m.certified !== filter.certified) return false;
    if (filter?.category && m.category !== filter.category) return false;
    return true;
  });
}

// ─── Starter manifests (certified: false until assets exist) ─────────────────
//
// These are the first 5 props to certify per the PropLoader directive.
// modelUrl is null → PropLoader renders nothing → honest per Rule 20.
// When a real .glb is placed at the modelUrl path, set certified: true.

const STARTER_MANIFESTS: AvatarPropManifest[] = [
  {
    propId:         'lighter_v1',
    name:           'Lighter',
    category:       'concert',
    socket:         'socket_primary_hand',
    modelUrl:       '/assets/props/lighter_v1.glb',
    animationState: 'holding_lighter',
    particleEffect: 'flame_emitter',
    lightEffect: {
      type:      'point',
      color:     '#FF8C00',
      intensity: 1.8,
      radius:    1.2,
      flicker:   true,
      flickerHz: 8,
    },
    audioEffect: null,
    lod: {
      maxVisibleInstances:       300,
      disableLightingAfterCount: 150,
      disableParticlesAfterDistance: 0.6,
    },
    economy:   { pricePoints: 0 }, // free starter prop
    certified: false, // asset not yet placed
  },
  {
    propId:         'candle_v1',
    name:           'Candle',
    category:       'concert',
    socket:         'socket_primary_hand',
    modelUrl:       '/assets/props/candle_v1.glb',
    animationState: 'holding_candle',
    particleEffect: 'candle_flame_emitter',
    lightEffect: {
      type:      'point',
      color:     '#FFA040',
      intensity: 1.2,
      radius:    0.9,
      flicker:   true,
      flickerHz: 5,
    },
    audioEffect: null,
    lod: {
      maxVisibleInstances:       300,
      disableLightingAfterCount: 150,
      disableParticlesAfterDistance: 0.55,
    },
    economy:   { pricePoints: 0 },
    certified: false,
  },
  {
    propId:         'flashlight_v1',
    name:           'Flashlight',
    category:       'concert',
    socket:         'socket_primary_hand',
    modelUrl:       '/assets/props/flashlight_v1.glb',
    animationState: 'holding_flashlight',
    particleEffect: null,
    lightEffect: {
      type:      'spot',
      color:     '#FFFFFF',
      intensity: 4.0,
      angle:     0.28, // ~16 degrees
      flicker:   false,
    },
    audioEffect: null,
    lod: {
      maxVisibleInstances:       200,
      disableLightingAfterCount: 100,
      disableParticlesAfterDistance: 0.7,
    },
    economy:   { pricePoints: 100 },
    certified: false,
  },
  {
    propId:         'glowstick_v1',
    name:           'Glow Stick',
    category:       'dance',
    socket:         'socket_primary_hand',
    modelUrl:       '/assets/props/glowstick_v1.glb',
    animationState: 'waving',
    particleEffect: 'glowstick_trail',
    lightEffect: {
      type:      'point',
      color:     '#00FF88',
      intensity: 0.8,
      radius:    0.5,
      flicker:   false,
    },
    audioEffect: null,
    lod: {
      maxVisibleInstances:       500,
      disableLightingAfterCount: 200,
      disableParticlesAfterDistance: 0.5,
    },
    economy:   { pricePoints: 150 },
    certified: false,
  },
  {
    propId:         'money_gun_v1',
    name:           'Money Gun',
    category:       'currency',
    socket:         'socket_primary_hand',
    modelUrl:       '/assets/props/money_gun_v1.glb',
    animationState: 'holding_gun',
    particleEffect: 'flying_bills_emitter',
    lightEffect: {
      type:      'point',
      color:     '#00D000',
      intensity: 2.0,
      radius:    1.5,
      flicker:   false,
    },
    audioEffect: '/assets/audio/props/cash_burst.mp3',
    lod: {
      maxVisibleInstances:       50, // intentionally rare — makes it special
      disableLightingAfterCount: 30,
      disableParticlesAfterDistance: 0.45,
    },
    economy: {
      pricePoints: 500,
      unlockXP:    5000,
      tierRequired: 'gold',
    },
    certified: false,
  },
];

// Register all starter manifests at module load
STARTER_MANIFESTS.forEach(registerPropManifest);

// ─── Active prop state (what an entity currently has equipped) ────────────────

export interface ActiveProp {
  propId:    string;
  equippedAt: number;
  instanceId: string; // unique per equip event (for particle cleanup)
}

export function createActiveProp(propId: string): ActiveProp {
  return {
    propId,
    equippedAt: Date.now(),
    instanceId: `prop-${propId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  };
}
