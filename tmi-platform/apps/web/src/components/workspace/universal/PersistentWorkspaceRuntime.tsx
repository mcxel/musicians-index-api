/**
 * PersistentWorkspaceRuntime — keep workspace children mounted across geometry/mode changes.
 * Hides via CSS when CLOSED/CLOSING; does not unmount (avoids audio restart on mode change).
 */

"use client";

import type { CSSProperties, ReactNode } from "react";
import type { WorkspaceWindowState } from "@/lib/workspace/universal/types";

export interface PersistentWorkspaceRuntimeProps {
  windowState: WorkspaceWindowState;
  keepMounted: boolean;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export function PersistentWorkspaceRuntime({
  windowState,
  keepMounted,
  children,
  style,
  className,
}: PersistentWorkspaceRuntimeProps) {
  const visible =
    windowState !== "CLOSED" &&
    windowState !== "CLOSING" &&
    windowState !== "OPENING";

  // First open: mount while OPENING so content is ready when geometry settles.
  const shouldMount =
    keepMounted ||
    windowState === "OPENING" ||
    windowState === "CLOSING" ||
    visible;

  if (!shouldMount) return null;

  const hidden = !visible && windowState !== "OPENING";

  return (
    <div
      className={className}
      data-workspace-persistent="true"
      data-workspace-state={windowState}
      aria-hidden={hidden}
      style={{
        ...style,
        display: hidden ? "none" : style?.display,
        // Content subtree stays alive — only shell visibility changes.
        visibility: windowState === "OPENING" ? "hidden" : style?.visibility,
      }}
    >
      {children}
    </div>
  );
}

export default PersistentWorkspaceRuntime;
