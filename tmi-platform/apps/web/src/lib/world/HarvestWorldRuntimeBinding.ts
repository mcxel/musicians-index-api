/**
 * HarvestWorldRuntimeBinding — consume frozen harvest WORLD_ASSEMBLED packages
 * into the EXISTING world presentation/selection path.
 *
 * Resolves to WorldAdaptation fabric + Camera/Collision/Venue/Avatar/Jumbotron.
 * Does NOT create a second WorldRuntime, WorldScenePlan engine, or WebRTC stack.
 * PHYSICAL_GREEN remains 0. sellable remains false.
 */

import {
  getHarvestAssembledWorldPackage,
  getHarvestGeometryPackage,
  getHarvestMaterialPackage,
  listHarvestAssembledWorldPackages,
  runHarvestDerivedWorldAssemblyPass,
  type HarvestAssembledWorldPackage,
} from "@/lib/world/HarvestWorldPackageAssembly";
import {
  WORLD_CAMERA_FABRIC,
  firstThirdPersonPreservesSession,
  switchWorldCamera,
} from "@/lib/world/WorldCameraFabric";
import { WORLD_ENVELOPE_LAW } from "@/lib/world/WorldEnvelopeContract";
import { CANONICAL_AVATAR_RIG_SLOT } from "@/lib/avatars/AvatarIdentityDeformationRuntime";
import { CHROMA_RUNTIME_OWNER } from "@/lib/venue/ChromaSegmentationRuntime";
import { venueSkinChangePreservesSession } from "@/lib/world/WorldAdaptationRegistry";
import { registerWorldRoute, getWorldRoute, type TmiWorldRoute } from "@/lib/world/tmiWorldRouteRegistry";

export const HARVEST_WORLD_RUNTIME_BINDING_OWNER = "HarvestWorldRuntimeBinding" as const;

export type HarvestWorldPresentationOption = {
  worldPackageId: string;
  candidateId: string;
  selectionId: string;
  baseWorldId: HarvestAssembledWorldPackage["baseWorldId"];
  meshAuthority: string;
  label: string;
  selectable: true;
  sellable: false;
  physicalGreen: 0;
  sphereClaim: false;
};

export type HarvestFabricBindingCert = {
  selectionId: string;
  candidateId: string;
  worldPackageId: string;
  baseWorldId: string;
  bindings: {
    envelope: "PASS" | "FAIL";
    cameraFabric: "PASS" | "FAIL";
    collision: "PASS" | "FAIL";
    seatingAvatar: "PASS" | "FAIL";
    jumbotron: "PASS" | "FAIL";
    mediaSurfaces: "PASS" | "FAIL";
    chroma: "PASS" | "FAIL";
    sessionPreserve: "PASS" | "FAIL";
    worldRoute: "PASS" | "FAIL";
  };
  allPass: boolean;
  physicalGreen: 0;
  secondWorldRuntime: false;
};

function normalizeSelectionId(raw: string): string {
  const s = raw.trim();
  if (s.startsWith("wpkg:")) return s;
  if (s.startsWith("harvest:")) {
    const id = s.slice("harvest:".length).split(":")[0]!;
    return `wpkg:${id}`;
  }
  if (s.startsWith("wad-")) return `wpkg:${s}`;
  return s;
}

function candidateIdFromSelection(selectionId: string): string | null {
  const n = normalizeSelectionId(selectionId);
  if (!n.startsWith("wpkg:")) return null;
  return n.slice("wpkg:".length);
}

/** Presentation/selection catalog — assembled packages only (not REFERENCE_ONLY). */
export function listHarvestWorldPresentationOptions(): HarvestWorldPresentationOption[] {
  runHarvestDerivedWorldAssemblyPass();
  return listHarvestAssembledWorldPackages().map((pkg) => {
    const geo = getHarvestGeometryPackage(pkg.candidateId);
    return {
      worldPackageId: pkg.worldPackageId,
      candidateId: pkg.candidateId,
      selectionId: pkg.worldPackageId,
      baseWorldId: pkg.baseWorldId,
      meshAuthority: geo?.meshAuthority ?? "BASE_FABRIC_SHELL_ESTIMATE",
      label: `Harvest ${pkg.candidateId} · ${pkg.baseWorldId}`,
      selectable: true as const,
      sellable: false as const,
      physicalGreen: 0 as const,
      sphereClaim: false as const,
    };
  });
}

export function isHarvestWorldSelectionId(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const s = raw.trim();
  return s.startsWith("wpkg:") || s.startsWith("harvest:") || /^wad-\d+/i.test(s);
}

export function resolveHarvestWorldPackage(
  selectionId: string,
): HarvestAssembledWorldPackage | null {
  const candidateId = candidateIdFromSelection(selectionId);
  if (!candidateId) return null;
  return getHarvestAssembledWorldPackage(candidateId);
}

/** Ensure a world route exists for the package — uses tmiWorldRouteRegistry (no second router). */
export function ensureHarvestWorldRoute(pkg: HarvestAssembledWorldPackage): TmiWorldRoute {
  const route = `/world/harvest/${encodeURIComponent(pkg.candidateId)}`;
  const existing = getWorldRoute(route);
  if (existing) return existing;
  const entry: TmiWorldRoute = {
    worldId: pkg.worldPackageId,
    route,
    backRoute: "/live/lobby",
    entryPoint: "harvest-world-selection",
    exitPoint: "live-lobby",
    locked: false,
  };
  registerWorldRoute(entry);
  return entry;
}

/**
 * Certify that a harvest package resolves onto the canonical fabric authorities.
 * PHYSICAL_GREEN stays 0 — this is binding certification, not visual/GPU pass.
 */
export function certifyHarvestWorldRuntimeBindings(
  selectionId: string,
): HarvestFabricBindingCert | null {
  const pkg = resolveHarvestWorldPackage(selectionId);
  if (!pkg) return null;

  const fabric = pkg.fabric;
  const route = ensureHarvestWorldRoute(pkg);
  const mat = getHarvestMaterialPackage(pkg.candidateId);

  const cameraIds = Object.keys(WORLD_CAMERA_FABRIC);
  const cameraOk =
    fabric.cameras.length > 0 &&
    fabric.cameras.every((id) => cameraIds.includes(id)) &&
    switchWorldCamera({
      from: "AUDIENCE_SEATED",
      to: "OVERHEAD",
      roomId: "bind-cert",
      sessionId: "bind-sess",
    }).preservesWebRtcSession === true &&
    firstThirdPersonPreservesSession("bind-cert", "bind-sess").preservesRoomSession === true;

  const collisionOk =
    fabric.collisions.length > 0 &&
    fabric.collisions.some((c) => c.kind === "FLOOR") &&
    fabric.grounding.forbidFloating === true;

  const seatingOk =
    fabric.seats.length > 0 &&
    fabric.seats.every((s) => s.avatarRigSlot === CANONICAL_AVATAR_RIG_SLOT) &&
    fabric.avatar.rigSlotId === CANONICAL_AVATAR_RIG_SLOT &&
    fabric.seats.every((s) => s.occupancy === "EMPTY");

  const jumbotronOk = fabric.jumbotron.present && fabric.jumbotron.inWorld && fabric.jumbotron.notOnAppChrome;

  const mediaOk =
    fabric.mediaSurfaces.some((s) => s.kind === "HD_PERFORMER_PANEL") &&
    fabric.mediaSurfaces.every((s) => s.isDestinationNotWebRtcSource && s.bindsVenuePresentationExecution);

  const chromaOk =
    fabric.chroma.owner === CHROMA_RUNTIME_OWNER &&
    fabric.chroma.surfaceBound === true &&
    fabric.mediaSurfaces.some((s) => s.kind === "CHROMA_PERFORMER" && s.bindsChromaRuntime);

  const sessionOk =
    fabric.preservesSessionOnSkinChange === true &&
    venueSkinChangePreservesSession({
      roomId: "bind-cert",
      sessionId: "bind-sess",
      fromSkinId: "prior",
      toSkinId: pkg.worldPackageId,
    }).preservesSession === true;

  const envelopeOk =
    fabric.envelope.horizontalCoverageDegrees === WORLD_ENVELOPE_LAW.horizontalCoverageDegrees &&
    fabric.envelope.verticalCoverageDegrees === WORLD_ENVELOPE_LAW.verticalCoverageDegrees &&
    fabric.envelope.flatImageIsNotWorld === true &&
    mat?.sphereClaim === false;

  const routeOk = Boolean(route.worldId === pkg.worldPackageId && route.route.includes(pkg.candidateId));

  const bindings = {
    envelope: envelopeOk ? ("PASS" as const) : ("FAIL" as const),
    cameraFabric: cameraOk ? ("PASS" as const) : ("FAIL" as const),
    collision: collisionOk ? ("PASS" as const) : ("FAIL" as const),
    seatingAvatar: seatingOk ? ("PASS" as const) : ("FAIL" as const),
    jumbotron: jumbotronOk ? ("PASS" as const) : ("FAIL" as const),
    mediaSurfaces: mediaOk ? ("PASS" as const) : ("FAIL" as const),
    chroma: chromaOk ? ("PASS" as const) : ("FAIL" as const),
    sessionPreserve: sessionOk ? ("PASS" as const) : ("FAIL" as const),
    worldRoute: routeOk ? ("PASS" as const) : ("FAIL" as const),
  };

  return {
    selectionId: pkg.worldPackageId,
    candidateId: pkg.candidateId,
    worldPackageId: pkg.worldPackageId,
    baseWorldId: pkg.baseWorldId,
    bindings,
    allPass: Object.values(bindings).every((v) => v === "PASS"),
    physicalGreen: 0,
    secondWorldRuntime: false,
  };
}

/** Apply harvest selection into generator material/environment inputs — appearance binding only. */
export function applyHarvestSelectionToGeneratorSkin(
  venueSkinId: string | null | undefined,
): {
  skinId: string | null;
  harvestWorldPackageId: string | null;
  environmentHint: "indoor" | "outdoor" | null;
  structureUnchanged: true;
  sellable: false;
  physicalGreen: 0;
} {
  if (!venueSkinId || !isHarvestWorldSelectionId(venueSkinId)) {
    return {
      skinId: venueSkinId ?? null,
      harvestWorldPackageId: null,
      environmentHint: null,
      structureUnchanged: true,
      sellable: false,
      physicalGreen: 0,
    };
  }
  const pkg = resolveHarvestWorldPackage(venueSkinId);
  if (!pkg) {
    return {
      skinId: venueSkinId,
      harvestWorldPackageId: null,
      environmentHint: null,
      structureUnchanged: true,
      sellable: false,
      physicalGreen: 0,
    };
  }
  ensureHarvestWorldRoute(pkg);
  return {
    skinId: pkg.worldPackageId,
    harvestWorldPackageId: pkg.worldPackageId,
    environmentHint: pkg.baseWorldId.includes("outdoor") ? "outdoor" : "indoor",
    structureUnchanged: true,
    sellable: false,
    physicalGreen: 0,
  };
}

export function harvestRuntimeBindingCreatesSecondWorldRuntime(): false {
  return false;
}

export function harvestRuntimeBindingPhysicalGreen(): 0 {
  return 0;
}

export function harvestRuntimeBindingSellableByDefault(): false {
  return false;
}

/** Sample certify N packages — used by QA without claiming PHYSICAL_GREEN. */
export function certifyHarvestWorldRuntimeBindingSample(limit = 12): {
  sampled: number;
  allPass: boolean;
  physicalGreen: 0;
  failures: string[];
} {
  const opts = listHarvestWorldPresentationOptions().slice(0, limit);
  const failures: string[] = [];
  for (const o of opts) {
    const cert = certifyHarvestWorldRuntimeBindings(o.selectionId);
    if (!cert?.allPass) failures.push(o.candidateId);
  }
  return {
    sampled: opts.length,
    allPass: failures.length === 0,
    physicalGreen: 0,
    failures,
  };
}
