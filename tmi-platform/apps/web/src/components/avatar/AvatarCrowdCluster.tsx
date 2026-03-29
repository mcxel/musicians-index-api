"use client";
// ============================================================
// AvatarCrowdCluster
// TMI Platform — The Musicians Index
// ============================================================

import type { ReactNode } from "react";
import type { AvatarVenueZone } from "@/systems/avatar";

export interface AvatarCrowdClusterProps {
  children: ReactNode;
  zone?: AvatarVenueZone;
  className?: string;
}

export function AvatarCrowdCluster({ children, zone, className = "" }: AvatarCrowdClusterProps) {
  // SCAFFOLD: Renders a cluster of audience avatars in a venue zone.
  return (
    <div
      className={`avatar-structural avatar-crowd-cluster ${className}`}
      data-zone={zone}
    >
      {children}
    </div>
  );
}

export default AvatarCrowdCluster;
