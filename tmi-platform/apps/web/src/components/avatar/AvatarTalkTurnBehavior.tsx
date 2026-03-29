"use client";
// ============================================================
// AvatarTalkTurnBehavior
// TMI Platform — The Musicians Index
// ============================================================

import type { ReactNode } from "react";
import type { AvatarVenueZone } from "@/systems/avatar";

export interface AvatarTalkTurnBehaviorProps {
  children: ReactNode;
  zone?: AvatarVenueZone;
  className?: string;
}

export function AvatarTalkTurnBehavior({ children, zone, className = "" }: AvatarTalkTurnBehaviorProps) {
  // SCAFFOLD: Controls talk-turn indicator and speaking state.
  return (
    <div
      className={`avatar-structural avatar-talk-turn ${className}`}
      data-zone={zone}
    >
      {children}
    </div>
  );
}

export default AvatarTalkTurnBehavior;
