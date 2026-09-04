/**
 * Avatar Preview Parity Law — Studio draft === Quick draft; FAN-only;
 * Lounge lighting never enables occupancy; productionCompatible save gate.
 * Phase 1 pass conditions for Avatar Preview Parity Runtime.
 */

import {
  isFanAvatarOwnershipRole,
  isPerformerIdentityRole,
} from "@/lib/avatars/fanAvatarOwnership";
import {
  commitCanonicalDraftToFanWorld,
  getCanonicalAvatarDraft,
  hydrateCanonicalAvatarDraft,
  patchCanonicalAvatarDraft,
  resetCanonicalAvatarDraftForTest,
} from "@/lib/avatars/CanonicalAvatarDraft";
import {
  AVATAR_PRESENTATION_PANEL_TARGETS,
  AVATAR_PREVIEW_RUNTIME_OWNER,
  assertLoungeEnvironmentDoesNotEnableAvatarOccupancy,
  assertProductionCompatibleSave,
  dispatchProductionPreviewMotion,
  gatePreviewAction,
  getPreviewEnvironment,
  listPhase1MotionSuiteDispatches,
  resolveAvatarPreview,
  resolveEffectivePreviewFidelity,
  resolveJumbotronPresentationFromDraft,
  runArmsUpFitTest,
} from "@/lib/avatars/AvatarPreviewRuntime";
import { DEFAULT_FAN_AVATAR_GLB_SLOT, resolveAvatarViewportBinding } from "@/lib/avatars/AvatarGlbRegistry";
import { canCommitWearableToWorld, resolveWearableCapability } from "@/lib/avatars/AvatarWearableCapability";
import { AVATAR_LOOK_SCHEMA_VERSION, migrateAvatarLook } from "@/lib/avatars/AvatarLook";
import { AVATAR_RIG_VERSION } from "@/lib/avatars/AvatarRigSpec";
import {
  clearFanEquippedLookCache,
  readPersistedFanEquippedLook,
} from "@/lib/avatars/FanEquippedLookBridge";
import { PHASE1_MOTION_SUITE } from "@/lib/avatars/AvatarPreviewActions";

describe("Avatar Preview Parity Law", () => {
  beforeEach(() => {
    resetCanonicalAvatarDraftForTest();
    clearFanEquippedLookCache();
  });

  test("Studio and Quick Panel share one Canonical Avatar Draft + same draftId", () => {
    hydrateCanonicalAvatarDraft();
    const studioPatch = patchCanonicalAvatarDraft({
      equippedCosmeticIds: ["street_fit"],
      previewAction: "IDLE",
      environmentId: "STUDIO_EDITOR",
    });
    const quickRead = getCanonicalAvatarDraft();
    expect(studioPatch).toEqual(quickRead);
    expect(studioPatch.draftId).toBe(quickRead.draftId);
    expect(studioPatch.schemaVersion).toBe(1);
    expect(quickRead.equippedCosmeticIds).toEqual(["street_fit"]);
    // Second hydrate must not fork draft ownership
    hydrateCanonicalAvatarDraft();
    expect(getCanonicalAvatarDraft().draftId).toBe(studioPatch.draftId);
    expect(getCanonicalAvatarDraft().equippedCosmeticIds).toEqual(["street_fit"]);
  });

  test("mutation from Quick is observable on Full (same draftId both ways)", () => {
    hydrateCanonicalAvatarDraft();
    const idBefore = getCanonicalAvatarDraft().draftId;
    patchCanonicalAvatarDraft({ previewAction: "WALK", equippedCosmeticIds: ["street_fit"] });
    const full = getCanonicalAvatarDraft();
    expect(full.draftId).toBe(idBefore);
    expect(full.previewAction).toBe("WALK");
    patchCanonicalAvatarDraft({ previewAction: "IDLE", panelTargetId: "JUMBOTRON" });
    const quick = getCanonicalAvatarDraft();
    expect(quick.draftId).toBe(idBefore);
    expect(quick.panelTargetId).toBe("JUMBOTRON");
    // Surfaces cannot fork draftId
    patchCanonicalAvatarDraft({ draftId: "cad_forged_other" } as never);
    expect(getCanonicalAvatarDraft().draftId).toBe(idBefore);
  });

  test("single runtime owner — production motion adapter hits canonical path", () => {
    const viewport = resolveAvatarViewportBinding(DEFAULT_FAN_AVATAR_GLB_SLOT);
    const suite = listPhase1MotionSuiteDispatches(viewport);
    expect(suite.map((d) => d.requested)).toEqual([...PHASE1_MOTION_SUITE]);
    for (const dispatch of suite) {
      expect(dispatch.owner).toBe(AVATAR_PREVIEW_RUNTIME_OWNER);
      expect(dispatch.rigFamily).toBe(AVATAR_RIG_VERSION);
    }
    const emote = dispatchProductionPreviewMotion("EMOTE", viewport);
    expect(emote.productionPath).toBe("WAVE");
    expect(emote.owner).toBe(AVATAR_PREVIEW_RUNTIME_OWNER);
  });

  test("no duplicate state owner — draft patches do not create a second store", () => {
    hydrateCanonicalAvatarDraft();
    const a = getCanonicalAvatarDraft();
    patchCanonicalAvatarDraft({ skinT: 0.77 });
    const b = getCanonicalAvatarDraft();
    expect(a.draftId).toBe(b.draftId);
    expect(b.skinT).toBe(0.77);
    expect(AVATAR_PREVIEW_RUNTIME_OWNER).toContain("lib/avatars/AvatarPreviewRuntime");
  });

  test("PREVIEW → SAVE → FAN WORLD commits the same draft look fingerprint", () => {
    hydrateCanonicalAvatarDraft();
    patchCanonicalAvatarDraft({
      displayName: "Parity Fan",
      equippedCosmeticIds: ["street_fit"],
      previewAction: "WAVE",
    });
    const preview = resolveAvatarPreview(getCanonicalAvatarDraft());
    expect(preview.draft.equippedCosmeticIds).toEqual(["street_fit"]);
    expect(preview.actionGate.action).toBe("WAVE");
    expect(preview.motion.rigFamily).toBe(AVATAR_RIG_VERSION);

    const commit = commitCanonicalDraftToFanWorld({ outfitLabel: "Street Fit" });
    expect(commit.ok).toBe(true);
    if (!commit.ok) return;
    expect(commit.look.equippedCosmeticIds).toEqual(["street_fit"]);
    expect(commit.look.loadoutId).toContain("street_fit");

    const world = readPersistedFanEquippedLook();
    expect(world?.equippedCosmeticIds).toEqual(["street_fit"]);
    expect(world?.loadoutId).toBe(commit.look.loadoutId);
    expect(getCanonicalAvatarDraft().equippedCosmeticIds).toEqual(["street_fit"]);
  });

  test("commit refuses invented SKUs and locked-without-ownership (no fake Herser)", () => {
    hydrateCanonicalAvatarDraft();
    patchCanonicalAvatarDraft({ equippedCosmeticIds: ["invented-mesh"] });
    const bad = commitCanonicalDraftToFanWorld();
    expect(bad.ok).toBe(false);

    patchCanonicalAvatarDraft({ equippedCosmeticIds: ["gold_chain"] });
    const locked = commitCanonicalDraftToFanWorld({ ownedCosmeticIds: [] });
    expect(locked.ok).toBe(false);
    if (!locked.ok) expect(locked.storeHref).toBeTruthy();
  });

  test("commerce: preview ≠ own — locked SKUs previewable, save needs ownership", () => {
    const locked = resolveWearableCapability("gold_chain");
    expect(locked?.previewable).toBe(true);
    expect(locked?.requiresOwnershipToEquip).toBe(true);
    expect(canCommitWearableToWorld("gold_chain", [])).toBe(false);
    expect(canCommitWearableToWorld("gold_chain", ["gold_chain"])).toBe(true);
    expect(canCommitWearableToWorld("street_fit", [])).toBe(true);
  });

  test("FAN-only ownership; performers are identity roles", () => {
    expect(isFanAvatarOwnershipRole("FAN")).toBe(true);
    expect(isFanAvatarOwnershipRole("USER")).toBe(true);
    expect(isFanAvatarOwnershipRole("PERFORMER")).toBe(false);
    expect(isFanAvatarOwnershipRole("BAND")).toBe(false);
    expect(isPerformerIdentityRole("PERFORMER")).toBe(true);
    expect(isPerformerIdentityRole("FAN")).toBe(false);
  });

  test("Lounge lighting preview does not enable avatar occupancy", () => {
    const env = getPreviewEnvironment("LOUNGE_LIGHTING");
    expect(env.lightingOnly).toBe(true);
    expect(env.avatarOccupancyAllowed).toBe(false);
    expect(env.editorMannequinAllowed).toBe(false);
    expect(() => assertLoungeEnvironmentDoesNotEnableAvatarOccupancy(env)).not.toThrow();
    expect(() =>
      assertLoungeEnvironmentDoesNotEnableAvatarOccupancy({
        ...env,
        avatarOccupancyAllowed: true,
      }),
    ).toThrow(/Lounge environment must not enable avatar occupancy/);

    const preview = resolveAvatarPreview({
      ...getCanonicalAvatarDraft(),
      environmentId: "LOUNGE_LIGHTING",
    });
    expect(preview.environment.avatarOccupancyAllowed).toBe(false);
  });

  test("FAN_LOBBY env preview is lighting-only plate", () => {
    const env = getPreviewEnvironment("FAN_LOBBY");
    expect(env.lightingOnly).toBe(true);
    expect(env.editorMannequinAllowed).toBe(false);
    const preview = resolveAvatarPreview({
      ...getCanonicalAvatarDraft(),
      environmentId: "FAN_LOBBY",
    });
    expect(preview.environment.id).toBe("FAN_LOBBY");
    expect(preview.environment.lightingOnly).toBe(true);
  });

  test("JUMBOTRON presentation preview uses draft id", () => {
    hydrateCanonicalAvatarDraft();
    patchCanonicalAvatarDraft({ panelTargetId: "JUMBOTRON" });
    const draft = getCanonicalAvatarDraft();
    const jt = resolveJumbotronPresentationFromDraft(draft);
    expect(jt).not.toBeNull();
    expect(jt!.usesDraft).toBe(true);
    expect(jt!.draftId).toBe(draft.draftId);
    expect(jt!.panelTargetId).toBe("JUMBOTRON");
    const preview = resolveAvatarPreview(draft);
    expect(preview.jumbotron?.draftId).toBe(draft.draftId);
  });

  test("ARMS_UP fit test hits production motion adapter", () => {
    const result = runArmsUpFitTest();
    expect(result.action).toBe("ARMS_UP");
    expect(result.productionPath).toBe("ARMS_UP");
    expect(result.owner).toBe(AVATAR_PREVIEW_RUNTIME_OWNER);
    expect(result.gate.action).toBe("ARMS_UP");
  });

  test("reduced-motion path forces fidelity=reduced without forking actions", () => {
    hydrateCanonicalAvatarDraft();
    patchCanonicalAvatarDraft({ fidelity: "full", previewAction: "IDLE" });
    const draft = getCanonicalAvatarDraft();
    expect(resolveEffectivePreviewFidelity(draft, false)).toBe("full");
    expect(resolveEffectivePreviewFidelity(draft, true)).toBe("reduced");
    const preview = resolveAvatarPreview({ ...draft, fidelity: "full" });
    expect(preview.motion.requested).toBe("IDLE");
    expect(preview.fidelity === "full" || preview.fidelity === "reduced").toBe(true);
  });

  test("productionCompatible gate blocks invented SKUs on save", () => {
    expect(() => assertProductionCompatibleSave(["street_fit"])).not.toThrow();
    expect(() => assertProductionCompatibleSave(["invented-mesh"])).toThrow(/productionCompatible/);
  });

  test("preview actions never exceed production capability", () => {
    const viewport = resolveAvatarViewportBinding(DEFAULT_FAN_AVATAR_GLB_SLOT);
    expect(gatePreviewAction("IDLE", viewport).allowed).toBe(true);
    expect(gatePreviewAction("WALK", viewport).allowed).toBe(true);
    expect(gatePreviewAction("SIT", viewport).allowed).toBe(true);
    const smile = gatePreviewAction("SMILE", viewport);
    if (viewport.diagnostic === "OK" && viewport.facialTargetsSupported) {
      expect(smile.allowed).toBe(true);
    } else {
      expect(smile.allowed).toBe(false);
      expect(smile.reason).toMatch(/FACIAL_TARGETS_UNSUPPORTED/);
    }
  });

  test("presentation panel targets are TEMPLATE ids, not fake friends", () => {
    expect(AVATAR_PRESENTATION_PANEL_TARGETS.every((t) => t.status === "TEMPLATE")).toBe(true);
    expect(AVATAR_PRESENTATION_PANEL_TARGETS.map((t) => t.id)).toEqual([
      "FAN_CAM",
      "JUMBOTRON",
      "SPOTLIGHT",
      "PROGRAM_ISO",
      "GROUP_CAM",
    ]);
  });

  test("Phase 2 WORLD_CONCERT + LOW_LIGHT_LOUNGE_STYLE adapters", () => {
    const concert = getPreviewEnvironment("WORLD_CONCERT");
    expect(concert.lightingOnly).toBe(true);
    expect(concert.editorMannequinAllowed).toBe(false);

    const lounge = getPreviewEnvironment("LOW_LIGHT_LOUNGE_STYLE");
    expect(lounge.lightingOnly).toBe(true);
    expect(lounge.avatarOccupancyAllowed).toBe(false);
    expect(() => assertLoungeEnvironmentDoesNotEnableAvatarOccupancy(lounge)).not.toThrow();

    hydrateCanonicalAvatarDraft();
    patchCanonicalAvatarDraft({ panelTargetId: "GROUP_CAM", environmentId: "WORLD_CONCERT" });
    const preview = resolveAvatarPreview(getCanonicalAvatarDraft());
    expect(preview.environment.id).toBe("WORLD_CONCERT");
    expect(preview.presentation?.panelTargetId).toBe("GROUP_CAM");
    expect(preview.presentation?.editorMannequinsOnly).toBe(true);
  });

  test("Saved Look survives Full↔Quick with schemaVersion continuity", () => {
    hydrateCanonicalAvatarDraft();
    const draftId = getCanonicalAvatarDraft().draftId;
    patchCanonicalAvatarDraft({
      equippedCosmeticIds: ["street_fit"],
      baseId: getCanonicalAvatarDraft().baseId,
    });
    const look = migrateAvatarLook({
      id: "look-street",
      name: "Street",
      baseId: getCanonicalAvatarDraft().baseId,
      skinT: 0.4,
      equippedItemId: "street_fit",
      savedAt: 1,
    });
    expect(look?.schemaVersion).toBe(AVATAR_LOOK_SCHEMA_VERSION);
    expect(look?.equippedCosmeticIds).toEqual(["street_fit"]);
    // Quick surface still sees same draft after look hydrate semantics
    expect(getCanonicalAvatarDraft().draftId).toBe(draftId);
    expect(getCanonicalAvatarDraft().equippedCosmeticIds).toEqual(["street_fit"]);
  });

  test("legacy saved looks migrate to schemaVersion 1", () => {
    const look = migrateAvatarLook({
      id: "look-1",
      name: "Street",
      baseId: "fan_m_01",
      skinT: 0.4,
      equippedItemId: "street_fit",
      savedAt: 1,
    });
    expect(look?.schemaVersion).toBe(1);
    expect(look?.equippedCosmeticIds).toEqual(["street_fit"]);
    expect(look?.certificationSnapshot.wearableCert).toBe("UNBOUND");
  });
});
