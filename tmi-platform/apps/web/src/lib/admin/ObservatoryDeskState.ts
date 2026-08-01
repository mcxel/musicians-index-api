/**
 * ObservatoryDeskState — Living OS Control Desk session + workspace state.
 * Phase 1: panel + period + health/selection dual state.
 * Phase 2: grid tiles + named layouts (localStorage). Not a Command Bus god-object.
 *
 * Deferred (do not build here):
 * Phase 3 Analytics Builder · Phase 4 Command Timeline · Phase 5 AI Workspace
 * Phase 6 Action Center · Phase 7 OC Health · Phase 8 Registry Inspector
 */

export const OBSERVATORY_DESK_STORAGE_KEY = "tmi.observatory.controlDesk.v2";
export const OBSERVATORY_DESK_STORAGE_KEY_V1 = "tmi.observatory.controlDesk.v1";

export type DeskPeriod =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "90d"
  | "ytd"
  | "lifetime"
  | "custom";

export type DeskPanelId =
  | "overview"
  | "analytics"
  | "revenue"
  | "audience"
  | "rooms"
  | "lobby-wall"
  | "bots"
  | "rankings"
  | "presentation"
  | "webrtc"
  | "commerce"
  | "submissions"
  | "alerts"
  | "system-health"
  | "stats"
  | "geography"
  | "engagement"
  | "growth"
  | "sponsors"
  | "prizes";

/** Health light — never synthetic green-for-existence. Gray = no telemetry. */
export type DeskHealth = "green" | "yellow" | "red" | "gray" | "purple";

export type DeskHealthMap = Partial<Record<DeskPanelId, DeskHealth>>;

/** focus = rail drives one primary module; layout = multi-tile NOC grid */
export type DeskWorkspaceMode = "focus" | "layout";

export type DeskTile = {
  id: string;
  panelId: DeskPanelId;
  x: number;
  y: number;
  w: number;
  h: number;
  pinned?: boolean;
  collapsed?: boolean;
  /** When true, tile is omitted from the grid (tile picker hide) */
  hidden?: boolean;
};

export type DeskNamedLayoutId =
  | "default"
  | "executive"
  | "live-ops"
  | "bot-ops"
  | "presentation"
  | "revenue"
  | "custom";

export type DeskNamedLayout = {
  id: DeskNamedLayoutId;
  name: string;
  mode: DeskWorkspaceMode;
  tiles: DeskTile[];
  focusPanel: DeskPanelId;
  maximizedTileId: string | null;
};

export type ObservatoryDeskState = {
  panel: DeskPanelId;
  period: DeskPeriod;
  mode: DeskWorkspaceMode;
  tiles: DeskTile[];
  maximizedTileId: string | null;
  activeLayoutId: DeskNamedLayoutId;
  /** User-customized layouts keyed by preset id (custom overwrites live under "custom") */
  savedLayouts: Partial<Record<DeskNamedLayoutId, DeskNamedLayout>>;
};

export const DESK_GRID_COLS = 12;
export const DESK_GRID_ROW_PX = 72;
export const DESK_TILE_MIN_W = 3;
export const DESK_TILE_MAX_W = 12;
export const DESK_TILE_MIN_H = 2;
export const DESK_TILE_MAX_H = 10;
export const DESK_TILE_COLLAPSED_H = 1;

export const DESK_PERIODS: { id: DeskPeriod; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "7d", label: "7D" },
  { id: "30d", label: "30D" },
  { id: "90d", label: "90D" },
  { id: "ytd", label: "YTD" },
  { id: "lifetime", label: "Lifetime" },
  { id: "custom", label: "Custom" },
];

export const DESK_RAIL_ITEMS: {
  id: DeskPanelId;
  label: string;
  accent: string;
}[] = [
  { id: "overview", label: "Overview", accent: "#00FFFF" },
  { id: "analytics", label: "Analytics", accent: "#AA2DFF" },
  { id: "revenue", label: "Revenue", accent: "#FFD700" },
  { id: "audience", label: "Audience", accent: "#00FF88" },
  { id: "rooms", label: "Rooms", accent: "#00FF88" },
  { id: "lobby-wall", label: "Lobby Wall", accent: "#FF2DAA" },
  { id: "bots", label: "Bots", accent: "#FF2DAA" },
  { id: "rankings", label: "Rankings", accent: "#FFD700" },
  { id: "presentation", label: "Presentation", accent: "#00FFFF" },
  { id: "webrtc", label: "WebRTC", accent: "#AA2DFF" },
  { id: "commerce", label: "Commerce", accent: "#FFD700" },
  { id: "submissions", label: "Submissions", accent: "#FF2DAA" },
  { id: "alerts", label: "Alerts", accent: "#FF4444" },
  { id: "system-health", label: "System Health", accent: "#00FFFF" },
  { id: "stats", label: "Stats", accent: "#8CF9FF" },
  { id: "geography", label: "Geography", accent: "#8CF9FF" },
  { id: "engagement", label: "Engagement", accent: "#8CF9FF" },
  { id: "growth", label: "Growth", accent: "#8CF9FF" },
  { id: "sponsors", label: "Sponsors", accent: "#FFD700" },
  { id: "prizes", label: "Prizes", accent: "#FFD700" },
];

function tile(
  id: string,
  panelId: DeskPanelId,
  x: number,
  y: number,
  w: number,
  h: number,
  extras?: Partial<Pick<DeskTile, "pinned" | "collapsed" | "hidden">>,
): DeskTile {
  return { id, panelId, x, y, w, h, ...extras };
}

function clampTile(t: DeskTile): DeskTile {
  const w = Math.min(DESK_TILE_MAX_W, Math.max(DESK_TILE_MIN_W, Math.round(t.w)));
  const h = t.collapsed
    ? DESK_TILE_COLLAPSED_H
    : Math.min(DESK_TILE_MAX_H, Math.max(DESK_TILE_MIN_H, Math.round(t.h)));
  const x = Math.min(DESK_GRID_COLS - w, Math.max(0, Math.round(t.x)));
  const y = Math.max(0, Math.round(t.y));
  return { ...t, x, y, w, h };
}

export function newTileId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `tile-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export const NAMED_LAYOUT_PRESETS: DeskNamedLayout[] = [
  {
    id: "default",
    name: "Default (Focus)",
    mode: "focus",
    focusPanel: "overview",
    maximizedTileId: null,
    tiles: [tile("focus-overview", "overview", 0, 0, 12, 6)],
  },
  {
    id: "executive",
    name: "Executive View",
    mode: "layout",
    focusPanel: "overview",
    maximizedTileId: null,
    tiles: [
      tile("exec-overview", "overview", 0, 0, 6, 4, { pinned: true }),
      tile("exec-revenue", "revenue", 6, 0, 6, 4),
      tile("exec-health", "system-health", 0, 4, 4, 3),
      tile("exec-rooms", "rooms", 4, 4, 4, 3),
      tile("exec-alerts", "alerts", 8, 4, 4, 3),
    ],
  },
  {
    id: "live-ops",
    name: "Live Operations",
    mode: "layout",
    focusPanel: "rooms",
    maximizedTileId: null,
    tiles: [
      tile("live-rooms", "rooms", 0, 0, 8, 5, { pinned: true }),
      tile("live-lobby", "lobby-wall", 8, 0, 4, 5),
      tile("live-presentation", "presentation", 0, 5, 6, 3),
      tile("live-alerts", "alerts", 6, 5, 6, 3),
    ],
  },
  {
    id: "bot-ops",
    name: "Bot Operations",
    mode: "layout",
    focusPanel: "bots",
    maximizedTileId: null,
    tiles: [
      tile("bot-main", "bots", 0, 0, 8, 6, { pinned: true }),
      tile("bot-health", "system-health", 8, 0, 4, 3),
      tile("bot-rooms", "rooms", 8, 3, 4, 3),
      tile("bot-alerts", "alerts", 0, 6, 12, 2),
    ],
  },
  {
    id: "presentation",
    name: "Presentation Control",
    mode: "layout",
    focusPanel: "presentation",
    maximizedTileId: null,
    tiles: [
      tile("pres-main", "presentation", 0, 0, 8, 6, { pinned: true }),
      tile("pres-rooms", "rooms", 8, 0, 4, 3),
      tile("pres-lobby", "lobby-wall", 8, 3, 4, 3),
      tile("pres-overview", "overview", 0, 6, 12, 2),
    ],
  },
  {
    id: "revenue",
    name: "Revenue",
    mode: "layout",
    focusPanel: "revenue",
    maximizedTileId: null,
    tiles: [
      tile("rev-main", "revenue", 0, 0, 8, 5, { pinned: true }),
      tile("rev-commerce", "commerce", 8, 0, 4, 3),
      tile("rev-sponsors", "sponsors", 8, 3, 4, 2),
      tile("rev-submissions", "submissions", 0, 5, 6, 3),
      tile("rev-health", "system-health", 6, 5, 6, 3),
    ],
  },
];

export const DEFAULT_DESK_STATE: ObservatoryDeskState = {
  panel: "overview",
  period: "today",
  mode: "focus",
  tiles: NAMED_LAYOUT_PRESETS[0].tiles.map((t) => ({ ...t })),
  maximizedTileId: null,
  activeLayoutId: "default",
  savedLayouts: {},
};

const PANEL_IDS = new Set<string>(DESK_RAIL_ITEMS.map((i) => i.id));
const PERIOD_IDS = new Set<string>(DESK_PERIODS.map((p) => p.id));
const LAYOUT_IDS = new Set<string>([
  ...NAMED_LAYOUT_PRESETS.map((l) => l.id),
  "custom",
]);

export function isDeskPanelId(value: unknown): value is DeskPanelId {
  return typeof value === "string" && PANEL_IDS.has(value);
}

export function isDeskPeriod(value: unknown): value is DeskPeriod {
  return typeof value === "string" && PERIOD_IDS.has(value);
}

export function isDeskNamedLayoutId(value: unknown): value is DeskNamedLayoutId {
  return typeof value === "string" && LAYOUT_IDS.has(value);
}

export function deskPanelLabel(id: DeskPanelId): string {
  return DESK_RAIL_ITEMS.find((i) => i.id === id)?.label ?? id;
}

export function getPresetLayout(id: DeskNamedLayoutId): DeskNamedLayout | null {
  if (id === "custom") return null;
  return NAMED_LAYOUT_PRESETS.find((l) => l.id === id) ?? null;
}

export function cloneLayoutTiles(tiles: DeskTile[]): DeskTile[] {
  return tiles.map((t) => clampTile({ ...t }));
}

export function applyNamedLayout(
  state: ObservatoryDeskState,
  layoutId: DeskNamedLayoutId,
): ObservatoryDeskState {
  if (layoutId === "custom") {
    const saved = state.savedLayouts.custom;
    if (!saved) return { ...state, activeLayoutId: "custom" };
    return {
      ...state,
      activeLayoutId: "custom",
      mode: saved.mode,
      panel: saved.focusPanel,
      tiles: cloneLayoutTiles(saved.tiles),
      maximizedTileId: saved.maximizedTileId,
    };
  }

  const saved = state.savedLayouts[layoutId];
  const preset = getPresetLayout(layoutId);
  const source = saved ?? preset;
  if (!source) return state;

  return {
    ...state,
    activeLayoutId: layoutId,
    mode: source.mode,
    panel: source.focusPanel,
    tiles: cloneLayoutTiles(source.tiles),
    maximizedTileId: source.maximizedTileId,
  };
}

export function resetToDefaultLayout(): ObservatoryDeskState {
  return {
    ...DEFAULT_DESK_STATE,
    tiles: cloneLayoutTiles(DEFAULT_DESK_STATE.tiles),
    savedLayouts: {},
  };
}

export function saveCurrentAsLayout(
  state: ObservatoryDeskState,
  layoutId: DeskNamedLayoutId,
  name?: string,
): ObservatoryDeskState {
  const preset = getPresetLayout(layoutId);
  const layout: DeskNamedLayout = {
    id: layoutId,
    name: name ?? preset?.name ?? "Custom Layout",
    mode: state.mode,
    focusPanel: state.panel,
    maximizedTileId: state.maximizedTileId,
    tiles: cloneLayoutTiles(state.tiles),
  };
  return {
    ...state,
    activeLayoutId: layoutId,
    savedLayouts: { ...state.savedLayouts, [layoutId]: layout },
  };
}

export function tilesOverlap(a: DeskTile, b: DeskTile): boolean {
  if (a.id === b.id || a.hidden || b.hidden) return false;
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/** Find first free slot for a new tile of size w×h. */
export function findFreeSlot(
  tiles: DeskTile[],
  w = 6,
  h = 4,
  preferY = 0,
): { x: number; y: number } {
  const visible = tiles.filter((t) => !t.hidden).map(clampTile);
  const maxY = visible.reduce((m, t) => Math.max(m, t.y + t.h), preferY) + 8;
  for (let y = preferY; y <= maxY; y++) {
    for (let x = 0; x <= DESK_GRID_COLS - w; x++) {
      const candidate = clampTile(tile("__probe__", "overview", x, y, w, h));
      if (!visible.some((t) => tilesOverlap(candidate, t))) {
        return { x: candidate.x, y: candidate.y };
      }
    }
  }
  return { x: 0, y: maxY };
}

export function ensureFocusTile(
  tiles: DeskTile[],
  panel: DeskPanelId,
): { tiles: DeskTile[]; focusTileId: string } {
  const visible = tiles.filter((t) => !t.hidden);
  const match = visible.find((t) => t.panelId === panel);
  if (match) return { tiles, focusTileId: match.id };

  const focusLike = visible.find((t) => t.id.startsWith("focus-")) ?? visible[0];
  if (focusLike && tiles.length === 1) {
    return {
      tiles: tiles.map((t) => (t.id === focusLike.id ? { ...t, panelId: panel } : t)),
      focusTileId: focusLike.id,
    };
  }

  const slot = findFreeSlot(tiles, 6, 4);
  const id = newTileId();
  return {
    tiles: [...tiles, clampTile(tile(id, panel, slot.x, slot.y, 6, 4))],
    focusTileId: id,
  };
}

export function setFocusPanelInTiles(
  tiles: DeskTile[],
  panel: DeskPanelId,
  mode: DeskWorkspaceMode,
): DeskTile[] {
  if (mode === "focus") {
    if (tiles.length === 0) {
      return [clampTile(tile("focus-primary", panel, 0, 0, 12, 6))];
    }
    // Single primary tile carries the focused module
    const primary = tiles.find((t) => !t.hidden) ?? tiles[0];
    return tiles.map((t) =>
      t.id === primary.id ? clampTile({ ...t, panelId: panel, x: 0, y: 0, w: 12, h: 6, collapsed: false, hidden: false }) : t,
    );
  }

  const { tiles: next } = ensureFocusTile(tiles, panel);
  return next;
}

export function duplicateTile(tiles: DeskTile[], tileId: string): DeskTile[] {
  const source = tiles.find((t) => t.id === tileId);
  if (!source) return tiles;
  const slot = findFreeSlot(tiles, source.w, source.collapsed ? DESK_TILE_MIN_H : source.h);
  const copy = clampTile({
    ...source,
    id: newTileId(),
    x: slot.x,
    y: slot.y,
    pinned: false,
    collapsed: false,
    hidden: false,
    h: source.collapsed ? DESK_TILE_MIN_H : source.h,
  });
  return [...tiles, copy];
}

export function updateTile(
  tiles: DeskTile[],
  tileId: string,
  patch: Partial<Omit<DeskTile, "id">>,
): DeskTile[] {
  return tiles.map((t) => (t.id === tileId ? clampTile({ ...t, ...patch }) : t));
}

function parseTile(raw: unknown): DeskTile | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || !isDeskPanelId(o.panelId)) return null;
  if (typeof o.x !== "number" || typeof o.y !== "number") return null;
  if (typeof o.w !== "number" || typeof o.h !== "number") return null;
  return clampTile({
    id: o.id,
    panelId: o.panelId,
    x: o.x,
    y: o.y,
    w: o.w,
    h: o.h,
    pinned: Boolean(o.pinned),
    collapsed: Boolean(o.collapsed),
    hidden: Boolean(o.hidden),
  });
}

function parseNamedLayout(raw: unknown): DeskNamedLayout | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (!isDeskNamedLayoutId(o.id) || typeof o.name !== "string") return null;
  if (o.mode !== "focus" && o.mode !== "layout") return null;
  if (!isDeskPanelId(o.focusPanel)) return null;
  if (!Array.isArray(o.tiles)) return null;
  const tiles = o.tiles.map(parseTile).filter((t): t is DeskTile => t != null);
  if (tiles.length === 0) return null;
  return {
    id: o.id,
    name: o.name,
    mode: o.mode,
    focusPanel: o.focusPanel,
    maximizedTileId: typeof o.maximizedTileId === "string" ? o.maximizedTileId : null,
    tiles,
  };
}

function migrateFromV1(): Partial<ObservatoryDeskState> | null {
  try {
    const raw = sessionStorage.getItem(OBSERVATORY_DESK_STORAGE_KEY_V1);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { panel?: unknown; period?: unknown };
    return {
      panel: isDeskPanelId(parsed.panel) ? parsed.panel : undefined,
      period: isDeskPeriod(parsed.period) ? parsed.period : undefined,
    };
  } catch {
    return null;
  }
}

export function loadObservatoryDeskState(): ObservatoryDeskState {
  if (typeof window === "undefined") return DEFAULT_DESK_STATE;

  try {
    const raw = localStorage.getItem(OBSERVATORY_DESK_STORAGE_KEY);
    if (!raw) {
      const v1 = migrateFromV1();
      if (!v1) return { ...DEFAULT_DESK_STATE, tiles: cloneLayoutTiles(DEFAULT_DESK_STATE.tiles) };
      const base = {
        ...DEFAULT_DESK_STATE,
        tiles: cloneLayoutTiles(DEFAULT_DESK_STATE.tiles),
        panel: v1.panel ?? DEFAULT_DESK_STATE.panel,
        period: v1.period ?? DEFAULT_DESK_STATE.period,
      };
      return {
        ...base,
        tiles: setFocusPanelInTiles(base.tiles, base.panel, "focus"),
      };
    }

    const parsed = JSON.parse(raw) as Partial<ObservatoryDeskState>;
    const panel = isDeskPanelId(parsed.panel) ? parsed.panel : DEFAULT_DESK_STATE.panel;
    const period = isDeskPeriod(parsed.period) ? parsed.period : DEFAULT_DESK_STATE.period;
    const mode = parsed.mode === "layout" ? "layout" : "focus";
    const tilesRaw = Array.isArray(parsed.tiles)
      ? parsed.tiles.map(parseTile).filter((t): t is DeskTile => t != null)
      : [];
    const tiles =
      tilesRaw.length > 0 ? tilesRaw : setFocusPanelInTiles(cloneLayoutTiles(DEFAULT_DESK_STATE.tiles), panel, mode);
    const activeLayoutId = isDeskNamedLayoutId(parsed.activeLayoutId)
      ? parsed.activeLayoutId
      : DEFAULT_DESK_STATE.activeLayoutId;
    const savedLayouts: ObservatoryDeskState["savedLayouts"] = {};
    if (parsed.savedLayouts && typeof parsed.savedLayouts === "object") {
      for (const [key, value] of Object.entries(parsed.savedLayouts)) {
        if (!isDeskNamedLayoutId(key)) continue;
        const layout = parseNamedLayout(value);
        if (layout) savedLayouts[key] = layout;
      }
    }
    const maximizedTileId =
      typeof parsed.maximizedTileId === "string" && tiles.some((t) => t.id === parsed.maximizedTileId)
        ? parsed.maximizedTileId
        : null;

    return {
      panel,
      period,
      mode,
      tiles,
      maximizedTileId,
      activeLayoutId,
      savedLayouts,
    };
  } catch {
    return { ...DEFAULT_DESK_STATE, tiles: cloneLayoutTiles(DEFAULT_DESK_STATE.tiles) };
  }
}

export function saveObservatoryDeskState(state: ObservatoryDeskState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(OBSERVATORY_DESK_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage may be unavailable — ignore
  }
}

export const DESK_HEALTH_COLOR: Record<DeskHealth, string> = {
  green: "#00FF88",
  yellow: "#F59E0B",
  red: "#FB7185",
  gray: "#6B7280",
  purple: "#AA2DFF",
};
