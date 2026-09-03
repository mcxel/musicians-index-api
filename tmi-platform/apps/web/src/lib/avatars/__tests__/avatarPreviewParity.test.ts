/**
 * Avatar Preview Parity Law — Studio draft === Quick draft; FAN-only;
 * Lounge lighting never enables occupancy; productionCompatible save gate.
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
  assertLoungeEnvironmentDoesNotEnableAvatarOccupancy,
  assertProductionCompatibleSave,
  gatePreviewAction,
  getPreviewEnvironment,
  resolveAvatarPreview,
} from "@/lib/avatars/AvatarPreviewRuntime";
import { DEFAULT_FAN_AVATAR_GLB_SLOT, resolveAvatarViewportBinding } from "@/lib/avatars/AvatarGlbRegistry";
import { canCommitWearableToWorld, resolveWearableCapability } from "@/lib/avatars/AvatarWearableCapability";
import { migrateAvatarLook } from "@/lib/avatars/AvatarLook";
import {
  clearFanEquippedLookCache,
  readPersistedFanEquippedLook,
} from "@/lib/avatars/FanEquippedLookBridge";

describe("Avatar Preview Parity Law", () => {
  beforeEach(() => {
    resetCanonicalAvatarDraftForTest();
    clearFanEquippedLookCache();
  });

  test("Studio and Quick Panel share one Canonical Avatar Draft", () => {
    hydrateCanonicalAvatarDraft();
    const studioPatch = patchCanonicalAvatarDraft({
      equippedCosmeticIds: ["street_fit"],
      previewAction: "IDLE",
      environmentId: "STUDIO_EDITOR",
    });
    const quickRead = getCanonicalAvatarDraft();
    expect(studioPatch).toEqual(quickRead);
    expect(quickRead.equippedCosmeticIds).toEqual(["street_fit"]);
    hydrateCanonicalAvatarDraft();
    expect(getCanonicalAvatarDraft().equippedCosmeticIds).toEqual(["street_fit"]);
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

    const commit = commitCanonicalDraftToFanWorld({ outfitLabel: "Street Fit" });
    expect(commit.ok).toBe(true);
    if (!commit.ok) return;
    expect(commit.look.equippedCosmeticIds).toEqual(["street_fit"]);
    expect(commit.look.loadoutId).toContain("street_fit");

    const world = readPersistedFanEquippedLook();
    expect(world?.equippedCosmeticIds).toEqual(["street_fit"]);
    expect(world?.loadoutId).toBe(commit.look.loadoutId);
    // Quick surface still reads the same draft after save
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

  test("productionCompatible gate blocks invented SKUs on save", () => {
    expect(() => assertProductionCompatibleSave(["street_fit"])).not.toThrow();
    expect(() => assertProductionCompatibleSave(["invented-mesh"])).toThrow(/productionCompatible/);
  });

  test("locked SKUs are previewable; equip-to-world requires ownership", () => {
    const locked = resolveWearableCapability("gold_chain");
    expect(locked?.previewable).toBe(true);
    expect(locked?.requiresOwnershipToEquip).toBe(true);
    expect(canCommitWearableToWorld("gold_chain", [])).toBe(false);
    expect(canCommitWearableToWorld("gold_chain", ["gold_chain"])).toBe(true);
    expect(canCommitWearableToWorld("street_fit", [])).toBe(true);
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
    ]);
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
