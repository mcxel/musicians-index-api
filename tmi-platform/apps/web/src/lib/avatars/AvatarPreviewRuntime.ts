/**
 * AvatarPreviewRuntime — Studio + Quick Panel preview facade (Preview Parity Law).
 * Binds to existing Foundry GLB + bobblehead runtime. Never invents a second rig.
 * Lounge environment = lighting only (no occupancy).
 */

import {
  bobbleheadRuntimeToRigProps,
  resolveBobbleheadRuntimeCharacter,
} from "@/lib/avatars/BobbleheadRuntimeCharacter";
import {
  DEFAULT_FAN_AVATAR_GLB_SLOT,
  resolveAvatarViewportBinding,
  type AvatarViewportBinding,
} from "@/lib/avatars/AvatarGlbRegistry";
import {
  FACIAL_PREVIEW_ACTIONS,
  MOTION_PACKAGE_PREVIEW_ACTIONS,
  PRODUCTION_PROCEDURAL_ACTIONS,
  type AvatarFitValidationAction,
  type AvatarPreviewAction,
} from "@/lib/avatars/AvatarPreviewActions";
import type { AvatarLook } from "@/lib/avatars/AvatarLook";
import { defaultMotionPersonality } from "@/lib/avatars/AvatarLook";
import {
  evaluateFoundryWearableCert,
  resolveWearableCapability,
} from "@/lib/avatars/AvatarWearableCapability";
import type { AvatarRigProps } from "@/components/3d/AvatarLobbyCanvas";

export type AvatarPreviewFidelity = "full" | "reduced";

export type AvatarPreviewEnvironmentId =
  | "STUDIO_EDITOR"
  | "FAN_LOBBY_AMBIENT"
  | "VENUE_SEAT"
  | "WDP_FLOOR"
  | "LOUNGE_LIGHTING";

export type AvatarPresentationPanelTargetId =
  | "FAN_CAM"
  | "JUMBOTRON"
  | "SPOTLIGHT"
  | "PROGRAM_ISO";

export type AvatarPreviewEnvironment = {
  id: AvatarPreviewEnvironmentId;
  label: string;
  /** Lighting / plate only — never a second presence model. */
  lightingOnly: boolean;
  avatarOccupancyAllowed: boolean;
  /** Labeled editor mannequin is OK only in STUDIO_EDITOR. */
  editorMannequinAllowed: boolean;
};

export type AvatarPresentationPanelTarget = {
  id: AvatarPresentationPanelTargetId;
  label: string;
  /** TEMPLATE until a real director bind exists — not fake friends. */
  status: "TEMPLATE";
  resolvesTo: string;
};

export const AVATAR_PREVIEW_ENVIRONMENT_CATALOG: readonly AvatarPreviewEnvironment[] = [
  {
    id: "STUDIO_EDITOR",
    label: "Studio editor",
    lightingOnly: false,
    avatarOccupancyAllowed: false,
    editorMannequinAllowed: true,
  },
  {
    id: "FAN_LOBBY_AMBIENT",
    label: "Fan Lobby lighting",
    lightingOnly: true,
    avatarOccupancyAllowed: true,
    editorMannequinAllowed: false,
  },
  {
    id: "VENUE_SEAT",
    label: "Venue seat lighting",
    lightingOnly: true,
    avatarOccupancyAllowed: true,
    editorMannequinAllowed: false,
  },
  {
    id: "WDP_FLOOR",
    label: "Dance floor lighting",
    lightingOnly: true,
    avatarOccupancyAllowed: true,
    editorMannequinAllowed: false,
  },
  {
    id: "LOUNGE_LIGHTING",
    label: "Lounge lighting (no avatars)",
    lightingOnly: true,
    avatarOccupancyAllowed: false,
    editorMannequinAllowed: false,
  },
] as const;

export const AVATAR_PRESENTATION_PANEL_TARGETS: readonly AvatarPresentationPanelTarget[] = [
  {
    id: "FAN_CAM",
    label: "Fan cam",
    status: "TEMPLATE",
    resolvesTo: "spotlight / ISO.SELF_AVATAR",
  },
  {
    id: "JUMBOTRON",
    label: "Jumbotron",
    status: "TEMPLATE",
    resolvesTo: "VenueAutomatedJumbotronMount",
  },
  {
    id: "SPOTLIGHT",
    label: "Spotlight",
    status: "TEMPLATE",
    resolvesTo: "audience spotlight director",
  },
  {
    id: "PROGRAM_ISO",
    label: "PROGRAM ISO",
    status: "TEMPLATE",
    resolvesTo: "ExperienceSourceRegistry ISO",
  },
] as const;

export function getPreviewEnvironment(
  id: AvatarPreviewEnvironmentId,
): AvatarPreviewEnvironment {
  return AVATAR_PREVIEW_ENVIRONMENT_CATALOG.find((e) => e.id === id)!;
}

/** Hard law: Lounge lighting preview must never flip occupancy on. */
export function assertLoungeEnvironmentDoesNotEnableAvatarOccupancy(
  env: AvatarPreviewEnvironment,
): void {
  if (env.id === "LOUNGE_LIGHTING" && env.avatarOccupancyAllowed) {
    throw new Error("PREVIEW_PARITY: Lounge environment must not enable avatar occupancy");
  }
}

export type PreviewActionGate = {
  action: AvatarPreviewAction;
  allowed: boolean;
  reason: string | null;
};

export function gatePreviewAction(
  action: AvatarPreviewAction,
  viewport: AvatarViewportBinding,
): PreviewActionGate {
  if ((PRODUCTION_PROCEDURAL_ACTIONS as readonly string[]).includes(action)) {
    return { action, allowed: true, reason: null };
  }
  if ((FACIAL_PREVIEW_ACTIONS as readonly string[]).includes(action)) {
    if (!viewport.facialTargetsSupported || viewport.diagnostic !== "OK") {
      return {
        action,
        allowed: false,
        reason: "FACIAL_TARGETS_UNSUPPORTED — production cannot smile until Foundry morphs certify",
      };
    }
    return { action, allowed: true, reason: null };
  }
  if ((MOTION_PACKAGE_PREVIEW_ACTIONS as readonly string[]).includes(action)) {
    if (!viewport.motionPackageSupported || viewport.diagnostic !== "OK") {
      return {
        action,
        allowed: false,
        reason: "MOTION_PACKAGE_NOT_CERTIFIED — production cannot play this clip",
      };
    }
    return { action, allowed: true, reason: null };
  }
  return { action, allowed: false, reason: "UNKNOWN_PREVIEW_ACTION" };
}

export type CanonicalAvatarDraftState = {
  displayName: string;
  baseId: string;
  skinT: number;
  equippedCosmeticIds: string[];
  previewAction: AvatarPreviewAction;
  environmentId: AvatarPreviewEnvironmentId;
  fidelity: AvatarPreviewFidelity;
  panelTargetId: AvatarPresentationPanelTargetId | null;
};

export type AvatarPreviewResolution = {
  draft: CanonicalAvatarDraftState;
  viewport: AvatarViewportBinding;
  environment: AvatarPreviewEnvironment;
  actionGate: PreviewActionGate;
  rigProps: (AvatarRigProps & { bobbleheadRatio: number }) | null;
  /** EDITOR mannequin only when environment allows and GLB unbound. */
  editorMannequin: boolean;
};

export function resolveAvatarPreview(draft: CanonicalAvatarDraftState): AvatarPreviewResolution {
  const environment = getPreviewEnvironment(draft.environmentId);
  assertLoungeEnvironmentDoesNotEnableAvatarOccupancy(environment);
  const viewport = resolveAvatarViewportBinding(DEFAULT_FAN_AVATAR_GLB_SLOT);
  const actionGate = gatePreviewAction(draft.previewAction, viewport);
  const character = resolveBobbleheadRuntimeCharacter(draft.baseId);
  const seated =
    actionGate.allowed && (draft.previewAction === "SIT" || draft.previewAction === "DEEP_SIT");
  const playing =
    actionGate.allowed &&
    (draft.previewAction === "WALK" ||
      draft.previewAction === "HYPE" ||
      draft.previewAction === "DANCE_RANGE_TEST");
  const bound = viewport.diagnostic === "OK" && Boolean(viewport.glbUrl);
  const rigBase = bobbleheadRuntimeToRigProps(character, {
    isSeated: seated,
    isPlaying: playing,
    extraAccessoryIds: draft.equippedCosmeticIds,
    skinT: draft.skinT,
  });
  const rigProps = bound
    ? {
        ...rigBase,
        glbSlotId: viewport.slotId,
        glbUrl: viewport.glbUrl,
        certifiedOnly: true as const,
      }
    : rigBase;
  return {
    draft,
    viewport,
    environment,
    actionGate,
    rigProps,
    editorMannequin: !bound && environment.editorMannequinAllowed,
  };
}

export function lookMotionPersonalityFromViewport(
  viewport: AvatarViewportBinding,
): ReturnType<typeof defaultMotionPersonality> {
  const p = defaultMotionPersonality();
  if (viewport.motionPackageSupported) {
    p.danceClipId = "AvatarMotionPackage/1.0";
  }
  return p;
}

export function certificationSnapshotFromPreview(
  equippedCosmeticIds: string[],
): AvatarLook["certificationSnapshot"] {
  const viewport = resolveAvatarViewportBinding(DEFAULT_FAN_AVATAR_GLB_SLOT);
  const wearableCerts = equippedCosmeticIds.map((id) => evaluateFoundryWearableCert(id).verdict);
  const wearableCert = wearableCerts.includes("UNBOUND")
    ? "UNBOUND"
    : wearableCerts.includes("REGENERATE")
      ? "REGENERATE"
      : equippedCosmeticIds.length
        ? "PASS"
        : viewport.diagnostic === "OK"
          ? "PASS"
          : "UNBOUND";
  return {
    glbSlotId: viewport.slotId,
    viewportDiagnostic: viewport.diagnostic,
    facialTargetsCertified: viewport.facialTargetsSupported,
    motionPackageCertified: viewport.motionPackageSupported,
    wearableCert,
  };
}

export function assertProductionCompatibleSave(equippedCosmeticIds: string[]): void {
  const blocked = equippedCosmeticIds.filter((id) => {
    const cap = resolveWearableCapability(id);
    return !cap || !cap.productionCompatible;
  });
  if (blocked.length) {
    throw new Error(
      `PREVIEW_PARITY: cannot save look — not productionCompatible: ${blocked.join(",")}`,
    );
  }
}

export function fitValidationStatus(
  action: AvatarFitValidationAction,
  viewport: AvatarViewportBinding,
): { action: AvatarFitValidationAction; allowed: boolean; reason: string } {
  if (viewport.diagnostic !== "OK") {
    return {
      action,
      allowed: false,
      reason: `${viewport.diagnostic} — fit test requires certified production rig`,
    };
  }
  return { action, allowed: true, reason: "bound" };
}
