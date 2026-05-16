"use client";

import { useEffect, useRef, useState } from "react";

/**
 * MagazineShell — wraps any home surface in the magazine canvas system.
 *
 * Behavior:
 * - Renders at scale(0.78) on mount (closed/shrunk state)
 * - After `openAfterMs` (default 25s) OR user click → opens to scale(1)
 * - Provides the 1980s neon background layer
 * - Exposes data-magazine-open for external CSS hooks
 */
type MagazineShellProps = {
  children: React.ReactNode;
  openAfterMs?: number;
  /** If true, starts open (no delay) */
  startOpen?: boolean;
};

export default function MagazineOpenShell({
  children,
  openAfterMs = 25000,
  startOpen = false,
}: MagazineShellProps) {
  const [open, setOpen] = useState(startOpen);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (startOpen) return;
    timerRef.current = setTimeout(() => setOpen(true), openAfterMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [startOpen, openAfterMs]);

  // Allow any click to open (instant override)
  const handleClick = () => {
    if (!open) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setOpen(true);
    }
  };

  return (
    <>
      {/* 1980s neon background */}
      <div className="tmi-bg-1980s" aria-hidden />

      <div className="magazine-shell" data-magazine-open={open ? "true" : "false"}>
        <div
          className={`magazine-canvas${open ? " magazine-open" : ""}`}
          onClick={handleClick}
          role="presentation"
        >
          {children}
        </div>
      </div>
    </>
  );
}
