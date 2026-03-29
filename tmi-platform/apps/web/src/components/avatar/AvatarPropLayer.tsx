"use client";
// ============================================================
// AvatarPropLayer
// TMI Platform — The Musicians Index
// ============================================================

import type { AvatarPresenceState, AvatarIdentity } from "@/systems/avatar";

export interface AvatarPropLayerProps {
  identity: AvatarIdentity;
  presence: AvatarPresenceState;
  className?: string;
}

export function AvatarPropLayer({ identity, presence, className = "" }: AvatarPropLayerProps) {
  // SCAFFOLD: Wire to avatar engine — Renders held props on the avatar.
  return (
    <div
      className={`avatar-layer avatar-prop-layer ${className}`}
      data-avatar-id={identity.id}
    >
      {/* Renders held props on the avatar. */}
    </div>
  );
}

export default AvatarPropLayer;
