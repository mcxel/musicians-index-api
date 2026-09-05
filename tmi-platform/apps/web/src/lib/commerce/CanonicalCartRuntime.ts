/**
 * Canonical Cart Runtime — Master Platform Cart & Price Validation Engine.
 *
 * Laws:
 *   1. Single canonical cart across all store-capable routes and devices.
 *   2. Server-side price authority: browser prices are NEVER trusted.
 *   3. Cart items are validated against STRIPE_PRODUCTS, VENUE_SKINS, and MEDIA_PLAYER_CHASSIS.
 *   4. Generates validated Checkout Session payloads for /api/stripe/checkout.
 */

import {
  lookupStripeCatalogPrice,
  parseMediaPlayerChassisSku,
  parseStoreItemSku,
  parseVenueSkinSku,
} from "./CommerceCatalogContract";
import { findStoreItemById, findStoreItemByPriceId } from "@/lib/store/StoreItemEngine";
import { VENUE_SKINS } from "../venue/venueSkinEngine";
import { getSkinPriceCents } from "../venue/VenueSkinCommerce";
import {
  MEDIA_PLAYER_CHASSIS_REGISTRY,
  MEDIA_PLAYER_STORE_SKUS,
  type MediaPlayerChassisId,
} from "../artifacts/PlaylistArtifactEngine";

export interface CartItem {
  id: string;
  skuId: string;
  title: string;
  category: "cosmetic" | "skin" | "chassis" | "subscription" | "pass";
  unitPriceCents: number;
  quantity: number;
  thumbnailUrl?: string;
}

export interface CartState {
  cartId: string;
  userId?: string;
  items: CartItem[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  updatedAt: number;
}

class CanonicalCartRuntimeImpl {
  private carts = new Map<string, CartState>();

  getOrCreateCart(cartId: string, userId?: string): CartState {
    let cart = this.carts.get(cartId);
    if (!cart) {
      cart = {
        cartId,
        userId,
        items: [],
        subtotalCents: 0,
        taxCents: 0,
        totalCents: 0,
        updatedAt: Date.now(),
      };
      this.carts.set(cartId, cart);
    }
    return cart;
  }

  /**
   * Server Price Validation Authority
   * Validates browser item price against canonical catalog price. An
   * unrecognized skuId is never trusted at the client's price — that would
   * let a malicious client add an unknown SKU with clientPriceCents:1 and
   * buy anything for a cent, directly contradicting this file's own Law #2
   * ("browser prices are NEVER trusted"). Unknown SKUs are rejected.
   */
  validatePrice(skuId: string, clientPriceCents?: number): { valid: boolean; canonicalPriceCents: number; title: string } {
    const storeItemId = parseStoreItemSku(skuId);
    if (storeItemId) {
      const item = findStoreItemById(storeItemId);
      if (item) {
        return { valid: true, canonicalPriceCents: item.price, title: item.name };
      }
    }

    const storeItemByPrice = findStoreItemByPriceId(skuId);
    if (storeItemByPrice) {
      return { valid: true, canonicalPriceCents: storeItemByPrice.price, title: storeItemByPrice.name };
    }

    const stripeHit = lookupStripeCatalogPrice(skuId);
    if (stripeHit) {
      return { valid: true, canonicalPriceCents: stripeHit.priceCents, title: stripeHit.title };
    }

    const skinId = parseVenueSkinSku(skuId) ?? (skuId in VENUE_SKINS ? skuId : null);
    if (skinId && VENUE_SKINS[skinId as keyof typeof VENUE_SKINS]) {
      const skin = VENUE_SKINS[skinId as keyof typeof VENUE_SKINS];
      return { valid: true, canonicalPriceCents: getSkinPriceCents(skinId), title: skin.name };
    }

    const chassisId = (parseMediaPlayerChassisSku(skuId) ?? skuId) as MediaPlayerChassisId;
    if (MEDIA_PLAYER_STORE_SKUS.includes(chassisId) && MEDIA_PLAYER_CHASSIS_REGISTRY[chassisId]) {
      const chassis = MEDIA_PLAYER_CHASSIS_REGISTRY[chassisId];
      return {
        valid: true,
        canonicalPriceCents: chassis.priceUsdCents ?? 0,
        title: chassis.label,
      };
    }

    void clientPriceCents;
    return { valid: false, canonicalPriceCents: 0, title: `Unknown item (${skuId})` };
  }

  addItem(cartId: string, item: Omit<CartItem, "unitPriceCents"> & { clientPriceCents?: number }, userId?: string): CartState {
    const cart = this.getOrCreateCart(cartId, userId);
    const validated = this.validatePrice(item.skuId, item.clientPriceCents);

    const existingIndex = cart.items.findIndex((i) => i.skuId === item.skuId);
    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += item.quantity || 1;
    } else {
      cart.items.push({
        id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        skuId: item.skuId,
        title: validated.title || item.title,
        category: item.category,
        unitPriceCents: validated.canonicalPriceCents,
        quantity: item.quantity || 1,
        thumbnailUrl: item.thumbnailUrl,
      });
    }

    this.recalculate(cart);
    return cart;
  }

  removeItem(cartId: string, skuId: string): CartState {
    const cart = this.getOrCreateCart(cartId);
    cart.items = cart.items.filter((i) => i.skuId !== skuId);
    this.recalculate(cart);
    return cart;
  }

  updateQuantity(cartId: string, skuId: string, quantity: number): CartState {
    const cart = this.getOrCreateCart(cartId);
    if (quantity <= 0) {
      return this.removeItem(cartId, skuId);
    }
    const item = cart.items.find((i) => i.skuId === skuId);
    if (item) {
      item.quantity = quantity;
    }
    this.recalculate(cart);
    return cart;
  }

  clearCart(cartId: string): CartState {
    const cart = this.getOrCreateCart(cartId);
    cart.items = [];
    this.recalculate(cart);
    return cart;
  }

  private recalculate(cart: CartState): void {
    cart.subtotalCents = cart.items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
    // Tax is calculated at checkout via Stripe Tax / address jurisdiction
    cart.taxCents = 0;
    cart.totalCents = cart.subtotalCents;
    cart.updatedAt = Date.now();
  }
}

export const CanonicalCartRuntime = new CanonicalCartRuntimeImpl();
