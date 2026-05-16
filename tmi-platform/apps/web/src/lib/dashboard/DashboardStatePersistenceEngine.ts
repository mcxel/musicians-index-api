export type PanelId = string;

export interface PanelState {
  panelId: PanelId;
  collapsed: boolean;
  order: number;
  width?: "full" | "half" | "third";
  pinned: boolean;
}

export interface DashboardLayout {
  userId: string;
  role: string;
  panels: PanelState[];
  savedAt: string;
  version: number;
}

const layouts = new Map<string, DashboardLayout>();

export function saveDashboardLayout(layout: DashboardLayout): DashboardLayout {
  const next: DashboardLayout = { ...layout, savedAt: new Date().toISOString(), version: (layout.version ?? 0) + 1 };
  layouts.set(layout.userId, next);
  return next;
}

export function loadDashboardLayout(userId: string): DashboardLayout | null {
  return layouts.get(userId) ?? null;
}

export function upsertPanelState(userId: string, panel: PanelState): DashboardLayout | null {
  const layout = layouts.get(userId);
  if (!layout) return null;
  const panels = layout.panels.filter((p) => p.panelId !== panel.panelId);
  panels.push(panel);
  panels.sort((a, b) => a.order - b.order);
  const next: DashboardLayout = { ...layout, panels, savedAt: new Date().toISOString() };
  layouts.set(userId, next);
  return next;
}

export function togglePanel(userId: string, panelId: PanelId): DashboardLayout | null {
  const layout = layouts.get(userId);
  if (!layout) return null;
  const panels = layout.panels.map((p) =>
    p.panelId === panelId ? { ...p, collapsed: !p.collapsed } : p,
  );
  const next: DashboardLayout = { ...layout, panels, savedAt: new Date().toISOString() };
  layouts.set(userId, next);
  return next;
}

export function reorderPanels(userId: string, orderedIds: PanelId[]): DashboardLayout | null {
  const layout = layouts.get(userId);
  if (!layout) return null;
  const panels = layout.panels.map((p) => {
    const idx = orderedIds.indexOf(p.panelId);
    return { ...p, order: idx >= 0 ? idx : p.order };
  });
  panels.sort((a, b) => a.order - b.order);
  const next: DashboardLayout = { ...layout, panels, savedAt: new Date().toISOString() };
  layouts.set(userId, next);
  return next;
}

export function clearDashboardLayout(userId: string): void {
  layouts.delete(userId);
}
