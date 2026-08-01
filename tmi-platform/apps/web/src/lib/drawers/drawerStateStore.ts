/**
 * drawerStateStore — session-scoped drawer state persistence (Living OS contract).
 * Preserves per-role last-active panel, analytics period, and other per-drawer UI state
 * so reopening any Operating Center always returns the user to their exact last position.
 *
 * Pattern: useSyncExternalStore singleton — same as floatingWorkspaceStore / launchDockStore.
 * NOT localStorage-persisted; lives only for the current browser session.
 */

"use client";

import { useSyncExternalStore } from "react";
import type { UniversalDrawerModuleId } from "@/lib/drawers/UniversalDrawerRegistry";

// ─── Analytics period (canonical type, imported by CommandCenterDrawer) ──────

export type AnalyticsPeriod =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "this_year"
  | "last_year"
  | "last_5yr"
  | "lifetime";

export const ANALYTICS_PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  today:      "Today",
  yesterday:  "Yesterday",
  this_week:  "This Week",
  last_week:  "Last Week",
  this_month: "This Month",
  last_month: "Last Month",
  this_year:  "This Year",
  last_year:  "Last Year",
  last_5yr:   "Last 5 Years",
  lifetime:   "Lifetime",
};

// ─── State shape ──────────────────────────────────────────────────────────────

export interface DrawerSessionState {
  /** Last active panel per role — restored when drawer is reopened. */
  lastPanelFan: UniversalDrawerModuleId | null;
  lastPanelPerformer: UniversalDrawerModuleId | null;
  /** Analytics period selection — persisted per role across open/close cycles. */
  analyticsPeriodFan: AnalyticsPeriod;
  analyticsPeriodPerformer: AnalyticsPeriod;
}

// ─── Store singleton ──────────────────────────────────────────────────────────

type Listener = () => void;

let state: DrawerSessionState = {
  lastPanelFan: null,
  lastPanelPerformer: null,
  analyticsPeriodFan: "this_month",
  analyticsPeriodPerformer: "this_month",
};

const listeners = new Set<Listener>();

function emit(): void {
  for (const l of listeners) l();
}

function getSnapshot(): DrawerSessionState {
  return state;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ─── Store API ────────────────────────────────────────────────────────────────

export const drawerStateStore = {
  getState: getSnapshot,

  setLastPanel(role: "fan" | "performer", panel: UniversalDrawerModuleId | null): void {
    state =
      role === "fan"
        ? { ...state, lastPanelFan: panel }
        : { ...state, lastPanelPerformer: panel };
    emit();
  },

  setAnalyticsPeriod(role: "fan" | "performer", period: AnalyticsPeriod): void {
    state =
      role === "fan"
        ? { ...state, analyticsPeriodFan: period }
        : { ...state, analyticsPeriodPerformer: period };
    emit();
  },

  getLastPanel(role: "fan" | "performer"): UniversalDrawerModuleId | null {
    return role === "fan" ? state.lastPanelFan : state.lastPanelPerformer;
  },

  getAnalyticsPeriod(role: "fan" | "performer"): AnalyticsPeriod {
    return role === "fan" ? state.analyticsPeriodFan : state.analyticsPeriodPerformer;
  },
};

// ─── React hook ───────────────────────────────────────────────────────────────

export function useDrawerState(): DrawerSessionState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
