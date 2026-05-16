/**
 * VisualRouteRegistry
 * Lightweight bridge between route pages and the visual AI system.
 * Records active routes, surfaces failures, and gates approved assets.
 * Synchronous — safe to call in both server and client components.
 */

import { listVisualFailureMemory } from './VisualFailureMemoryEngine';

export type RouteVisualStatus = 'CLEAR' | 'HAS_FAILURES' | 'PENDING_APPROVAL';

export interface RouteRegistryEntry {
  routePath: string;
  registeredAt: number;
  status: RouteVisualStatus;
  failureCount: number;
}

const routeRegistry = new Map<string, RouteRegistryEntry>();

/**
 * Register a route with the visual system.
 * Call once at render time for each route page.
 * Returns the route's current visual status.
 */
export function registerVisualRoute(routePath: string): RouteRegistryEntry {
  const failures = listVisualFailureMemory().filter(
    (f) => f.route === routePath && f.resolution !== 'resolved'
  );

  const entry: RouteRegistryEntry = {
    routePath,
    registeredAt: Date.now(),
    status: failures.length > 0 ? 'HAS_FAILURES' : 'CLEAR',
    failureCount: failures.length,
  };

  routeRegistry.set(routePath, entry);

  if (failures.length > 0) {
    console.warn(
      `[VISUAL_ROUTE] ⚠️ ${routePath} has ${failures.length} unresolved visual failure(s)`
    );
  }

  return entry;
}

/**
 * Get registry status for a route.
 */
export function getRouteVisualEntry(routePath: string): RouteRegistryEntry | undefined {
  return routeRegistry.get(routePath);
}

/**
 * List all registered routes and their visual status.
 */
export function listRegisteredRoutes(): RouteRegistryEntry[] {
  return Array.from(routeRegistry.values()).sort((a, b) => a.routePath.localeCompare(b.routePath));
}
