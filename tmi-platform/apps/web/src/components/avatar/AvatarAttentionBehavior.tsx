"use client";
// ============================================================
// AvatarAttentionBehavior
// TMI Platform — The Musicians Index
// ============================================================

import { useEffect } from "react";
import type { AvatarPresenceState, AvatarBehaviorContext } from "@/systems/avatar";

export interface AvatarAttentionBehaviorProps {
  presence: AvatarPresenceState;
  context: AvatarBehaviorContext;
  onPoseChange?: (pose: AvatarPresenceState["currentPose"]) => void;
}

export function AvatarAttentionBehavior({ presence, context, onPoseChange }: AvatarAttentionBehaviorProps) {
  useEffect(() => {
    // SCAFFOLD: Wire attention behavior logic to avatar engine
    // context triggers → resolveBehavior() → call onPoseChange
  }, [presence, context, onPoseChange]);

  return null; // behavior-only component — no render output
}

export default AvatarAttentionBehavior;
