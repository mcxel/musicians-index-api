"use client";
// ============================================================
// AvatarVenueAnchor
// TMI Platform — The Musicians Index
// ============================================================

import type { ReactNode } from "react";
import type { AvatarVenueZone } from "@/systems/avatar";

export interface AvatarVenueAnchorProps {
  children: ReactNode;
  zone?: AvatarVenueZone;
  className?: string;
}

export function AvatarVenueAnchor({ children, zone, className = "" }: AvatarVenueAnchorProps) {
  // SCAFFOLD: Anchors an avatar to a specific venue zone position.
  return (
    <div
      className={`avatar-structural avatar-venue-anchor ${className}`}
      data-zone={zone}
    >
      {children}
    </div>
  );
}

export default AvatarVenueAnchor;
