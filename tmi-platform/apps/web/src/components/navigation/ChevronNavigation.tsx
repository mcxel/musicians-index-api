"use client";

import React, { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function ChevronNavigation() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;
  const fallbackRoute = "/home/1";

  const canGoBack = typeof window !== "undefined" ? window.history.length > 2 : false;

  const isInteractiveTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(target.closest("a,button,input,select,textarea,[role='button']"));
  };

  const goBackSafe = () => {
    if (canGoBack) {
      router.back();
      return;
    }
    if (pathname !== fallbackRoute) {
      router.push(fallbackRoute);
    }
  };

  const goForwardSafe = () => {
    router.forward();
  };

  const onTouchStart = (e: TouchEvent) => {
    if (isInteractiveTarget(e.target)) return;
    setTouchEnd(null); // Reset touch end
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = useCallback(() => {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swiped left -> Go forward
      goForwardSafe();
    }
    if (isRightSwipe) {
      // Swiped right -> Go back
      goBackSafe();
    }
  }, [touchStart, touchEnd, router, canGoBack, pathname]);

  useEffect(() => {
    // Attach event listeners to the window for global swipe detection
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [onTouchEnd]);

  return (
    <>
      {/* Back Chevron */}
      <button
        onClick={goBackSafe}
        className="fixed top-1/2 left-2 z-50 p-2 md:p-3 bg-black/55 text-white rounded-full hover:bg-black/80 transition-colors transform -translate-y-1/2 flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Go Back"
        title="Go Back"
      >
        <svg
          className="w-6 h-6 md:w-8 md:h-8 group-hover:-translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Forward Chevron */}
      <button
        onClick={goForwardSafe}
        className="fixed top-1/2 right-2 z-50 p-2 md:p-3 bg-black/55 text-white rounded-full hover:bg-black/80 transition-colors transform -translate-y-1/2 flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Go Forward"
        title="Go Forward"
      >
        <svg
          className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </>
  );
}
