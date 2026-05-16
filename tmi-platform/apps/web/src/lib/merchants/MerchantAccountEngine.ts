/**
 * MerchantAccountEngine
 * First-class merchant accounts — local stores and businesses on the platform.
 * Handles signup, profile, verification, and sponsored artist relationships.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type MerchantCategory =
  | "restaurant"
  | "barbershop"
  | "clothing"
  | "studio"
  | "brand"
  | "online-store"
  | "events"
  | "fitness"
  | "beauty"
  | "electronics"
  | "food-beverage"
  | "entertainment"
  | "services"
  | "other";

export type MerchantVerificationStatus = "unverified" | "pending" | "verified" | "suspended";

export type MerchantContact = {
  ownerName: string;
  email: string;
  phone?: string;
};

export type MerchantLocation = {
  address?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  lat?: number;
  lng?: number;
};

export type SponsoredArtistRef = {
  artistId: string;
  artistName: string;
  artistSlug: string;
  sponsorId: string;
  sponsorClass: "local" | "major";
  monthlyCommitmentCents: number;
  activeSince: string;
};

export type MerchantAccount = {
  merchantId: string;
  storeName: string;
  slug: string;
  category: MerchantCategory;
  description: string;
  logoUrl?: string;
  bannerUrl?: string;
  website?: string;
  contact: MerchantContact;
  location: MerchantLocation;
  verificationStatus: MerchantVerificationStatus;
  sponsoredArtists: SponsoredArtistRef[];
  totalMonthlySpendCents: number;
  createdAtMs: number;
  updatedAtMs: number;
};

// ─── In-memory store ──────────────────────────────────────────────────────────

const merchants: MerchantAccount[] = [];
let merchantCounter = 0;

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function createMerchantAccount(input: {
  storeName: string;
  category: MerchantCategory;
  description: string;
  contact: MerchantContact;
  location: MerchantLocation;
  logoUrl?: string;
  bannerUrl?: string;
  website?: string;
}): MerchantAccount {
  const now = Date.now();
  const merchant: MerchantAccount = {
    merchantId: `merchant-${++merchantCounter}`,
    storeName: input.storeName,
    slug: toSlug(input.storeName),
    category: input.category,
    description: input.description,
    logoUrl: input.logoUrl,
    bannerUrl: input.bannerUrl,
    website: input.website,
    contact: input.contact,
    location: input.location,
    verificationStatus: "pending",
    sponsoredArtists: [],
    totalMonthlySpendCents: 0,
    createdAtMs: now,
    updatedAtMs: now,
  };
  merchants.unshift(merchant);
  return merchant;
}

export function getMerchantById(merchantId: string): MerchantAccount | null {
  return merchants.find((m) => m.merchantId === merchantId) ?? null;
}

export function getMerchantBySlug(slug: string): MerchantAccount | null {
  return merchants.find((m) => m.slug === slug) ?? null;
}

export function updateMerchantVerification(
  merchantId: string,
  status: MerchantVerificationStatus
): MerchantAccount {
  const merchant = merchants.find((m) => m.merchantId === merchantId);
  if (!merchant) throw new Error(`Merchant ${merchantId} not found`);
  merchant.verificationStatus = status;
  merchant.updatedAtMs = Date.now();
  return merchant;
}

export function attachSponsoredArtist(
  merchantId: string,
  ref: SponsoredArtistRef
): MerchantAccount {
  const merchant = merchants.find((m) => m.merchantId === merchantId);
  if (!merchant) throw new Error(`Merchant ${merchantId} not found`);
  const exists = merchant.sponsoredArtists.find((a) => a.sponsorId === ref.sponsorId);
  if (!exists) {
    merchant.sponsoredArtists.push(ref);
    merchant.totalMonthlySpendCents += ref.monthlyCommitmentCents;
    merchant.updatedAtMs = Date.now();
  }
  return merchant;
}

export function detachSponsoredArtist(merchantId: string, sponsorId: string): MerchantAccount {
  const merchant = merchants.find((m) => m.merchantId === merchantId);
  if (!merchant) throw new Error(`Merchant ${merchantId} not found`);
  const idx = merchant.sponsoredArtists.findIndex((a) => a.sponsorId === sponsorId);
  if (idx !== -1) {
    merchant.totalMonthlySpendCents -= merchant.sponsoredArtists[idx].monthlyCommitmentCents;
    merchant.sponsoredArtists.splice(idx, 1);
    merchant.updatedAtMs = Date.now();
  }
  return merchant;
}

export function listMerchants(filters?: {
  category?: MerchantCategory;
  verificationStatus?: MerchantVerificationStatus;
  city?: string;
}): MerchantAccount[] {
  return merchants.filter((m) => {
    if (filters?.category && m.category !== filters.category) return false;
    if (filters?.verificationStatus && m.verificationStatus !== filters.verificationStatus) return false;
    if (filters?.city && m.location.city.toLowerCase() !== filters.city.toLowerCase()) return false;
    return true;
  });
}

export function updateMerchantProfile(
  merchantId: string,
  updates: Partial<Pick<MerchantAccount, "description" | "logoUrl" | "bannerUrl" | "website">>
): MerchantAccount {
  const merchant = merchants.find((m) => m.merchantId === merchantId);
  if (!merchant) throw new Error(`Merchant ${merchantId} not found`);
  Object.assign(merchant, updates, { updatedAtMs: Date.now() });
  return merchant;
}
