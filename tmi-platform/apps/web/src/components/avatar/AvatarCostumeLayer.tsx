"use client";
// ============================================================
// AvatarCostumeLayer
// TMI Platform — The Musicians Index
// ============================================================

import type { AvatarPresenceState, AvatarIdentity } from "@/systems/avatar";

export interface AvatarCostumeLayerProps {
  identity: AvatarIdentity;
  presence: AvatarPresenceState;
  className?: string;
}

export function AvatarCostumeLayer({ identity, presence, className = "" }: AvatarCostumeLayerProps) {
  // SCAFFOLD: Wire to avatar engine — Renders costume items on the avatar.
  return (
    <div
      className={`avatar-layer avatar-costume-layer ${className}`}
      data-avatar-id={identity.id}
    >
      {/* Renders costume items on the avatar. */}
    </div>
  );
}

export default AvatarCostumeLayer;
