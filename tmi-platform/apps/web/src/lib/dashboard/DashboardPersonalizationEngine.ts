export type ColorTheme = "cyan" | "fuchsia" | "gold" | "purple" | "green" | "white";
export type DensityMode = "compact" | "comfortable" | "spacious";
export type MetricDisplay = "numbers" | "bars" | "sparkline" | "ring";

export interface DashboardPreferences {
  userId: string;
  accentColor: ColorTheme;
  density: DensityMode;
  metricDisplay: MetricDisplay;
  showAnimations: boolean;
  showAvatarWidget: boolean;
  showLiveRoomWidget: boolean;
  showRevenueWidget: boolean;
  showNotificationsWidget: boolean;
  pinnedPanels: string[];
  hiddenPanels: string[];
  updatedAt: string;
}

const THEME_HEX: Record<ColorTheme, string> = {
  cyan:    "#00FFFF",
  fuchsia: "#FF2DAA",
  gold:    "#FFD700",
  purple:  "#AA2DFF",
  green:   "#00FF88",
  white:   "#FFFFFF",
};

const DEFAULT_PREFS: Omit<DashboardPreferences, "userId"> = {
  accentColor: "cyan",
  density: "comfortable",
  metricDisplay: "numbers",
  showAnimations: true,
  showAvatarWidget: true,
  showLiveRoomWidget: true,
  showRevenueWidget: true,
  showNotificationsWidget: true,
  pinnedPanels: [],
  hiddenPanels: [],
  updatedAt: "",
};

const prefsStore = new Map<string, DashboardPreferences>();

export function getPreferences(userId: string): DashboardPreferences {
  return prefsStore.get(userId) ?? { ...DEFAULT_PREFS, userId, updatedAt: new Date().toISOString() };
}

export function updatePreferences(
  userId: string,
  patch: Partial<Omit<DashboardPreferences, "userId" | "updatedAt">>,
): DashboardPreferences {
  const current = getPreferences(userId);
  const next: DashboardPreferences = { ...current, ...patch, userId, updatedAt: new Date().toISOString() };
  prefsStore.set(userId, next);
  return next;
}

export function getAccentHex(userId: string): string {
  const prefs = getPreferences(userId);
  return THEME_HEX[prefs.accentColor];
}

export function pinPanel(userId: string, panelId: string): DashboardPreferences {
  const prefs = getPreferences(userId);
  const pinned = Array.from(new Set([...prefs.pinnedPanels, panelId]));
  return updatePreferences(userId, { pinnedPanels: pinned });
}

export function hidePanel(userId: string, panelId: string): DashboardPreferences {
  const prefs = getPreferences(userId);
  const hidden = Array.from(new Set([...prefs.hiddenPanels, panelId]));
  const pinned = prefs.pinnedPanels.filter((p) => p !== panelId);
  return updatePreferences(userId, { hiddenPanels: hidden, pinnedPanels: pinned });
}

export function showPanel(userId: string, panelId: string): DashboardPreferences {
  const prefs = getPreferences(userId);
  const hidden = prefs.hiddenPanels.filter((p) => p !== panelId);
  return updatePreferences(userId, { hiddenPanels: hidden });
}

export function resetPreferences(userId: string): DashboardPreferences {
  const reset: DashboardPreferences = { ...DEFAULT_PREFS, userId, updatedAt: new Date().toISOString() };
  prefsStore.set(userId, reset);
  return reset;
}
