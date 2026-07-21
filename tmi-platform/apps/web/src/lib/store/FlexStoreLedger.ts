// ─── TMI 3D Flex Store & Entitlement Ledger Engine ───────────────────────────
// Canonical entitlement ledger, item catalog, micro-pricing matrix ($0.99 - $4.99),
// 3D showroom wings, rotating collection timers, and locker sync.

export type FlexItemType =
  | 'APPAREL'
  | 'HAIR'
  | 'ACCESSORY'
  | 'EMOTE'
  | 'YOPHO_TEMPLATE'
  | 'PLAYLIST_SKIN'
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
  badge?: 'NEW' | 'HOT' | 'LIMITED' | 'CHAMPION' | '7-DAY ROTATION';
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
  // ── 1. AVATAR APPAREL & ACCESSORIES ($0.99 - $2.99) ──
  {
    id: 'cyber-jacket-neon',
    name: 'Cyberpunk Neon Leather Jacket',
    description: 'Ultra-realistic glowing LED leather jacket for your 3D avatar',
    itemType: 'APPAREL',
    collectionTier: 'FEATURED',
    priceCents: 299,
    icon: '🧥',
    badge: '7-DAY ROTATION',
    preview: {
      thumbnail: '/bot-images/Bot image 1.png',
      accentColor: '#00E5FF',
    },
    rotationExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'holographic-sneakers-gold',
    name: 'Gold Holographic Kicks',
    description: 'PBR metallic gold sneakers with ground spark trail particles',
    itemType: 'APPAREL',
    collectionTier: 'EVERYDAY',
    priceCents: 99,
    icon: '👟',
    badge: 'HOT',
    preview: {
      thumbnail: '/bot-images/Bot image 2.png',
      accentColor: '#FFD700',
    },
  },
  {
    id: 'afro-fade-gradient',
    name: 'Gradient Sunrise Afro Fade',
    description: 'Custom 3D hairstyle with magenta-to-gold gradient tips',
    itemType: 'HAIR',
    collectionTier: 'EVERYDAY',
    priceCents: 99,
    icon: '✂️',
    badge: 'NEW',
    preview: {
      thumbnail: '/bot-images/Bot image 3.png',
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

  // ── 2. ANIMATED EMOTES & REACTIONS ($0.99 - $1.99) ──
  {
    id: 'emote-bursting-hearts',
    name: 'Bursting Hearts 3D Aura',
    description: 'Triggers a cascading shower of 3D floating hearts over your avatar during live broadcasts',
    itemType: 'EMOTE',
    collectionTier: 'EVERYDAY',
    priceCents: 99,
    icon: '💖',
    badge: 'HOT',
    preview: {
      thumbnail: '/bot-images/Bot image 5.png',
      animationUrl: 'hearts_burst',
      accentColor: '#FF2DAA',
    },
  },
  {
    id: 'emote-flaming-stage',
    name: 'Rising Stage Flames',
    description: 'Summons hyper-realistic pyro fire pillars around your performer stage',
    itemType: 'EMOTE',
    collectionTier: 'FEATURED',
    priceCents: 199,
    icon: '🔥',
    badge: '7-DAY ROTATION',
    preview: {
      thumbnail: '/bot-images/Bot image 6.png',
      animationUrl: 'fire_pillars',
      accentColor: '#FF5500',
    },
    rotationExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'emote-gold-champion-aura',
    name: 'Crown Winner Gold Aura',
    description: 'Surrounds avatar in rotating gold trophy light beams and confetti rain',
    itemType: 'EMOTE',
    collectionTier: 'CHAMPIONSHIP',
    priceCents: 299,
    icon: '👑',
    badge: 'CHAMPION',
    preview: {
      thumbnail: '/bot-images/Bot image 7.png',
      animationUrl: 'gold_crown_aura',
      accentColor: '#FFD700',
    },
  },

  // ── 3. PERFORMER YOPHO & PLAYLIST UPGRADES ($0.99 - $4.99) ──
  {
    id: 'yopho-album-master-skin',
    name: 'Vintage 90s Album Cover YoPho Skin',
    description: 'Photorealistic vinyl press framing, airbrush lighting & double-exposure canvas',
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

  // ── 5. SEASON PASS & TICKETS ($4.99) ──
  {
    id: 'monday-night-stage-vip-pass',
    name: "Marcel's Monday Night Stage VIP Pass",
    description: 'Front-row judge voting booth seat + exclusive performer prize pool access',
    itemType: 'SEASON_PASS',
    collectionTier: 'SEASONAL',
    priceCents: 499,
    icon: '🎫',
    badge: 'LIMITED',
    preview: {
      thumbnail: '/bot-images/Bot image 10.png',
      accentColor: '#FF2DAA',
    },
  },
];

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
