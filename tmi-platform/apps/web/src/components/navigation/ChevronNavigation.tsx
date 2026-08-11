"use client";

import React, { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

const HIDDEN_PATH_PREFIXES = ["/auth", "/api"];

/** Role shells — global history-swipe must not feel like a Fan↔Admin carousel. */
function isRoleShellPath(pathname: string): boolean {
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname.startsWith("/hub/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/command-center")
  );
}

export default function ChevronNavigation() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const roleShell = isRoleShellPath(pathname);

  const isInteractiveTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(target.closest("a,button,input,select,textarea,[role='button']"));
  };

  const goBackSafe = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    }
    // No fallback push — middleware handles authenticated landing
  };

  const goForwardSafe = () => {
    router.forward();
  };

  const onTouchStart = (e: TouchEvent) => {
    if (roleShell) return;
    if (isInteractiveTarget(e.target)) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    if (roleShell) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = useCallback(() => {
    if (roleShell) return;
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) goForwardSafe();
    if (isRightSwipe) goBackSafe();
  }, [touchStart, touchEnd, router, pathname, roleShell]);

  useEffect(() => {
    if (roleShell) return;
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [onTouchEnd, roleShell]);

  const shouldHide = HIDDEN_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (shouldHide) return null;

  // Visual buttons removed — swipe gestures above handle navigation.
  // Logged-in users navigate via their role hub; no global chevron arrows needed.
  return null;
}

