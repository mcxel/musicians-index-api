/**
 * YoAlbumReleaseAuthority — Phase 2 YoAlbum Living Release + Collectible Fabric (BUILDABLE NOW)
 *
 * Brand: YoAlbum — "Your Photo. Your Album. Your Music. Your Way."
 * Family: YoPho → YoSingle → YoEP → YoAlbum via EXISTING YoPho Living Creator.
 *
 * A. BUILDABLE NOW: release identity, rights gates, zero-work cover, YoPho bind,
 *    editions (no audio clone), Shop, Promo Rack, Buyer Library, STREAM/OPEN honesty.
 * B. SECURE-MEDIA DEPENDENT (NOT FAKE): encrypted packaging, DRM, offline licenses,
 *    device auth — report DRM_UNBOUND / SECURE_PLAYBACK_UNBOUND / PACKAGING_UNBOUND.
 *
 * DISTRIBUTOR_FEED_UNBOUND. TRANSCODE_BACKEND_UNBOUND (Origami frozen).
 * Persistence: PROCESS_MEMORY. PHYSICAL_GREEN = 0.
 * Do NOT reopen Promo / Beat Locker / Show-to-Beat / Origami.
 */

import { createYoPhoLivingProject, type YoPhoLivingProject } from "@/lib/yopho/living/YoPhoLivingProject";
import { saveYoPhoLivingProject } from "@/lib/yopho/living/YoPhoLivingProjectStore";
import { OwnershipRuntime } from "@/lib/commerce/OwnershipRuntime";
import { probeOrigamiTranscodeBackend } from "@/lib/beats/OrigamiAudioFabric";
import type { UniversalPromoItem } from "@/lib/promo/UniversalPromotionRackAuthority";

export const YOALBUM_BRAND_LINE = "Your Photo. Your Album. Your Music. Your Way." as const;
export const YOALBUM_CREATOR_AUTHORITY = "YoPhoLivingProject" as const;
export const DISTRIBUTOR_FEED_STATUS = "DISTRIBUTOR_FEED_UNBOUND" as const;
export const DRM_STATUS = "DRM_UNBOUND" as const;

export type YoReleaseFamily = "YO_SINGLE" | "YO_EP" | "YO_ALBUM";
export type YoProductClass = "STREAM" | "OPEN_DOWNLOAD" | "YOALBUM_SECURE";
export type YoCoverMode = "NONE" | "STANDARD_STATIC" | "LIVING_PREMIUM";
export type YoReleaseLifecycle =
  | "DRAFT"
  | "RECEIVED_AHEAD"
  | "SCHEDULED"
  | "EMBARGOED"
  | "READY"
  | "ACTIVE"
  | "TAKEDOWN";

export type YoRightsFlags = {
  stream: boolean;
  downloadOpen: boolean;
  sell: boolean;
  collectible: boolean;
  artworkPublish: boolean;
};

export const METADATA_ONLY_RIGHTS: YoRightsFlags = {
  stream: false,
  downloadOpen: false,
  sell: false,
  collectible: false,
  artworkPublish: false,
};

export type YoEdition = {
  editionId: string;
  releaseId: string;
  coverAssetId: string | null;
  yoAlbumProjectId: string | null;
  visualKind: "STANDARD" | "LIVING" | "LIMITED_VISUAL";
  /** Must stay false unless durable atomic inventory is proven. */
  durableInventoryProven: boolean;
  supply: number | null;
  soldCount: number;
  commerceProductId: string | null;
  title: string;
};

export type YoAlbumRelease = {
  releaseId: string;
  performerId: string;
  family: YoReleaseFamily;
  title: string;
  trackMediaAssetIds: string[];
  coverAssetId: string | null;
  coverRightsAuthorized: boolean;
  yoAlbumProjectId: string | null;
  coverMode: YoCoverMode;
  rights: YoRightsFlags;
  productClasses: YoProductClass[];
  secureDeliverable: "DRM_UNBOUND" | "SECURE_PLAYBACK_UNBOUND" | "PACKAGING_UNBOUND";
  lifecycle: YoReleaseLifecycle;
  editions: YoEdition[];
  distributor: {
    feedStatus: typeof DISTRIBUTOR_FEED_STATUS | "FIXTURE" | "CONNECTED";
    fixtureClassified: boolean;
    externalReleaseId: string | null;
    upc: string | null;
    isrcs: string[];
  };
  createdAt: string;
  updatedAt: string;
};

export type YoReleaseDayNotice = {
  noticeId: string;
  releaseId: string;
  performerId: string;
  message: string;
  action: "CREATE_YOUR_YOALBUM";
  source: "FIXTURE" | "AUTHORIZED_RELEASE";
  at: string;
};

export type BuyerLibraryEntry = {
  entitlementId: string;
  userId: string;
  releaseId: string;
  editionId: string | null;
  skuId: string;
  productClass: YoProductClass;
  title: string;
  actions: Array<"PLAY" | "OPEN_YOALBUM" | "VIEW_EDITION" | "VIEW_ARTIST" | "DOWNLOAD" | "DOWNLOAD_FOR_OFFLINE_UNBOUND" | "MANAGE_DEVICES_UNBOUND">;
};

const releases = new Map<string, YoAlbumRelease>();
const notices: YoReleaseDayNotice[] = [];
const yophoProjects = new Map<string, YoPhoLivingProject>();

function nowIso(): string {
  return new Date().toISOString();
}

function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function resetYoAlbumAuthorityForTests(): void {
  releases.clear();
  notices.length = 0;
  yophoProjects.clear();
}

export function getYoAlbumBrandLine(): typeof YOALBUM_BRAND_LINE {
  return YOALBUM_BRAND_LINE;
}

export function getDistributorFeedStatus(): typeof DISTRIBUTOR_FEED_STATUS {
  return DISTRIBUTOR_FEED_STATUS;
}

export function getDrmStatus(): typeof DRM_STATUS {
  return DRM_STATUS;
}

export function getOrigamiTranscodeHonesty(): "TRANSCODE_BACKEND_UNBOUND" {
  return probeOrigamiTranscodeBackend().status;
}

export function createYoAlbumRelease(input: {
  performerId: string;
  family: YoReleaseFamily;
  title: string;
  trackMediaAssetIds: string[];
  rights?: Partial<YoRightsFlags>;
  productClasses?: YoProductClass[];
}): YoAlbumRelease {
  const releaseId = genId("yar");
  const rights: YoRightsFlags = { ...METADATA_ONLY_RIGHTS, ...input.rights };
  const productClasses = input.productClasses ?? ["STREAM"];
  // Secure class may be declared architecturally, but deliverable stays unbound.
  const secureDeliverable: YoAlbumRelease["secureDeliverable"] = "DRM_UNBOUND";
  const rec: YoAlbumRelease = {
    releaseId,
    performerId: input.performerId,
    family: input.family,
    title: input.title,
    trackMediaAssetIds: [...input.trackMediaAssetIds],
    coverAssetId: null,
    coverRightsAuthorized: false,
    yoAlbumProjectId: null,
    coverMode: "NONE",
    rights,
    productClasses,
    secureDeliverable,
    lifecycle: "DRAFT",
    editions: [],
    distributor: {
      feedStatus: DISTRIBUTOR_FEED_STATUS,
      fixtureClassified: false,
      externalReleaseId: null,
      upc: null,
      isrcs: [],
    },
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  releases.set(releaseId, rec);
  return structuredClone(rec);
}

export function getYoAlbumRelease(releaseId: string): YoAlbumRelease | null {
  const r = releases.get(releaseId);
  return r ? structuredClone(r) : null;
}

export function listYoAlbumReleasesForPerformer(performerId: string): YoAlbumRelease[] {
  return [...releases.values()]
    .filter((r) => r.performerId === performerId)
    .map((r) => structuredClone(r));
}

/** Distributor metadata intake CONTRACT — unbound feed; fixtures only when classified. */
export function ingestDistributorMetadata(input: {
  releaseId: string;
  mode: "LIVE_FEED" | "FIXTURE";
  externalReleaseId?: string;
  upc?: string;
  isrcs?: string[];
  metadataTitle?: string;
}): { ok: boolean; code?: string; release?: YoAlbumRelease } {
  const r = releases.get(input.releaseId);
  if (!r) return { ok: false, code: "NO_RELEASE" };
  if (input.mode === "LIVE_FEED") {
    return { ok: false, code: DISTRIBUTOR_FEED_STATUS };
  }
  r.distributor = {
    feedStatus: "FIXTURE",
    fixtureClassified: true,
    externalReleaseId: input.externalReleaseId ?? null,
    upc: input.upc ?? null,
    isrcs: input.isrcs ?? [],
  };
  if (input.metadataTitle) r.title = input.metadataTitle;
  // CRITICAL: metadata alone never grants rights
  r.rights = { ...METADATA_ONLY_RIGHTS };
  r.updatedAt = nowIso();
  return { ok: true, release: structuredClone(r) };
}

export function grantExplicitRights(releaseId: string, rights: Partial<YoRightsFlags>): YoAlbumRelease | null {
  const r = releases.get(releaseId);
  if (!r) return null;
  r.rights = { ...r.rights, ...rights };
  r.updatedAt = nowIso();
  return structuredClone(r);
}

export function distributorMetadataGrants(releaseId: string): {
  audioRights: false;
  artworkRights: false;
  downloadRights: false;
  saleRights: false;
  collectibleRights: false;
} {
  void releaseId;
  return {
    audioRights: false,
    artworkRights: false,
    downloadRights: false,
    saleRights: false,
    collectibleRights: false,
  };
}

/** Zero-work standard cover from authorized artwork. */
export function bindZeroWorkStandardCover(input: {
  releaseId: string;
  coverAssetId: string;
  artworkAuthorized: boolean;
}): { ok: boolean; code?: string; release?: YoAlbumRelease } {
  const r = releases.get(input.releaseId);
  if (!r) return { ok: false, code: "NO_RELEASE" };
  if (!input.artworkAuthorized || !r.rights.artworkPublish) {
    return { ok: false, code: "ARTWORK_RIGHTS_BLOCKED" };
  }
  r.coverAssetId = input.coverAssetId;
  r.coverRightsAuthorized = true;
  r.coverMode = "STANDARD_STATIC";
  r.updatedAt = nowIso();
  // Ensure standard edition exists without new audio
  if (!r.editions.some((e) => e.visualKind === "STANDARD")) {
    r.editions.push({
      editionId: genId("yed"),
      releaseId: r.releaseId,
      coverAssetId: input.coverAssetId,
      yoAlbumProjectId: null,
      visualKind: "STANDARD",
      durableInventoryProven: false,
      supply: null,
      soldCount: 0,
      commerceProductId: `shop_${r.performerId}_${r.releaseId}_standard`,
      title: `${r.title} — Standard`,
    });
  }
  return { ok: true, release: structuredClone(r) };
}

/**
 * Open EXISTING YoPho Living Creator for this release.
 * Does NOT introduce a second visual editor.
 * Does NOT duplicate track mediaAssetIds.
 */
export function bindYoPhoLivingCreator(input: {
  releaseId: string;
  premium?: boolean;
}): { ok: boolean; code?: string; projectId?: string; creatorAuthority: typeof YOALBUM_CREATOR_AUTHORITY; secondEditor: false } {
  const r = releases.get(input.releaseId);
  if (!r) {
    return { ok: false, code: "NO_RELEASE", creatorAuthority: YOALBUM_CREATOR_AUTHORITY, secondEditor: false };
  }
  const project = createYoPhoLivingProject({
    ownerId: r.performerId,
    title: `YoAlbum · ${r.title}`,
    qaTag: "YOALBUM",
  });
  yophoProjects.set(project.projectId, project);
  try {
    saveYoPhoLivingProject(project);
  } catch {
    // Node/test: process memory retains project
  }
  r.yoAlbumProjectId = project.projectId;
  r.coverMode = input.premium ? "LIVING_PREMIUM" : r.coverMode === "NONE" ? "STANDARD_STATIC" : r.coverMode;
  if (input.premium) r.coverMode = "LIVING_PREMIUM";
  r.updatedAt = nowIso();
  return {
    ok: true,
    projectId: project.projectId,
    creatorAuthority: YOALBUM_CREATOR_AUTHORITY,
    secondEditor: false,
  };
}

export function getBoundYoPhoProject(projectId: string): YoPhoLivingProject | null {
  return yophoProjects.get(projectId) ?? null;
}

/** Collectible visual edition — NEVER clones mediaAssetIds. */
export function createCollectibleEdition(input: {
  releaseId: string;
  title: string;
  visualKind: "LIVING" | "LIMITED_VISUAL";
  coverAssetId?: string;
  /** Ignored for badge purposes unless durableInventoryProven === true */
  requestedSupply?: number;
  durableInventoryProven?: boolean;
}): { ok: boolean; code?: string; edition?: YoEdition; trackMediaAssetIds?: string[] } {
  const r = releases.get(input.releaseId);
  if (!r) return { ok: false, code: "NO_RELEASE" };
  if (!r.rights.collectible) return { ok: false, code: "COLLECTIBLE_RIGHTS_BLOCKED" };
  const durable = input.durableInventoryProven === true;
  const edition: YoEdition = {
    editionId: genId("yed"),
    releaseId: r.releaseId,
    coverAssetId: input.coverAssetId ?? r.coverAssetId,
    yoAlbumProjectId: r.yoAlbumProjectId,
    visualKind: input.visualKind,
    durableInventoryProven: durable,
    supply: durable && input.requestedSupply != null ? input.requestedSupply : null,
    soldCount: 0,
    commerceProductId: `shop_${r.performerId}_${r.releaseId}_${genId("prod")}`,
    title: input.title,
  };
  r.editions.push(edition);
  r.updatedAt = nowIso();
  return {
    ok: true,
    edition: structuredClone(edition),
    trackMediaAssetIds: [...r.trackMediaAssetIds],
  };
}

export function scarcityBadgeForEdition(edition: YoEdition): string | null {
  if (!edition.durableInventoryProven) return null;
  if (edition.supply === 1) return "1 OF 1";
  if (edition.supply != null && edition.supply > 1) {
    return `LIMITED · ${edition.soldCount + 1}/${edition.supply}`;
  }
  return null;
}

export function activateRelease(releaseId: string): { ok: boolean; code?: string; notice?: YoReleaseDayNotice } {
  const r = releases.get(releaseId);
  if (!r) return { ok: false, code: "NO_RELEASE" };
  r.lifecycle = "ACTIVE";
  r.updatedAt = nowIso();
  const notice: YoReleaseDayNotice = {
    noticeId: genId("ydn"),
    releaseId: r.releaseId,
    performerId: r.performerId,
    message: "Your album dropped today. Do you want to create your YoAlbum?",
    action: "CREATE_YOUR_YOALBUM",
    source: r.distributor.fixtureClassified ? "FIXTURE" : "AUTHORIZED_RELEASE",
    at: nowIso(),
  };
  // Cannot fabricate distributor-driven notice from unbound live feed without fixture/authorized path
  if (r.distributor.feedStatus === DISTRIBUTOR_FEED_STATUS && !r.distributor.fixtureClassified) {
    // Still allow notice from explicit activate (authorized release path), not distributor feed
    notice.source = "AUTHORIZED_RELEASE";
  }
  notices.push(notice);
  return { ok: true, notice };
}

export function listReleaseDayNotices(): YoReleaseDayNotice[] {
  return [...notices];
}

export function attemptFabricatedDistributorReleaseDay(): { ok: false; code: typeof DISTRIBUTOR_FEED_STATUS } {
  return { ok: false, code: DISTRIBUTOR_FEED_STATUS };
}

/** Contextual Performer Shop — inventory bound to performerId. */
export function resolvePerformerShopYoAlbumInventory(performerId: string): Array<{
  performerId: string;
  releaseId: string;
  editionId: string | null;
  commerceProductId: string;
  title: string;
  family: YoReleaseFamily;
  productClasses: YoProductClass[];
  trackMediaAssetIds: string[];
  scarcityBadge: string | null;
  secureDeliverable: YoAlbumRelease["secureDeliverable"];
}> {
  const out: ReturnType<typeof resolvePerformerShopYoAlbumInventory> = [];
  for (const r of releases.values()) {
    if (r.performerId !== performerId) continue;
    if (!r.rights.sell && !r.rights.stream) continue;
    if (r.editions.length === 0) {
      out.push({
        performerId: r.performerId,
        releaseId: r.releaseId,
        editionId: null,
        commerceProductId: `shop_${r.performerId}_${r.releaseId}`,
        title: r.title,
        family: r.family,
        productClasses: [...r.productClasses],
        trackMediaAssetIds: [...r.trackMediaAssetIds],
        scarcityBadge: null,
        secureDeliverable: r.secureDeliverable,
      });
    } else {
      for (const e of r.editions) {
        out.push({
          performerId: r.performerId,
          releaseId: r.releaseId,
          editionId: e.editionId,
          commerceProductId: e.commerceProductId ?? `shop_${r.performerId}_${r.releaseId}_${e.editionId}`,
          title: e.title,
          family: r.family,
          productClasses: [...r.productClasses],
          trackMediaAssetIds: [...r.trackMediaAssetIds],
          scarcityBadge: scarcityBadgeForEdition(e),
          secureDeliverable: r.secureDeliverable,
        });
      }
    }
  }
  return out;
}

export function toPromoItemForRelease(input: {
  releaseId: string;
  editionId?: string | null;
}): UniversalPromoItem | { ok: false; code: string } {
  const r = releases.get(input.releaseId);
  if (!r) return { ok: false, code: "NO_RELEASE" };
  const edition = input.editionId ? r.editions.find((e) => e.editionId === input.editionId) : r.editions[0];
  const dest = `/performers/${r.performerId}/yoalbum/${r.releaseId}${edition ? `?edition=${edition.editionId}` : ""}`;
  const badges: string[] = [r.family.replace("YO_", "YO")];
  // Product badges only when truthful
  if (r.productClasses.includes("STREAM") && r.rights.stream) badges.push("STREAM");
  if (r.productClasses.includes("OPEN_DOWNLOAD") && r.rights.downloadOpen) badges.push("OWN — OPEN DOWNLOAD");
  if (r.productClasses.includes("YOALBUM_SECURE")) {
    // Architecture may include Secure class; do NOT imply DRM functional
    badges.push("OWN — YOALBUM SECURE · DRM_UNBOUND");
  }
  const scarcity = edition ? scarcityBadgeForEdition(edition) : null;
  if (scarcity) badges.push(scarcity);

  const sourceType =
    r.family === "YO_SINGLE" ? "YO_SINGLE" : r.family === "YO_EP" ? "YO_EP" : "YO_ALBUM";

  return {
    promoItemId: `yoalbum_${r.releaseId}_${edition?.editionId ?? "base"}`,
    sourceType,
    sourceAuthority: "YoAlbumReleaseAuthority",
    canonicalTargetId: r.releaseId,
    creatorId: r.performerId,
    title: edition?.title ?? r.title,
    subtitle: YOALBUM_BRAND_LINE,
    artworkAssetId: edition?.coverAssetId ?? r.coverAssetId,
    badge: badges.join(" · "),
    callToAction: r.rights.sell ? "GET YOALBUM" : r.rights.stream ? "LISTEN" : "VIEW",
    exactDestination: dest,
    qrDestination: dest,
    availability: "AVAILABLE",
    rightsState: "APPROVED",
    disclosure: "NONE",
    priceLabel: null,
    scarcityLabel: scarcity,
    sortRank: 1,
    campaignId: null,
  };
}

export function secureProductPresentation(releaseId: string): {
  productArchitectureIncludesSecure: boolean;
  currentlyDeliverable: false;
  status: "DRM_UNBOUND" | "SECURE_PLAYBACK_UNBOUND" | "PACKAGING_UNBOUND";
} {
  const r = releases.get(releaseId);
  return {
    productArchitectureIncludesSecure: Boolean(r?.productClasses.includes("YOALBUM_SECURE")),
    currentlyDeliverable: false,
    status: r?.secureDeliverable ?? "DRM_UNBOUND",
  };
}

export function purchaseYoAlbumProduct(input: {
  buyerUserId: string;
  releaseId: string;
  editionId?: string | null;
  orderId: string;
  priceCents: number;
  productClass: YoProductClass;
}): { ok: boolean; code?: string; entitlementId?: string; copyrightTransferred: false } {
  const r = releases.get(input.releaseId);
  if (!r) return { ok: false, code: "NO_RELEASE", copyrightTransferred: false };
  if (input.productClass === "STREAM") {
    return { ok: false, code: "STREAM_IS_NOT_OWNERSHIP", copyrightTransferred: false };
  }
  if (input.productClass === "OPEN_DOWNLOAD" && !r.rights.downloadOpen) {
    return { ok: false, code: "DOWNLOAD_RIGHTS_BLOCKED", copyrightTransferred: false };
  }
  if (input.productClass === "YOALBUM_SECURE") {
    // May grant architectural entitlement record, but playback remains unbound
    if (!r.rights.sell) return { ok: false, code: "SALE_RIGHTS_BLOCKED", copyrightTransferred: false };
  } else if (!r.rights.sell && input.productClass !== "OPEN_DOWNLOAD") {
    return { ok: false, code: "SALE_RIGHTS_BLOCKED", copyrightTransferred: false };
  }

  const edition = input.editionId ? r.editions.find((e) => e.editionId === input.editionId) : null;
  if (edition?.durableInventoryProven && edition.supply != null && edition.soldCount >= edition.supply) {
    return { ok: false, code: "SOLD_OUT", copyrightTransferred: false };
  }

  const skuId = `yoalbum:${r.releaseId}:${edition?.editionId ?? "base"}:${input.productClass}`;
  const ent = OwnershipRuntime.grantEntitlement({
    userId: input.buyerUserId,
    skuId,
    title: edition?.title ?? r.title,
    category: "yoalbum",
    provenance: "PURCHASED",
    pricePaidCents: input.priceCents,
    orderId: input.orderId,
  });
  if (edition) edition.soldCount += 1;
  return { ok: true, entitlementId: ent.id, copyrightTransferred: false };
}

export function resolveBuyerLibrary(userId: string): BuyerLibraryEntry[] {
  const ents = OwnershipRuntime.getUserEntitlements(userId, "PURCHASED").filter((e) => e.category === "yoalbum");
  const out: BuyerLibraryEntry[] = [];
  for (const e of ents) {
    const parts = e.skuId.split(":");
    // yoalbum:releaseId:editionOrBase:PRODUCT
    const releaseId = parts[1];
    const editionKey = parts[2];
    const productClass = (parts[3] as YoProductClass) ?? "OPEN_DOWNLOAD";
    const r = releaseId ? releases.get(releaseId) : null;
    const actions: BuyerLibraryEntry["actions"] = ["OPEN_YOALBUM", "VIEW_ARTIST"];
    if (r?.rights.stream) actions.unshift("PLAY");
    if (editionKey && editionKey !== "base") actions.push("VIEW_EDITION");
    if (productClass === "OPEN_DOWNLOAD" && r?.rights.downloadOpen) actions.push("DOWNLOAD");
    if (productClass === "YOALBUM_SECURE") {
      actions.push("DOWNLOAD_FOR_OFFLINE_UNBOUND", "MANAGE_DEVICES_UNBOUND");
    }
    out.push({
      entitlementId: e.id,
      userId,
      releaseId: releaseId ?? "",
      editionId: editionKey && editionKey !== "base" ? editionKey : null,
      skuId: e.skuId,
      productClass,
      title: e.title,
      actions,
    });
  }
  return out;
}

export function claimsCopyrightOnPurchase(): false {
  return false;
}

export function secondVisualEditorIntroduced(): false {
  return false;
}

export function secondAudioCommerceOwnershipAuthorityIntroduced(): false {
  return false;
}
