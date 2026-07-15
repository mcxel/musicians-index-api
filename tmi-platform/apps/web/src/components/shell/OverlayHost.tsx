"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * OverlayHost — fixed, full-viewport container for floating panels/buttons
 * that need to render above the rest of a shell (e.g. CanonOverseerShell's
 * floating canisters + drawer-restore buttons). The host itself ignores
 * pointer events by default so it never blocks clicks on the page beneath
 * it; individual children re-enable pointerEvents on themselves.
 */
export default function OverlayHost({
  children,
  zIndex = 1000,
  pointerEvents = "none",
}: {
  children: ReactNode;
  zIndex?: number;
  pointerEvents?: CSSProperties["pointerEvents"];
}) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex, pointerEvents }}>
      {children}
    </div>
  );
}
