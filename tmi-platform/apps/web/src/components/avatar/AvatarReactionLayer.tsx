"use client";
// ============================================================
// AvatarReactionLayer
// TMI Platform — The Musicians Index
// ============================================================

import type { AvatarPresenceState, AvatarIdentity } from "@/systems/avatar";

export interface AvatarReactionLayerProps {
  identity: AvatarIdentity;
  presence: AvatarPresenceState;
  className?: string;
}

export function AvatarReactionLayer({ identity, presence, className = "" }: AvatarReactionLayerProps) {
  // SCAFFOLD: Wire to avatar engine — Renders reaction overlays (emotes, effects) on top of avatar.
  return (
    <div
      className={`avatar-layer avatar-reaction-layer ${className}`}
      data-avatar-id={identity.id}
    >
      {/* Renders reaction overlays (emotes, effects) on top of avatar. */}
    </div>
  );
}

export default AvatarReactionLayer;
