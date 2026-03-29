"use client";
// ============================================================
// AvatarSeatBehavior
// TMI Platform — The Musicians Index
// ============================================================

import { useEffect } from "react";
import type { AvatarPresenceState, AvatarBehaviorContext } from "@/systems/avatar";

export interface AvatarSeatBehaviorProps {
  presence: AvatarPresenceState;
  context: AvatarBehaviorContext;
  onPoseChange?: (pose: AvatarPresenceState["currentPose"]) => void;
}

export function AvatarSeatBehavior({ presence, context, onPoseChange }: AvatarSeatBehaviorProps) {
  useEffect(() => {
    // SCAFFOLD: Wire seat behavior logic to avatar engine
    // context triggers → resolveBehavior() → call onPoseChange
  }, [presence, context, onPoseChange]);

  return null; // behavior-only component — no render output
}

export default AvatarSeatBehavior;
