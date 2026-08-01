/**
 * ObservatoryDeskState — thin session state for Living OS Control Desk (Phase 1).
 * Not a god Command Bus. Persist panel + period only (sessionStorage).
 * Health = telemetry truth (green/yellow/red/gray/purple). Selection = cyan active.
 */

export const OBSERVATORY_DESK_STORAGE_KEY = "tmi.observatory.controlDesk.v1";

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

export type ObservatoryDeskState = {
  panel: DeskPanelId;
  period: DeskPeriod;
};

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

export const DEFAULT_DESK_STATE: ObservatoryDeskState = {
  panel: "overview",
  period: "today",
};

const PANEL_IDS = new Set<string>(DESK_RAIL_ITEMS.map((i) => i.id));
const PERIOD_IDS = new Set<string>(DESK_PERIODS.map((p) => p.id));

export function isDeskPanelId(value: unknown): value is DeskPanelId {
  return typeof value === "string" && PANEL_IDS.has(value);
}

export function isDeskPeriod(value: unknown): value is DeskPeriod {
  return typeof value === "string" && PERIOD_IDS.has(value);
}

export function loadObservatoryDeskState(): ObservatoryDeskState {
  if (typeof window === "undefined") return DEFAULT_DESK_STATE;
  try {
    const raw = sessionStorage.getItem(OBSERVATORY_DESK_STORAGE_KEY);
    if (!raw) return DEFAULT_DESK_STATE;
    const parsed = JSON.parse(raw) as Partial<ObservatoryDeskState>;
    return {
      panel: isDeskPanelId(parsed.panel) ? parsed.panel : DEFAULT_DESK_STATE.panel,
      period: isDeskPeriod(parsed.period) ? parsed.period : DEFAULT_DESK_STATE.period,
    };
  } catch {
    return DEFAULT_DESK_STATE;
  }
}

export function saveObservatoryDeskState(state: ObservatoryDeskState): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(OBSERVATORY_DESK_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage may be unavailable — ignore
  }
}

export const DESK_HEALTH_COLOR: Record<DeskHealth, string> = {
  green: "#00FF88",
  yellow: "#F59E0B",
  red: "#FB7185",
  gray: "#6B7280",
  purple: "#AA2DFF",
};
