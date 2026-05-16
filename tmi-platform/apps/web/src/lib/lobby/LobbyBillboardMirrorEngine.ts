import {
  LobbyFeedState,
  getLobbyFeedSnapshot,
  subscribeLobbyFeed,
} from "@/lib/lobby/LobbyFeedBus";

export type BillboardSource =
  | "magazine"
  | "sponsor"
  | "battle_result"
  | "cypher_result"
  | "top10"
  | "event"
  | "lobby_feed";

export type BillboardSlotStatus = "live" | "queued" | "archived";

export interface BillboardSlot {
  id: string;
  source: BillboardSource;
  headline: string;
  subline: string;
  accentColor: string;
  badgeLabel?: string;
  ctaRoute: string;
  status: BillboardSlotStatus;
  expiresAtMs?: number;
  injectedAtMs: number;
}

export interface BillboardFeed {
  activeSlot: BillboardSlot | null;
  queue: BillboardSlot[];
  archived: BillboardSlot[];
  lastUpdatedMs: number;
}

type BillboardSubscriber = (feed: BillboardFeed) => void;

const _slots: BillboardSlot[] = [];
const _subs = new Set<BillboardSubscriber>();
let _feedUnsub: (() => void) | null = null;
let _rotationTimer: ReturnType<typeof setInterval> | null = null;
let _slotCounter = 1;

const ROTATION_INTERVAL_MS = 8_000;

function generateSlotId(source: BillboardSource): string {
  return `bb_${source}_${Date.now()}_${_slotCounter++}`;
}

function getCurrentFeed(): BillboardFeed {
  const now = Date.now();
  const active  = _slots.filter((s) => s.status === "live");
  const queued  = _slots.filter((s) => s.status === "queued");
  const archived = _slots.filter((s) => s.status === "archived");

  // Expire stale live slots
  for (const slot of active) {
    if (slot.expiresAtMs && slot.expiresAtMs < now) {
      slot.status = "archived";
    }
  }

  const liveSlots = _slots.filter((s) => s.status === "live");
  return {
    activeSlot: liveSlots[0] ?? null,
    queue: queued,
    archived,
    lastUpdatedMs: now,
  };
}

function notify(): void {
  const feed = getCurrentFeed();
  for (const fn of _subs) fn(feed);
}

function pushSlot(slot: BillboardSlot): void {
  // Mark previous live slots as queued if this is a high-priority source
  if (slot.source === "battle_result" || slot.source === "cypher_result") {
    for (const s of _slots) {
      if (s.status === "live") s.status = "queued";
    }
    slot.status = "live";
  } else {
    const hasLive = _slots.some((s) => s.status === "live");
    slot.status = hasLive ? "queued" : "live";
  }
  _slots.push(slot);
  notify();
}

function rotateBillboard(): void {
  const liveSlots = _slots.filter((s) => s.status === "live");
  const queuedSlots = _slots.filter((s) => s.status === "queued");

  if (liveSlots.length > 0) {
    for (const s of liveSlots) s.status = "archived";
  }
  if (queuedSlots.length > 0) {
    queuedSlots[0]!.status = "live";
  }
  notify();
}

function syncFromFeedState(state: LobbyFeedState): void {
  if (state.status === "STANDBY") return;

  const slot: BillboardSlot = {
    id: generateSlotId("lobby_feed"),
    source: "lobby_feed",
    headline: state.title !== "—" ? state.title : state.performer,
    subline: `${state.occupancy} seated · Heat ${state.heat} · ${state.status}`,
    accentColor: "#00FFFF",
    badgeLabel: state.status,
    ctaRoute: state.slug ? `/lobbies/${state.slug}` : "/lobbies",
    status: "queued",
    injectedAtMs: Date.now(),
    expiresAtMs: Date.now() + 30_000,
  };

  const existing = _slots.find((s) => s.source === "lobby_feed" && s.status !== "archived");
  if (existing) {
    existing.headline = slot.headline;
    existing.subline  = slot.subline;
    notify();
  } else {
    pushSlot(slot);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function startBillboardMirror(): () => void {
  _feedUnsub = subscribeLobbyFeed(syncFromFeedState);
  _rotationTimer = setInterval(rotateBillboard, ROTATION_INTERVAL_MS);

  return () => {
    _feedUnsub?.();
    if (_rotationTimer) clearInterval(_rotationTimer);
    _feedUnsub = null;
    _rotationTimer = null;
  };
}

export function getBillboardFeed(): BillboardFeed {
  return getCurrentFeed();
}

export function subscribeBillboard(fn: BillboardSubscriber): () => void {
  _subs.add(fn);
  fn(getCurrentFeed());
  return () => _subs.delete(fn);
}

export function injectMagazineSlot(headline: string, subline: string, route: string): BillboardSlot {
  const slot: BillboardSlot = {
    id: generateSlotId("magazine"),
    source: "magazine",
    headline,
    subline,
    accentColor: "#FFD700",
    badgeLabel: "MAGAZINE",
    ctaRoute: route,
    status: "queued",
    injectedAtMs: Date.now(),
  };
  pushSlot(slot);
  return slot;
}

export function injectSponsorSlot(name: string, campaign: string, route: string): BillboardSlot {
  const slot: BillboardSlot = {
    id: generateSlotId("sponsor"),
    source: "sponsor",
    headline: name,
    subline: campaign,
    accentColor: "#FF6B35",
    badgeLabel: "SPONSOR",
    ctaRoute: route,
    status: "queued",
    injectedAtMs: Date.now(),
    expiresAtMs: Date.now() + 120_000,
  };
  pushSlot(slot);
  return slot;
}

export function injectBattleResult(winner: string, opponent: string, genre: string, route: string): BillboardSlot {
  const slot: BillboardSlot = {
    id: generateSlotId("battle_result"),
    source: "battle_result",
    headline: `👑 ${winner} wins`,
    subline: `Defeated ${opponent} · ${genre} Battle`,
    accentColor: "#CC0000",
    badgeLabel: "BATTLE WIN",
    ctaRoute: route,
    status: "queued",
    injectedAtMs: Date.now(),
    expiresAtMs: Date.now() + 60_000,
  };
  pushSlot(slot);
  return slot;
}

export function injectCypherResult(spotlight: string, genre: string, route: string): BillboardSlot {
  const slot: BillboardSlot = {
    id: generateSlotId("cypher_result"),
    source: "cypher_result",
    headline: `⭐ ${spotlight} spotlight`,
    subline: `${genre} Cypher · Session complete`,
    accentColor: "#AA2DFF",
    badgeLabel: "CYPHER",
    ctaRoute: route,
    status: "queued",
    injectedAtMs: Date.now(),
    expiresAtMs: Date.now() + 60_000,
  };
  pushSlot(slot);
  return slot;
}

export function injectTopRanking(rank: number, artistName: string, score: number, route: string): BillboardSlot {
  const slot: BillboardSlot = {
    id: generateSlotId("top10"),
    source: "top10",
    headline: `#${rank} ${artistName}`,
    subline: `Score ${score} · Top 10 this week`,
    accentColor: "#00FF88",
    badgeLabel: "TOP 10",
    ctaRoute: route,
    status: "queued",
    injectedAtMs: Date.now(),
  };
  pushSlot(slot);
  return slot;
}

export function injectEventSlot(title: string, countdownLabel: string, route: string): BillboardSlot {
  const slot: BillboardSlot = {
    id: generateSlotId("event"),
    source: "event",
    headline: title,
    subline: countdownLabel,
    accentColor: "#FF2DAA",
    badgeLabel: "EVENT",
    ctaRoute: route,
    status: "queued",
    injectedAtMs: Date.now(),
  };
  pushSlot(slot);
  return slot;
}

export function clearBillboard(): void {
  _slots.length = 0;
  notify();
}

// Seed from current bus snapshot on first call
export function hydrateBillboardFromBus(): void {
  const state = getLobbyFeedSnapshot();
  syncFromFeedState(state);
}
