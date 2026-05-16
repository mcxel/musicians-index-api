"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export type ChevronDirection = "left" | "right" | "up" | "down";

interface ChevronRouteMap {
  left?: string;
  right?: string;
  up?: string;
  down?: string;
}

interface ChevronOptions {
  router: AppRouterInstance;
  currentRoute: string;
  fallbackRoute: string;
  routeMap: ChevronRouteMap;
  onNavigate?: (target: string, direction: ChevronDirection) => void;
}

export function resolveChevronRoute(
  direction: ChevronDirection,
  routeMap: ChevronRouteMap,
  fallbackRoute: string,
): string {
  const target = routeMap[direction];
  if (!target || !target.startsWith("/")) {
    return fallbackRoute;
  }
  return target;
}

export function createChevronRouter(options: ChevronOptions) {
  return {
    go(direction: ChevronDirection) {
      const target = resolveChevronRoute(direction, options.routeMap, options.fallbackRoute);
      options.onNavigate?.(target, direction);
      options.router.push(target);
      return target;
    },
    canGo(direction: ChevronDirection) {
      return Boolean(options.routeMap[direction]);
    },
    currentRoute: options.currentRoute,
  };
}
