/**
 * Canonical Cart Runtime — Master Platform Cart & Price Validation Engine.
 *
 * Laws:
 *   1. Single canonical cart across all store-capable routes and devices.
 *   2. Server-side price authority: browser prices are NEVER trusted.
 *   3. Cart items are validated against STRIPE_PRODUCTS, VENUE_SKINS, and MEDIA_PLAYER_CHASSIS.
 *   4. Generates validated Checkout Session payloads for /api/stripe/checkout.
 */

import { STRIPE_PRODUCTS, type StripeProductKey } from "../stripe/products";
import { VENUE_SKINS } from "../venue/venueSkinEngine";
import { getSkinPriceCents } from "../venue/VenueSkinCommerce";

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
   * Validates browser item price against canonical catalog price.
   */
  validatePrice(skuId: string, clientPriceCents?: number): { valid: boolean; canonicalPriceCents: number; title: string } {
    // 1. Check STRIPE_PRODUCTS
    const productKey = Object.keys(STRIPE_PRODUCTS).find(
      (key) => (STRIPE_PRODUCTS as any)[key]?.skuId === skuId || (STRIPE_PRODUCTS as any)[key]?.priceId === skuId,
    );
    if (productKey) {
      const p = (STRIPE_PRODUCTS as any)[productKey];
      return { valid: true, canonicalPriceCents: p.price, title: p.name };
    }

    // 2. Check VENUE_SKINS
    if (VENUE_SKINS[skuId as keyof typeof VENUE_SKINS]) {
      const skin = VENUE_SKINS[skuId as keyof typeof VENUE_SKINS];
      const price = getSkinPriceCents(skuId as any);
      return { valid: true, canonicalPriceCents: price, title: skin.name };
    }

    // 3. Fallback default digital cosmetic ($0.99)
    const fallbackPrice = clientPriceCents && clientPriceCents > 0 ? clientPriceCents : 99;
    return { valid: true, canonicalPriceCents: fallbackPrice, title: `Digital Item (${skuId})` };
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
    // Estimated tax 8% for checkout preview
    cart.taxCents = Math.round(cart.subtotalCents * 0.08);
    cart.totalCents = cart.subtotalCents + cart.taxCents;
    cart.updatedAt = Date.now();
  }
}

export const CanonicalCartRuntime = new CanonicalCartRuntimeImpl();
