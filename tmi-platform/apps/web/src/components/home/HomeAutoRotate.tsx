"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HOME_ROUTE_CHAIN, getHomeRouteIndex } from "@/components/home/homeRouteChain";
import { isNavigationLocked, lockNavigation } from "@/lib/navigationLock";

const ROTATE_INTERVAL_MS = 30_000;

/**
 * Auto-advances through HOME_ROUTE_CHAIN (Home 1 -> 1-2 -> 2 -> 3 -> 4 -> 5 ->
 * back to 1) every 30s. Reuses the same lock/route-push pattern as
 * HomeRouteChevronNav so this never fights a manual chevron/swipe navigation.
 * The timer restarts on every pathname change (auto or manual), so a manual
 * navigation simply gives the user a fresh 30s on whichever page they moved to.
 */
export default function HomeAutoRotate() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const activeIndex = getHomeRouteIndex(pathname);
  const isInHomeChain = activeIndex >= 0;

  useEffect(() => {
    if (!isInHomeChain) return;

    const id = window.setTimeout(() => {
      if (isNavigationLocked()) return;
      const nextPath = HOME_ROUTE_CHAIN[(activeIndex + 1) % HOME_ROUTE_CHAIN.length];
      try {
        window.sessionStorage.setItem("tmi.home.lastRoute", nextPath);
      } catch {}
      lockNavigation(nextPath);
      router.push(nextPath);
    }, ROTATE_INTERVAL_MS);

    return () => window.clearTimeout(id);
  }, [isInHomeChain, activeIndex, router]);

  return null;
}
