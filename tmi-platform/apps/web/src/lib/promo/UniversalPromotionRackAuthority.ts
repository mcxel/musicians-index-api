/**
 * UniversalPromotionRackAuthority — Phase 2 Universal Creator Promotion Fabric
 *
 * ONE button [PROMOTE] (exact former SPONSORS slot)
 * → ONE Mosaic-Mini-Panel-sized performer-private rack
 * → dimensional scroll / poke / private preview / TAKE LIVE
 * → public finished overlay only
 *
 * ONE SURFACE != ONE BUSINESS AUTHORITY.
 * Consumes Beat Locker / Show-to-Beat / Sponsor / commerce helpers.
 * Does NOT reopen frozen Beat Locker or Show-to-Beat laws.
 *
 * Persistence: PROCESS_MEMORY. PHYSICAL_GREEN = 0.
 */

import { getBeatListing } from "@/lib/beats/BeatLockerUniqueTitleOwnership";

/** Locked size class — compact auxiliary panel (ControlCanister / Mosaic-mini envelope). */
export const MOSAIC_MINI_PANEL_SIZE = {
  sizeClass: "MOSAIC_MINI_PANEL" as const,
  widthPx: 280,
  heightPx: 360,
  maxWidthCss: "min(280px, calc(100vw - 24px))",
  maxHeightCss: "min(360px, calc(100vh - 120px))",
};

export type PromoSourceType =
  | "YO_SINGLE"
  | "YO_EP"
  | "YO_ALBUM"
  | "YOPHO_CARD"
  | "LIVING_YOPHO"
  | "BEAT_LOCKER"
  | "MERCH"
  | "TICKET"
  | "UPCOMING_SHOW"
  | "TOUR_DATE"
  | "CREATOR_PRODUCT"
  | "FILM_PROJECT"
  | "SPONSOR_CAMPAIGN"
  | "STREAM"
  | "OPEN_DOWNLOAD"
  | "YOALBUM_SECURE";

export type PromoItemState =
  | "AVAILABLE"
  | "QUEUED"
  | "PREVIEWING"
  | "READY"
  | "LIVE"
  | "COMPLETED"
  | "EXPIRED"
  | "BLOCKED"
  | "SOLD_OUT";

export type PromoDisclosure = "NONE" | "SPONSORED" | "SPONSOR" | "PAID_PARTNERSHIP";

export type UniversalPromoItem = {
  promoItemId: string;
  sourceType: PromoSourceType;
  sourceAuthority: string;
  canonicalTargetId: string;
  creatorId: string;
  title: string;
  subtitle: string | null;
  artworkAssetId: string | null;
  badge: string;
  callToAction: string;
  exactDestination: string;
  qrDestination: string;
  availability: PromoItemState;
  rightsState: "APPROVED" | "PENDING" | "BLOCKED" | "EXPIRED";
  disclosure: PromoDisclosure;
  priceLabel: string | null;
  scarcityLabel: string | null;
  sortRank: number;
  campaignId: string | null;
};

export type PromoPresentation = {
  presentationId: string;
  promoItemId: string;
  placement: "TOP_LEFT" | "TOP_RIGHT" | "BOTTOM_LEFT" | "BOTTOM_RIGHT" | "AUTO";
  enteredAt: string;
  expiresAt: string;
  programSessionId: string;
  plane: "PUBLIC_PROGRAM";
  disclosure: PromoDisclosure;
};

export type PromoAnalyticsState =
  | "CREATOR_PROMO_SHOWN"
  | "CREATOR_PROMO_CLICKED"
  | "CREATOR_PROMO_QR_OPENED"
  | "CREATOR_PROMO_STORE_OPENED"
  | "CREATOR_PROMO_CHECKOUT_STARTED"
  | "CREATOR_PROMO_PURCHASE_ATTRIBUTED"
  | "SPONSOR_IMPRESSION_QUALIFIED";

type AnalyticsEvent = {
  state: PromoAnalyticsState;
  presentationId: string | null;
  promoItemId: string;
  creatorId: string;
  sessionId: string;
  at: string;
  isHuman: boolean;
};

type SessionRuntime = {
  creatorId: string;
  sessionId: string;
  roomId: string | null;
  inventory: UniversalPromoItem[];
  selectedId: string | null;
  queue: string[];
  livePresentation: PromoPresentation | null;
  quickTake: boolean;
  cooldownUntil: number;
  deckOpen: boolean;
};

const sessions = new Map<string, SessionRuntime>();
const analyticsLog: AnalyticsEvent[] = [];
const DEFAULT_HOLD_MS = 7000;
const DEFAULT_COOLDOWN_MS = 2500;

function nowIso(): string {
  return new Date().toISOString();
}

function getOrCreate(sessionId: string, creatorId: string, roomId?: string | null): SessionRuntime {
  let s = sessions.get(sessionId);
  if (!s) {
    s = {
      creatorId,
      sessionId,
      roomId: roomId ?? null,
      inventory: [],
      selectedId: null,
      queue: [],
      livePresentation: null,
      quickTake: false,
      cooldownUntil: 0,
      deckOpen: false,
    };
    sessions.set(sessionId, s);
  }
  return s;
}

export function resetUniversalPromotionRackForTests(): void {
  sessions.clear();
  analyticsLog.length = 0;
}

export function listPromoAnalytics(): AnalyticsEvent[] {
  return [...analyticsLog];
}

export function getMosaicMiniPanelSize() {
  return { ...MOSAIC_MINI_PANEL_SIZE };
}

/**
 * Aggregate authorized promo inventory into ONE rack.
 * Callers supply already-authorized records — client cannot forge rights/price/scarcity.
 */
export function seedUniversalPromotionRack(input: {
  sessionId: string;
  creatorId: string;
  roomId?: string | null;
  items: UniversalPromoItem[];
}): UniversalPromoItem[] {
  const s = getOrCreate(input.sessionId, input.creatorId, input.roomId);
  const eligible = input.items
    .filter((i) => i.creatorId === input.creatorId)
    .filter((i) => i.rightsState === "APPROVED" || i.sourceType === "SPONSOR_CAMPAIGN")
    .filter((i) => i.availability !== "EXPIRED" && i.availability !== "BLOCKED")
    .map((i) => {
      if (i.sourceType === "SPONSOR_CAMPAIGN" && i.rightsState !== "APPROVED") {
        return { ...i, availability: "BLOCKED" as const };
      }
      // Scarcity badges require truthful labels from caller — never invent.
      if ((i.badge.includes("LIMITED") || i.badge.includes("1 OF 1")) && !i.scarcityLabel) {
        return { ...i, badge: i.badge.replace(/\s*LIMITED.*$/i, "").trim() || i.badge, scarcityLabel: null };
      }
      return i;
    })
    .sort((a, b) => a.sortRank - b.sortRank);
  s.inventory = eligible;
  return [...s.inventory];
}

export function openPromoDeck(sessionId: string, creatorId: string): {
  open: true;
  plane: "PERFORMER_PRIVATE";
  sizeClass: "MOSAIC_MINI_PANEL";
  publicLeak: false;
  webrtcRemount: false;
} {
  const s = getOrCreate(sessionId, creatorId);
  s.deckOpen = true;
  return {
    open: true,
    plane: "PERFORMER_PRIVATE",
    sizeClass: "MOSAIC_MINI_PANEL",
    publicLeak: false,
    webrtcRemount: false,
  };
}

export function closePromoDeck(sessionId: string): {
  closed: true;
  livePromoContinues: boolean;
  publicLeak: false;
} {
  const s = sessions.get(sessionId);
  if (s) s.deckOpen = false;
  return {
    closed: true,
    livePromoContinues: Boolean(s?.livePresentation),
    publicLeak: false,
  };
}

export function listRackItems(sessionId: string): UniversalPromoItem[] {
  return [...(sessions.get(sessionId)?.inventory ?? [])];
}

/** Poke/tap: SELECT + PRIVATE PREVIEW. Default does NOT broadcast. */
export function pokePromoItem(sessionId: string, promoItemId: string): {
  ok: boolean;
  selected: UniversalPromoItem | null;
  plane: "PERFORMER_PRIVATE";
  broadcast: false;
  code?: string;
} {
  const s = sessions.get(sessionId);
  if (!s) return { ok: false, selected: null, plane: "PERFORMER_PRIVATE", broadcast: false, code: "NO_SESSION" };
  const item = s.inventory.find((i) => i.promoItemId === promoItemId) ?? null;
  if (!item) return { ok: false, selected: null, plane: "PERFORMER_PRIVATE", broadcast: false, code: "NOT_FOUND" };
  if (item.availability === "EXPIRED" || item.availability === "BLOCKED" || item.availability === "SOLD_OUT") {
    return { ok: false, selected: item, plane: "PERFORMER_PRIVATE", broadcast: false, code: item.availability };
  }
  s.selectedId = promoItemId;
  item.availability = "PREVIEWING";
  return { ok: true, selected: item, plane: "PERFORMER_PRIVATE", broadcast: false };
}

export function setQuickTake(sessionId: string, enabled: boolean): void {
  const s = sessions.get(sessionId);
  if (s) s.quickTake = enabled;
}

export function isQuickTakeEnabled(sessionId: string): boolean {
  return Boolean(sessions.get(sessionId)?.quickTake);
}

/**
 * Append authorized items. Does not replace the rack and does not present.
 * Callers supply already-authorized records.
 */
export function mergePromoLibrary(input: {
  sessionId: string;
  creatorId: string;
  roomId?: string | null;
  items: UniversalPromoItem[];
}): UniversalPromoItem[] {
  const s = getOrCreate(input.sessionId, input.creatorId, input.roomId);
  const eligible = input.items
    .filter((i) => i.creatorId === input.creatorId)
    .filter((i) => i.rightsState === "APPROVED" || i.sourceType === "SPONSOR_CAMPAIGN")
    .filter((i) => i.availability !== "EXPIRED" && i.availability !== "BLOCKED");
  for (const item of eligible) {
    if (s.inventory.some((i) => i.promoItemId === item.promoItemId)) continue;
    s.inventory.push(item);
  }
  s.inventory.sort((a, b) => a.sortRank - b.sortRank);
  return [...s.inventory];
}

/** ADD → READY. Prepares an item. Does not put it on screen. */
export function markPromoReady(sessionId: string, promoItemId: string): {
  ok: boolean;
  code?: string;
  presented: false;
} {
  const s = sessions.get(sessionId);
  if (!s) return { ok: false, code: "NO_SESSION", presented: false };
  const item = s.inventory.find((i) => i.promoItemId === promoItemId);
  if (!item) return { ok: false, code: "NOT_FOUND", presented: false };
  if (item.availability === "EXPIRED" || item.availability === "BLOCKED" || item.availability === "SOLD_OUT") {
    return { ok: false, code: item.availability, presented: false };
  }
  if (!s.queue.includes(promoItemId)) s.queue.push(promoItemId);
  if (item.availability !== "LIVE") item.availability = "READY";
  s.selectedId = promoItemId;
  return { ok: true, presented: false };
}

/** Drop an item from the ready collection. The library copy stays. */
export function removePromoFromReady(sessionId: string, promoItemId: string): { ok: boolean } {
  const s = sessions.get(sessionId);
  if (!s) return { ok: false };
  s.queue = s.queue.filter((id) => id !== promoItemId);
  const item = s.inventory.find((i) => i.promoItemId === promoItemId);
  if (item && item.availability === "READY") item.availability = "AVAILABLE";
  if (s.selectedId === promoItemId && item?.availability !== "LIVE") s.selectedId = s.queue[0] ?? null;
  return { ok: true };
}

export function enqueuePromo(sessionId: string, promoItemId: string): { ok: boolean; queue: string[] } {
  const s = sessions.get(sessionId);
  if (!s) return { ok: false, queue: [] };
  if (!s.inventory.some((i) => i.promoItemId === promoItemId)) return { ok: false, queue: [...s.queue] };
  if (!s.queue.includes(promoItemId)) s.queue.push(promoItemId);
  const item = s.inventory.find((i) => i.promoItemId === promoItemId);
  if (item && item.availability !== "LIVE") item.availability = "QUEUED";
  return { ok: true, queue: [...s.queue] };
}

export function getQueue(sessionId: string): string[] {
  return [...(sessions.get(sessionId)?.queue ?? [])];
}

export function reorderQueue(sessionId: string, next: string[]): string[] {
  const s = sessions.get(sessionId);
  if (!s) return [];
  s.queue = next.filter((id) => s.inventory.some((i) => i.promoItemId === id));
  return [...s.queue];
}


export function takePromoLive(input: {
  sessionId: string;
  creatorId: string;
  promoItemId?: string;
  placement?: PromoPresentation["placement"];
  holdMs?: number;
  nowMs?: number;
}): {
  ok: boolean;
  code?: string;
  presentation: PromoPresentation | null;
  webrtcRemount: false;
  impressionCounted: boolean;
} {
  const s = sessions.get(input.sessionId);
  if (!s) return { ok: false, code: "NO_SESSION", presentation: null, webrtcRemount: false, impressionCounted: false };
  if (s.creatorId !== input.creatorId) {
    return { ok: false, code: "UNAUTHORIZED_CREATOR", presentation: null, webrtcRemount: false, impressionCounted: false };
  }
  const now = input.nowMs ?? Date.now();
  if (now < s.cooldownUntil) {
    return { ok: false, code: "COOLDOWN", presentation: null, webrtcRemount: false, impressionCounted: false };
  }
  const id = input.promoItemId ?? s.selectedId;
  if (!id) return { ok: false, code: "NO_SELECTION", presentation: null, webrtcRemount: false, impressionCounted: false };
  const item = s.inventory.find((i) => i.promoItemId === id);
  if (!item) return { ok: false, code: "NOT_FOUND", presentation: null, webrtcRemount: false, impressionCounted: false };
  if (item.availability === "EXPIRED" || item.availability === "BLOCKED" || item.availability === "SOLD_OUT") {
    return { ok: false, code: item.availability, presentation: null, webrtcRemount: false, impressionCounted: false };
  }
  if (item.rightsState !== "APPROVED") {
    return { ok: false, code: "RIGHTS_BLOCKED", presentation: null, webrtcRemount: false, impressionCounted: false };
  }
  if (!item.exactDestination || item.exactDestination === "/" || item.exactDestination === "#") {
    return { ok: false, code: "DESTINATION_INVALID", presentation: null, webrtcRemount: false, impressionCounted: false };
  }
  // End previous live if any
  if (s.livePresentation) {
    const prev = s.inventory.find((i) => i.promoItemId === s.livePresentation!.promoItemId);
    if (prev) prev.availability = "COMPLETED";
  }
  const hold = input.holdMs ?? DEFAULT_HOLD_MS;
  const presentation: PromoPresentation = {
    presentationId: `pres_${now}_${Math.random().toString(36).slice(2, 8)}`,
    promoItemId: item.promoItemId,
    placement: input.placement ?? "AUTO",
    enteredAt: new Date(now).toISOString(),
    expiresAt: new Date(now + hold).toISOString(),
    programSessionId: s.sessionId,
    plane: "PUBLIC_PROGRAM",
    disclosure: item.disclosure,
  };
  s.livePresentation = presentation;
  item.availability = "LIVE";
  s.selectedId = item.promoItemId;
  s.cooldownUntil = now + DEFAULT_COOLDOWN_MS;

  // Impression only when actually taken live (public render). QUEUE/PREVIEW never count.
  analyticsLog.push({
    state: item.sourceType === "SPONSOR_CAMPAIGN" ? "SPONSOR_IMPRESSION_QUALIFIED" : "CREATOR_PROMO_SHOWN",
    presentationId: presentation.presentationId,
    promoItemId: item.promoItemId,
    creatorId: s.creatorId,
    sessionId: s.sessionId,
    at: presentation.enteredAt,
    isHuman: true,
  });

  return { ok: true, presentation, webrtcRemount: false, impressionCounted: true };
}

/** Quick Take: poke then immediately take live — still runs full authority checks. */
export function pokeAndMaybeQuickTake(sessionId: string, creatorId: string, promoItemId: string) {
  const poke = pokePromoItem(sessionId, promoItemId);
  if (!poke.ok) return { poke, take: null as ReturnType<typeof takePromoLive> | null };
  if (!isQuickTakeEnabled(sessionId)) {
    return { poke, take: null };
  }
  return {
    poke,
    take: takePromoLive({ sessionId, creatorId, promoItemId }),
  };
}

export function hideLivePromo(sessionId: string): { ok: boolean; nextReady: string | null } {
  const s = sessions.get(sessionId);
  if (!s || !s.livePresentation) return { ok: false, nextReady: null };
  const item = s.inventory.find((i) => i.promoItemId === s.livePresentation!.promoItemId);
  if (item) item.availability = "COMPLETED";
  s.livePresentation = null;
  // Advance queue: next becomes READY, do NOT auto take live
  const nextId = s.queue.find((id) => {
    const it = s.inventory.find((x) => x.promoItemId === id);
    return it && it.availability !== "COMPLETED" && it.availability !== "LIVE";
  }) ?? null;
  if (nextId) {
    const next = s.inventory.find((i) => i.promoItemId === nextId)!;
    next.availability = "READY";
    s.selectedId = nextId;
  }
  return { ok: true, nextReady: nextId };
}

export function getLivePresentation(sessionId: string): PromoPresentation | null {
  return sessions.get(sessionId)?.livePresentation ?? null;
}

export function getPublicAudienceView(sessionId: string): {
  promoDeckVisible: false;
  overlay: PromoPresentation | null;
  item: UniversalPromoItem | null;
} {
  const s = sessions.get(sessionId);
  const overlay = s?.livePresentation ?? null;
  const item = overlay ? s!.inventory.find((i) => i.promoItemId === overlay.promoItemId) ?? null : null;
  return { promoDeckVisible: false, overlay, item };
}

export function getPrivateOperatorView(sessionId: string): {
  plane: "PERFORMER_PRIVATE";
  deckOpen: boolean;
  sizeClass: "MOSAIC_MINI_PANEL";
  selected: UniversalPromoItem | null;
  queue: string[];
  live: PromoPresentation | null;
  inventory: UniversalPromoItem[];
} {
  const s = sessions.get(sessionId);
  const selected = s?.selectedId ? s.inventory.find((i) => i.promoItemId === s.selectedId) ?? null : null;
  return {
    plane: "PERFORMER_PRIVATE",
    deckOpen: Boolean(s?.deckOpen),
    sizeClass: "MOSAIC_MINI_PANEL",
    selected,
    queue: [...(s?.queue ?? [])],
    live: s?.livePresentation ?? null,
    inventory: [...(s?.inventory ?? [])],
  };
}

export function recordPromoOpen(input: {
  sessionId: string;
  promoItemId: string;
  creatorId: string;
  method: "CLICK" | "QR";
  isHuman?: boolean;
}): { ok: boolean; storeOpen: boolean; purchase: false } {
  const human = input.isHuman !== false;
  analyticsLog.push({
    state: input.method === "QR" ? "CREATOR_PROMO_QR_OPENED" : "CREATOR_PROMO_CLICKED",
    presentationId: sessions.get(input.sessionId)?.livePresentation?.presentationId ?? null,
    promoItemId: input.promoItemId,
    creatorId: input.creatorId,
    sessionId: input.sessionId,
    at: nowIso(),
    isHuman: human,
  });
  if (human) {
    analyticsLog.push({
      state: "CREATOR_PROMO_STORE_OPENED",
      presentationId: sessions.get(input.sessionId)?.livePresentation?.presentationId ?? null,
      promoItemId: input.promoItemId,
      creatorId: input.creatorId,
      sessionId: input.sessionId,
      at: nowIso(),
      isHuman: true,
    });
  }
  return { ok: true, storeOpen: human, purchase: false };
}

/**
 * Beat promo item helper — reuses frozen Show-to-Beat / Beat Locker routing.
 * Does not create listings or entitlements.
 */
export function buildBeatPromoItem(input: {
  creatorId: string;
  mediaAssetId: string;
  listingId: string;
  title: string;
  sortRank?: number;
}): UniversalPromoItem | { ok: false; code: string } {
  const listing = getBeatListing(input.listingId);
  if (!listing || listing.lifecycle !== "ACTIVE") return { ok: false, code: "NO_ACTIVE_LISTING" };
  if (listing.mediaAssetId !== input.mediaAssetId) return { ok: false, code: "MEDIA_MISMATCH" };
  const dest = `/beats/locker/${listing.listingId}`;
  return {
    promoItemId: `beat_${listing.listingId}`,
    sourceType: "BEAT_LOCKER",
    sourceAuthority: "BeatLockerUniqueTitleOwnership",
    canonicalTargetId: listing.listingId,
    creatorId: input.creatorId,
    title: input.title || listing.displayTitle,
    subtitle: "Beat Locker",
    artworkAssetId: null,
    badge: "BEAT",
    callToAction: "VIEW BEAT",
    exactDestination: dest,
    qrDestination: dest,
    availability: "AVAILABLE",
    rightsState: "APPROVED",
    disclosure: "NONE",
    priceLabel: null,
    scarcityLabel: null,
    sortRank: input.sortRank ?? 50,
    campaignId: null,
  };
}

export function markItemSoldOut(sessionId: string, promoItemId: string): void {
  const s = sessions.get(sessionId);
  const item = s?.inventory.find((i) => i.promoItemId === promoItemId);
  if (item) item.availability = "SOLD_OUT";
}

export function expireSponsorCampaign(sessionId: string, promoItemId: string): void {
  const s = sessions.get(sessionId);
  const item = s?.inventory.find((i) => i.promoItemId === promoItemId);
  if (item && item.sourceType === "SPONSOR_CAMPAIGN") {
    item.availability = "EXPIRED";
    item.rightsState = "EXPIRED";
  }
}

export function assertPrivatePublicBoundary(sessionId: string): {
  privateHasDeck: boolean;
  publicHasDeck: false;
  publicHasOverlayOnly: boolean;
} {
  const priv = getPrivateOperatorView(sessionId);
  const pub = getPublicAudienceView(sessionId);
  return {
    privateHasDeck: priv.deckOpen,
    publicHasDeck: false,
    publicHasOverlayOnly: Boolean(pub.overlay) && pub.promoDeckVisible === false,
  };
}
