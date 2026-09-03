/**
 * AvatarPreviewRuntime — Studio + Quick Panel preview facade (Preview Parity Law).
 * Binds to existing Foundry GLB + bobblehead runtime. Never invents a second rig.
 * Lounge environment = lighting only (no occupancy).
 *
 * OWNER: apps/web/src/lib/avatars/ (plural). Do not use lib/avatar/AvatarPreviewRuntime.ts.
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
  PHASE1_MOTION_SUITE,
  PRODUCTION_PROCEDURAL_ACTIONS,
  resolveProductionMotionPath,
  type AvatarFitValidationAction,
  type AvatarPreviewAction,
} from "@/lib/avatars/AvatarPreviewActions";
import type { AvatarLook } from "@/lib/avatars/AvatarLook";
import { defaultMotionPersonality, AVATAR_LOOK_SCHEMA_VERSION } from "@/lib/avatars/AvatarLook";
import {
  evaluateFoundryWearableCert,
  resolveWearableCapability,
} from "@/lib/avatars/AvatarWearableCapability";
import { AVATAR_RIG_VERSION, MOTION_PACKAGE_VERSION } from "@/lib/avatars/AvatarRigSpec";
import type { AvatarRigProps } from "@/components/3d/AvatarLobbyCanvas";
import { patchCanonicalAvatarDraft } from "@/lib/avatars/CanonicalAvatarDraft";

/** Single ownership marker — tests assert Studio/Quick bind this module family only. */
export const AVATAR_PREVIEW_RUNTIME_OWNER =
  "apps/web/src/lib/avatars/AvatarPreviewRuntime.ts" as const;

export const CANONICAL_AVATAR_DRAFT_SCHEMA_VERSION = 1 as const;

export type AvatarPreviewFidelity = "full" | "reduced";

export type AvatarPreviewEnvironmentId =
  | "STUDIO_EDITOR"
  | "FAN_LOBBY"
  | "FAN_LOBBY_AMBIENT"
  | "VENUE_SEAT"
  | "WDP_FLOOR"
  | "WORLD_CONCERT"
  | "LOUNGE_LIGHTING"
  /** Phase 2 cert alias — lighting/material only; production Lounge remains NO AVATARS. */
  | "LOW_LIGHT_LOUNGE_STYLE";

export type AvatarPresentationPanelTargetId =
  | "FAN_CAM"
  | "JUMBOTRON"
  | "SPOTLIGHT"
  | "PROGRAM_ISO"
  /** Editor-only mannequin composition — never real participants. */
  | "GROUP_CAM";

/** Phase 2 physical-cert environment selectors (adapters onto this runtime only). */
export const PHASE2_CERT_ENVIRONMENTS = [
  "FAN_LOBBY",
  "WORLD_CONCERT",
  "LOW_LIGHT_LOUNGE_STYLE",
] as const satisfies readonly AvatarPreviewEnvironmentId[];

/** Phase 2 physical-cert presentation selectors (TEMPLATE binds — no second director). */
export const PHASE2_CERT_PANELS = [
  "JUMBOTRON",
  "FAN_CAM",
  "GROUP_CAM",
] as const satisfies readonly AvatarPresentationPanelTargetId[];

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
    id: "FAN_LOBBY",
    label: "Fan Lobby environment (lighting plate)",
    lightingOnly: true,
    avatarOccupancyAllowed: true,
    editorMannequinAllowed: false,
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
    id: "WORLD_CONCERT",
    label: "World Concert environment (lighting plate)",
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
  {
    id: "LOW_LIGHT_LOUNGE_STYLE",
    label: "Low-light lounge style (lighting/material only)",
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
  {
    id: "GROUP_CAM",
    label: "Group cam (editor mannequins only)",
    status: "TEMPLATE",
    resolvesTo: "EDITOR_MANNEQUIN_COMPOSITION — never real participants",
  },
] as const;

export function getPreviewEnvironment(
  id: AvatarPreviewEnvironmentId,
): AvatarPreviewEnvironment {
  return AVATAR_PREVIEW_ENVIRONMENT_CATALOG.find((e) => e.id === id)!;
}

const LOUNGE_LIGHTING_ONLY_IDS: ReadonlySet<AvatarPreviewEnvironmentId> = new Set([
  "LOUNGE_LIGHTING",
  "LOW_LIGHT_LOUNGE_STYLE",
]);

/** Hard law: Lounge lighting preview must never flip occupancy on. */
export function assertLoungeEnvironmentDoesNotEnableAvatarOccupancy(
  env: AvatarPreviewEnvironment,
): void {
  if (LOUNGE_LIGHTING_ONLY_IDS.has(env.id) && env.avatarOccupancyAllowed) {
    throw new Error("PREVIEW_PARITY: Lounge environment must not enable avatar occupancy");
  }
}

/** GROUP_CAM may only show labeled editor mannequins — never real participants. */
export function isGroupCamEditorOnly(
  panelTargetId: AvatarPresentationPanelTargetId | null,
): boolean {
  return panelTargetId === "GROUP_CAM";
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
  const productionAction = resolveProductionMotionPath(action);
  if ((PRODUCTION_PROCEDURAL_ACTIONS as readonly string[]).includes(productionAction)) {
    return { action, allowed: true, reason: null };
  }
  if ((FACIAL_PREVIEW_ACTIONS as readonly string[]).includes(productionAction)) {
    if (!viewport.facialTargetsSupported || viewport.diagnostic !== "OK") {
      return {
        action,
        allowed: false,
        reason: "FACIAL_TARGETS_UNSUPPORTED — production cannot smile until Foundry morphs certify",
      };
    }
    return { action, allowed: true, reason: null };
  }
  if ((MOTION_PACKAGE_PREVIEW_ACTIONS as readonly string[]).includes(productionAction)) {
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

/**
 * Production motion adapter (thin) — routes IDLE/WALK/DANCE/EMOTE through the same
 * gate + bobblehead path Fan Lobby uses. Not a second AvatarMotionDirector runtime.
 */
export type ProductionMotionDispatch = {
  requested: AvatarPreviewAction;
  productionPath: AvatarPreviewAction;
  gate: PreviewActionGate;
  rigFamily: typeof AVATAR_RIG_VERSION;
  owner: typeof AVATAR_PREVIEW_RUNTIME_OWNER;
  productionCompatible: boolean;
  motionSource: "PROCEDURAL_RUNTIME" | "MOTION_PACKAGE";
  assetCertificationState: "CERTIFIED" | "UNBOUND" | "BLOCKED";
};

export function dispatchProductionPreviewMotion(
  action: AvatarPreviewAction,
  viewport?: AvatarViewportBinding,
): ProductionMotionDispatch {
  const binding = viewport ?? resolveAvatarViewportBinding(DEFAULT_FAN_AVATAR_GLB_SLOT);
  const productionPath = resolveProductionMotionPath(action);
  const gate = gatePreviewAction(action, binding);
  const isProcedural = (PRODUCTION_PROCEDURAL_ACTIONS as readonly string[]).includes(productionPath);
  return {
    requested: action,
    productionPath,
    gate,
    rigFamily: AVATAR_RIG_VERSION,
    owner: AVATAR_PREVIEW_RUNTIME_OWNER,
    productionCompatible: gate.allowed,
    motionSource: isProcedural ? "PROCEDURAL_RUNTIME" : "MOTION_PACKAGE",
    assetCertificationState: gate.allowed
      ? binding.diagnostic === "OK"
        ? "CERTIFIED"
        : "UNBOUND"
      : "BLOCKED",
  };
}

export function listPhase1MotionSuiteDispatches(
  viewport?: AvatarViewportBinding,
): ProductionMotionDispatch[] {
  return PHASE1_MOTION_SUITE.map((action) => dispatchProductionPreviewMotion(action, viewport));
}

export type CanonicalAvatarDraftState = {
  draftId: string;
  schemaVersion: typeof CANONICAL_AVATAR_DRAFT_SCHEMA_VERSION;
  displayName: string;
  baseId: string;
  skinT: number;
  equippedCosmeticIds: string[];
  previewAction: AvatarPreviewAction;
  environmentId: AvatarPreviewEnvironmentId;
  fidelity: AvatarPreviewFidelity;
  panelTargetId: AvatarPresentationPanelTargetId | null;
};

export type JumbotronPresentationPreview = {
  usesDraft: true;
  draftId: string;
  panelTargetId: "JUMBOTRON";
  status: "TEMPLATE";
  resolvesTo: string;
};

export type PresentationPanelPreview = {
  usesDraft: true;
  draftId: string;
  panelTargetId: AvatarPresentationPanelTargetId;
  status: "TEMPLATE";
  resolvesTo: string;
  /** GROUP_CAM only — labeled editor mannequins, never real participants. */
  editorMannequinsOnly: boolean;
};

export type AvatarPreviewResolution = {
  draft: CanonicalAvatarDraftState;
  viewport: AvatarViewportBinding;
  environment: AvatarPreviewEnvironment;
  actionGate: PreviewActionGate;
  motion: ProductionMotionDispatch;
  fidelity: AvatarPreviewFidelity;
  jumbotron: JumbotronPresentationPreview | null;
  presentation: PresentationPanelPreview | null;
  rigProps: (AvatarRigProps & { bobbleheadRatio: number }) | null;
  /** EDITOR mannequin only when environment allows and GLB unbound. */
  editorMannequin: boolean;
};

function detectPrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/** Reduced-motion path: force fidelity=reduced; never invent a separate action set. */
export function resolveEffectivePreviewFidelity(
  draft: CanonicalAvatarDraftState,
  prefersReduced?: boolean,
): AvatarPreviewFidelity {
  if (prefersReduced ?? detectPrefersReducedMotion()) return "reduced";
  return draft.fidelity;
}

export function resolveJumbotronPresentationFromDraft(
  draft: CanonicalAvatarDraftState,
): JumbotronPresentationPreview | null {
  if (draft.panelTargetId !== "JUMBOTRON") return null;
  const target = AVATAR_PRESENTATION_PANEL_TARGETS.find((t) => t.id === "JUMBOTRON")!;
  return {
    usesDraft: true,
    draftId: draft.draftId,
    panelTargetId: "JUMBOTRON",
    status: "TEMPLATE",
    resolvesTo: target.resolvesTo,
  };
}

export function resolvePresentationPanelFromDraft(
  draft: CanonicalAvatarDraftState,
): PresentationPanelPreview | null {
  if (!draft.panelTargetId) return null;
  const target = AVATAR_PRESENTATION_PANEL_TARGETS.find((t) => t.id === draft.panelTargetId);
  if (!target) return null;
  return {
    usesDraft: true,
    draftId: draft.draftId,
    panelTargetId: target.id,
    status: "TEMPLATE",
    resolvesTo: target.resolvesTo,
    editorMannequinsOnly: isGroupCamEditorOnly(target.id),
  };
}

export function resolveAvatarPreview(draft: CanonicalAvatarDraftState): AvatarPreviewResolution {
  const environment = getPreviewEnvironment(draft.environmentId);
  assertLoungeEnvironmentDoesNotEnableAvatarOccupancy(environment);
  const viewport = resolveAvatarViewportBinding(DEFAULT_FAN_AVATAR_GLB_SLOT);
  const motion = dispatchProductionPreviewMotion(draft.previewAction, viewport);
  const actionGate = motion.gate;
  const productionPath = motion.productionPath;
  const character = resolveBobbleheadRuntimeCharacter(draft.baseId);
  const seated =
    actionGate.allowed && (productionPath === "SIT" || productionPath === "DEEP_SIT");
  const playing =
    actionGate.allowed &&
    (productionPath === "WALK" ||
      productionPath === "HYPE" ||
      productionPath === "DANCE" ||
      productionPath === "DANCE_RANGE_TEST" ||
      productionPath === "WAVE");
  const bound = viewport.diagnostic === "OK" && Boolean(viewport.glbUrl);
  const fidelity = resolveEffectivePreviewFidelity(draft);
  const rigBase = bobbleheadRuntimeToRigProps(character, {
    isSeated: seated,
    isPlaying: playing && fidelity === "full",
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
    motion,
    fidelity,
    jumbotron: resolveJumbotronPresentationFromDraft(draft),
    presentation: resolvePresentationPanelFromDraft(draft),
    rigProps,
    editorMannequin:
      (!bound && environment.editorMannequinAllowed) ||
      isGroupCamEditorOnly(draft.panelTargetId),
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

/** ARMS_UP fit stress — production motion package path only (no fake clipping scores). */
export type ArmsUpFitTestResult = {
  action: "ARMS_UP";
  gate: PreviewActionGate;
  fit: ReturnType<typeof fitValidationStatus>;
  allowed: boolean;
  productionPath: AvatarPreviewAction;
  rigFamily: typeof AVATAR_RIG_VERSION;
  owner: typeof AVATAR_PREVIEW_RUNTIME_OWNER;
  productionCompatible: boolean;
  motionSource: "MOTION_PACKAGE";
  assetCertificationState: "CERTIFIED" | "UNBOUND" | "BLOCKED";
};

export function runArmsUpFitTest(viewport?: AvatarViewportBinding): ArmsUpFitTestResult {
  const binding = viewport ?? resolveAvatarViewportBinding(DEFAULT_FAN_AVATAR_GLB_SLOT);
  const motion = dispatchProductionPreviewMotion("ARMS_UP", binding);
  const fit = fitValidationStatus("SOCKET_FIT", binding);
  const allowed = motion.gate.allowed && fit.allowed;
  return {
    action: "ARMS_UP",
    gate: motion.gate,
    fit,
    allowed,
    productionPath: motion.productionPath,
    rigFamily: AVATAR_RIG_VERSION,
    owner: AVATAR_PREVIEW_RUNTIME_OWNER,
    productionCompatible: allowed,
    motionSource: "MOTION_PACKAGE",
    assetCertificationState: allowed ? "CERTIFIED" : "BLOCKED",
  };
}

/**
 * Creates an authoritative AvatarLook from current CanonicalAvatarDraft.
 * Enforces productionCompatible wearables before creating snapshot.
 */
export function createAvatarLookFromDraft(
  draft: CanonicalAvatarDraftState,
  name: string,
): AvatarLook {
  assertProductionCompatibleSave(draft.equippedCosmeticIds);
  const viewport = resolveAvatarViewportBinding(DEFAULT_FAN_AVATAR_GLB_SLOT);
  return {
    schemaVersion: AVATAR_LOOK_SCHEMA_VERSION,
    lookId: `look_${draft.draftId}_${Date.now()}`,
    name,
    rigVersion: AVATAR_RIG_VERSION,
    motionPackageVersion: MOTION_PACKAGE_VERSION,
    baseId: draft.baseId,
    skinT: draft.skinT,
    displayName: draft.displayName || name,
    equippedCosmeticIds: [...draft.equippedCosmeticIds],
    motionPersonality: lookMotionPersonalityFromViewport(viewport),
    lastPreviewAction: draft.previewAction,
    certificationSnapshot: certificationSnapshotFromPreview(draft.equippedCosmeticIds),
    savedAt: new Date().toISOString(),
  };
}

/**
 * Applies a canonical AvatarLook back onto the active CanonicalAvatarDraft.
 * Studio and Quick Panel observe changes identically without state forks.
 */
export function applyAvatarLookToDraft(
  look: AvatarLook,
): CanonicalAvatarDraftState {
  return patchCanonicalAvatarDraft({
    baseId: look.baseId,
    skinT: look.skinT,
    displayName: look.displayName,
    equippedCosmeticIds: [...look.equippedCosmeticIds],
    previewAction: look.lastPreviewAction,
  });
}

/** Browser cert probe — surfaces publish the same draft truth; never a second runtime. */
export type AvatarPreviewCertProbe = {
  surface: "full-studio" | "quick-avatar";
  owner: typeof AVATAR_PREVIEW_RUNTIME_OWNER;
  draftId: string;
  environmentId: AvatarPreviewEnvironmentId;
  panelTargetId: AvatarPresentationPanelTargetId | null;
  previewAction: AvatarPreviewAction;
  fidelity: AvatarPreviewFidelity;
  lightingOnly: boolean;
  occupancyAllowed: boolean;
  loungeLightingLaw: boolean;
  groupCamEditorOnly: boolean;
  motionProductionCompatible: boolean;
  motionPath: AvatarPreviewAction;
  equippedCosmeticIds: string[];
  viewportDiagnostic: string;
};

export function publishAvatarPreviewCertProbe(
  surface: AvatarPreviewCertProbe["surface"],
  resolution: AvatarPreviewResolution,
): AvatarPreviewCertProbe {
  const probe: AvatarPreviewCertProbe = {
    surface,
    owner: AVATAR_PREVIEW_RUNTIME_OWNER,
    draftId: resolution.draft.draftId,
    environmentId: resolution.draft.environmentId,
    panelTargetId: resolution.draft.panelTargetId,
    previewAction: resolution.draft.previewAction,
    fidelity: resolution.fidelity,
    lightingOnly: resolution.environment.lightingOnly,
    occupancyAllowed: resolution.environment.avatarOccupancyAllowed,
    loungeLightingLaw:
      LOUNGE_LIGHTING_ONLY_IDS.has(resolution.environment.id) &&
      !resolution.environment.avatarOccupancyAllowed,
    groupCamEditorOnly: isGroupCamEditorOnly(resolution.draft.panelTargetId),
    motionProductionCompatible: resolution.motion.productionCompatible,
    motionPath: resolution.motion.productionPath,
    equippedCosmeticIds: [...resolution.draft.equippedCosmeticIds],
    viewportDiagnostic: resolution.viewport.diagnostic,
  };
  if (typeof window !== "undefined") {
    (window as unknown as { __TMI_AVATAR_PREVIEW_CERT__?: AvatarPreviewCertProbe }).__TMI_AVATAR_PREVIEW_CERT__ =
      probe;
  }
  return probe;
}
