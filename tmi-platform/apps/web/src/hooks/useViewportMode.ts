"use client";

import { useState, useEffect } from "react";

export type ViewportMode = "PHONE" | "TABLET" | "DESKTOP";

export interface ViewportState {
  mode: ViewportMode;
  isPhone: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
  orientation: "portrait" | "landscape";
  hasTouch: boolean;
}

const DEFAULT_STATE: ViewportState = {
  mode: "DESKTOP",
  isPhone: false,
  isTablet: false,
  isDesktop: true,
  width: 1280,
  height: 800,
  orientation: "landscape",
  hasTouch: false,
};

export function resolveViewportMode(width: number): ViewportMode {
  if (width < 768) return "PHONE";
  if (width < 1024) return "TABLET";
  return "DESKTOP";
}

export function useViewportMode(): ViewportState {
  const [state, setState] = useState<ViewportState>(DEFAULT_STATE);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function handleResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const mode = resolveViewportMode(w);
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const orientation = h > w ? "portrait" : "landscape";

      setState({
        mode,
        isPhone: mode === "PHONE",
        isTablet: mode === "TABLET",
        isDesktop: mode === "DESKTOP",
        width: w,
        height: h,
        orientation,
        hasTouch,
      });
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return state;
}

export default useViewportMode;
