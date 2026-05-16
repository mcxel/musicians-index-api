/**
 * botMaintenanceEngine.ts
 *
 * Scans for broken routes, buttons, feeds, and creates tickets via
 * permanentBotOperationsEngine.
 */

import { createMaintenanceTicket, botReportToAdmin } from "./permanentBotOperationsEngine";
import type { MaintenanceTicket } from "./permanentBotOperationsEngine";

export type MaintenanceScanResult = {
  scannedAt: number;
  brokenRoutes: string[];
  brokenButtons: string[];
  brokenFeeds: string[];
  ticketsCreated: string[];
  allClear: boolean;
};

const MAINTENANCE_BOT_ID = "maintenance-bot-001";
const ROUTE_WATCHER_BOT_ID = "route-watcher-001";

/** Known critical routes to verify */
const CRITICAL_ROUTES = [
  "/home/1",
  "/home/2",
  "/home/3",
  "/home/4",
  "/home/5",
  "/admin",
  "/admin/big-ace",
  "/admin/bot-operations",
  "/signup",
  "/season-pass",
  "/lobby",
  "/profile",
  "/magazine",
  "/cypher",
];

/** Known critical button test IDs to verify presence */
const CRITICAL_BUTTON_TEST_IDS = [
  "voting-live-chip",
  "cypher-arena-badge",
  "vote-rank4-badge",
  "stream-win-chip",
  "weekly-cyphers-footer",
  "awkward-shape-overlay-frame",
  "rank-number-pop-1",
  "home1-cover-overlay",
];

/** Known live feed endpoints to verify */
const CRITICAL_FEEDS = [
  "/api/homepage/charts",
  "/api/homepage/crown-feed",
  "/api/homepage/new-releases",
];

/**
 * Run a maintenance scan in browser environment.
 * Checks DOM for expected testids and reports missing ones as tickets.
 */
export function runBrowserMaintenanceScan(): MaintenanceScanResult {
  const brokenButtons: string[] = [];
  const brokenFeeds: string[] = [];
  const ticketsCreated: string[] = [];

  if (typeof document !== "undefined") {
    for (const testId of CRITICAL_BUTTON_TEST_IDS) {
      const el = document.querySelector(`[data-testid="${testId}"]`);
      if (!el) {
        brokenButtons.push(testId);
      }
    }
  }

  for (const buttonTestId of brokenButtons) {
    const ticket = createMaintenanceTicket(
      ROUTE_WATCHER_BOT_ID,
      "broken-button",
      `UI element with data-testid="${buttonTestId}" not found in DOM`,
      "medium"
    );
    ticketsCreated.push(ticket.id);
  }

  if (brokenButtons.length > 0) {
    botReportToAdmin(
      MAINTENANCE_BOT_ID,
      `Browser scan found ${brokenButtons.length} missing UI elements: ${brokenButtons.join(", ")}`,
      ["admin", "big-ace"]
    );
  }

  return {
    scannedAt: Date.now(),
    brokenRoutes: [],
    brokenButtons,
    brokenFeeds,
    ticketsCreated,
    allClear: brokenButtons.length === 0 && brokenFeeds.length === 0,
  };
}

/**
 * Server-side route scan (called from API route or script).
 */
export async function runServerRouteScan(baseUrl: string): Promise<MaintenanceScanResult> {
  const brokenRoutes: string[] = [];
  const brokenFeeds: string[] = [];
  const ticketsCreated: string[] = [];

  // Check routes
  await Promise.allSettled(
    CRITICAL_ROUTES.map(async (route) => {
      try {
        const res = await fetch(`${baseUrl}${route}`, {
          method: "HEAD",
          signal: AbortSignal.timeout(5000),
        });
        if (res.status >= 400) {
          brokenRoutes.push(route);
        }
      } catch {
        brokenRoutes.push(route);
      }
    })
  );

  // Check feeds
  await Promise.allSettled(
    CRITICAL_FEEDS.map(async (feed) => {
      try {
        const res = await fetch(`${baseUrl}${feed}`, {
          signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) {
          brokenFeeds.push(feed);
        }
      } catch {
        brokenFeeds.push(feed);
      }
    })
  );

  // Create tickets for broken routes
  for (const route of brokenRoutes) {
    const ticket = createMaintenanceTicket(
      ROUTE_WATCHER_BOT_ID,
      "broken-route",
      `Route ${route} returned error or timed out`,
      "high"
    );
    ticketsCreated.push(ticket.id);
  }

  // Create tickets for broken feeds
  for (const feed of brokenFeeds) {
    const ticket = createMaintenanceTicket(
      ROUTE_WATCHER_BOT_ID,
      "broken-feed",
      `Feed ${feed} returned non-OK or timed out`,
      "high"
    );
    ticketsCreated.push(ticket.id);
  }

  if (brokenRoutes.length > 0 || brokenFeeds.length > 0) {
    botReportToAdmin(
      MAINTENANCE_BOT_ID,
      `Server scan: ${brokenRoutes.length} broken routes, ${brokenFeeds.length} broken feeds.`,
      ["admin", "big-ace", "mc"]
    );
  }

  return {
    scannedAt: Date.now(),
    brokenRoutes,
    brokenButtons: [],
    brokenFeeds,
    ticketsCreated,
    allClear: brokenRoutes.length === 0 && brokenFeeds.length === 0,
  };
}

export type { MaintenanceTicket };
export { CRITICAL_ROUTES, CRITICAL_FEEDS, CRITICAL_BUTTON_TEST_IDS };
