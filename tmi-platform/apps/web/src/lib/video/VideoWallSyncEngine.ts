export type WallContentType =
  | "ad"
  | "artist_promo"
  | "battle_intro"
  | "winner_replay"
  | "sponsor_reel"
  | "season_pass_promo"
  | "event_countdown"
  | "standby";

export type WallContentStatus = "active" | "queued" | "played" | "skipped";

export interface VideoWallSlot {
  id: string;
  type: WallContentType;
  title: string;
  subtitle: string;
  accentColor: string;
  durationMs: number;
  ctaRoute?: string;
  mediaUrl?: string;
  sponsorId?: string;
  artistId?: string;
  badgeLabel?: string;
  status: WallContentStatus;
  queuedAtMs: number;
  playedAtMs?: number;
}

export interface VideoWallState {
  wallId: string;
  activeSlot: VideoWallSlot | null;
  queue: VideoWallSlot[];
  playHistory: VideoWallSlot[];
  isRunning: boolean;
  updatedAtMs: number;
}

type WallSubscriber = (state: VideoWallState) => void;

const DEFAULT_DURATIONS: Record<WallContentType, number> = {
  ad:               15_000,
  artist_promo:     20_000,
  battle_intro:     10_000,
  winner_replay:    25_000,
  sponsor_reel:     20_000,
  season_pass_promo: 18_000,
  event_countdown:  12_000,
  standby:          10_000,
};

const _walls: Map<string, VideoWallState> = new Map();
const _subs: Map<string, Set<WallSubscriber>> = new Map();
const _timers: Map<string, ReturnType<typeof setTimeout>> = new Map();
let _slotCounter = 1;

function generateSlotId(type: WallContentType): string {
  return `vw_${type}_${Date.now()}_${_slotCounter++}`;
}

function getOrCreateWall(wallId: string): VideoWallState {
  if (_walls.has(wallId)) return _walls.get(wallId)!;
  const state: VideoWallState = {
    wallId,
    activeSlot: null,
    queue: [],
    playHistory: [],
    isRunning: false,
    updatedAtMs: Date.now(),
  };
  _walls.set(wallId, state);
  return state;
}

function notify(wallId: string): void {
  const state = _walls.get(wallId);
  if (!state) return;
  const subs = _subs.get(wallId);
  if (!subs) return;
  for (const fn of subs) fn(state);
}

function scheduleNext(wallId: string, durationMs: number): void {
  const existing = _timers.get(wallId);
  if (existing) clearTimeout(existing);

  const timer = setTimeout(() => {
    advanceWall(wallId);
  }, durationMs);

  _timers.set(wallId, timer);
}

function advanceWall(wallId: string): void {
  const state = _walls.get(wallId);
  if (!state || !state.isRunning) return;

  const history = state.activeSlot
    ? [...state.playHistory, { ...state.activeSlot, status: "played" as WallContentStatus, playedAtMs: Date.now() }]
    : state.playHistory;

  const [next, ...remaining] = state.queue;

  const activeSlot: VideoWallSlot | null = next
    ? { ...next, status: "active", playedAtMs: Date.now() }
    : buildStandbySlot(wallId);

  const updated: VideoWallState = {
    ...state,
    activeSlot,
    queue: remaining ?? [],
    playHistory: history.slice(-20),
    updatedAtMs: Date.now(),
  };
  _walls.set(wallId, updated);
  notify(wallId);

  if (activeSlot) {
    scheduleNext(wallId, activeSlot.durationMs);
  }
}

function buildStandbySlot(wallId: string): VideoWallSlot {
  return {
    id: generateSlotId("standby"),
    type: "standby",
    title: "TMI · The Musician's Index",
    subtitle: "Live performances · Cyphers · Battles",
    accentColor: "#AA2DFF",
    durationMs: DEFAULT_DURATIONS.standby,
    ctaRoute: "/home/1",
    status: "active",
    queuedAtMs: Date.now(),
    playedAtMs: Date.now(),
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export function activateWall(wallId: string): () => void {
  const state = getOrCreateWall(wallId);
  _walls.set(wallId, { ...state, isRunning: true });
  advanceWall(wallId);

  return () => {
    const timer = _timers.get(wallId);
    if (timer) clearTimeout(timer);
    const current = _walls.get(wallId);
    if (current) _walls.set(wallId, { ...current, isRunning: false });
  };
}

export function getWallState(wallId: string): VideoWallState | null {
  return _walls.get(wallId) ?? null;
}

export function subscribeWall(wallId: string, fn: WallSubscriber): () => void {
  if (!_subs.has(wallId)) _subs.set(wallId, new Set());
  _subs.get(wallId)!.add(fn);

  const current = _walls.get(wallId);
  if (current) fn(current);

  return () => _subs.get(wallId)?.delete(fn);
}

function enqueue(wallId: string, slot: VideoWallSlot): void {
  const state = getOrCreateWall(wallId);
  const updated: VideoWallState = {
    ...state,
    queue: [...state.queue, slot],
    updatedAtMs: Date.now(),
  };
  _walls.set(wallId, updated);
  notify(wallId);
}

export function injectAd(wallId: string, opts: {
  title: string; subtitle: string; sponsorId: string; ctaRoute: string; mediaUrl?: string;
}): VideoWallSlot {
  const slot: VideoWallSlot = {
    id: generateSlotId("ad"),
    type: "ad",
    title: opts.title,
    subtitle: opts.subtitle,
    accentColor: "#FFD700",
    durationMs: DEFAULT_DURATIONS.ad,
    ctaRoute: opts.ctaRoute,
    mediaUrl: opts.mediaUrl,
    sponsorId: opts.sponsorId,
    badgeLabel: "AD",
    status: "queued",
    queuedAtMs: Date.now(),
  };
  enqueue(wallId, slot);
  return slot;
}

export function injectArtistPromo(wallId: string, opts: {
  artistName: string; tagline: string; artistId: string; ctaRoute: string; mediaUrl?: string;
}): VideoWallSlot {
  const slot: VideoWallSlot = {
    id: generateSlotId("artist_promo"),
    type: "artist_promo",
    title: opts.artistName,
    subtitle: opts.tagline,
    accentColor: "#00FFFF",
    durationMs: DEFAULT_DURATIONS.artist_promo,
    ctaRoute: opts.ctaRoute,
    mediaUrl: opts.mediaUrl,
    artistId: opts.artistId,
    badgeLabel: "ARTIST",
    status: "queued",
    queuedAtMs: Date.now(),
  };
  enqueue(wallId, slot);
  return slot;
}

export function injectBattleIntro(wallId: string, opts: {
  fighter1: string; fighter2: string; genre: string; ctaRoute: string;
}): VideoWallSlot {
  const slot: VideoWallSlot = {
    id: generateSlotId("battle_intro"),
    type: "battle_intro",
    title: `${opts.fighter1} vs ${opts.fighter2}`,
    subtitle: `${opts.genre} Battle · Starting now`,
    accentColor: "#CC0000",
    durationMs: DEFAULT_DURATIONS.battle_intro,
    ctaRoute: opts.ctaRoute,
    badgeLabel: "⚔ BATTLE",
    status: "queued",
    queuedAtMs: Date.now(),
  };
  enqueue(wallId, slot);
  return slot;
}

export function injectWinnerReplay(wallId: string, opts: {
  winnerName: string; eventName: string; ctaRoute: string; mediaUrl?: string;
}): VideoWallSlot {
  const slot: VideoWallSlot = {
    id: generateSlotId("winner_replay"),
    type: "winner_replay",
    title: `👑 ${opts.winnerName}`,
    subtitle: `Winner replay · ${opts.eventName}`,
    accentColor: "#FFD700",
    durationMs: DEFAULT_DURATIONS.winner_replay,
    ctaRoute: opts.ctaRoute,
    mediaUrl: opts.mediaUrl,
    badgeLabel: "WINNER",
    status: "queued",
    queuedAtMs: Date.now(),
  };
  enqueue(wallId, slot);
  return slot;
}

export function injectSponsorReel(wallId: string, opts: {
  sponsorName: string; campaign: string; sponsorId: string; ctaRoute: string; mediaUrl?: string;
}): VideoWallSlot {
  const slot: VideoWallSlot = {
    id: generateSlotId("sponsor_reel"),
    type: "sponsor_reel",
    title: opts.sponsorName,
    subtitle: opts.campaign,
    accentColor: "#FF6B35",
    durationMs: DEFAULT_DURATIONS.sponsor_reel,
    ctaRoute: opts.ctaRoute,
    mediaUrl: opts.mediaUrl,
    sponsorId: opts.sponsorId,
    badgeLabel: "SPONSOR",
    status: "queued",
    queuedAtMs: Date.now(),
  };
  enqueue(wallId, slot);
  return slot;
}

export function injectSeasonPassPromo(wallId: string, opts: {
  tier: string; instrument: string; ctaRoute: string;
}): VideoWallSlot {
  const slot: VideoWallSlot = {
    id: generateSlotId("season_pass_promo"),
    type: "season_pass_promo",
    title: `${opts.tier} Season Pass`,
    subtitle: `Unlock ${opts.instrument} · Swap anytime`,
    accentColor: "#AA2DFF",
    durationMs: DEFAULT_DURATIONS.season_pass_promo,
    ctaRoute: opts.ctaRoute,
    badgeLabel: "PASS",
    status: "queued",
    queuedAtMs: Date.now(),
  };
  enqueue(wallId, slot);
  return slot;
}

export function skipCurrentSlot(wallId: string): void {
  const state = _walls.get(wallId);
  if (!state || !state.isRunning) return;

  const existing = _timers.get(wallId);
  if (existing) clearTimeout(existing);

  if (state.activeSlot) {
    const skipped = { ...state.activeSlot, status: "skipped" as WallContentStatus };
    _walls.set(wallId, {
      ...state,
      playHistory: [...state.playHistory, skipped].slice(-20),
    });
  }
  advanceWall(wallId);
}

export function clearQueue(wallId: string): void {
  const state = _walls.get(wallId);
  if (!state) return;
  _walls.set(wallId, { ...state, queue: [], updatedAtMs: Date.now() });
  notify(wallId);
}

export function getAllWalls(): VideoWallState[] {
  return Array.from(_walls.values());
}
