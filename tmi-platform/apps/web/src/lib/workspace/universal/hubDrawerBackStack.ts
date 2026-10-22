/**
 * hubDrawerBackStack — Android/browser Back contract for every Hub drawer.
 *
 * A Hub drawer is an in-Hub workspace, not a browser destination. Opening a
 * drawer pushes exactly one same-URL history entry; Back pops it and closes the
 * topmost drawer instead of leaving the Hub. Closing with X consumes that entry,
 * so the next Back follows normal history. A drawer may refuse Back (unsaved
 * work prompt); its entry is restored so the user is never ejected or trapped.
 */

import { useEffect, useRef } from "react";

export const HUB_DRAWER_HISTORY_KEY = "tmiHubDrawerDepth";
export const HUB_DRAWER_OPEN_ATTR = "data-hub-drawer-open";

/** Returns true when the drawer closed; false keeps it open (e.g. unsaved prompt). */
export type HubDrawerBackHandler = () => boolean;

export interface HubDrawerHistoryHost {
  getState(): unknown;
  pushState(state: Record<string, unknown>): void;
  go(delta: number): void;
  addPopStateListener(listener: (state: unknown) => void): void;
  setOpenFlag(open: boolean): void;
  schedule(run: () => void): void;
}

export interface HubDrawerBackStack {
  register(onBack: HubDrawerBackHandler): number;
  release(token: number): void;
  openCount(): number;
}

function depthOf(state: unknown): number {
  if (!state || typeof state !== "object") return 0;
  const value = (state as Record<string, unknown>)[HUB_DRAWER_HISTORY_KEY];
  return typeof value === "number" ? value : 0;
}

export function createHubDrawerBackStack(host: HubDrawerHistoryHost): HubDrawerBackStack {
  const entries: Array<{ token: number; onBack: HubDrawerBackHandler }> = [];
  let pendingRelease = 0;
  let releaseScheduled = false;
  let ignorePops = 0;
  let nextToken = 1;
  let listening = false;

  const liveDepth = () => entries.length + pendingRelease;
  const syncFlag = () => host.setOpenFlag(entries.length > 0);

  function push() {
    host.pushState({ [HUB_DRAWER_HISTORY_KEY]: liveDepth() + 1 });
  }

  function onPop(state: unknown) {
    if (ignorePops > 0) {
      ignorePops -= 1;
      return;
    }
    const depth = depthOf(state);
    while (liveDepth() > depth) {
      if (pendingRelease > 0) {
        pendingRelease -= 1;
        continue;
      }
      const top = entries.pop();
      if (!top) break;
      if (!top.onBack()) {
        push();
        entries.push(top);
        break;
      }
    }
    if (depth > liveDepth()) {
      ignorePops += 1;
      host.go(liveDepth() - depth);
    }
    syncFlag();
  }

  function flushRelease() {
    releaseScheduled = false;
    if (pendingRelease === 0) return;
    const count = pendingRelease;
    pendingRelease = 0;
    if (depthOf(host.getState()) !== entries.length + count) return;
    ignorePops += 1;
    host.go(-count);
  }

  return {
    register(onBack) {
      if (!listening) {
        host.addPopStateListener(onPop);
        listening = true;
      }
      const token = nextToken++;
      if (pendingRelease > 0) pendingRelease -= 1;
      else push();
      entries.push({ token, onBack });
      syncFlag();
      return token;
    },
    release(token) {
      const index = entries.findIndex((entry) => entry.token === token);
      if (index < 0) return;
      entries.splice(index, 1);
      pendingRelease += 1;
      syncFlag();
      if (!releaseScheduled) {
        releaseScheduled = true;
        host.schedule(flushRelease);
      }
    },
    openCount: () => entries.length,
  };
}

let browserStack: HubDrawerBackStack | null = null;

function hubDrawerBackStack(): HubDrawerBackStack {
  if (browserStack) return browserStack;
  browserStack = createHubDrawerBackStack({
    getState: () => window.history.state,
    pushState: (state) => window.history.pushState(state, ""),
    go: (delta) => window.history.go(delta),
    addPopStateListener: (listener) => window.addEventListener("popstate", (event) => listener(event.state)),
    setOpenFlag: (open) => {
      if (open) document.documentElement.setAttribute(HUB_DRAWER_OPEN_ATTR, "1");
      else document.documentElement.removeAttribute(HUB_DRAWER_OPEN_ATTR);
    },
    // A drawer switch (X then open another in the same gesture) reuses the entry.
    schedule: (run) => window.setTimeout(run, 50),
  });
  return browserStack;
}

/** While `open`, Back closes this drawer first via `onBack`. */
export function useHubDrawerBackContract(open: boolean, onBack: HubDrawerBackHandler): void {
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;
  useEffect(() => {
    if (!open) return;
    const stack = hubDrawerBackStack();
    const token = stack.register(() => onBackRef.current());
    return () => stack.release(token);
  }, [open]);
}
