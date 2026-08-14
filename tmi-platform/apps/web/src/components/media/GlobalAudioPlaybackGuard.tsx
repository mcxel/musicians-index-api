"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function pauseAllAudioExcept(active: HTMLAudioElement | null): void {
  const elements = document.querySelectorAll("audio");
  elements.forEach((el) => {
    if (!(el instanceof HTMLAudioElement)) return;
    if (active && el === active) return;
    if (!el.paused) {
      try {
        el.pause();
      } catch {
        // Ignore non-critical playback race conditions.
      }
    }
  });
}

export default function GlobalAudioPlaybackGuard() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const onPlay = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLAudioElement)) return;
      const current = activeAudioRef.current;
      if (current && current !== target && !current.paused) {
        try {
          current.pause();
        } catch {
          // Ignore if source was detached during route/layout transition.
        }
      }
      activeAudioRef.current = target;
      pauseAllAudioExcept(target);
    };

    const onStop = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLAudioElement)) return;
      if (activeAudioRef.current === target) {
        activeAudioRef.current = null;
      }
    };

    document.addEventListener("play", onPlay, true);
    document.addEventListener("pause", onStop, true);
    document.addEventListener("ended", onStop, true);

    return () => {
      document.removeEventListener("play", onPlay, true);
      document.removeEventListener("pause", onStop, true);
      document.removeEventListener("ended", onStop, true);
    };
  }, []);

  useEffect(() => {
    activeAudioRef.current = null;
    pauseAllAudioExcept(null);
  }, [pathname, searchParams]);

  useEffect(() => {
    const onPageHide = () => {
      activeAudioRef.current = null;
      pauseAllAudioExcept(null);
    };
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, []);

  return null;
}
