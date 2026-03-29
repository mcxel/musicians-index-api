"use client";
// ============================================================
// AvatarIdleController
// TMI Platform — The Musicians Index
// ============================================================

import { useEffect } from "react";
import type { AvatarPresenceState, AvatarBehaviorContext } from "@/systems/avatar";

export interface AvatarIdleControllerProps {
  presence: AvatarPresenceState;
  context: AvatarBehaviorContext;
  onPoseChange?: (pose: AvatarPresenceState["currentPose"]) => void;
}

export function AvatarIdleController({ presence, context, onPoseChange }: AvatarIdleControllerProps) {
  useEffect(() => {
    // SCAFFOLD: Wire idle behavior logic to avatar engine
    // context triggers → resolveBehavior() → call onPoseChange
  }, [presence, context, onPoseChange]);

  return null; // behavior-only component — no render output
}

export default AvatarIdleController;
