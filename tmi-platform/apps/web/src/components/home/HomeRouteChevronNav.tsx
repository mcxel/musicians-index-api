"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HOME_ROUTE_CHAIN, getHomeRouteIndex } from "@/components/home/homeRouteChain";
import { isNavigationLocked, lockNavigation, unlockNavigation } from "@/lib/navigationLock";

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("a,button,input,select,textarea,[role='button'],[data-no-home-swipe='true']"));
}

export default function HomeRouteChevronNav() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const activeIndex = getHomeRouteIndex(pathname);

  const isInHomeChain = activeIndex >= 0;
  const chainLength = HOME_ROUTE_CHAIN.length;
  const prevPath = isInHomeChain
    ? HOME_ROUTE_CHAIN[(activeIndex - 1 + chainLength) % chainLength]
    : null;
  const nextPath = isInHomeChain
    ? HOME_ROUTE_CHAIN[(activeIndex + 1) % chainLength]
    : null;

  function go(path: string | null) {
    if (!path || isNavigationLocked()) return;
    try {
      window.sessionStorage.setItem("tmi.home.lastRoute", path);
    } catch {}
    lockNavigation(path);
    router.push(path);
  }

  useEffect(() => {
    if (!isInHomeChain) return;

    // Clear any stale navigation lock when the route settles on a new page.
    unlockNavigation();

    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      if (isInteractiveTarget(event.target)) return;
      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      tracking = true;
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (!tracking || isNavigationLocked()) return;
      tracking = false;

      const touch = event.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (Math.abs(dx) < 60 || Math.abs(dx) <= Math.abs(dy) * 1.2) return;

      if (dx < 0) {
        go(nextPath);
      } else {
        go(prevPath);
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isInHomeChain, nextPath, prevPath]);

  if (!isInHomeChain || !prevPath || !nextPath) return null;

  // Visual buttons removed — swipe/keyboard gestures above still active.
  return null;
}
