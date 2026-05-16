"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { HOME_SCREENS } from "./HomeNavigator";
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
    const activeIdx = HOME_SCREENS.findIndex((s) => s.path === pathname);
    const prev = HOME_SCREENS[activeIdx - 1];
    const next = HOME_SCREENS[activeIdx + 1];
    const first = HOME_SCREENS[0];
    const last = HOME_SCREENS[HOME_SCREENS.length - 1];

    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (isNavigationLocked()) return;
      if (e.key === "ArrowLeft" && prev) navigate(router, prev.path);
      if (e.key === "ArrowRight" && next) navigate(router, next.path);
      if (e.key === "Home" && !e.ctrlKey) navigate(router, first.path);
      if (e.key === "End" && !e.ctrlKey) navigate(router, last.path);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [pathname, router]);

  return null;
}
