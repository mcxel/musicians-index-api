"use client";
// ============================================================
// AvatarListeningBehavior
// TMI Platform — The Musicians Index
// ============================================================

import { useEffect } from "react";
import type { AvatarPresenceState, AvatarBehaviorContext } from "@/systems/avatar";

export interface AvatarListeningBehaviorProps {
  presence: AvatarPresenceState;
  context: AvatarBehaviorContext;
  onPoseChange?: (pose: AvatarPresenceState["currentPose"]) => void;
}

export function AvatarListeningBehavior({ presence, context, onPoseChange }: AvatarListeningBehaviorProps) {
  useEffect(() => {
    // SCAFFOLD: Wire listening behavior logic to avatar engine
    // context triggers → resolveBehavior() → call onPoseChange
  }, [presence, context, onPoseChange]);

  return null; // behavior-only component — no render output
}

export default AvatarListeningBehavior;
