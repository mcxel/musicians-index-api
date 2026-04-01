/**
 * Store Engine — Client-Side
 * Handles cart, product catalog, purchases, inventory, and order history.
 *
 * Connects to: /api/store/* REST endpoints
 * Integrates with: EconomyEngine (discounts), WalletService (payments)
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ProductCategory =
  | 'AVATAR_ITEM' | 'JULIUS_SKIN' | 'JULIUS_ANIMATION' | 'JULIUS_PET'
  | 'ROOM_THEME' | 'LOBBY_UPGRADE' | 'EFFECT_PACK' | 'MERCH'
  | 'SUBSCRIPTION' | 'TICKET' | 'BOOST' | 'BUNDLE';

export type ProductCurrency = 'USD' | 'NGN' | 'IDR' | 'ZAR' | 'EUR' | 'GBP' | 'KES' | 'GHS' | 'POINTS';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface StoreProduct {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  currency: ProductCurrency;
  originalPrice?: number;
  discountPercent?: number;
  imageUrl?: string;
  previewUrl?: string;
  tags: string[];
  inStock: boolean;
  owned: boolean;
  featured: boolean;
  newArrival: boolean;
  limitedEdition: boolean;
  expiresAt?: number;
  metadata?: Record<string, unknown>;
}

export interface CartItem {
  productId: string;
  product: StoreProduct;
  quantity: number;
  unitPrice: number;
  currency: ProductCurrency;
  discountApplied: number;
  lineTotal: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  currency: ProductCurrency;
  itemCount: number;
  couponCode?: string;
  couponDiscount?: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  currency: ProductCurrency;
  status: OrderStatus;
  paymentMethod: string;
  createdAt: number;
  completedAt?: number;
  receiptUrl?: string;
}

export interface StoreFilters {
  category?: ProductCategory;
  currency?: ProductCurrency;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  featured?: boolean;
  newArrivals?: boolean;
  inStock?: boolean;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'name';
  page?: number;
  limit?: number;
}

// ─── Store Engine ──────────────────────────────────────────────────────────────

export class StoreEngine {
  private cart: Cart;
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();
  private baseUrl: string;
  private userTier: 'FREE' | 'SUPPORTER' | 'PRO' | 'ELITE' = 'FREE';

  private readonly TIER_DISCOUNTS: Record<string, number> = {
    FREE: 0, SUPPORTER: 5, PRO: 10, ELITE: 20,
  };

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
    this.cart = this.emptyCart();
  }

  private emptyCart(): Cart {
    return { items: [], subtotal: 0, discount: 0, total: 0, currency: 'USD', itemCount: 0 };
  }

  // ─── Event Bus ─────────────────────────────────────────────────────────────

  on(event: string, listener: (...args: unknown[]) => void): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener);
    return () => this.listeners.get(event)?.delete(listener);
  }

  private fire(event: string, data: unknown): void {
    this.listeners.get(event)?.forEach(fn => fn(data));
  }

  // ─── Tier Management ────────────────────────────────────────────────────────

  setUserTier(tier: 'FREE' | 'SUPPORTER' | 'PRO' | 'ELITE'): void {
    this.userTier = tier;
    this.recalculateCart();
  }

  getTierDiscount(): number {
    return this.TIER_DISCOUNTS[this.userTier] ?? 0;
  }

  // ─── Cart Operations ────────────────────────────────────────────────────────

  addToCart(product: StoreProduct, quantity = 1): void {
    if (!product.inStock || product.owned) return;

    const existing = this.cart.items.find(i => i.productId === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      const discountApplied = this.getTierDiscount();
      const unitPrice = product.price;
      const discountedPrice = Math.round(unitPrice * (1 - discountApplied / 100));
      this.cart.items.push({
        productId: product.id,
        product,
        quantity,
        unitPrice,
        currency: product.currency,
        discountApplied,
        lineTotal: discountedPrice * quantity,
      });
    }
    this.recalculateCart();
    this.fire('cart_updated', this.cart);
  }

  removeFromCart(productId: string): void {
    this.cart.items = this.cart.items.filter(i => i.productId !== productId);
    this.recalculateCart();
    this.fire('cart_updated', this.cart);
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    const item = this.cart.items.find(i => i.productId === productId);
    if (item) {
      item.quantity = quantity;
      item.lineTotal = Math.round(item.unitPrice * (1 - item.discountApplied / 100)) * quantity;
      this.recalculateCart();
      this.fire('cart_updated', this.cart);
    }
  }

  clearCart(): void {
    this.cart = this.emptyCart();
    this.fire('cart_cleared', null);
    this.fire('cart_updated', this.cart);
  }

  applyCoupon(code: string, discountPercent: number): void {
    this.cart.couponCode = code;
    this.cart.couponDiscount = discountPercent;
    this.recalculateCart();
    this.fire('coupon_applied', { code, discountPercent });
    this.fire('cart_updated', this.cart);
  }

  removeCoupon(): void {
    delete this.cart.couponCode;
    delete this.cart.couponDiscount;
    this.recalculateCart();
    this.fire('cart_updated', this.cart);
  }

  private recalculateCart(): void {
    const subtotal = this.cart.items.reduce((sum, item) => {
      return sum + item.unitPrice * item.quantity;
    }, 0);

    const tierDiscount = this.getTierDiscount();
    const couponDiscount = this.cart.couponDiscount ?? 0;
    const totalDiscountPct = Math.min(tierDiscount + couponDiscount, 50); // cap at 50%

    const discount = Math.round(subtotal * totalDiscountPct / 100);
    const total = subtotal - discount;

    this.cart.subtotal = subtotal;
    this.cart.discount = discount;
    this.cart.total = total;
    this.cart.itemCount = this.cart.items.reduce((sum, i) => sum + i.quantity, 0);

    // Recalculate line totals
    this.cart.items.forEach(item => {
      const itemDiscount = Math.round(item.unitPrice * totalDiscountPct / 100);
      item.discountApplied = totalDiscountPct;
      item.lineTotal = (item.unitPrice - itemDiscount) * item.quantity;
    });
  }

  // ─── Cart Accessors ─────────────────────────────────────────────────────────

  getCart(): Cart { return { ...this.cart, items: [...this.cart.items] }; }
  getCartTotal(): number { return this.cart.total; }
  getCartItemCount(): number { return this.cart.itemCount; }
  isInCart(productId: string): boolean { return this.cart.items.some(i => i.productId === productId); }

  // ─── Price Formatting ───────────────────────────────────────────────────────

  formatPrice(amount: number, currency: ProductCurrency): string {
    if (currency === 'POINTS') return `${amount.toLocaleString()} pts`;
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
      }).format(amount / 100);
    } catch {
      return `${amount / 100} ${currency}`;
    }
  }

  getDiscountedPrice(product: StoreProduct): number {
    const discount = this.getTierDiscount();
    return Math.round(product.price * (1 - discount / 100));
  }

  getSavingsAmount(product: StoreProduct): number {
    return product.price - this.getDiscountedPrice(product);
  }

  // ─── REST API ───────────────────────────────────────────────────────────────

  async fetchProducts(filters?: StoreFilters): Promise<{ products: StoreProduct[]; total: number; page: number }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          params.set(k, Array.isArray(v) ? v.join(',') : String(v));
        }
      });
    }
    const url = `${this.baseUrl}/store/products${params.toString() ? `?${params}` : ''}`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error(`Store products fetch failed: ${res.status}`);
    return res.json();
  }

  async fetchProduct(id: string): Promise<StoreProduct> {
    const res = await fetch(`${this.baseUrl}/store/products/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Store product fetch failed: ${res.status}`);
    return res.json() as Promise<StoreProduct>;
  }

  async fetchFeatured(): Promise<StoreProduct[]> {
    const res = await fetch(`${this.baseUrl}/store/featured`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Store featured fetch failed: ${res.status}`);
    return res.json() as Promise<StoreProduct[]>;
  }

  async checkout(paymentMethod: string): Promise<Order> {
    if (this.cart.items.length === 0) throw new Error('Cart is empty');
    const res = await fetch(`${this.baseUrl}/store/checkout`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: this.cart.items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        couponCode: this.cart.couponCode,
        paymentMethod,
      }),
    });
    if (!res.ok) throw new Error(`Checkout failed: ${res.status}`);
    const order = await res.json() as Order;
    if (order.status === 'COMPLETED') {
      this.clearCart();
      this.fire('purchase_complete', order);
    }
    return order;
  }

  async fetchOrderHistory(limit = 20): Promise<Order[]> {
    const res = await fetch(`${this.baseUrl}/store/orders?limit=${limit}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Order history fetch failed: ${res.status}`);
    return res.json() as Promise<Order[]>;
  }

  async fetchInventory(): Promise<StoreProduct[]> {
    const res = await fetch(`${this.baseUrl}/store/inventory`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Inventory fetch failed: ${res.status}`);
    return res.json() as Promise<StoreProduct[]>;
  }

  async validateCoupon(code: string): Promise<{ valid: boolean; discountPercent: number; message?: string }> {
    const res = await fetch(`${this.baseUrl}/store/coupons/validate`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) return { valid: false, discountPercent: 0, message: 'Invalid coupon' };
    return res.json();
  }
}

// ─── Singleton Export ──────────────────────────────────────────────────────────

export const storeEngine = new StoreEngine();

export function useStoreEngine(): StoreEngine {
  return storeEngine;
}
