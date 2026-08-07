/**
 * TMI Commerce Constitution v1.0 — locked by Marcel Dickens.
 *
 * Architecture lock for the three-store commerce model:
 *   1. Performer Marketplace  — context-aware per-performer storefront
 *   2. TMI Platform Store     — platform-owned, bot-automated drops
 *   3. Creator Asset Vault    — single-source master media library
 *
 * Rules:
 *   - ARTIST_ALWAYS_RECEIVES_FULL_PRICE: settlement on list price P; points discount never cuts artist share
 *   - TMI_ABSORBS_POINTS_DISCOUNT: discount funded by burning prepaid points liability (packs already paid);
 *     platform fee still taken on full P; cash charge = P − discount (see PointDiscountEngine)
 *   - YOPHO_IS_NOT_COMMERCE: YoPho is identity/art, never a commerce vehicle
 *   - COMMERCE_CONNECTOR_IS_SOURCE_OF_TRUTH: external store (Shopify etc.) owns product/price/inventory
 *   - DISTRIBUTOR_BRIDGE_IS_METADATA_ONLY: CD Baby etc. import release metadata, never sell on TMI
 */

export const COMMERCE_CONSTITUTION_VERSION = "1.0" as const;

// ─── TMI Platform Store ───────────────────────────────────────────────────────

/**
 * Bot-automated lifecycle for TMI-owned store items.
 * Items are never manually scheduled — BotStoreDirectorEngine drives transitions.
 */
export type TMIStoreItemLifecycle =
  | "PROTOTYPE"          // internal only, not visible
  | "COMING_SOON"        // visible teaser, not purchasable
  | "LAUNCH"             // first 48h after drop
  | "FEATURED"           // editorial pick, surfaced in top shelf
  | "TRENDING"           // high velocity purchases this week
  | "LIMITED_EDITION"    // quantity cap or countdown timer active
  | "RETIRED"            // no longer purchasable
  | "VAULT"              // archived, historically significant
  | "ANNIVERSARY_RETURN";// retired item back for limited window

export type TMIStoreCategory =
  // Avatar cosmetics (Fan-only per Rule 26 Identity Policy)
  | "AVATAR_CLOTHING"
  | "HAIRSTYLE"
  | "DANCE_PACK"
  | "EMOTE"
  | "PROFILE_FRAME"
  | "SEAT_STYLE"
  // Performer surface items
  | "VENUE_SKIN"
  | "STAGE_CURTAIN"
  | "LIGHTING_PACK"
  | "SMOKE_EFFECT"
  // Fan boosts (engagement multipliers — never competitive rank purchase, Rule 24)
  | "FAN_BOOSTER"
  // Performer discovery boosts (exposure only — never rank purchase, Rule 20)
  | "PERFORMANCE_BOOSTER"
  // Lobby themes (shared fan/performer ambient)
  | "LOBBY_THEME"
  // Platform currency (convertible to points at display price)
  | "COINS"
  | "DIAMONDS";

export interface TMIStoreItem {
  id: string;
  name: string;
  category: TMIStoreCategory;
  lifecycle: TMIStoreItemLifecycle;
  basePrice: number;     // USD cents
  pointsPrice: number;   // TMI platform points
  /** Displayed to buyer; TMI absorbs any points discount from platform fee. */
  artistReceives: 0;     // TMI Store items — TMI retains, no artist split
  limitedQuantity?: number;
  availableUntil?: string; // ISO-8601
  thumbnailUrl: string;
  previewUrl?: string;
}

// ─── Performer Marketplace ────────────────────────────────────────────────────

export type PerformerProductCategory =
  | "ALBUM"
  | "SINGLE"
  | "EP"
  | "VINYL"
  | "CD"
  | "MERCH"
  | "BEAT_LICENSE"
  | "VIP_EXPERIENCE"
  | "LESSON"
  | "MEMBERSHIP"
  | "BUNDLE";

export type ListenVsOwnMode =
  | "LISTEN_FREE"          // streamed, no purchase needed
  | "OWN_DIGITAL"          // digital download after purchase
  | "OWN_PHYSICAL"         // physical item shipped
  | "LISTEN_THEN_OWN"      // preview stream → purchase unlocks full
  | "SUBSCRIPTION_ONLY"    // locked behind fan club membership
  | "VIP_ONLY";            // locked behind VIP tier

export interface PerformerProduct {
  id: string;
  performerId: string;
  name: string;
  category: PerformerProductCategory;
  price: number;           // USD cents — what buyer pays
  /** Artist always receives this full amount (COMMERCE_CONSTITUTION RULE 1). */
  artistReceives: number;  // === price (TMI fee separate, never deducted from this)
  pointsPrice?: number;    // optional points alternative
  listenMode: ListenVsOwnMode;
  /** Source-of-truth sync from Commerce Connector (never hardcoded). */
  connectorProductId?: string;
  connectorType?: CommerceConnectorType;
  inventoryCount?: number;  // null = unlimited digital
  previewUrl?: string;
  thumbnailUrl: string;
  isFeatured: boolean;     // performer editorial pick (top shelf)
}

// ─── Commerce Connector ───────────────────────────────────────────────────────

export type CommerceConnectorType =
  | "SHOPIFY"
  | "WOOCOMMERCE"
  | "SQUARE"
  | "BIGCOMMERCE"
  | "CUSTOM_API";

export interface CommerceConnectorConfig {
  type: CommerceConnectorType;
  performerId: string;
  /** Encrypted store credentials — never logged. */
  storeUrl: string;
  lastSyncAt?: string;      // ISO-8601
  syncStatus: "CONNECTED" | "SYNCING" | "ERROR" | "DISCONNECTED";
  productCount: number;
  ordersToday: number;
}

export const COMMERCE_CONNECTOR_LABELS: Record<CommerceConnectorType, string> = {
  SHOPIFY: "Shopify",
  WOOCOMMERCE: "WooCommerce",
  SQUARE: "Square",
  BIGCOMMERCE: "BigCommerce",
  CUSTOM_API: "Custom API",
};

export const COMMERCE_CONNECTOR_ICONS: Record<CommerceConnectorType, string> = {
  SHOPIFY: "🛍️",
  WOOCOMMERCE: "🔵",
  SQUARE: "⬛",
  BIGCOMMERCE: "🔷",
  CUSTOM_API: "⚙️",
};

// ─── Distributor Bridge ───────────────────────────────────────────────────────

/**
 * Distributor Bridge imports release metadata ONLY.
 * TMI is NOT a selling platform for distributor-linked releases.
 * Imported metadata feeds the Catalog Registry, not the Marketplace.
 */
export type DistributorType =
  | "CD_BABY"
  | "DISTROKID"
  | "TUNECORE"
  | "LANDR"
  | "OTHER";

export interface DistributorConnection {
  type: DistributorType;
  performerId: string;
  connectedAt: string;       // ISO-8601
  lastImportAt?: string;
  releaseCount: number;
  /** METADATA_ONLY — never a commerce action on TMI. */
  importMode: "METADATA_ONLY";
}

export const DISTRIBUTOR_LABELS: Record<DistributorType, string> = {
  CD_BABY: "CD Baby",
  DISTROKID: "DistroKid",
  TUNECORE: "TuneCore",
  LANDR: "LANDR",
  OTHER: "Other",
};

export const DISTRIBUTOR_ICONS: Record<DistributorType, string> = {
  CD_BABY: "🎵",
  DISTROKID: "📀",
  TUNECORE: "🎸",
  LANDR: "🌊",
  OTHER: "🔗",
};

// ─── Creator Asset Vault ──────────────────────────────────────────────────────

export type AssetVaultCategory =
  | "ALBUM_ARTWORK"
  | "SINGLE_ARTWORK"
  | "PRESS_KIT"
  | "BIO_COPY"
  | "PHOTO_GALLERY"
  | "VIDEO_REEL"
  | "STEMS"
  | "MASTER_AUDIO"
  | "LEGAL_DOCS"
  | "MERCH_DESIGN";

export interface AssetVaultEntry {
  id: string;
  performerId: string;
  name: string;
  category: AssetVaultCategory;
  fileUrl: string;
  fileSizeBytes: number;
  mimeType: string;
  uploadedAt: string;       // ISO-8601
  linkedProductId?: string;  // ties asset to a PerformerProduct
  linkedReleaseId?: string;  // ties asset to a distributor release
}

// ─── Constitution Rules ───────────────────────────────────────────────────────

export const COMMERCE_RULES = {
  /** Rule 1: Artist always receives their full asking price. TMI fee is additive, never deducted from artist amount. */
  ARTIST_ALWAYS_RECEIVES_FULL_PRICE: true,

  /** Rule 2: When buyer uses TMI points, TMI absorbs the discount from its own platform fee — artist still receives full price. */
  TMI_ABSORBS_POINTS_DISCOUNT: true,

  /** Rule 3: YoPho is identity and art — not a commerce product, not a store item, never priced or resold. */
  YOPHO_IS_NOT_COMMERCE: true,

  /** Rule 4: Commerce Connector (Shopify etc.) is the source of truth for product data, pricing, and inventory. TMI syncs, never duplicates. */
  COMMERCE_CONNECTOR_IS_SOURCE_OF_TRUTH: true,

  /** Rule 5: Distributor Bridge (CD Baby etc.) imports release metadata only. TMI does not sell distributor-linked releases. */
  DISTRIBUTOR_BRIDGE_IS_METADATA_ONLY: true,

  /** Rule 6: TMI Store items are bot-automated. No human schedules lifecycle transitions. */
  TMI_STORE_IS_BOT_AUTOMATED: true,

  /** Rule 7: "Listen vs Own" buttons must appear on every product surface (magazine, battles, radio, profiles, marketplace). */
  LISTEN_VS_OWN_IS_MANDATORY: true,
} as const;
