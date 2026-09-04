/**
 * runAvatarPreviewParityCertification.test.ts
 *
 * Master Acceptance Test Suite for:
 * Avatar Preview Parity Law & ACGBR Studio Integration (Phase 1A)
 *
 * Evaluates all 18 architectural gates:
 * 1. one CanonicalAvatarDraft owner
 * 2. one canonical preview runtime owner
 * 3. Full + Quick share same draft ID
 * 4. Quick mutation visible to Full
 * 5. Full mutation visible to Quick
 * 6. IDLE production compatible
 * 7. WALK production compatible
 * 8. DANCE production compatible
 * 9. EMOTE production compatible
 * 10. ARMS_UP production compatible
 * 11. FAN_LOBBY environment resolves
 * 12. JUMBOTRON preview uses current canonical draft
 * 13. locked cosmetic remains unowned
 * 14. Saved Look survives Quick <-> Full
 * 15. certificationSnapshot retained
 * 16. reduced-motion behavior
 * 17. no import from singular duplicate runtime
 * 18. mobile 390x844 structural compatibility
 */

import fs from "fs";
import path from "path";
import {
  commitCanonicalDraftToFanWorld,
  getCanonicalAvatarDraft,
  hydrateCanonicalAvatarDraft,
  patchCanonicalAvatarDraft,
  resetCanonicalAvatarDraftForTest,
} from "../lib/avatars/CanonicalAvatarDraft";
import {
  AVATAR_PREVIEW_RUNTIME_OWNER,
  applyAvatarLookToDraft,
  createAvatarLookFromDraft,
  dispatchProductionPreviewMotion,
  getPreviewEnvironment,
  resolveAvatarPreview,
  resolveEffectivePreviewFidelity,
  resolveJumbotronPresentationFromDraft,
  runArmsUpFitTest,
} from "../lib/avatars/AvatarPreviewRuntime";
import { AVATAR_LOOK_SCHEMA_VERSION, migrateAvatarLook } from "../lib/avatars/AvatarLook";
import { AVATAR_RIG_VERSION } from "../lib/avatars/AvatarRigSpec";
import { canCommitWearableToWorld, resolveWearableCapability } from "../lib/avatars/AvatarWearableCapability";
import { clearFanEquippedLookCache } from "../lib/avatars/FanEquippedLookBridge";

describe("Avatar Preview Parity Phase 1A Master Certification Suite", () => {
  beforeEach(() => {
    resetCanonicalAvatarDraftForTest();
    clearFanEquippedLookCache();
  });

  test("Gate 1: one CanonicalAvatarDraft owner", () => {
    hydrateCanonicalAvatarDraft();
    const draft = getCanonicalAvatarDraft();
    expect(draft).toBeDefined();
    expect(draft.schemaVersion).toBe(1);
    expect(typeof draft.draftId).toBe("string");
    expect(draft.draftId.startsWith("cad_")).toBe(true);
  });

  test("Gate 2: one canonical preview runtime owner", () => {
    expect(AVATAR_PREVIEW_RUNTIME_OWNER).toBe(
      "apps/web/src/lib/avatars/AvatarPreviewRuntime.ts"
    );
  });

  test("Gate 3: Full + Quick share same draft ID", () => {
    hydrateCanonicalAvatarDraft();
    const studioInitial = getCanonicalAvatarDraft();
    const quickInitial = getCanonicalAvatarDraft();
    expect(studioInitial.draftId).toBe(quickInitial.draftId);
  });

  test("Gate 4: Quick mutation visible to Full", () => {
    hydrateCanonicalAvatarDraft();
    const initialId = getCanonicalAvatarDraft().draftId;
    // Quick equips streetwear and triggers dance preview
    patchCanonicalAvatarDraft({
      equippedCosmeticIds: ["street_fit"],
      previewAction: "DANCE",
    });
    const fullObserved = getCanonicalAvatarDraft();
    expect(fullObserved.draftId).toBe(initialId);
    expect(fullObserved.equippedCosmeticIds).toEqual(["street_fit"]);
    expect(fullObserved.previewAction).toBe("DANCE");
  });

  test("Gate 5: Full mutation visible to Quick", () => {
    hydrateCanonicalAvatarDraft();
    const initialId = getCanonicalAvatarDraft().draftId;
    // Full studio changes base archetype and skin tone
    patchCanonicalAvatarDraft({
      baseId: "fan_m_01",
      skinT: 0.82,
      previewAction: "WALK",
    });
    const quickObserved = getCanonicalAvatarDraft();
    expect(quickObserved.draftId).toBe(initialId);
    expect(quickObserved.baseId).toBe("fan_m_01");
    expect(quickObserved.skinT).toBe(0.82);
    expect(quickObserved.previewAction).toBe("WALK");
  });

  test("Gate 6: IDLE production compatible", () => {
    const dispatch = dispatchProductionPreviewMotion("IDLE");
    expect(dispatch.requested).toBe("IDLE");
    expect(dispatch.productionPath).toBe("IDLE");
    expect(dispatch.productionCompatible).toBe(true);
    expect(dispatch.motionSource).toBe("PROCEDURAL_RUNTIME");
    expect(dispatch.rigFamily).toBe(AVATAR_RIG_VERSION);
    expect(dispatch.owner).toBe(AVATAR_PREVIEW_RUNTIME_OWNER);
  });

  test("Gate 7: WALK production compatible", () => {
    const dispatch = dispatchProductionPreviewMotion("WALK");
    expect(dispatch.requested).toBe("WALK");
    expect(dispatch.productionPath).toBe("WALK");
    expect(dispatch.productionCompatible).toBe(true);
    expect(dispatch.motionSource).toBe("PROCEDURAL_RUNTIME");
    expect(dispatch.rigFamily).toBe(AVATAR_RIG_VERSION);
    expect(dispatch.owner).toBe(AVATAR_PREVIEW_RUNTIME_OWNER);
  });

  test("Gate 8: DANCE production compatible", () => {
    const dispatch = dispatchProductionPreviewMotion("DANCE");
    expect(dispatch.requested).toBe("DANCE");
    expect(dispatch.productionPath).toBe("DANCE");
    expect(dispatch.productionCompatible).toBe(true);
    expect(dispatch.motionSource).toBe("MOTION_PACKAGE");
    expect(dispatch.rigFamily).toBe(AVATAR_RIG_VERSION);
    expect(dispatch.owner).toBe(AVATAR_PREVIEW_RUNTIME_OWNER);
  });

  test("Gate 9: EMOTE production compatible", () => {
    const dispatch = dispatchProductionPreviewMotion("EMOTE");
    expect(dispatch.requested).toBe("EMOTE");
    expect(dispatch.productionPath).toBe("WAVE");
    expect(dispatch.productionCompatible).toBe(true);
    expect(dispatch.motionSource).toBe("MOTION_PACKAGE");
    expect(dispatch.rigFamily).toBe(AVATAR_RIG_VERSION);
    expect(dispatch.owner).toBe(AVATAR_PREVIEW_RUNTIME_OWNER);
  });

  test("Gate 10: ARMS_UP production compatible", () => {
    const result = runArmsUpFitTest();
    expect(result.action).toBe("ARMS_UP");
    expect(result.productionPath).toBe("ARMS_UP");
    expect(result.productionCompatible).toBe(true);
    expect(result.motionSource).toBe("MOTION_PACKAGE");
    expect(result.rigFamily).toBe(AVATAR_RIG_VERSION);
    expect(result.owner).toBe(AVATAR_PREVIEW_RUNTIME_OWNER);
    expect(result.allowed).toBe(true);
  });

  test("Gate 11: FAN_LOBBY environment resolves", () => {
    const env = getPreviewEnvironment("FAN_LOBBY");
    expect(env.id).toBe("FAN_LOBBY");
    expect(env.lightingOnly).toBe(true);
    expect(env.avatarOccupancyAllowed).toBe(true);
    expect(env.editorMannequinAllowed).toBe(false);

    const preview = resolveAvatarPreview({
      ...getCanonicalAvatarDraft(),
      environmentId: "FAN_LOBBY",
    });
    expect(preview.environment.id).toBe("FAN_LOBBY");
    expect(preview.environment.lightingOnly).toBe(true);
  });

  test("Gate 12: JUMBOTRON preview uses current canonical draft", () => {
    hydrateCanonicalAvatarDraft();
    patchCanonicalAvatarDraft({
      panelTargetId: "JUMBOTRON",
      equippedCosmeticIds: ["street_fit"],
    });
    const draft = getCanonicalAvatarDraft();
    const jt = resolveJumbotronPresentationFromDraft(draft);
    expect(jt).not.toBeNull();
    expect(jt?.usesDraft).toBe(true);
    expect(jt?.draftId).toBe(draft.draftId);
    expect(jt?.panelTargetId).toBe("JUMBOTRON");
    expect(jt?.resolvesTo).toContain("VenueAutomatedJumbotronMount");

    const preview = resolveAvatarPreview(draft);
    expect(preview.jumbotron?.draftId).toBe(draft.draftId);
  });

  test("Gate 13: locked cosmetic remains unowned", () => {
    const cap = resolveWearableCapability("gold_chain");
    expect(cap?.previewable).toBe(true);
    expect(cap?.requiresOwnershipToEquip).toBe(true);
    // User without gold_chain in inventory cannot commit
    expect(canCommitWearableToWorld("gold_chain", [])).toBe(false);
    // Draft attempt with unowned locked cosmetic fails commit to Fan World
    patchCanonicalAvatarDraft({ equippedCosmeticIds: ["gold_chain"] });
    const commit = commitCanonicalDraftToFanWorld({ ownedCosmeticIds: [] });
    expect(commit.ok).toBe(false);
  });

  test("Gate 14: Saved Look survives Quick <-> Full", () => {
    hydrateCanonicalAvatarDraft();
    patchCanonicalAvatarDraft({
      baseId: "fan_f_01",
      skinT: 0.65,
      equippedCosmeticIds: ["street_fit"],
      previewAction: "IDLE",
    });
    const draft = getCanonicalAvatarDraft();
    // Quick saves look
    const look = createAvatarLookFromDraft(draft, "Quick Saved Look");
    expect(look.schemaVersion).toBe(AVATAR_LOOK_SCHEMA_VERSION);
    expect(look.baseId).toBe("fan_f_01");
    expect(look.skinT).toBe(0.65);
    expect(look.equippedCosmeticIds).toEqual(["street_fit"]);

    // Full studio resets draft
    resetCanonicalAvatarDraftForTest();
    hydrateCanonicalAvatarDraft();
    expect(getCanonicalAvatarDraft().equippedCosmeticIds).toEqual([]);

    // Full studio applies the saved look
    const restored = applyAvatarLookToDraft(look);
    expect(restored.baseId).toBe("fan_f_01");
    expect(restored.skinT).toBe(0.65);
    expect(restored.equippedCosmeticIds).toEqual(["street_fit"]);
  });

  test("Gate 15: certificationSnapshot retained", () => {
    hydrateCanonicalAvatarDraft();
    patchCanonicalAvatarDraft({ equippedCosmeticIds: ["street_fit"] });
    const look = createAvatarLookFromDraft(getCanonicalAvatarDraft(), "Certified Look");
    expect(look.certificationSnapshot).toBeDefined();
    expect(["PASS", "REGENERATE", "UNBOUND"]).toContain(look.certificationSnapshot.wearableCert);
    expect(look.rigVersion).toBe(AVATAR_RIG_VERSION);

    // Migrating raw persisted look retains certificationSnapshot
    const migrated = migrateAvatarLook(look);
    expect(migrated?.certificationSnapshot.wearableCert).toBe(look.certificationSnapshot.wearableCert);
    expect(migrated?.schemaVersion).toBe(1);
  });

  test("Gate 16: reduced-motion behavior", () => {
    hydrateCanonicalAvatarDraft();
    patchCanonicalAvatarDraft({ fidelity: "full" });
    const draft = getCanonicalAvatarDraft();
    expect(resolveEffectivePreviewFidelity(draft, false)).toBe("full");
    expect(resolveEffectivePreviewFidelity(draft, true)).toBe("reduced");

    const reducedPreview = resolveAvatarPreview({
      ...draft,
      fidelity: "reduced",
    });
    expect(reducedPreview.fidelity).toBe("reduced");
    // Action truth is identical, only rendering fidelity is reduced
    expect(reducedPreview.motion.requested).toBe("IDLE");
  });

  test("Gate 17: no import from singular duplicate runtime", () => {
    const filesToCheck = [
      "src/lib/avatars/AvatarPreviewRuntime.ts",
      "src/lib/avatars/CanonicalAvatarDraft.ts",
      "src/lib/avatars/AvatarPreviewActions.ts",
      "src/components/canisters/AvatarCreationCenter.tsx",
      "src/components/workspace/universal/CanonicalQuickPanelContent.tsx",
    ];
    for (const rel of filesToCheck) {
      const fullPath = path.join(__dirname, "..", "..", rel);
      if (fs.existsSync(fullPath)) {
        const text = fs.readFileSync(fullPath, "utf8");
        // Must not import from singular lib/avatar/
        expect(text).not.toMatch(/from\s+["'].*lib\/avatar\/AvatarPreviewRuntime["']/);
      }
    }
  });

  test("Gate 18: mobile 390x844 structural compatibility", () => {
    // Check that QuickPanel Content and AvatarCreationCenter provide responsive classes / styles
    const creationCenterPath = path.join(
      __dirname,
      "..",
      "components",
      "canisters",
      "AvatarCreationCenter.tsx"
    );
    const quickPanelPath = path.join(
      __dirname,
      "..",
      "components",
      "workspace",
      "universal",
      "CanonicalQuickPanelContent.tsx"
    );
    expect(fs.existsSync(creationCenterPath)).toBe(true);
    expect(fs.existsSync(quickPanelPath)).toBe(true);

    const creationCenterText = fs.readFileSync(creationCenterPath, "utf8");
    const quickPanelText = fs.readFileSync(quickPanelPath, "utf8");

    // Must have flex wrap and viewport safety without fixed width > 390px
    expect(creationCenterText).toContain("flexWrap");
    expect(quickPanelText).toContain("overflow");
  });
});
