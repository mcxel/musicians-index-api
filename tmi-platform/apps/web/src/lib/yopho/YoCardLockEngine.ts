/**
 * YoCardLockEngine — card ownership + lock/unlock system.
 *
 * Lock states:
 *   OPEN   — owner and collaborators can edit layers, title, audio
 *   LOCKED — content frozen; only playback and ownership transfer allowed
 *
 * Applies to all card types: YoPho identity cards, YoAlbums, YoSingles, YoPlaylists.
 * Both performers AND fans can lock their cards.
 *
 * Rule 20: locked cards must show a real lock badge — never a fake shield.
 * Rule 17: ticket/sale authority stays in Venue/Promoter — this is card-level
 *          content protection, not ticketing.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/** Broad kind of Yo artifact for display and policy purposes */
export type YoCardProductKind =
  | "YO_IDENTITY"     // personal YoPho card
  | "YO_ALBUM"        // multi-track release
  | "YO_SINGLE"       // single track release
  | "YO_PLAYLIST"     // curated playlist card
  | "YO_VIDEO"        // video release
  | "YO_COMEDY"       // comedy/spoken word
  | "YO_VISUAL_ART";  // non-audio collectible

export type YoCardLockState = "OPEN" | "LOCKED";

/** What a buyer receives when they purchase a locked release card */
export interface YoCardSaleConfig {
  /** Whether this card is currently for sale */
  isForSale: boolean;
  priceCents: number;
  /** Currency — platform uses USD for now */
  currency: "USD";
  /** Max copies that can be sold (null = unlimited) */
  editionLimit: number | null;
  /** Copies already sold — real count only, never fake */
  soldCount: number;
  /** Buyer gets standard MP3/MP4 export in addition to the Yo card */
  includesRawExport: boolean;
  /** Stripe price ID — present only after product created in Stripe */
  stripePriceId?: string;
}

/** What the card owner decides survives the lock */
export interface YoCardLockPermissions {
  /** Buyer/viewer can play the audio/video — always true for purchased cards */
  allowPlayback: boolean;
  /** Owner may choose to allow accent colour customisation by the buyer */
  allowBuyerAccentOverride: boolean;
  /** Whether raw MP3/MP4 may be exported by the buyer */
  allowRawExport: boolean;
  /** Card may appear in public discovery feeds */
  allowPublicDiscovery: boolean;
}

/** Full lock record attached to a YoPhoCardDocument */
export interface YoCardLockPolicy {
  state: YoCardLockState;
  productKind: YoCardProductKind;
  /** ISO timestamp of when the card was locked */
  lockedAt: string | null;
  /** ownerId at time of lock — prevents transfer from bypassing lock */
  lockedByOwner: string | null;
  permissions: YoCardLockPermissions;
  sale: YoCardSaleConfig | null;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

export function defaultLockPermissions(): YoCardLockPermissions {
  return {
    allowPlayback: true,
    allowBuyerAccentOverride: false,
    allowRawExport: false,
    allowPublicDiscovery: true,
  };
}

export function defaultSaleConfig(): YoCardSaleConfig {
  return {
    isForSale: false,
    priceCents: 0,
    currency: "USD",
    editionLimit: null,
    soldCount: 0,
    includesRawExport: false,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Create a fresh OPEN lock policy (card editable, not for sale) */
export function createOpenPolicy(
  ownerId: string,
  productKind: YoCardProductKind = "YO_IDENTITY",
): YoCardLockPolicy {
  return {
    state: "OPEN",
    productKind,
    lockedAt: null,
    lockedByOwner: null,
    permissions: defaultLockPermissions(),
    sale: null,
  };
}

/** Lock a card, returning the new policy */
export function lockCard(
  existing: YoCardLockPolicy,
  ownerId: string,
  overrides?: Partial<YoCardLockPermissions>,
): YoCardLockPolicy {
  return {
    ...existing,
    state: "LOCKED",
    lockedAt: new Date().toISOString(),
    lockedByOwner: ownerId,
    permissions: { ...existing.permissions, ...overrides },
  };
}

/** Unlock a card (owner only — caller must verify ownership before calling) */
export function unlockCard(existing: YoCardLockPolicy): YoCardLockPolicy {
  return {
    ...existing,
    state: "OPEN",
    lockedAt: null,
    lockedByOwner: null,
  };
}

export function isCardLocked(policy: YoCardLockPolicy | undefined): boolean {
  return policy?.state === "LOCKED";
}

export function canEditCard(policy: YoCardLockPolicy | undefined): boolean {
  return !isCardLocked(policy);
}

export function canBuyerExportRaw(policy: YoCardLockPolicy | undefined): boolean {
  return policy?.permissions.allowRawExport === true;
}

export const LOCK_BADGE_LABEL: Record<YoCardLockState, string> = {
  OPEN: "Open",
  LOCKED: "🔒 Locked",
};

export const PRODUCT_KIND_LABEL: Record<YoCardProductKind, string> = {
  YO_IDENTITY: "YoPho Card",
  YO_ALBUM: "Yo Album",
  YO_SINGLE: "Yo Single",
  YO_PLAYLIST: "Yo Playlist",
  YO_VIDEO: "Yo Video",
  YO_COMEDY: "Yo Comedy",
  YO_VISUAL_ART: "Yo Visual Art",
};
