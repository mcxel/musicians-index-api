/**
 * ==================================================================================
 * INVENTORY MANAGER
 * ==================================================================================
 * 
 * Manages user inventory with unlimited expandability
 * Tracks emotes, accessories, backgrounds, voice effects
 * 
 * Features:
 * - User inventory persistence
 * - Item unlocking/purchase system
 * - Usage tracking
 * - Tier-based restrictions
 * - Dynamic expansion support
 * 
 * ==================================================================================
 */

import type { EmoteType, UserTier } from '@/components/play-widget/PlayWidget';

export type InventoryItemType = 
  | 'emote' 
  | 'accessory' 
  | 'background' 
  | 'voice_effect' 
  | 'animation' 
  | 'badge';

export interface InventoryItem {
  id: string;
  type: InventoryItemType;
  name: string;
  description: string;
  icon: string;
  tier: UserTier;
  cost: number; // in platform currency
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  metadata?: Record<string, any>;
}

export interface UserInventory {
  userId: string;
  items: InventoryItem[];
  currency: number;
  lastUpdated: Date;
}

export class InventoryManager {
  private static inventories = new Map<string, UserInventory>();
  private static registeredItems = new Map<string, InventoryItem>();

  /**
   * Register a new item in the global item registry
   * Enables unlimited expansion without modifying core code
   */
  static registerItem(item: InventoryItem): void {
    if (this.registeredItems.has(item.id)) {
      console.warn(`[InventoryManager] Item ${item.id} already registered. Overwriting.`);
    }
    this.registeredItems.set(item.id, item);
  }

  /**
   * Register multiple items at once
   */
  static registerItems(items: InventoryItem[]): void {
    items.forEach(item => this.registerItem(item));
  }

  /**
   * Get all registered items
   */
  static getAllItems(): InventoryItem[] {
    return Array.from(this.registeredItems.values());
  }

  /**
   * Get items by type
   */
  static getItemsByType(type: InventoryItemType): InventoryItem[] {
    return this.getAllItems().filter(item => item.type === type);
  }

  /**
   * Get items by tier
   */
  static getItemsByTier(tier: UserTier): InventoryItem[] {
    const tierOrder: UserTier[] = ['FREE', 'PREMIUM', 'VIP', 'SPONSOR', 'OVERSEER'];
    const userTierIndex = tierOrder.indexOf(tier);
    
    return this.getAllItems().filter(item => {
      const itemTierIndex = tierOrder.indexOf(item.tier);
      return itemTierIndex <= userTierIndex;
    });
  }

  /**
   * Get user inventory
   */
  static getUserInventory(userId: string): UserInventory {
    if (!this.inventories.has(userId)) {
      // Create default inventory with free items
      const freeItems = this.getItemsByTier('FREE');
      this.inventories.set(userId, {
        userId,
        items: freeItems,
        currency: 0,
        lastUpdated: new Date(),
      });
    }
    return this.inventories.get(userId)!;
  }

  /**
   * Check if user owns an item
   */
  static userOwnsItem(userId: string, itemId: string): boolean {
    const inventory = this.getUserInventory(userId);
    return inventory.items.some(item => item.id === itemId);
  }

  /**
   * Unlock an item for a user
   */
  static async unlockItem(userId: string, itemId: string): Promise<{
    success: boolean;
    message: string;
    inventory?: UserInventory;
  }> {
    const item = this.registeredItems.get(itemId);
    
    if (!item) {
      return { success: false, message: 'Item not found' };
    }

    const inventory = this.getUserInventory(userId);

    if (this.userOwnsItem(userId, itemId)) {
      return { success: false, message: 'Item already owned' };
    }

    if (inventory.currency < item.cost) {
      return { 
        success: false, 
        message: `Insufficient currency. Need ${item.cost}, have ${inventory.currency}` 
      };
    }

    // Deduct currency and add item
    inventory.currency -= item.cost;
    inventory.items.push(item);
    inventory.lastUpdated = new Date();

    return {
      success: true,
      message: `Successfully unlocked ${item.name}!`,
      inventory,
    };
  }

  /**
   * Grant free item to user (admin/promotion)
   */
  static grantItem(userId: string, itemId: string): boolean {
    const item = this.registeredItems.get(itemId);
    if (!item) return false;

    const inventory = this.getUserInventory(userId);
    if (this.userOwnsItem(userId, itemId)) return false;

    inventory.items.push(item);
    inventory.lastUpdated = new Date();
    return true;
  }

  /**
   * Add currency to user
   */
  static addCurrency(userId: string, amount: number): void {
    const inventory = this.getUserInventory(userId);
    inventory.currency += amount;
    inventory.lastUpdated = new Date();
  }

  /**
   * Get owned emotes for user
   */
  static getOwnedEmotes(userId: string): EmoteType[] {
    const inventory = this.getUserInventory(userId);
    const emoteItems = inventory.items.filter(item => item.type === 'emote');
    return emoteItems.map(item => item.metadata?.emoteType as EmoteType).filter(Boolean);
  }

  /**
   * Get available accessories for user
   */
  static getOwnedAccessories(userId: string): InventoryItem[] {
    const inventory = this.getUserInventory(userId);
    return inventory.items.filter(item => item.type === 'accessory');
  }
}

// Initialize default items
InventoryManager.registerItems([
  {
    id: 'emote_clap',
    type: 'emote',
    name: 'Clap',
    description: 'Show appreciation',
    icon: '👏',
    tier: 'FREE',
    cost: 0,
    rarity: 'common',
    metadata: { emoteType: 'clap' },
  },
  {
    id: 'emote_heart',
    type: 'emote',
    name: 'Heart',
    description: 'Spread the love',
    icon: '❤️',
    tier: 'FREE',
    cost: 0,
    rarity: 'common',
    metadata: { emoteType: 'heart' },
  },
  {
    id: 'emote_star',
    type: 'emote',
    name: 'Star',
    description: 'Premium reaction',
    icon: '⭐',
    tier: 'PREMIUM',
    cost: 100,
    rarity: 'rare',
    metadata: { emoteType: 'star' },
  },
]);
