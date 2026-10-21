/**
 * BeatLockerUniqueTitleOwnership — Phase 2 Beat Locker Unique Title + Ownership
 *
 * Permanent identity separation (BEAT TITLE ≠ AUDIO IDENTITY ≠ OWNERSHIP):
 *   mediaAssetId     = Origami audio identity
 *   listingId        = Beat Locker marketplace listing
 *   displayTitle     = creator-facing title (never silently rewritten)
 *   normalizedTitle  = server conflict key (GLOBAL_ACTIVE_BEAT_LOCKER)
 *   entitlement/order = buyer ownership/use authority (OwnershipRuntime)
 *
 * TITLE_RESERVATION != AUDIO_OWNERSHIP
 * AUDIO_OWNERSHIP != MARKETPLACE_LISTING
 * LISTING_ACTIVATION != SALE
 * SALE/PAYMENT != ENTITLEMENT
 * ENTITLEMENT != NEW mediaAssetId
 *
 * Frozen Origami honesty: AAC/OPUS encode = TRANSCODE_BACKEND_UNBOUND;
 * Persistence: PROCESS_MEMORY; SCHEMA_READY; DATABASE_APPLIED = false.
 */

import {
  BEAT_TITLE_UNIQUENESS_SCOPE,
  normalizeBeatTitle,
  titleConflictPayload,
} from "@/lib/beats/BeatLockerTitleAuthority";
import { OwnershipRuntime, type UserEntitlement } from "@/lib/commerce/OwnershipRuntime";
import {
  beatLockerAudioHandoff,
  listOrigamiDerivatives,
  probeOrigamiTranscodeBackend,
  type OrigamiRightsStatus,
} from "@/lib/beats/OrigamiAudioFabric";

export type BeatListingLifecycle =
  | "DRAFT"
  | "ELIGIBILITY_CHECK"
  | "TITLE_RESERVED"
  | "ACTIVE"
  | "PURCHASE_PENDING"
  | "SOLD"
  | "INACTIVE"
  | "RETIRED"
  | "BLOCKED"
  | "PENDING";

export type BeatPurchasePhase =
  | "AVAILABLE"
  | "PURCHASE_PENDING"
  | "PAYMENT_CONFIRMED"
  | "ENTITLEMENT_GRANTED"
  | "OWNED";

export type BeatRightsState = OrigamiRightsStatus | "BLOCKED";

export type BeatListingRecord = {
  listingId: string;
  mediaAssetId: string;
  sourceHash: string | null;
  displayTitle: string;
  normalizedTitle: string;
  sellerUserId: string;
  rightsState: BeatRightsState;
  lifecycle: BeatListingLifecycle;
  priceCents: number | null;
  priceAuthority: "SELLER_CONTROLLED" | "PRODUCT_POLICY_REQUIRED";
  exclusivityPolicy: "PRODUCT_POLICY_REQUIRED";
  titleReuseAfterSoldRetired: "PRODUCT_POLICY_REQUIRED";
  purchasePhase: BeatPurchasePhase;
  ownerUserId: string | null;
  entitlementId: string | null;
  orderId: string | null;
  playbackAvailable: boolean;
  playbackReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BeatLibraryEntry = {
  listingId: string;
  mediaAssetId: string;
  displayTitle: string;
  sellerUserId: string;
  entitlementId: string;
  orderId: string | null;
  licensePolicy: "PRODUCT_POLICY_REQUIRED";
};

export type ShowToBeatStoreHandoffFields = {
  listingId: string | null;
  mediaAssetId: string;
  sellerUserId: string;
  displayTitle: string;
  normalizedTitle: string;
  eligibility: "ELIGIBLE" | "INELIGIBLE";
  activeStatus: boolean;
  ownershipState: BeatPurchasePhase;
  conversionImplemented: false;
};

type ActivateInput = {
  listingId: string;
  mediaAssetId: string;
  displayTitle: string;
  clientSellerId?: string;
  serverSellerUserId: string;
  rightsState: BeatRightsState;
  sourceHash?: string | null;
  priceCents?: number | null;
};

type PurchaseInput = {
  listingId: string;
  buyerUserId: string;
  paymentEventId: string;
  orderId?: string;
};

const listings = new Map<string, BeatListingRecord>();
const normalizedActiveIndex = new Map<string, string>();
const paymentMintIndex = new Map<string, string>();
const buyerLibraries = new Map<string, BeatLibraryEntry[]>();

const BLOCKED_RIGHTS: ReadonlySet<BeatRightsState> = new Set([
  "PENDING",
  "USER_ASSERTED",
  "ADMIN_REVIEW_REQUIRED",
  "RESTRICTED",
  "REJECTED",
  "BLOCKED",
]);

function nowIso(): string {
  return new Date().toISOString();
}

function beatSkuId(listingId: string): string {
  return `beat:${listingId}`;
}

export function resetBeatLockerUniqueTitleOwnershipForTests(): void {
  listings.clear();
  normalizedActiveIndex.clear();
  paymentMintIndex.clear();
  buyerLibraries.clear();
}

export function getBeatListing(listingId: string): BeatListingRecord | null {
  return listings.get(listingId) ?? null;
}

export function findActiveBeatListingByMediaAssetId(
  mediaAssetId: string,
): BeatListingRecord | null {
  for (const listing of listings.values()) {
    if (
      listing.mediaAssetId === mediaAssetId &&
      listing.lifecycle === "ACTIVE" &&
      listing.purchasePhase === "AVAILABLE"
    ) {
      return listing;
    }
  }
  return null;
}

export function findAnyBeatListingByMediaAssetId(
  mediaAssetId: string,
): BeatListingRecord | null {
  for (const listing of listings.values()) {
    if (listing.mediaAssetId === mediaAssetId) return listing;
  }
  return null;
}


export function listSellerBeatListings(sellerUserId: string): BeatListingRecord[] {
  return [...listings.values()].filter((l) => l.sellerUserId === sellerUserId);
}

export function getBuyerBeatLibrary(buyerUserId: string): BeatLibraryEntry[] {
  return [...(buyerLibraries.get(buyerUserId) ?? [])];
}

export function resolveBeatPreviewAvailability(mediaAssetId: string): {
  previewAllowed: boolean;
  owned: false;
  mediaAssetId: string;
  honesty: "TRANSCODE_BACKEND_UNBOUND" | "PREVIEW_READY" | "PREVIEW_UNAVAILABLE";
  handoff: ReturnType<typeof beatLockerAudioHandoff>;
} {
  const handoff = beatLockerAudioHandoff(mediaAssetId);
  const backend = probeOrigamiTranscodeBackend();
  const derivs = listOrigamiDerivatives(mediaAssetId);
  const bytesReady = derivs.some(
    (d) =>
      (d.kind === "PREVIEW" || d.kind === "AAC" || d.kind === "OPUS") &&
      d.bytesGenerated === true,
  );
  if (bytesReady) {
    return { previewAllowed: true, owned: false, mediaAssetId, honesty: "PREVIEW_READY", handoff };
  }
  return {
    previewAllowed: false,
    owned: false,
    mediaAssetId,
    honesty: !backend.bound ? "TRANSCODE_BACKEND_UNBOUND" : "PREVIEW_UNAVAILABLE",
    handoff,
  };
}

export function activateBeatListing(input: ActivateInput):
  | { ok: true; listing: BeatListingRecord }
  | ReturnType<typeof titleConflictPayload>
  | {
      ok: false;
      code:
        | "RIGHTS_NOT_APPROVED"
        | "MISSING_MEDIA_ASSET"
        | "MISSING_TITLE"
        | "SELLER_REQUIRED";
      error: string;
      message: string;
    } {
  const displayTitle = String(input.displayTitle ?? "").trim();
  if (!displayTitle) {
    return {
      ok: false,
      code: "MISSING_TITLE",
      error: "MISSING_TITLE",
      message: "displayTitle is required; creator chooses title (no auto-rename).",
    };
  }
  if (!input.mediaAssetId) {
    return {
      ok: false,
      code: "MISSING_MEDIA_ASSET",
      error: "MISSING_MEDIA_ASSET",
      message: "listing must reference Origami mediaAssetId",
    };
  }
  const sellerUserId = String(input.serverSellerUserId ?? "").trim();
  if (!sellerUserId) {
    return {
      ok: false,
      code: "SELLER_REQUIRED",
      error: "SELLER_REQUIRED",
      message: "seller resolved server-side only; client sellerId ignored",
    };
  }
  void input.clientSellerId;

  if (BLOCKED_RIGHTS.has(input.rightsState) || input.rightsState !== "APPROVED") {
    return {
      ok: false,
      code: "RIGHTS_NOT_APPROVED",
      error: "RIGHTS_NOT_APPROVED",
      message: `rightsState=${input.rightsState} cannot activate; VALID AUDIO != RIGHTS APPROVED != LISTING ELIGIBLE`,
    };
  }

  const normalizedTitle = normalizeBeatTitle(displayTitle);
  const existingOwner = normalizedActiveIndex.get(normalizedTitle);
  if (existingOwner && existingOwner !== input.listingId) {
    return titleConflictPayload({
      displayTitle,
      normalizedTitle,
      conflictListingId: existingOwner,
    });
  }

  const handoff = beatLockerAudioHandoff(input.mediaAssetId);
  const preview = resolveBeatPreviewAvailability(input.mediaAssetId);

  const priceCents =
    typeof input.priceCents === "number" && Number.isFinite(input.priceCents)
      ? Math.max(0, Math.floor(input.priceCents))
      : null;

  const ts = nowIso();
  const prior = listings.get(input.listingId);
  const listing: BeatListingRecord = {
    listingId: input.listingId,
    mediaAssetId: input.mediaAssetId,
    sourceHash: input.sourceHash ?? handoff.sourceHash ?? prior?.sourceHash ?? null,
    displayTitle,
    normalizedTitle,
    sellerUserId,
    rightsState: input.rightsState,
    lifecycle: "ACTIVE",
    priceCents,
    priceAuthority:
      priceCents === null ? "PRODUCT_POLICY_REQUIRED" : "SELLER_CONTROLLED",
    exclusivityPolicy: "PRODUCT_POLICY_REQUIRED",
    titleReuseAfterSoldRetired: "PRODUCT_POLICY_REQUIRED",
    purchasePhase: "AVAILABLE",
    ownerUserId: null,
    entitlementId: null,
    orderId: null,
    playbackAvailable: preview.previewAllowed,
    playbackReason: preview.honesty,
    createdAt: prior?.createdAt ?? ts,
    updatedAt: ts,
  };

  if (prior?.lifecycle === "ACTIVE" && prior.normalizedTitle !== normalizedTitle) {
    normalizedActiveIndex.delete(prior.normalizedTitle);
  }
  listings.set(listing.listingId, listing);
  normalizedActiveIndex.set(normalizedTitle, listing.listingId);

  return { ok: true, listing };
}

export function startBeatCheckout(listingId: string, buyerUserId: string):
  | {
      ok: true;
      purchasePhase: "PURCHASE_PENDING";
      owned: false;
      listingId: string;
      buyerUserId: string;
    }
  | { ok: false; code: "LISTING_NOT_ACTIVE" | "LISTING_NOT_FOUND"; error: string } {
  const listing = listings.get(listingId);
  if (!listing) {
    return { ok: false, code: "LISTING_NOT_FOUND", error: "LISTING_NOT_FOUND" };
  }
  if (listing.lifecycle !== "ACTIVE" || listing.purchasePhase !== "AVAILABLE") {
    return { ok: false, code: "LISTING_NOT_ACTIVE", error: "LISTING_NOT_ACTIVE" };
  }
  listing.purchasePhase = "PURCHASE_PENDING";
  listing.lifecycle = "PURCHASE_PENDING";
  listing.updatedAt = nowIso();
  listings.set(listingId, listing);
  return {
    ok: true,
    purchasePhase: "PURCHASE_PENDING",
    owned: false,
    listingId,
    buyerUserId,
  };
}

export function confirmBeatPurchase(input: PurchaseInput):
  | {
      ok: true;
      listing: BeatListingRecord;
      ownership: UserEntitlement;
      libraryEntry: BeatLibraryEntry;
      minted: boolean;
      exclusivity: "PRODUCT_POLICY_REQUIRED";
    }
  | {
      ok: false;
      code: "LISTING_NOT_FOUND" | "NOT_PURCHASE_PENDING" | "ALREADY_OWNED_BY_OTHER";
      error: string;
      message: string;
    } {
  const listing = listings.get(input.listingId);
  if (!listing) {
    return {
      ok: false,
      code: "LISTING_NOT_FOUND",
      error: "LISTING_NOT_FOUND",
      message: "listing not found",
    };
  }

  const priorMint = paymentMintIndex.get(input.paymentEventId);
  if (priorMint) {
    const ents = OwnershipRuntime.getUserEntitlements(input.buyerUserId);
    const ownership = ents.find((e) => e.skuId === beatSkuId(input.listingId));
    const lib =
      getBuyerBeatLibrary(input.buyerUserId).find((e) => e.listingId === input.listingId) ?? null;
    if (ownership && lib) {
      return {
        ok: true,
        listing,
        ownership,
        libraryEntry: lib,
        minted: false,
        exclusivity: "PRODUCT_POLICY_REQUIRED",
      };
    }
  }

  if (
    listing.ownerUserId &&
    listing.ownerUserId !== input.buyerUserId &&
    listing.purchasePhase === "OWNED"
  ) {
    return {
      ok: false,
      code: "ALREADY_OWNED_BY_OTHER",
      error: "ALREADY_OWNED_BY_OTHER",
      message: "listing already owned; exclusivity semantics PRODUCT_POLICY_REQUIRED",
    };
  }

  if (
    listing.purchasePhase !== "PURCHASE_PENDING" &&
    listing.purchasePhase !== "AVAILABLE" &&
    listing.purchasePhase !== "PAYMENT_CONFIRMED"
  ) {
    if (listing.purchasePhase === "OWNED" && listing.ownerUserId === input.buyerUserId) {
      const ents = OwnershipRuntime.getUserEntitlements(input.buyerUserId);
      const ownership = ents.find((e) => e.skuId === beatSkuId(input.listingId));
      const lib = getBuyerBeatLibrary(input.buyerUserId).find(
        (e) => e.listingId === input.listingId,
      );
      if (ownership && lib) {
        return {
          ok: true,
          listing,
          ownership,
          libraryEntry: lib,
          minted: false,
          exclusivity: "PRODUCT_POLICY_REQUIRED",
        };
      }
    }
    return {
      ok: false,
      code: "NOT_PURCHASE_PENDING",
      error: "NOT_PURCHASE_PENDING",
      message: `purchasePhase=${listing.purchasePhase}`,
    };
  }

  listing.purchasePhase = "PAYMENT_CONFIRMED";
  listing.updatedAt = nowIso();

  const ownership = OwnershipRuntime.grantEntitlement({
    userId: input.buyerUserId,
    skuId: beatSkuId(input.listingId),
    title: listing.displayTitle,
    category: "beat",
    provenance: "PURCHASED",
    orderId: input.orderId ?? input.paymentEventId,
  });

  listing.ownerUserId = input.buyerUserId;
  listing.entitlementId = ownership.id;
  listing.orderId = input.orderId ?? input.paymentEventId;
  listing.lifecycle = "SOLD";
  listing.purchasePhase = "OWNED";
  listing.updatedAt = nowIso();
  listings.set(listing.listingId, listing);

  const libraryEntry: BeatLibraryEntry = {
    listingId: listing.listingId,
    mediaAssetId: listing.mediaAssetId,
    displayTitle: listing.displayTitle,
    sellerUserId: listing.sellerUserId,
    entitlementId: ownership.id,
    orderId: listing.orderId,
    licensePolicy: "PRODUCT_POLICY_REQUIRED",
  };
  const lib = buyerLibraries.get(input.buyerUserId) ?? [];
  if (!lib.some((e) => e.listingId === listing.listingId)) {
    lib.push(libraryEntry);
    buyerLibraries.set(input.buyerUserId, lib);
  }

  paymentMintIndex.set(input.paymentEventId, ownership.id);

  return {
    ok: true,
    listing,
    ownership,
    libraryEntry,
    minted: !priorMint,
    exclusivity: "PRODUCT_POLICY_REQUIRED",
  };
}

export function buildShowToBeatStoreHandoffFields(
  listingId: string,
): ShowToBeatStoreHandoffFields | null {
  const listing = listings.get(listingId);
  if (!listing) return null;
  return {
    listingId: listing.listingId,
    mediaAssetId: listing.mediaAssetId,
    sellerUserId: listing.sellerUserId,
    displayTitle: listing.displayTitle,
    normalizedTitle: listing.normalizedTitle,
    eligibility:
      listing.rightsState === "APPROVED" && listing.lifecycle === "ACTIVE"
        ? "ELIGIBLE"
        : "INELIGIBLE",
    activeStatus: listing.lifecycle === "ACTIVE",
    ownershipState: listing.purchasePhase,
    conversionImplemented: false,
  };
}

export function getBeatTitleUniquenessScope(): typeof BEAT_TITLE_UNIQUENESS_SCOPE {
  return BEAT_TITLE_UNIQUENESS_SCOPE;
}

export function getBeatLockerLicenseSemantics(): {
  exclusive: "PRODUCT_POLICY_REQUIRED";
  nonExclusive: "PRODUCT_POLICY_REQUIRED";
  resale: "PRODUCT_POLICY_REQUIRED";
  titleReuseAfterSoldRetired: "PRODUCT_POLICY_REQUIRED";
  sellerRetainsSourceOwnership: "PRODUCT_POLICY_REQUIRED";
} {
  return {
    exclusive: "PRODUCT_POLICY_REQUIRED",
    nonExclusive: "PRODUCT_POLICY_REQUIRED",
    resale: "PRODUCT_POLICY_REQUIRED",
    titleReuseAfterSoldRetired: "PRODUCT_POLICY_REQUIRED",
    sellerRetainsSourceOwnership: "PRODUCT_POLICY_REQUIRED",
  };
}

export function getBeatLockerSchemaStatus(): {
  SCHEMA_EXISTING: true;
  SCHEMA_MODIFIED: true;
  SCHEMA_READY: true;
  DATABASE_APPLIED: false;
  persistence: "PROCESS_MEMORY";
  uniqueActiveTitleStrategy: string;
  uniquenessScope: typeof BEAT_TITLE_UNIQUENESS_SCOPE;
} {
  return {
    SCHEMA_EXISTING: true,
    SCHEMA_MODIFIED: true,
    SCHEMA_READY: true,
    DATABASE_APPLIED: false,
    persistence: "PROCESS_MEMORY",
    uniqueActiveTitleStrategy:
      "partial unique index on (normalizedTitle) WHERE lifecycle = 'ACTIVE' — SQL prepared, not applied",
    uniquenessScope: BEAT_TITLE_UNIQUENESS_SCOPE,
  };
}
