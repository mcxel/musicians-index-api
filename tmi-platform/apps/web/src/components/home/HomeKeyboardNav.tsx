"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { HOME_ROUTE_CHAIN, getHomeRouteIndex } from "@/components/home/homeRouteChain";
import { isNavigationLocked, lockNavigation } from "@/lib/navigationLock";

function navigate(router: ReturnType<typeof useRouter>, path: string) {
  try {
    window.sessionStorage.setItem("tmi.home.lastRoute", path);
  } catch {}
  lockNavigation(path);
  router.push(path);
}

export default function HomeKeyboardNav() {
  const router = useRouter();
  const pathname = usePathname() ?? "";

  useEffect(() => {
    const activeIdx = getHomeRouteIndex(pathname);
    if (activeIdx < 0) return;

    const prev = HOME_ROUTE_CHAIN[(activeIdx - 1 + HOME_ROUTE_CHAIN.length) % HOME_ROUTE_CHAIN.length];
    const next = HOME_ROUTE_CHAIN[(activeIdx + 1) % HOME_ROUTE_CHAIN.length];
    const first = HOME_ROUTE_CHAIN[0];
    const last = HOME_ROUTE_CHAIN[HOME_ROUTE_CHAIN.length - 1];

    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (isNavigationLocked()) return;
      if (e.key === "ArrowLeft") navigate(router, prev);
      if (e.key === "ArrowRight") navigate(router, next);
      if (e.key === "Home" && !e.ctrlKey) navigate(router, first);
      if (e.key === "End" && !e.ctrlKey) navigate(router, last);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [pathname, router]);

  return null;
}
