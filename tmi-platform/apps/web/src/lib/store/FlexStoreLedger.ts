// ─── TMI 3D Flex Store & Entitlement Ledger Engine ───────────────────────────
// Canonical entitlement ledger, item catalog, micro-pricing matrix ($0.99 - $4.99),
// 3D showroom wings, rotating collection timers, and locker sync.
//
// REAL-OBJECT LAW: customer purchasable listings require a verifiable preview asset
// (distinct dance clip, GLB/geometry, YoPho/media, baseball-card benefit, or season offer).
// Emoji-only / undeliverable SKUs stay out of BUY surfaces (admin diagnostics only).

import { getFanCosmetic } from '@/lib/avatars/FanCosmeticCatalog';
import { resolveShowroomBodyClip } from '@/lib/avatars/EmoteEngine';

export type FlexItemType =
  | 'APPAREL'
  | 'HAIR'
  | 'ACCESSORY'
  | 'EMOTE'
  | 'YOPHO_TEMPLATE'
  | 'PLAYLIST_SKIN'
  | 'VENUE_SKIN'
  | 'BEAT_LICENSE'
  | 'NFT_COLLECTIBLE'
  | 'SEASON_PASS'
  | 'PROMOTION_BOOSTER';

export type CollectionTier =
  | 'EVERYDAY'       // Always available
  | 'SEASONAL'       // Available during specific season/event
  | 'FEATURED'       // 7-day limited rotation
  | 'CREATOR'        // Performer/producer custom release
  | 'CHAMPIONSHIP';  // Earned through competition wins

export interface FlexStoreItem {
  id: string;
  name: string;
  description: string;
  itemType: FlexItemType;
  collectionTier: CollectionTier;
  priceCents: number; // 99 for $0.99, 299 for $2.99, 499 for $4.99
  stripePriceId?: string;
  icon: string;
  badge?: 'NEW' | 'HOT' | 'LIMITED' | 'CHAMPION' | '7-DAY ROTATION' | 'SEASON';
  preview: {
    thumbnail: string;
    modelUrl?: string;
    animationUrl?: string;
    accentColor: string;
  };
  rotationExpiresAt?: string; // ISO date string for limited rotation items
  compatibility?: {
    roles?: string[];
    requiredLevel?: number;
  };
}

export interface UserEntitlement {
  id: string;
  userId: string;
  itemId: string;
  acquiredAt: string;
  source: 'PURCHASE' | 'SEASON_PASS' | 'COMPETITION_WIN' | 'REWARD';
  licenseType?: 'PERSONAL' | 'COMMERCIAL_BEAT' | 'PERFORMANCE_RIGHTS';
}

// ─── CANONICAL FLEX STORE CATALOG ($0.99 - $4.99 Micro-Pricing) ─────────────
export const FLEX_STORE_CATALOG: FlexStoreItem[] = [
  // ── 0. VENUE SKINS ($2.99 - $4.99) ──
  {
    id: 'venue-skin-rooftop-penthouse',
    name: 'Skyline Penthouse Lounge Skin',
    description: '3D luxury penthouse venue with rooftop pool & panoramic city view.',
    itemType: 'VENUE_SKIN',
    collectionTier: 'FEATURED',
    priceCents: 499,
    icon: '🏙️',
    badge: 'HOT',
    preview: {
      thumbnail: '/bot-images/Bot image 1.png',
      accentColor: '#FF2DAA',
    },
  },
  {
    id: 'venue-skin-underground-cypher',
    name: 'Underground Cypher Club Skin',
    description: 'Graffiti brick basement venue with neon strobe lighting & cypher pit.',
    itemType: 'VENUE_SKIN',
    collectionTier: 'EVERYDAY',
    priceCents: 299,
    icon: '🎙️',
    badge: 'NEW',
    preview: {
      thumbnail: '/bot-images/Bot image 2.png',
      accentColor: '#00FFFF',
    },
  },
  // ── 1. AVATAR APPAREL & ACCESSORIES ($0.99 - $2.99) ──
  {
    id: 'cyber-jacket-neon',
    name: 'Cyberpunk Neon Leather Jacket',
    description: 'Neon LED leather jacket for 3D Avatar Runtime v0 (Foundry bomber mesh)',
    itemType: 'APPAREL',
    collectionTier: 'FEATURED',
    priceCents: 299,
    icon: '🧥',
    badge: '7-DAY ROTATION',
    preview: {
      thumbnail: '/bot-images/Bot image 1.png',
      modelUrl: '/models/avatars/foundry/outerwear_bomber_hoodie_jacket_v1.glb',
      accentColor: '#00E5FF',
    },
    rotationExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'holographic-sneakers-gold',
    name: 'Gold Holographic Kicks',
    description: 'Gold sneakers with spark trail accent — Foundry modular athletic sneaker mesh',
    itemType: 'APPAREL',
    collectionTier: 'EVERYDAY',
    priceCents: 99,
    icon: '👟',
    badge: 'HOT',
    preview: {
      thumbnail: '/bot-images/Bot image 2.png',
      modelUrl: '/models/avatars/foundry/shoes_modular_athletic_sneaker_v1.glb',
      accentColor: '#FFD700',
    },
  },
  {
    id: 'afro-fade-gradient',
    name: 'Gradient Sunrise Afro Fade',
    description: 'Custom 3D hairstyle with magenta-to-gold gradient tips — Foundry high taper fade mesh',
    itemType: 'HAIR',
    collectionTier: 'EVERYDAY',
    priceCents: 99,
    icon: '✂️',
    badge: 'NEW',
    preview: {
      thumbnail: '/bot-images/Bot image 3.png',
      modelUrl: '/models/avatars/foundry/hair_high_taper_sponged_fade_v1.glb',
      accentColor: '#FF2DAA',
    },
  },
  {
    id: 'diamond-shades-vip',
    name: 'Diamond VIP Sunglasses',
    description: 'Reflective gold-rimmed tinted shades with lens light glare',
    itemType: 'ACCESSORY',
    collectionTier: 'SEASONAL',
    priceCents: 199,
    icon: '🕶️',
    badge: 'LIMITED',
    preview: {
      thumbnail: '/bot-images/Bot image 4.png',
      accentColor: '#00FF88',
    },
  },

  // ── 2. ANIMATED EMOTES — FanCosmeticCatalog IDs (real AvatarViewer Dance clip) ──
  {
    id: 'emote_dance',
    name: 'Two-Step / Vibe',
    description: 'Two-Step dance — mannequin plays Dance_TwoStep_v1 from the WDP pack',
    itemType: 'EMOTE',
    collectionTier: 'EVERYDAY',
    priceCents: 0,
    icon: '💃',
    badge: 'HOT',
    preview: {
      thumbnail: '/bot-images/Bot image 5.png',
      animationUrl: 'dance_twostep',
      modelUrl: '/models/avatars/bobblehead_urban_cap_v1.glb',
      accentColor: '#FF2DAA',
    },
  },
  {
    id: 'emote_dance_hype',
    name: 'Hype-Man',
    description: 'Hype-Man dance — mannequin plays Dance_HandsUp_v1 from the WDP pack',
    itemType: 'EMOTE',
    collectionTier: 'FEATURED',
    priceCents: 160,
    icon: '📢',
    badge: '7-DAY ROTATION',
    preview: {
      thumbnail: '/bot-images/Bot image 6.png',
      animationUrl: 'dance_hype',
      modelUrl: '/models/avatars/bobblehead_urban_cap_v1.glb',
      accentColor: '#FF6600',
    },
    rotationExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'emote_dance_hiphop',
    name: 'Groove / Hip-Hop',
    description: 'Groove dance — mannequin plays Dance_Groove_v1 from the WDP pack',
    itemType: 'EMOTE',
    collectionTier: 'CHAMPIONSHIP',
    priceCents: 120,
    icon: '🕺',
    badge: 'CHAMPION',
    preview: {
      thumbnail: '/bot-images/Bot image 7.png',
      animationUrl: 'dance_hiphop',
      modelUrl: '/models/avatars/bobblehead_urban_cap_v1.glb',
      accentColor: '#AA2DFF',
    },
  },

  // ── 3. PERFORMER YOPHO & PLAYLIST UPGRADES ($0.99 - $4.99) ──
  {
    id: 'yopho-album-master-skin',
    name: 'Vintage 90s Album Cover YoPho Skin',
    description: 'Vinyl press framing, airbrush lighting & double-exposure YoPho canvas',
    itemType: 'YOPHO_TEMPLATE',
    collectionTier: 'FEATURED',
    priceCents: 99,
    icon: '🖼️',
    badge: 'HOT',
    preview: {
      thumbnail: '/yopho/Yoho Canvas base 4.mp4',
      accentColor: '#00E5FF',
    },
  },
  {
    id: 'playlist-neon-cyber-skin',
    name: 'Neon Cyberpunk Playlist Wrapper',
    description: 'Audio-reactive neon spectrum equalizer UI wrapper for artist playlists',
    itemType: 'PLAYLIST_SKIN',
    collectionTier: 'EVERYDAY',
    priceCents: 99,
    icon: '🎧',
    badge: 'NEW',
    preview: {
      thumbnail: '/yopho/Yoho Canvas base 2.mp4',
      accentColor: '#AA2DFF',
    },
  },
  {
    id: 'promotion-booster-headline',
    name: '7-Day Headline Discovery Booster',
    description: 'Boosts performer track & profile into top billboard carousel across all hubs',
    itemType: 'PROMOTION_BOOSTER',
    collectionTier: 'CREATOR',
    priceCents: 499,
    icon: '🚀',
    badge: 'HOT',
    preview: {
      thumbnail: '/bot-images/Bot image 8.png',
      accentColor: '#FF2DAA',
    },
  },

  // ── 4. BEATS & NFTS WING ($2.99 - $4.99) ──
  {
    id: 'beat-cypher-anthem-2026',
    name: 'Cypher Arena Battle Beat (Full Commercial License)',
    description: 'Heavy 90 BPM boom-bap battle beat produced by ProdigyBeats with full rights',
    itemType: 'BEAT_LICENSE',
    collectionTier: 'CREATOR',
    priceCents: 499,
    icon: '🎹',
    badge: 'HOT',
    preview: {
      thumbnail: '/yopho/Yopho base 1.jpg',
      accentColor: '#FFD700',
    },
  },
  {
    id: 'nft-founding-genesis-pass',
    name: 'TMI Genesis Founders Collectible NFT',
    description: 'Verified platform collectible badge giving permanent 2x XP boost & VIP room access',
    itemType: 'NFT_COLLECTIBLE',
    collectionTier: 'FEATURED',
    priceCents: 499,
    icon: '💎',
    badge: 'LIMITED',
    preview: {
      thumbnail: '/bot-images/Bot image 9.png',
      accentColor: '#00E5FF',
    },
    rotationExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // ── 5. SEASON PASS (platform progression — not Monday Night Stage admission) ──
  {
    id: 'monday-night-stage-vip-pass',
    name: 'TMI Season Pass',
    description:
      'Quarterly instrument Season Pass (4×3 months/year) — animated instrument progression, coins, store rewards, and promotions. Monday Night Stage remains a separate show.',
    itemType: 'SEASON_PASS',
    collectionTier: 'SEASONAL',
    priceCents: 499,
    icon: '🎸',
    badge: 'SEASON',
    preview: {
      thumbnail: '/bot-images/Bot image 10.png',
      accentColor: '#FFD700',
    },
  },
];

// ─── REAL-OBJECT PRODUCT INTEGRITY (customer BUY gate) ───────────────────────
export type FlexPresentationMode =
  | 'AVATAR_DANCE'
  | 'AVATAR_TRYON_MESH'
  | 'AVATAR_TRYON_TINT'
  | 'YOPHO_MEDIA'
  | 'BASEBALL_CARD'
  | 'SEASON_INSTRUMENT'
  | 'AUDIO_PREVIEW'
  | 'ENVIRONMENT'
  | 'UNAVAILABLE';

export type FlexProductIntegrity = {
  productId: string;
  purchasable: boolean;
  presentation: FlexPresentationMode;
  reason: string;
  assetId: string | null;
  assetUrl: string | null;
};

function hasRealMediaPath(path: string | undefined | null): boolean {
  if (!path || !path.trim()) return false;
  if (path.startsWith('emoji:') || path.startsWith('data:')) return false;
  return (
    path.startsWith('/models/') ||
    path.startsWith('/yopho/') ||
    path.startsWith('/sounds/') ||
    path.startsWith('/images/') ||
    path.startsWith('/bot-images/') ||
    path.startsWith('http://') ||
    path.startsWith('https://')
  );
}

/** Customer-facing integrity check — fail closed for missing real assets. */
export function evaluateFlexProductIntegrity(item: FlexStoreItem): FlexProductIntegrity {
  const cosmetic = getFanCosmetic(item.id);

  if (item.itemType === 'EMOTE' || cosmetic?.emoteKind === 'dance') {
    const binding = resolveShowroomBodyClip({
      emoteKind: cosmetic?.emoteKind ?? 'dance',
      animationId: cosmetic?.animationId ?? item.preview.animationUrl,
    });
    if (binding.status === 'BOUND_DISTINCT') {
      return {
        productId: item.id,
        purchasable: true,
        presentation: 'AVATAR_DANCE',
        reason: `Distinct clip ${binding.clip}`,
        assetId: binding.clip,
        assetUrl: binding.packUrl,
      };
    }
    return {
      productId: item.id,
      purchasable: false,
      presentation: 'UNAVAILABLE',
      reason:
        binding.status === 'BOUND_SHARED_DANCE'
          ? 'Shared Dance fallback must not sell as a distinct emote'
          : binding.status === 'UNAVAILABLE'
            ? binding.reason
            : 'No distinct dance clip bound',
      assetId: cosmetic?.animationId ?? item.preview.animationUrl ?? null,
      assetUrl: null,
    };
  }

  if (item.itemType === 'APPAREL' || item.itemType === 'HAIR' || item.itemType === 'ACCESSORY') {
    const glb = cosmetic?.glbUrl ?? item.preview.modelUrl;
    if (glb && hasRealMediaPath(glb) && !glb.includes('bobblehead_v0')) {
      return {
        productId: item.id,
        purchasable: true,
        presentation: 'AVATAR_TRYON_MESH',
        reason: 'Wearable GLB bound',
        assetId: cosmetic?.id ?? item.id,
        assetUrl: glb,
      };
    }
    // Tint-only / emoji-icon apparel is not a real purchasable mesh product.
    return {
      productId: item.id,
      purchasable: false,
      presentation: 'UNAVAILABLE',
      reason: 'No wearable mesh GLB — tint/emoji preview is not a sellable product asset',
      assetId: cosmetic?.id ?? item.id,
      assetUrl: glb ?? null,
    };
  }

  if (item.itemType === 'PROMOTION_BOOSTER') {
    return {
      productId: item.id,
      purchasable: true,
      presentation: 'BASEBALL_CARD',
      reason: 'Intangible benefit uses baseball-card presentation',
      assetId: item.id,
      assetUrl: hasRealMediaPath(item.preview.thumbnail) ? item.preview.thumbnail : null,
    };
  }

  if (item.itemType === 'YOPHO_TEMPLATE' || item.itemType === 'PLAYLIST_SKIN') {
    if (hasRealMediaPath(item.preview.thumbnail)) {
      return {
        productId: item.id,
        purchasable: true,
        presentation: 'YOPHO_MEDIA',
        reason: 'YoPho/media preview asset present',
        assetId: item.id,
        assetUrl: item.preview.thumbnail,
      };
    }
    return {
      productId: item.id,
      purchasable: false,
      presentation: 'UNAVAILABLE',
      reason: 'Missing YoPho/media preview asset',
      assetId: item.id,
      assetUrl: null,
    };
  }

  if (item.itemType === 'SEASON_PASS') {
    return {
      productId: item.id,
      purchasable: true,
      presentation: 'SEASON_INSTRUMENT',
      reason: 'Season Pass offer — instrument progression via SeasonPassInstrumentEngine',
      assetId: item.id,
      assetUrl: '/season-pass',
    };
  }

  if (item.itemType === 'BEAT_LICENSE') {
    const audio = item.preview.animationUrl ?? item.preview.modelUrl;
    if (hasRealMediaPath(audio) || hasRealMediaPath(item.preview.thumbnail)) {
      return {
        productId: item.id,
        purchasable: Boolean(audio && hasRealMediaPath(audio)),
        presentation: audio && hasRealMediaPath(audio) ? 'AUDIO_PREVIEW' : 'UNAVAILABLE',
        reason:
          audio && hasRealMediaPath(audio)
            ? 'Authorized audio preview path present'
            : 'Beat SKU lacks authorized audio preview — not purchasable',
        assetId: item.id,
        assetUrl: audio && hasRealMediaPath(audio) ? audio : null,
      };
    }
    return {
      productId: item.id,
      purchasable: false,
      presentation: 'UNAVAILABLE',
      reason: 'Beat SKU lacks authorized audio preview',
      assetId: item.id,
      assetUrl: null,
    };
  }

  if (item.itemType === 'NFT_COLLECTIBLE') {
    return {
      productId: item.id,
      purchasable: false,
      presentation: 'UNAVAILABLE',
      reason: 'NFT purchasing not exposed — unsupported commerce path',
      assetId: item.id,
      assetUrl: null,
    };
  }

  if (item.itemType === 'VENUE_SKIN') {
    const model = item.preview.modelUrl;
    if (model && hasRealMediaPath(model)) {
      return {
        productId: item.id,
        purchasable: true,
        presentation: 'ENVIRONMENT',
        reason: 'Venue environment GLB bound',
        assetId: item.id,
        assetUrl: model,
      };
    }
    return {
      productId: item.id,
      purchasable: false,
      presentation: 'UNAVAILABLE',
      reason: 'Venue skin missing environment GLB',
      assetId: item.id,
      assetUrl: null,
    };
  }

  return {
    productId: item.id,
    purchasable: false,
    presentation: 'UNAVAILABLE',
    reason: `No integrity rule for itemType ${item.itemType}`,
    assetId: item.id,
    assetUrl: null,
  };
}

/** Customer catalog — only SKUs that pass real-object integrity. */
export function listPurchasableFlexItems(items: FlexStoreItem[] = FLEX_STORE_CATALOG): FlexStoreItem[] {
  return items.filter((i) => evaluateFlexProductIntegrity(i).purchasable);
}

export function listAdminDiagnosticFlexItems(items: FlexStoreItem[] = FLEX_STORE_CATALOG): FlexStoreItem[] {
  return items.filter((i) => !evaluateFlexProductIntegrity(i).purchasable);
}

// ─── ENTITLEMENT LEDGER LOCAL STORAGE STORAGE HELPERS ───────────────────────
const ENTITLEMENT_STORAGE_KEY = 'tmi_user_entitlement_ledger';

export function getOwnedEntitlementIds(): string[] {
  if (typeof window === 'undefined') return ['urban-loft-starter', 'afro-fade-gradient'];
  try {
    const raw = localStorage.getItem(ENTITLEMENT_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as string[];
    }
  } catch (err) {
    console.error('Failed to parse entitlement ledger:', err);
  }
  // Default free starters
  const starters = ['urban-loft-starter', 'afro-fade-gradient', 'emote-bursting-hearts'];
  localStorage.setItem(ENTITLEMENT_STORAGE_KEY, JSON.stringify(starters));
  return starters;
}

export function isItemOwned(itemId: string): boolean {
  const owned = getOwnedEntitlementIds();
  return owned.includes(itemId);
}

export function purchaseFlexItem(itemId: string): { ok: boolean; message: string } {
  const item = FLEX_STORE_CATALOG.find((i) => i.id === itemId);
  if (item) {
    const integrity = evaluateFlexProductIntegrity(item);
    if (!integrity.purchasable) {
      return { ok: false, message: `Not for sale — ${integrity.reason}` };
    }
  }
  const current = getOwnedEntitlementIds();
  if (current.includes(itemId)) {
    return { ok: true, message: 'Item already owned in your Locker!' };
  }
  const updated = [...current, itemId];
  try {
    localStorage.setItem(ENTITLEMENT_STORAGE_KEY, JSON.stringify(updated));
    // Trigger XP reward event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tmi-xp-reward', { detail: { amount: 150, reason: 'Flex Store Purchase' } }));
    }
    return { ok: true, message: 'Item purchased & unlocked in your Locker!' };
  } catch (err) {
    console.error('Failed to write purchase entitlement:', err);
    return { ok: false, message: 'Failed to record purchase entitlement.' };
  }
}

export function formatFlexPrice(cents: number): string {
  if (cents % 100 === 0) return `$${cents / 100}`;
  return `$${(cents / 100).toFixed(2)}`;
}
