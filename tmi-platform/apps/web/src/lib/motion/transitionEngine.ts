"use client";

import { prefersReducedMotion } from "./reducedMotionGuard";
import { TIMING } from "./timingRegistry";
import { applyGlitch } from "./glitchEngine";

export type TransitionType =
  | "glitch"
  | "sponsor-takeover"
  | "fade-to-black"
  | "signal-interrupt"
  | "magazine-flip"
  | "lobby-entry"
  | "game-reveal"
  | "admin-lock-in";

interface TransitionOptions {
  type?: TransitionType;
  targetElement?: HTMLElement | null;
  onMidpoint?: () => void;
  onComplete?: () => void;
}

const OVERLAY_ID = "tmi-transition-overlay";

function getOrCreateOverlay(): HTMLElement {
  let el = document.getElementById(OVERLAY_ID);
  if (!el) {
    el = document.createElement("div");
    el.id = OVERLAY_ID;
    el.setAttribute("aria-hidden", "true");
    Object.assign(el.style, {
      position: "fixed",
      inset: "0",
      zIndex: "9999",
      pointerEvents: "none",
      opacity: "0",
      background: "#000",
      transition: `opacity ${TIMING.routeGlitch}ms ease`,
    });
    document.body.appendChild(el);
  }
  return el;
}

export function glitchTransition(options: TransitionOptions = {}): void {
  if (prefersReducedMotion()) {
    options.onMidpoint?.();
    options.onComplete?.();
    return;
  }

  const overlay = getOrCreateOverlay();
  overlay.style.background = "#000";
  overlay.style.opacity = "0.85";

  if (options.targetElement) {
    applyGlitch(options.targetElement, {
      intensity: "heavy",
      durationMs: TIMING.routeGlitch,
    });
  }

  window.setTimeout(() => {
    options.onMidpoint?.();
    overlay.style.opacity = "0";
    window.setTimeout(() => options.onComplete?.(), TIMING.routeFade);
  }, TIMING.routeGlitch);
}

export function sponsorTakeover(options: TransitionOptions = {}): void {
  if (prefersReducedMotion()) {
    options.onMidpoint?.();
    options.onComplete?.();
    return;
  }

  const overlay = getOrCreateOverlay();
  overlay.style.background =
    "linear-gradient(135deg, rgba(255,107,53,0.9), rgba(2,6,23,0.95))";
  overlay.style.opacity = "1";

  window.setTimeout(() => {
    options.onMidpoint?.();
    overlay.style.opacity = "0";
    window.setTimeout(() => options.onComplete?.(), TIMING.adTakeoverOut);
  }, TIMING.adTakeoverIn);
}

export function fadeToBlack(options: TransitionOptions = {}): void {
  if (prefersReducedMotion()) {
    options.onMidpoint?.();
    options.onComplete?.();
    return;
  }

  const overlay = getOrCreateOverlay();
  overlay.style.background = "#000";
  overlay.style.opacity = "1";

  window.setTimeout(() => {
    options.onMidpoint?.();
    overlay.style.opacity = "0";
    window.setTimeout(() => options.onComplete?.(), TIMING.routeFade);
  }, TIMING.routeBlackout);
}

export function signalInterrupt(options: TransitionOptions = {}): void {
  if (prefersReducedMotion()) {
    options.onMidpoint?.();
    options.onComplete?.();
    return;
  }

  const overlay = getOrCreateOverlay();
  overlay.style.background =
    "repeating-linear-gradient(0deg, rgba(0,255,255,0.06) 0px, rgba(0,255,255,0.06) 1px, transparent 1px, transparent 4px), #000";
  overlay.style.opacity = "0.9";

  window.setTimeout(() => {
    options.onMidpoint?.();
    overlay.style.opacity = "0";
    window.setTimeout(() => options.onComplete?.(), TIMING.signalInterrupt);
  }, TIMING.signalInterrupt);
}

export function adminLockIn(targetEl: HTMLElement | null): void {
  if (!targetEl || prefersReducedMotion()) return;
  applyGlitch(targetEl, { intensity: "medium", durationMs: TIMING.monitorFade });
}
