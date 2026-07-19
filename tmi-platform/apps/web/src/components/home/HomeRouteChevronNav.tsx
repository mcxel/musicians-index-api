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

  return (
    <>
      <style>{`
        @media (max-width: 900px) {
          [data-home-chevron-nav] {
            left: 12px !important;
            right: 12px !important;
            bottom: 12px !important;
            top: auto !important;
            transform: none !important;
          }
        }
      `}</style>
      <nav
        data-home-chevron-nav
        aria-label="Home route controls"
        style={{
          position: "fixed",
          left: 18,
          right: 18,
          top: "52%",
          transform: "translateY(-50%)",
          zIndex: 75,
          pointerEvents: "none",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          type="button"
          onClick={() => go(prevPath)}
          aria-label="Go to previous home section"
          style={{
            pointerEvents: "auto",
            border: "1px solid rgba(255,255,255,0.28)",
            background: "rgba(5,7,18,0.82)",
            color: "#ffffff",
            borderRadius: 999,
            minWidth: 44,
            height: 44,
            padding: "0 14px",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            boxShadow: "0 0 18px rgba(0,255,255,0.12)",
          }}
        >
          ◀ Back
        </button>
        <button
          type="button"
          onClick={() => go(HOME_ROUTE_CHAIN[0])}
          aria-label="Go to home start"
          style={{
            pointerEvents: "auto",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(5,7,18,0.72)",
            color: "#d7f7ff",
            borderRadius: 999,
            minWidth: 104,
            height: 36,
            padding: "0 12px",
            cursor: "pointer",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Home {activeIndex + 1}/{chainLength}
        </button>
        <button
          type="button"
          onClick={() => go(nextPath)}
          aria-label="Go to next home section"
          style={{
            pointerEvents: "auto",
            border: "1px solid rgba(255,255,255,0.28)",
            background: "rgba(5,7,18,0.82)",
            color: "#ffffff",
            borderRadius: 999,
            minWidth: 44,
            height: 44,
            padding: "0 14px",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            boxShadow: "0 0 18px rgba(255,45,170,0.12)",
          }}
        >
          Next ▶
        </button>
      </nav>
    </>
  );
}
