"use client";
// ============================================================
// AvatarTransitionShell
// TMI Platform — The Musicians Index
// ============================================================

import type { ReactNode } from "react";
import type { AvatarVenueZone } from "@/systems/avatar";

export interface AvatarTransitionShellProps {
  children: ReactNode;
  zone?: AvatarVenueZone;
  className?: string;
}

export function AvatarTransitionShell({ children, zone, className = "" }: AvatarTransitionShellProps) {
  // SCAFFOLD: Wraps avatar with scene transition animation shell.
  return (
    <div
      className={`avatar-structural avatar-transition-shell ${className}`}
      data-zone={zone}
    >
      {children}
    </div>
  );
}

export default AvatarTransitionShell;
