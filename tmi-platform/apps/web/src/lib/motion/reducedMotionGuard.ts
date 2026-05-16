"use client";

/**
 * REDUCED MOTION GUARD
 * Checks window.matchMedia for prefers-reduced-motion.
 * All animation components MUST check this before applying heavy effects.
 */

let _cache: boolean | null = null;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  if (_cache !== null) return _cache;
  _cache = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return _cache;
}

/** Call once at app mount to keep cache fresh if user changes OS setting */
export function watchReducedMotion(onChange: (reduced: boolean) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const handler = (e: MediaQueryListEvent) => {
    _cache = e.matches;
    onChange(e.matches);
  };
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}

/**
 * Returns the value when motion is allowed, or the fallback when reduced.
 */
export function motionValue<T>(full: T, reduced: T): T {
  return prefersReducedMotion() ? reduced : full;
}
