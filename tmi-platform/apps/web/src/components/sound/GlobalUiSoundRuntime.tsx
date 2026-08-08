"use client";

import { useEffect, useRef } from "react";
import { SoundSystemEngine } from "@/lib/sound/SoundSystemEngine";

const INTERACTIVE_SELECTOR =
  'button:not([disabled]), a[href], [role="button"]:not([aria-disabled="true"]), input[type="button"], input[type="submit"], [data-tmi-click-sound]';

function isSilentTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return true;
  if (target.closest("[data-tmi-silent-click]")) return true;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.closest("input, textarea, select, [contenteditable='true']")) return true;
  return false;
}

/**
 * Global UI click feedback — unlocks WebAudio on first gesture and plays
 * themed click_primary on intentional control taps (not text fields).
 */
export default function GlobalUiSoundRuntime() {
  const unlockedRef = useRef(false);

  useEffect(() => {
    const unlock = () => {
      if (unlockedRef.current) return;
      unlockedRef.current = true;
      SoundSystemEngine.play("click_secondary");
    };

    window.addEventListener("pointerdown", unlock, { once: true, passive: true });

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (isSilentTarget(event.target)) return;
      const el = event.target instanceof Element ? event.target.closest(INTERACTIVE_SELECTOR) : null;
      if (!el) return;
      SoundSystemEngine.play("click_primary");
    };

    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}
