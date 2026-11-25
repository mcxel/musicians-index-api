/**
 * Performer Stage ↔ Audience presence + Headset Invisible preference.
 *
 * One live session / one performer identity. Mode switches must not mint
 * a second performer or leave a ghost stage feed.
 *
 * Reuses worldPresenceBridge for spatial posture; does NOT create a second
 * avatar runtime, WebRTC session, or seat DB.
 *
 * Honesty: VR embodiment / photoreal face reconstruction / AI live-video
 * headset removal are capability-gated. A button alone ≠ VERIFIED VR.
 */

export type PerformerPresentationMode =
  | "STAGE_CAMERA"
  | "STAGE_COMPOSITE"
  | "STAGE_3D_AVATAR"
  | "AUDIENCE_VISIT"
  | "VR_EMBODIMENT";

export type HeadsetInvisibleMode =
  | "OFF"
  | "AVATAR_REPLACEMENT"
  | "PHOTOREAL_FACE"
  | "AI_VIDEO_RECONSTRUCTION";

export type PresenceCapabilityStatus =
  | "PRESENT"
  | "PARTIAL"
  | "EXPERIMENTAL"
  | "BLOCKED"
  | "GAP";

export type PerformerPresenceSnapshot = {
  performerId: string;
  roomId: string;
  liveSessionId: string;
  presentationMode: PerformerPresentationMode;
  previousMode: PerformerPresentationMode | null;
  stageAnchorId: string;
  spatialPosition: { x: number; y: number; z: number } | null;
  previousSpatialPosition: { x: number; y: number; z: number } | null;
  cameraCompositeSource: "LIVE_CAMERA" | "CHROMA_COMPOSITE" | "AVATAR" | "NONE";
  audioRouting: "STAGE_BROADCAST" | "PROXIMITY" | "GROUP" | "DIRECT";
  audienceVisible: boolean;
  headsetInvisible: HeadsetInvisibleMode;
  headsetInvisibleEffective: boolean;
  capabilityNotes: string[];
  duplicateIdentityForbidden: true;
  webrtcIntact: true;
};

type SessionKey = string;

const sessions = new Map<SessionKey, PerformerPresenceSnapshot>();

function key(liveSessionId: string, performerId: string): SessionKey {
  return `${liveSessionId}::${performerId}`;
}

export const PRESENCE_CAPABILITY_AUDIT: Record<
  string,
  { status: PresenceCapabilityStatus; note: string }
> = {
  STAGE_CAMERA: { status: "PRESENT", note: "Live camera on stage program" },
  STAGE_COMPOSITE: {
    status: "PARTIAL",
    note: "Chroma/VenueChromaCompositeLayer — device/entitlement dependent",
  },
  STAGE_3D_AVATAR: {
    status: "PARTIAL",
    note: "Avatar rig / Foundry ARKit — Fan-first; performer stage avatar is presentation where authorized",
  },
  AUDIENCE_VISIT: {
    status: "PARTIAL",
    note: "worldPresenceBridge MOVE/STAND + consent interactions — multi-account spatial cert outstanding",
  },
  VR_EMBODIMENT: {
    status: "BLOCKED",
    note: "Requires compatible VR runtime + tracking; button alone is not VR",
  },
  HEADSET_INVISIBLE_AVATAR: {
    status: "PARTIAL",
    note: "Avatar replacement can hide headset mesh; needs avatar identity bound",
  },
  HEADSET_INVISIBLE_PHOTOREAL: {
    status: "EXPERIMENTAL",
    note: "ARKit-52 / face identity exist; live headset-free photoreal not physically certified",
  },
  HEADSET_INVISIBLE_AI_VIDEO: {
    status: "GAP",
    note: "No proven AI live-video headset removal pipeline in repo — do not claim",
  },
  PROXIMITY_AUDIO_WHILE_VISITING: {
    status: "PARTIAL",
    note: "LoungeCommChannelAuthority math exists; SFU proximity binding outstanding",
  },
  CONSENT_VIRTUAL_TOUCH: {
    status: "PARTIAL",
    note: "Emote/collision authorities exist; consent gate must remain explicit",
  },
};

export function detectPresenceCapabilities(input?: {
  hasVrRuntime?: boolean;
  hasEyeTracking?: boolean;
  hasFaceIdentity?: boolean;
  hasAvatarBound?: boolean;
  chromaReady?: boolean;
}): {
  modes: Record<PerformerPresentationMode, PresenceCapabilityStatus>;
  headsetInvisible: Record<HeadsetInvisibleMode, PresenceCapabilityStatus>;
  notes: string[];
} {
  const hasVr = input?.hasVrRuntime === true;
  const hasFace = input?.hasFaceIdentity === true;
  const hasAvatar = input?.hasAvatarBound === true;
  const chroma = input?.chromaReady === true;
  const notes: string[] = [];

  if (!hasVr) notes.push("VR_EMBODIMENT blocked — no compatible runtime detected");
  if (!hasFace) notes.push("Photoreal face reconstruction limited — no face identity bound");
  if (!hasAvatar) notes.push("Avatar replacement limited — no avatar bound");
  if (!chroma) notes.push("Stage composite may fall back to video panel");

  return {
    modes: {
      STAGE_CAMERA: "PRESENT",
      STAGE_COMPOSITE: chroma ? "PARTIAL" : "BLOCKED",
      STAGE_3D_AVATAR: hasAvatar ? "PARTIAL" : "BLOCKED",
      AUDIENCE_VISIT: "PARTIAL",
      VR_EMBODIMENT: hasVr ? "EXPERIMENTAL" : "BLOCKED",
    },
    headsetInvisible: {
      OFF: "PRESENT",
      AVATAR_REPLACEMENT: hasAvatar ? "PARTIAL" : "BLOCKED",
      PHOTOREAL_FACE: hasFace ? "EXPERIMENTAL" : "BLOCKED",
      AI_VIDEO_RECONSTRUCTION: "GAP",
    },
    notes,
  };
}

function ensure(input: {
  performerId: string;
  roomId: string;
  liveSessionId: string;
}): PerformerPresenceSnapshot {
  const k = key(input.liveSessionId, input.performerId);
  let s = sessions.get(k);
  if (!s) {
    s = {
      performerId: input.performerId,
      roomId: input.roomId,
      liveSessionId: input.liveSessionId,
      presentationMode: "STAGE_CAMERA",
      previousMode: null,
      stageAnchorId: `stage:${input.roomId}`,
      spatialPosition: { x: 0, y: 0, z: 0 },
      previousSpatialPosition: null,
      cameraCompositeSource: "LIVE_CAMERA",
      audioRouting: "STAGE_BROADCAST",
      audienceVisible: true,
      headsetInvisible: "OFF",
      headsetInvisibleEffective: false,
      capabilityNotes: [],
      duplicateIdentityForbidden: true,
      webrtcIntact: true,
    };
    sessions.set(k, s);
  }
  return s;
}

export function getPerformerPresence(
  liveSessionId: string,
  performerId: string,
): PerformerPresenceSnapshot | null {
  return sessions.get(key(liveSessionId, performerId)) ?? null;
}

export function setHeadsetInvisiblePreference(input: {
  performerId: string;
  roomId: string;
  liveSessionId: string;
  mode: HeadsetInvisibleMode;
  capabilities?: Parameters<typeof detectPresenceCapabilities>[0];
}): {
  ok: boolean;
  snapshot: PerformerPresenceSnapshot;
  status: PresenceCapabilityStatus;
  reason: string;
} {
  const caps = detectPresenceCapabilities(input.capabilities);
  const status = caps.headsetInvisible[input.mode];
  const s = ensure(input);
  s.headsetInvisible = input.mode;
  s.capabilityNotes = caps.notes;

  if (input.mode === "AI_VIDEO_RECONSTRUCTION" || status === "GAP" || status === "BLOCKED") {
    s.headsetInvisibleEffective = false;
    return {
      ok: input.mode === "OFF",
      snapshot: { ...s },
      status,
      reason:
        input.mode === "OFF"
          ? "HEADSET_VISIBLE_CAMERA"
          : status === "GAP"
            ? "AI_VIDEO_RECONSTRUCTION_NOT_IMPLEMENTED"
            : "CAPABILITY_UNAVAILABLE",
    };
  }

  // Avatar / photoreal: preference stored; effective only when representation is avatar-based
  s.headsetInvisibleEffective =
    (s.presentationMode === "STAGE_3D_AVATAR" ||
      s.presentationMode === "AUDIENCE_VISIT" ||
      s.presentationMode === "VR_EMBODIMENT") &&
    (status === "PARTIAL" || status === "EXPERIMENTAL" || status === "PRESENT");

  return {
    ok: true,
    snapshot: { ...s },
    status,
    reason: s.headsetInvisibleEffective
      ? "HEADSET_HIDDEN_ON_DIGITAL_REPRESENTATION"
      : "PREFERENCE_STORED_AWAITING_AVATAR_MODE",
  };
}

export function setPerformerPresentationMode(input: {
  performerId: string;
  roomId: string;
  liveSessionId: string;
  mode: PerformerPresentationMode;
  spatialPosition?: { x: number; y: number; z: number } | null;
  audioRouting?: PerformerPresenceSnapshot["audioRouting"];
  capabilities?: Parameters<typeof detectPresenceCapabilities>[0];
}): {
  ok: boolean;
  snapshot: PerformerPresenceSnapshot;
  status: PresenceCapabilityStatus;
  reason: string;
  VISUAL_EFFECT_CHANGE_RECONNECTS_CAMERA: 0;
  duplicateIdentityCreated: false;
} {
  const caps = detectPresenceCapabilities(input.capabilities);
  const status = caps.modes[input.mode];
  if (status === "BLOCKED" || status === "GAP") {
    const s = ensure(input);
    return {
      ok: false,
      snapshot: { ...s },
      status,
      reason: caps.notes[0] ?? "MODE_UNAVAILABLE",
      VISUAL_EFFECT_CHANGE_RECONNECTS_CAMERA: 0,
      duplicateIdentityCreated: false,
    };
  }

  const s = ensure(input);
  s.previousMode = s.presentationMode;
  s.previousSpatialPosition = s.spatialPosition;
  s.presentationMode = input.mode;
  s.capabilityNotes = caps.notes;

  if (input.spatialPosition !== undefined) {
    s.spatialPosition = input.spatialPosition;
  }

  if (input.mode === "AUDIENCE_VISIT") {
    s.audioRouting = input.audioRouting ?? "PROXIMITY";
    s.cameraCompositeSource = "AVATAR";
  } else if (input.mode === "STAGE_COMPOSITE") {
    s.audioRouting = "STAGE_BROADCAST";
    s.cameraCompositeSource = "CHROMA_COMPOSITE";
  } else if (input.mode === "STAGE_3D_AVATAR" || input.mode === "VR_EMBODIMENT") {
    s.audioRouting = input.audioRouting ?? "STAGE_BROADCAST";
    s.cameraCompositeSource = "AVATAR";
  } else {
    s.audioRouting = "STAGE_BROADCAST";
    s.cameraCompositeSource = "LIVE_CAMERA";
  }

  // Re-evaluate headset invisible effectiveness for new mode
  const hi = setHeadsetInvisiblePreference({
    ...input,
    mode: s.headsetInvisible,
    capabilities: input.capabilities,
  });
  s.headsetInvisibleEffective = hi.snapshot.headsetInvisibleEffective;

  return {
    ok: true,
    snapshot: { ...s },
    status,
    reason: "MODE_APPLIED_SAME_SESSION",
    VISUAL_EFFECT_CHANGE_RECONNECTS_CAMERA: 0,
    duplicateIdentityCreated: false,
  };
}

export function returnPerformerToStage(input: {
  performerId: string;
  roomId: string;
  liveSessionId: string;
}): {
  ok: boolean;
  snapshot: PerformerPresenceSnapshot;
  reason: string;
} {
  const s = ensure(input);
  const target = s.previousMode && s.previousMode !== "AUDIENCE_VISIT"
    ? s.previousMode
    : "STAGE_CAMERA";
  const result = setPerformerPresentationMode({
    ...input,
    mode: target,
    spatialPosition: s.previousSpatialPosition ?? { x: 0, y: 0, z: 0 },
    audioRouting: "STAGE_BROADCAST",
  });
  return {
    ok: result.ok,
    snapshot: result.snapshot,
    reason: result.ok ? "RETURNED_TO_STAGE" : result.reason,
  };
}

export function resetPerformerPresenceForTests(): void {
  sessions.clear();
}
