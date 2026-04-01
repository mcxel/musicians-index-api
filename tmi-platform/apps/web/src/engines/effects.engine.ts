/**
 * Effects Engine — Client-Side
 * Visual effects registry for rooms, Julius overlays, reactions, and avatar animations.
 * Manages effect definitions, triggers, durations, and layering.
 *
 * Used by: Room system, Julius system, Reaction bar, Avatar system
 */

// ─── Effect Types ──────────────────────────────────────────────────────────────

export type EffectCategory =
  | 'reaction'      // Emoji/reaction bursts
  | 'julius'        // Julius AI overlay effects
  | 'room'          // Room ambient effects
  | 'achievement'   // Achievement unlock effects
  | 'confetti'      // Celebration effects
  | 'spotlight'     // Stage spotlight effects
  | 'weather'       // Ambient weather (rain, snow, etc.)
  | 'fire'          // Fire/energy effects
  | 'hologram'      // Holographic overlays
  | 'glitch'        // Glitch/digital effects
  | 'smoke'         // Smoke/fog effects
  | 'particles';    // Generic particle systems

export type EffectTrigger =
  | 'manual'        // Triggered by user action
  | 'auto'          // Auto-triggered by system
  | 'threshold'     // Triggered when metric hits threshold
  | 'scheduled'     // Triggered on schedule
  | 'reaction';     // Triggered by audience reaction

export type EffectLayer = 'background' | 'midground' | 'foreground' | 'overlay' | 'hud';

export interface EffectDefinition {
  id: string;
  name: string;
  category: EffectCategory;
  layer: EffectLayer;
  trigger: EffectTrigger;
  durationMs: number;       // 0 = infinite until stopped
  intensity: number;        // 0.0 – 1.0
  color?: string;
  emoji?: string;
  cssClass?: string;
  animationName?: string;
  particleCount?: number;
  requiresTier?: 'FREE' | 'SUPPORTER' | 'PRO' | 'ELITE';
  tags: string[];
}

export interface ActiveEffect {
  id: string;
  definition: EffectDefinition;
  startedAt: number;
  endsAt: number | null;    // null = infinite
  sourceUserId?: string;
  metadata?: Record<string, unknown>;
}

// ─── Effect Registry ───────────────────────────────────────────────────────────

export const EFFECT_REGISTRY: Record<string, EffectDefinition> = {
  // ── Reactions ──────────────────────────────────────────────────────────────
  FIRE_REACTION: {
    id: 'FIRE_REACTION',
    name: 'Fire',
    category: 'reaction',
    layer: 'foreground',
    trigger: 'reaction',
    durationMs: 3000,
    intensity: 0.8,
    emoji: '🔥',
    cssClass: 'effect-fire-reaction',
    animationName: 'fireFloat',
    tags: ['reaction', 'hot', 'energy'],
  },
  HEART_REACTION: {
    id: 'HEART_REACTION',
    name: 'Hearts',
    category: 'reaction',
    layer: 'foreground',
    trigger: 'reaction',
    durationMs: 2500,
    intensity: 0.7,
    emoji: '❤️',
    cssClass: 'effect-heart-reaction',
    animationName: 'heartFloat',
    tags: ['reaction', 'love'],
  },
  CLAP_REACTION: {
    id: 'CLAP_REACTION',
    name: 'Applause',
    category: 'reaction',
    layer: 'foreground',
    trigger: 'reaction',
    durationMs: 2000,
    intensity: 0.6,
    emoji: '👏',
    cssClass: 'effect-clap-reaction',
    animationName: 'clapBurst',
    tags: ['reaction', 'applause'],
  },
  CROWN_REACTION: {
    id: 'CROWN_REACTION',
    name: 'Crown',
    category: 'reaction',
    layer: 'foreground',
    trigger: 'reaction',
    durationMs: 3500,
    intensity: 0.9,
    emoji: '👑',
    cssClass: 'effect-crown-reaction',
    animationName: 'crownFloat',
    requiresTier: 'SUPPORTER',
    tags: ['reaction', 'vip', 'premium'],
  },
  LIGHTNING_REACTION: {
    id: 'LIGHTNING_REACTION',
    name: 'Lightning',
    category: 'reaction',
    layer: 'foreground',
    trigger: 'reaction',
    durationMs: 1500,
    intensity: 1.0,
    emoji: '⚡',
    cssClass: 'effect-lightning-reaction',
    animationName: 'lightningStrike',
    requiresTier: 'PRO',
    tags: ['reaction', 'electric', 'premium'],
  },

  // ── Julius Effects ─────────────────────────────────────────────────────────
  JULIUS_SPOTLIGHT: {
    id: 'JULIUS_SPOTLIGHT',
    name: 'Julius Spotlight',
    category: 'julius',
    layer: 'overlay',
    trigger: 'auto',
    durationMs: 5000,
    intensity: 0.85,
    color: '#f59e0b',
    cssClass: 'effect-julius-spotlight',
    animationName: 'spotlightPulse',
    tags: ['julius', 'spotlight', 'ai'],
  },
  JULIUS_HOLOGRAM: {
    id: 'JULIUS_HOLOGRAM',
    name: 'Julius Hologram',
    category: 'hologram',
    layer: 'overlay',
    trigger: 'manual',
    durationMs: 8000,
    intensity: 0.9,
    color: '#06b6d4',
    cssClass: 'effect-julius-hologram',
    animationName: 'hologramFlicker',
    requiresTier: 'PRO',
    tags: ['julius', 'hologram', 'premium'],
  },
  JULIUS_GLITCH: {
    id: 'JULIUS_GLITCH',
    name: 'Julius Glitch',
    category: 'glitch',
    layer: 'overlay',
    trigger: 'manual',
    durationMs: 2000,
    intensity: 0.7,
    cssClass: 'effect-julius-glitch',
    animationName: 'glitchScan',
    tags: ['julius', 'glitch', 'digital'],
  },

  // ── Room Ambient Effects ───────────────────────────────────────────────────
  ROOM_CONFETTI: {
    id: 'ROOM_CONFETTI',
    name: 'Confetti',
    category: 'confetti',
    layer: 'foreground',
    trigger: 'manual',
    durationMs: 6000,
    intensity: 0.8,
    cssClass: 'effect-confetti',
    animationName: 'confettiFall',
    particleCount: 150,
    tags: ['celebration', 'party', 'room'],
  },
  ROOM_SMOKE: {
    id: 'ROOM_SMOKE',
    name: 'Stage Smoke',
    category: 'smoke',
    layer: 'background',
    trigger: 'auto',
    durationMs: 0,
    intensity: 0.4,
    color: '#9ca3af',
    cssClass: 'effect-stage-smoke',
    animationName: 'smokeRise',
    tags: ['ambient', 'stage', 'room'],
  },
  ROOM_SPOTLIGHT: {
    id: 'ROOM_SPOTLIGHT',
    name: 'Stage Spotlight',
    category: 'spotlight',
    layer: 'midground',
    trigger: 'manual',
    durationMs: 0,
    intensity: 1.0,
    color: '#ffffff',
    cssClass: 'effect-stage-spotlight',
    animationName: 'spotlightSweep',
    tags: ['stage', 'spotlight', 'room'],
  },
  ROOM_FIRE_PILLARS: {
    id: 'ROOM_FIRE_PILLARS',
    name: 'Fire Pillars',
    category: 'fire',
    layer: 'background',
    trigger: 'threshold',
    durationMs: 4000,
    intensity: 0.9,
    color: '#ef4444',
    cssClass: 'effect-fire-pillars',
    animationName: 'firePillarBurst',
    requiresTier: 'ELITE',
    tags: ['fire', 'energy', 'premium', 'room'],
  },

  // ── Achievement Effects ────────────────────────────────────────────────────
  ACHIEVEMENT_UNLOCK: {
    id: 'ACHIEVEMENT_UNLOCK',
    name: 'Achievement Unlocked',
    category: 'achievement',
    layer: 'hud',
    trigger: 'auto',
    durationMs: 4000,
    intensity: 1.0,
    color: '#f59e0b',
    cssClass: 'effect-achievement-unlock',
    animationName: 'achievementPop',
    tags: ['achievement', 'unlock', 'hud'],
  },
  ACHIEVEMENT_LEGENDARY: {
    id: 'ACHIEVEMENT_LEGENDARY',
    name: 'Legendary Achievement',
    category: 'achievement',
    layer: 'overlay',
    trigger: 'auto',
    durationMs: 6000,
    intensity: 1.0,
    color: '#8b5cf6',
    cssClass: 'effect-achievement-legendary',
    animationName: 'legendaryBurst',
    particleCount: 200,
    tags: ['achievement', 'legendary', 'rare'],
  },

  // ── Weather / Ambient ──────────────────────────────────────────────────────
  AMBIENT_RAIN: {
    id: 'AMBIENT_RAIN',
    name: 'Rain',
    category: 'weather',
    layer: 'background',
    trigger: 'manual',
    durationMs: 0,
    intensity: 0.5,
    color: '#93c5fd',
    cssClass: 'effect-ambient-rain',
    animationName: 'rainFall',
    particleCount: 100,
    tags: ['ambient', 'weather', 'rain'],
  },
  AMBIENT_SNOW: {
    id: 'AMBIENT_SNOW',
    name: 'Snow',
    category: 'weather',
    layer: 'background',
    trigger: 'manual',
    durationMs: 0,
    intensity: 0.4,
    color: '#e0f2fe',
    cssClass: 'effect-ambient-snow',
    animationName: 'snowFall',
    particleCount: 80,
    tags: ['ambient', 'weather', 'snow'],
  },
};

// ─── Effects Engine Class ──────────────────────────────────────────────────────

export class EffectsEngine {
  private activeEffects: Map<string, ActiveEffect> = new Map();
  private listeners: Set<(effects: ActiveEffect[]) => void> = new Set();
  private cleanupTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  // ─── Registry ──────────────────────────────────────────────────────────────

  getEffect(id: string): EffectDefinition | undefined {
    return EFFECT_REGISTRY[id];
  }

  getAllEffects(): EffectDefinition[] {
    return Object.values(EFFECT_REGISTRY);
  }

  getEffectsByCategory(category: EffectCategory): EffectDefinition[] {
    return Object.values(EFFECT_REGISTRY).filter(e => e.category === category);
  }

  getEffectsByTier(tier: 'FREE' | 'SUPPORTER' | 'PRO' | 'ELITE'): EffectDefinition[] {
    const tierOrder = ['FREE', 'SUPPORTER', 'PRO', 'ELITE'];
    const tierIdx = tierOrder.indexOf(tier);
    return Object.values(EFFECT_REGISTRY).filter(e => {
      if (!e.requiresTier) return true;
      return tierOrder.indexOf(e.requiresTier) <= tierIdx;
    });
  }

  canUseEffect(effectId: string, tier: 'FREE' | 'SUPPORTER' | 'PRO' | 'ELITE'): boolean {
    const effect = EFFECT_REGISTRY[effectId];
    if (!effect) return false;
    if (!effect.requiresTier) return true;
    const tierOrder = ['FREE', 'SUPPORTER', 'PRO', 'ELITE'];
    return tierOrder.indexOf(tier) >= tierOrder.indexOf(effect.requiresTier);
  }

  // ─── Active Effect Management ───────────────────────────────────────────────

  trigger(
    effectId: string,
    options: { sourceUserId?: string; metadata?: Record<string, unknown> } = {},
  ): ActiveEffect | null {
    const definition = EFFECT_REGISTRY[effectId];
    if (!definition) {
      console.warn(`[EffectsEngine] Unknown effect: ${effectId}`);
      return null;
    }

    const instanceId = `${effectId}_${Date.now()}`;
    const now = Date.now();
    const endsAt = definition.durationMs > 0 ? now + definition.durationMs : null;

    const active: ActiveEffect = {
      id: instanceId,
      definition,
      startedAt: now,
      endsAt,
      sourceUserId: options.sourceUserId,
      metadata: options.metadata,
    };

    this.activeEffects.set(instanceId, active);
    this.notifyListeners();

    // Auto-cleanup after duration
    if (endsAt !== null) {
      const timer = setTimeout(() => {
        this.stop(instanceId);
      }, definition.durationMs);
      this.cleanupTimers.set(instanceId, timer);
    }

    return active;
  }

  stop(instanceId: string): void {
    this.activeEffects.delete(instanceId);
    const timer = this.cleanupTimers.get(instanceId);
    if (timer) {
      clearTimeout(timer);
      this.cleanupTimers.delete(instanceId);
    }
    this.notifyListeners();
  }

  stopByCategory(category: EffectCategory): void {
    for (const [id, effect] of this.activeEffects) {
      if (effect.definition.category === category) {
        this.stop(id);
      }
    }
  }

  stopAll(): void {
    for (const id of this.activeEffects.keys()) {
      this.stop(id);
    }
  }

  getActiveEffects(): ActiveEffect[] {
    return Array.from(this.activeEffects.values());
  }

  getActiveByLayer(layer: EffectLayer): ActiveEffect[] {
    return this.getActiveEffects().filter(e => e.definition.layer === layer);
  }

  isActive(effectId: string): boolean {
    return Array.from(this.activeEffects.values()).some(e => e.definition.id === effectId);
  }

  // ─── Listeners ─────────────────────────────────────────────────────────────

  subscribe(listener: (effects: ActiveEffect[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const effects = this.getActiveEffects();
    this.listeners.forEach(l => l(effects));
  }

  // ─── Reaction Burst Helper ─────────────────────────────────────────────────

  triggerReactionBurst(emoji: string, count = 5, sourceUserId?: string): void {
    const reactionMap: Record<string, string> = {
      '🔥': 'FIRE_REACTION',
      '❤️': 'HEART_REACTION',
      '👏': 'CLAP_REACTION',
      '👑': 'CROWN_REACTION',
      '⚡': 'LIGHTNING_REACTION',
    };

    const effectId = reactionMap[emoji];
    if (!effectId) return;

    // Stagger multiple bursts
    for (let i = 0; i < Math.min(count, 10); i++) {
      setTimeout(() => {
        this.trigger(effectId, { sourceUserId, metadata: { burst: i } });
      }, i * 150);
    }
  }

  // ─── Achievement Trigger ───────────────────────────────────────────────────

  triggerAchievement(isLegendary = false, userId?: string): void {
    const effectId = isLegendary ? 'ACHIEVEMENT_LEGENDARY' : 'ACHIEVEMENT_UNLOCK';
    this.trigger(effectId, { sourceUserId: userId });
  }

  // ─── Room Scene Helpers ────────────────────────────────────────────────────

  setRoomAmbient(effectId: string): void {
    // Stop existing ambient effects first
    this.stopByCategory('weather');
    this.stopByCategory('smoke');
    this.trigger(effectId);
  }

  triggerCelebration(tier: 'FREE' | 'SUPPORTER' | 'PRO' | 'ELITE' = 'FREE'): void {
    this.trigger('ROOM_CONFETTI');
    if (tier === 'ELITE') {
      setTimeout(() => this.trigger('ROOM_FIRE_PILLARS'), 500);
    }
  }
}

// ─── Singleton Export ──────────────────────────────────────────────────────────

export const effectsEngine = new EffectsEngine();

export function useEffectsEngine(): EffectsEngine {
  return effectsEngine;
}
