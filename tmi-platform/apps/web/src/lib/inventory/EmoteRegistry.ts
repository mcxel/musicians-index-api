/**
 * ==================================================================================
 * EMOTE REGISTRY
 * ==================================================================================
 * 
 * Dynamic emote registration system
 * Allows unlimited expansion of emotes without modifying core code
 * 
 * ==================================================================================
 */

import type { EmoteType } from '@/types/playWidget.contracts';
import { InventoryManager } from './InventoryManager';
import { logger } from '@/lib/logger';

export interface EmoteDefinition {
  type: EmoteType;
  name: string;
  icon: string;
  animation?: string;
  soundEffect?: string;
  tier: 'FREE' | 'PREMIUM' | 'VIP' | 'SPONSOR' | 'OVERSEER';
  cost: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export class EmoteRegistry {
  private static emotes = new Map<EmoteType, EmoteDefinition>();

  /**
   * Register a new emote
   */
  static registerEmote(definition: EmoteDefinition): void {
    if (this.emotes.has(definition.type)) {
      logger.warn(`[EmoteRegistry] Emote ${definition.type} already registered. Overwriting.`);
    }

    this.emotes.set(definition.type, definition);

    // Also register in inventory system
    InventoryManager.registerItem({
      id: `emote_${definition.type}`,
      type: 'emote',
      name: definition.name,
      description: `${definition.name} emote`,
      icon: definition.icon,
      tier: definition.tier,
      cost: definition.cost,
      rarity: definition.rarity,
      metadata: {
        emoteType: definition.type,
        animation: definition.animation,
        soundEffect: definition.soundEffect,
      },
    });
  }

  /**
   * Register multiple emotes
   */
  static registerEmotes(definitions: EmoteDefinition[]): void {
    definitions.forEach(def => this.registerEmote(def));
  }

  /**
   * Get emote definition
   */
  static getEmote(type: EmoteType): EmoteDefinition | undefined {
    return this.emotes.get(type);
  }

  /**
   * Get all registered emotes
   */
  static getAllEmotes(): EmoteDefinition[] {
    return Array.from(this.emotes.values());
  }

  /**
   * Get emotes by tier
   */
  static getEmotesByTier(tier: string): EmoteDefinition[] {
    return this.getAllEmotes().filter(emote => emote.tier === tier);
  }
}

// Initialize default emotes
EmoteRegistry.registerEmotes([
  { type: 'clap', name: 'Clap', icon: '👏', tier: 'FREE', cost: 0, rarity: 'common' },
  { type: 'heart', name: 'Heart', icon: '❤️', tier: 'FREE', cost: 0, rarity: 'common' },
  { type: 'star', name: 'Star', icon: '⭐', tier: 'PREMIUM', cost: 100, rarity: 'rare' },
  { type: 'fire', name: 'Fire', icon: '🔥', tier: 'PREMIUM', cost: 150, rarity: 'rare' },
  { type: 'rocket', name: 'Rocket', icon: '🚀', tier: 'PREMIUM', cost: 200, rarity: 'rare' },
  { type: 'trophy', name: 'Trophy', icon: '🏆', tier: 'VIP', cost: 500, rarity: 'epic' },
  { type: 'diamond', name: 'Diamond', icon: '💎', tier: 'VIP', cost: 1000, rarity: 'epic' },
  { type: 'crown', name: 'Crown', icon: '👑', tier: 'VIP', cost: 1500, rarity: 'legendary' },
  { type: 'lightning', name: 'Lightning', icon: '⚡', tier: 'SPONSOR', cost: 2000, rarity: 'legendary' },
  { type: 'boom', name: 'Boom', icon: '💥', tier: 'SPONSOR', cost: 2500, rarity: 'legendary' },
  { type: 'sparkles', name: 'Sparkles', icon: '✨', tier: 'SPONSOR', cost: 3000, rarity: 'legendary' },
]);
