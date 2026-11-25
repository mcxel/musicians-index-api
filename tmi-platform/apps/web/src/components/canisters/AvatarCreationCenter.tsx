"use client";

/**
 * AvatarCreationCenter.tsx — Game-Grade Canonical Character Creator
 *
 * Game-Grade Features:
 * 1. Prominent Live 3D Viewport with Orbit, Zoom, and Angle Inspection (Front, Side, Back, Close-up).
 * 2. Real-time Animation & Emote Testing (Idle, Walk, Run, Wave, Clap, Dance, Emotes).
 * 3. Categorized customizer suites:
 *    - MY AVATAR & STATS
 *    - FACE SCAN / AUTO CREATE (Consent → Capture → Quality Gate → Landmarks → Rig Fit)
 *    - HEAD / FACE / BASES (Canonical Bobblehead Bases)
 *    - SKIN TONE (Global Continuum Slider + Presets)
 *    - HAIR & STYLING
 *    - WARDROBE: Outfits · Tops · Bottoms · Shoes · Hats · Accessories · Masks · Props
 *    - EMOTES & DANCES
 *    - SAVED LOOKS & LOADOUTS
 * 4. Automated AI Assistant actions:
 *    - SMART RANDOMIZE
 *    - AUTO PICK BEST HAIR
 *    - AUTO FIT OUTFIT
 *    - RESTORE LAST LOOK
 * 5. Instant runtime equip & live sync across Fan Lobby, Venue Audience, and Quick Avatar Panel.
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useMobileGpsMonitorLayoutStore } from "@/lib/commandCenter/mobileGpsMonitorLayoutStore";
import Link from "next/link";
import { AvatarViewer } from "@/components/3d/AvatarLobbyCanvas";
import LivingAvatarStage from "@/components/avatar/LivingAvatarStage";
import RoleGate from "@/components/auth/RoleGate";
import { useAuth } from "@/lib/hooks/useAuth";
import { resolveAvatarItemEconomy } from "@/lib/avatars/AvatarShowroomEconomyPolicy";
import AvatarFaceScanPanel from "@/components/avatar/AvatarFaceScanPanel";
import { FullSpectrumColorPicker } from "@/components/avatar/FullSpectrumColorPicker";
import {
  GLOBAL_STOCK_FACE_PRESETS,
  getStockFacePresetById,
  generateRandomFaceRecipe,
  searchStockFaces,
  type StockFacePreset,
  type FaceMorphologyCategory,
} from "@/lib/avatar/GlobalStockFacePresets";
import {
  GLOBAL_BODY_DIVERSITY_PRESETS,
  DEFAULT_BODY_DIVERSITY_PARAMETERS,
  clampBodyDiversityParameters,
  readPersistedBodyDiversity,
  persistBodyDiversity,
  generateRandomBodyRecipe,
  type BodyDiversityParameters,
  type BodyDiversityPreset,
} from "@/lib/avatar/AvatarBodyTypeEngine";
import {
  BOBBLEHEAD_STATURE_PRESETS,
  DEFAULT_BOBBLEHEAD_STATURE_ID,
  getBobbleheadStaturePreset,
  type BobbleheadStatureId,
} from "@/lib/avatars/BobbleheadProportionLaw";
import {
  applyAvatarMoodPresentation,
  AVATAR_MOOD_SPECS,
  type AvatarMoodId,
  readPersistedAvatarMood,
} from "@/lib/avatars/AvatarMoodPresentation";
import {
  clampShapeCoefficients,
  type FaceIdentityShapeCoefficients,
} from "@/lib/avatar/AvatarFaceIdentityContract";
import {
  persistFaceIdentityProfile,
  readPersistedFaceIdentityProfile,
} from "@/lib/avatars/BobbleheadRuntimeCharacter";
import {
  buildMiniMePreview,
  DEFAULT_MINI_ME_HEAD_SCALE,
  FAKE_MORPH_TARGETS_FORBIDDEN,
  MINI_ME_CREATION_MODES,
} from "@/lib/avatars/MiniMeCreationContracts";
import MiniMeCompanionSurface from "@/components/avatars/MiniMeCompanionSurface";
import {
  BOBBLEHEAD_BASES,
  BOBBLEHEAD_DEFAULT_BASE_ID,
  getBobbleheadBaseById,
  type BobbleheadBase,
} from "@/lib/avatars/BobbleheadBaseRegistry";
import {
  FAN_SKIN_TONE_CONTINUUM,
  getFanCosmeticCatalogStats,
  listActionEmotes,
  listDanceEmotes,
  listEquippableAccessories,
  listEquippableEmotes,
  getFanCosmetic,
  listEquippableHair,
  listEquippableInstruments,
  listEquippableProps,
  listFanCosmeticsByCategory,
  persistFanSkinT,
  readPersistedFanSkinT,
  sampleFanSkinTone,
  type FanCosmeticDef,
} from "@/lib/avatars/FanCosmeticCatalog";
import { cosmeticIdsToAttachments } from "@/lib/avatars/fanAvatarLoadout";
import {
  readSweatFxPreference,
  writeSweatFxPreference,
  type SweatFxPreference,
} from "@/lib/avatars/LivingSkinRuntime";
import {
  persistBobbleheadBaseId,
  readPersistedBobbleheadBaseId,
} from "@/lib/avatars/BobbleheadRuntimeCharacter";
import {
  commitCanonicalDraftToFanWorld,
  getCanonicalAvatarDraft,
  hydrateAvatarDraftFromServerIfLocalMissing,
  hydrateCanonicalAvatarDraft,
  patchCanonicalAvatarDraft,
  persistCanonicalDraftIdentity,
  persistCanonicalDraftToAvatarConfig,
  subscribeCanonicalAvatarDraft,
} from "@/lib/avatars/CanonicalAvatarDraft";
import { migrateAvatarLook } from "@/lib/avatars/AvatarLook";
import {
  gatePreviewAction,
  resolveAvatarPreview,
} from "@/lib/avatars/AvatarPreviewRuntime";
import type { AvatarPreviewAction } from "@/lib/avatars/AvatarPreviewActions";
import { avatarBehavioralDirector } from "@/lib/avatars/AvatarBehavioralDirector";
import {
  resolveCreationCenterCamera,
  resolveShoesCamera,
  resolveUpperBodyCamera,
  type CreationCenterCameraPlan,
} from "@/lib/avatars/CreationCenterStudioCamera";
import {
  FAN_COSMETIC_STORE_HREF,
  splitWearablesForSave,
} from "@/lib/avatars/AvatarWearableCapability";
import {
  STARTING_BASE_OPTIONS,
  STARTING_BASE_STORAGE_KEY,
  isIdentityPreservingOutfit,
} from "@/lib/avatars/FoundryManufacturedCosmetics";
import { resolveBobbleheadBaseRuntimeBinding } from "@/lib/avatars/BobbleheadBaseRuntimeBinding";
import { resolveFoundryV3GlbUrl } from "@/lib/avatars/AvatarFoundryV3Bases";
import AccFoundrySlotGrid from "@/components/avatar/AccFoundrySlotGrid";
import {
  decideShoesForOutfit,
  resolveOutfitFootwearPolicy,
} from "@/lib/foundry/avatar/FootwearOutfitCoordination";
import type { AccSectionId } from "@/lib/foundry/avatar/AccCatalogSlotRuntime";

export type CreatorCategory =
  | "BASES"
  | "BODY"
  | "FACE_SCAN"
  | "FACE"
  | "SKIN"
  | "HAIR"
  | "OUTFITS"
  | "TOPS"
  | "BOTTOMS"
  | "SHOES"
  | "HATS"
  | "ACCESSORIES"
  | "MASKS"
  | "PROPS"
  | "EMOTES"
  | "SAVED_LOOKS"
  | "FOUNDRY";

export type AnimationPose = "idle" | "walk" | "run" | "wave" | "clap" | "dance" | "sit" | "sing";
export type CameraAngle = "front" | "side" | "back" | "closeup" | "fullbody";

function wearableReadiness(item: FanCosmeticDef): "EQUIP-READY" | "MANUFACTURED" | "CATALOG" {
  // Bald = certified clear style (no mesh). Also allow certifiedGlb without glbUrl for clear-slot SKUs.
  if (item.id === "hair_bald" || (item.certifiedGlb && !item.glbUrl && item.equipSlot === "hair")) {
    return "EQUIP-READY";
  }
  if (item.certifiedGlb && item.glbUrl) return "EQUIP-READY";
  if (item.glbUrl) return "MANUFACTURED";
  return "CATALOG";
}

/** Public editor: free / owned / equip-ready only — Marketplace catalog stays out of usable inventory. */
function isUsableInPublicEditor(item: FanCosmeticDef): boolean {
  const eco = resolveAvatarItemEconomy(item.id);
  if (eco?.canEquipPersistently) return true;
  if (eco?.commerceClass === "FREE_BASIC") return true;
  return wearableReadiness(item) === "EQUIP-READY";
}

function poseToClip(pose: AnimationPose): string {
  switch (pose) {
    case "walk":
    case "run":
      return "Walk";
    case "dance":
      return "Dance";
    case "sit":
      return "SeatedIdle";
    case "sing":
      return "SingDemo";
    default:
      return "Idle";
  }
}

function poseToPreviewAction(pose: AnimationPose): AvatarPreviewAction {
  switch (pose) {
    case "sit":
      return "SIT";
    case "walk":
    case "run":
      return "WALK";
    case "wave":
    case "clap":
      return "EMOTE";
    case "dance":
      return "DANCE";
    case "sing":
      return "IDLE";
    default:
      return "IDLE";
  }
}

interface SavedLook {
  id: string;
  name: string;
  baseId: string;
  skinT: number;
  equippedItemId?: string;
  savedAt: number;
}

const SAVED_LOOKS_KEY = "tmi:avatar:saved_looks:v1";

function loadSavedLooks(): SavedLook[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_LOOKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function storeSavedLooks(looks: SavedLook[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SAVED_LOOKS_KEY, JSON.stringify(looks));
  } catch {
    // Ignore storage quota
  }
}

export interface AvatarCreationCenterProps {
  accentColor?: string;
}

export function AvatarCreationCenter({ accentColor = "#AA2DFF" }: AvatarCreationCenterProps) {
  const drawerPresentation = useMobileGpsMonitorLayoutStore((s) => s.drawerPresentation);
  // ── Canonical State ────────────────────────────────────────────────────────
  const [baseId, setBaseId] = useState(() => readPersistedBobbleheadBaseId() || BOBBLEHEAD_DEFAULT_BASE_ID);
  const [skinT, setSkinT] = useState(() => readPersistedFanSkinT());
  const [sweatFxPreference, setSweatFxPreference] = useState<SweatFxPreference>(() =>
    typeof window !== "undefined" ? readSweatFxPreference(window.localStorage) : "FULL",
  );
  const [scanActive, setScanActive] = useState(false);
  const [mood, setMood] = useState<AvatarMoodId>(() =>
    typeof window !== "undefined" ? readPersistedAvatarMood() : "REGULAR",
  );
  const [selectedCategory, setSelectedCategory] = useState<CreatorCategory>("BASES");
  const { role: sessionRole } = useAuth();
  useEffect(() => {
    if (selectedCategory !== "FOUNDRY") return;
    const r = (sessionRole ?? "").toUpperCase();
    if (r !== "ADMIN" && r !== "STAFF") setSelectedCategory("BASES");
  }, [sessionRole, selectedCategory]);
  const [selectedSubTab, setSelectedSubTab] = useState<string>("all");
  const [faceSubMode, setFaceSubMode] = useState<"PRESETS" | "MANUAL" | "SCAN">("PRESETS");
  const [faceMorphFilter, setFaceMorphFilter] = useState<string>("all");
  const [faceSearchTerm, setFaceSearchTerm] = useState<string>("");
  const [bodyDiversity, setBodyDiversity] = useState<BodyDiversityParameters>(() => readPersistedBodyDiversity());
  const [baseGenderFilter, setBaseGenderFilter] = useState<"all" | "female" | "male" | "unisex">("all");
  const [startingBaseChosen, setStartingBaseChosen] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return window.sessionStorage.getItem(STARTING_BASE_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [previewWearableNote, setPreviewWearableNote] = useState<string | null>(null);
  const [bodyGenderFilter, setBodyGenderFilter] = useState<"all" | "female" | "male">("all");
  const [faceGenderFilter, setFaceGenderFilter] = useState<"all" | "female" | "male">("all");
  const [faceAgeFilter, setFaceAgeFilter] = useState<"all" | "youth" | "adult" | "mature">("all");
  const [hairStyleFilter, setHairStyleFilter] = useState<"all" | "textured" | "straight" | "specialty">("all");
  const [activePose, setActivePose] = useState<AnimationPose>("idle");
  const [cameraAngle, setCameraAngle] = useState<CameraAngle>("front");
  const [sideView, setSideView] = useState(false);
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
  const [lookNameInput, setLookNameInput] = useState("");
  const [equipToast, setEquipToast] = useState(false);
  const [draftNote, setDraftNote] = useState<"idle" | "saved">("idle");
  const [equipSaveNote, setEquipSaveNote] = useState<"idle" | "saved" | "failed" | "locked">("idle");
  const [lockedPurchaseId, setLockedPurchaseId] = useState<string | null>(null);
  const [equippedCosmeticId, setEquippedCosmeticId] = useState<string | null>(null);
  const [livingReaction, setLivingReaction] = useState<string | null>(null);
  const [miniMeTalking, setMiniMeTalking] = useState(false);
  const [miniMeSpeechWeights, setMiniMeSpeechWeights] = useState<Record<string, number> | null>(null);
  const [miniMeRustNote, setMiniMeRustNote] = useState<string | null>(null);
  const reactionGen = useRef(0);
  const [angleOverride, setAngleOverride] = useState<CameraAngle | null>(null);
  const [shoesFocus, setShoesFocus] = useState(false);
  const [outfitShoePrompt, setOutfitShoePrompt] = useState<{
    outfitId: string;
    matchedFootwearAssetId: string | null;
  } | null>(null);
  const [equippedShoesId, setEquippedShoesId] = useState<string | null>(null);
  const [upperFocus, setUpperFocus] = useState(false);
  const [hairColorHex, setHairColorHex] = useState<string>(() => getCanonicalAvatarDraft().hairColorHex || "#111111");
  const [eyeColorHex, setEyeColorHex] = useState<string>(() => getCanonicalAvatarDraft().eyeColorHex || "#2C1810");
  const [outfitTintHex, setOutfitTintHex] = useState<string>(() => getCanonicalAvatarDraft().outfitTintHex || "#0a192f");
  const [initialSnapshot, setInitialSnapshot] = useState<{
    baseId: string;
    skinT: number;
    equippedCosmeticId: string | null;
    hairColorHex: string;
    eyeColorHex: string;
    outfitTintHex: string;
  } | null>(null);
  const [faceIdentityTick, setFaceIdentityTick] = useState(0);

  const miniMePreview = useMemo(() => {
    const profile = readPersistedFaceIdentityProfile();
    const to01 = (v: number) => Math.max(0, Math.min(1, (v + 1) / 2));
    return buildMiniMePreview({
      shape: profile?.shapeCoefficients ?? {},
      confidence: profile?.confidence ?? null,
      headToBodyScale: DEFAULT_MINI_ME_HEAD_SCALE,
      body: {
        shoulderWidth: to01(bodyDiversity.shoulderWidth),
        hipWidth: to01(bodyDiversity.hipWidth),
        chestFullness: to01(bodyDiversity.chestFullness),
        bellyFullness: to01(bodyDiversity.bellyFullness),
        waistWidth: to01(bodyDiversity.waistWidth),
        muscularity: to01(bodyDiversity.muscleMass),
        overallFullness: Math.max(-1, Math.min(1, bodyDiversity.bodyMass)),
        legHeight: Math.max(-1, Math.min(1, bodyDiversity.legToTorsoRatio)),
      },
    });
  }, [bodyDiversity, faceIdentityTick, baseId]);

  // Initial load — one canonical draft shared with Quick Panel
  useEffect(() => {
    const hydrated = hydrateCanonicalAvatarDraft();
    setBaseId(hydrated.baseId);
    setSkinT(hydrated.skinT);
    if (hydrated.equippedCosmeticIds[0]) setEquippedCosmeticId(hydrated.equippedCosmeticIds[0]!);
    if (hydrated.hairColorHex) setHairColorHex(hydrated.hairColorHex);
    if (hydrated.eyeColorHex) setEyeColorHex(hydrated.eyeColorHex);
    if (hydrated.outfitTintHex) setOutfitTintHex(hydrated.outfitTintHex);
    setInitialSnapshot({
      baseId: hydrated.baseId,
      skinT: hydrated.skinT,
      equippedCosmeticId: hydrated.equippedCosmeticIds[0] ?? null,
      hairColorHex: hydrated.hairColorHex || "#111111",
      eyeColorHex: hydrated.eyeColorHex || "#2C1810",
      outfitTintHex: hydrated.outfitTintHex || "#0a192f",
    });
    setSavedLooks(loadSavedLooks());
    avatarBehavioralDirector.setContext("CREATION_CENTER");
    let restoredReturn = false;
    try {
      const raw = window.sessionStorage.getItem("tmi_avatar_editor_return_v1");
      if (raw) {
        window.sessionStorage.removeItem("tmi_avatar_editor_return_v1");
        const parsed = JSON.parse(raw) as {
          baseId?: string;
          skinT?: number;
          equippedCosmeticId?: string | null;
          category?: CreatorCategory;
        };
        if (typeof parsed.skinT === "number") {
          patchCanonicalAvatarDraft({
            baseId: typeof parsed.baseId === "string" ? parsed.baseId : hydrated.baseId,
            skinT: parsed.skinT,
            equippedCosmeticIds: parsed.equippedCosmeticId ? [parsed.equippedCosmeticId] : [],
          });
          const returned = getCanonicalAvatarDraft();
          setBaseId(returned.baseId);
          setSkinT(returned.skinT);
          setEquippedCosmeticId(returned.equippedCosmeticIds[0] ?? null);
          if (parsed.category) setSelectedCategory(parsed.category);
          restoredReturn = true;
        }
      }
    } catch {
      restoredReturn = false;
    }
    let cancelled = false;
    if (!restoredReturn) void hydrateAvatarDraftFromServerIfLocalMissing().then((applied) => {
      if (cancelled || !applied) return;
      const next = getCanonicalAvatarDraft();
      setBaseId(next.baseId);
      setSkinT(next.skinT);
      setEquippedCosmeticId(next.equippedCosmeticIds[0] ?? null);
    });
    const unsub = subscribeCanonicalAvatarDraft((next) => {
      setBaseId(next.baseId);
      setSkinT(next.skinT);
      setEquippedCosmeticId(next.equippedCosmeticIds[0] ?? null);
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  useEffect(() => {
    return () => {
      reactionGen.current += 1;
    };
  }, []);
  useEffect(() => {
    const prefs = avatarBehavioralDirector.getPreferences();
    if (prefs.disableAutonomousIdle || prefs.reducedMotion) return;
    const id = window.setInterval(() => {
      if (activePose !== "idle") return;
      const tick = avatarBehavioralDirector.tickIdle();
      if (!tick?.motion) return;
      const gen = ++reactionGen.current;
      setLivingReaction(tick.reaction);
      patchCanonicalAvatarDraft({ previewAction: tick.motion });
      window.setTimeout(() => {
        if (reactionGen.current !== gen) return;
        patchCanonicalAvatarDraft({ previewAction: "IDLE" });
        setLivingReaction(null);
      }, tick.recoveryMs);
    }, 14000);
    return () => window.clearInterval(id);
  }, [activePose]);

  const selectedBase = useMemo(() => getBobbleheadBaseById(baseId) ?? BOBBLEHEAD_BASES[0]!, [baseId]);
  const skin = useMemo(() => sampleFanSkinTone(skinT), [skinT]);
  const stats = useMemo(() => getFanCosmeticCatalogStats(), []);
  const preview = useMemo(() => {
    const shared = getCanonicalAvatarDraft();
    return resolveAvatarPreview({
      ...shared,
      displayName: selectedBase.displayName,
      baseId,
      skinT,
      equippedCosmeticIds: equippedCosmeticId ? [equippedCosmeticId] : [],
      previewAction: poseToPreviewAction(activePose),
      environmentId: "STUDIO_EDITOR",
      fidelity: "full",
      panelTargetId: shared.panelTargetId,
    });
  }, [selectedBase.displayName, baseId, skinT, equippedCosmeticId, activePose]);

  /** Hair/accessory GLB parts for FoundrySkinnedPartMount — independent of FACE/FULL camera. */
  const previewAttachments = useMemo(
    () => cosmeticIdsToAttachments(equippedCosmeticId ? [equippedCosmeticId] : []),
    [equippedCosmeticId],
  );

  const cameraPlan: CreationCenterCameraPlan = useMemo(() => {
    if (shoesFocus || selectedCategory === "SHOES") return resolveShoesCamera();
    return resolveCreationCenterCamera(selectedCategory, angleOverride ?? cameraAngle);
  }, [selectedCategory, angleOverride, cameraAngle, shoesFocus]);

  useEffect(() => {
    setCameraAngle(cameraPlan.angle);
  }, [selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Direct mesh raycast only — NO poke button. Zone comes from Three.js hit. */
  const handleDirectAvatarTouch = useCallback(
    (result: { reaction: string; motion: string | null; recoveryMs: number; zone?: string }) => {
      if (result.recoveryMs <= 0 && !result.motion) {
        setLivingReaction(`${result.zone || "touch"} · ${result.reaction}`);
        window.setTimeout(() => setLivingReaction(null), 900);
        return;
      }
      const gen = ++reactionGen.current;
      setLivingReaction(`${result.zone || "touch"} · ${result.reaction}`);
      if (result.motion) {
        setActivePose(result.reaction === "ARMS_CROSSED" ? "idle" : "wave");
        patchCanonicalAvatarDraft({ previewAction: result.motion as never });
      }
      window.setTimeout(() => {
        if (reactionGen.current !== gen) return;
        setActivePose("idle");
        setLivingReaction(null);
        patchCanonicalAvatarDraft({ previewAction: "IDLE" });
      }, Math.max(result.recoveryMs, 900));
    },
    [],
  );

  // ── Actions & Handlers ──────────────────────────────────────────────────────
  const handleSelectBase = useCallback((base: BobbleheadBase) => {
    setBaseId(base.id);
    patchCanonicalAvatarDraft({ baseId: base.id });
  }, []);

  const handleChooseStartingBase = useCallback((optionId: "male" | "female" | "neutral") => {
    const option = STARTING_BASE_OPTIONS.find((o) => o.id === optionId);
    // Phase 1C: selectable promoted GLBs may be chosen for live cert; meshReady stays false until PASS.
    if (!option?.selectable || !option.bobbleheadBaseId) return;
    const base = getBobbleheadBaseById(option.bobbleheadBaseId);
    if (!base) return;
    try {
      window.sessionStorage.setItem(STARTING_BASE_STORAGE_KEY, optionId);
    } catch {
      // sessionStorage may be blocked
    }
    setStartingBaseChosen(optionId);
    setBaseGenderFilter(optionId === "neutral" ? "unisex" : optionId);
    handleSelectBase(base);
    setSelectedCategory("BASES");
  }, [handleSelectBase]);

  const handleCancelRollback = useCallback(() => {
    if (!initialSnapshot) return;
    setBaseId(initialSnapshot.baseId);
    setSkinT(initialSnapshot.skinT);
    setEquippedCosmeticId(initialSnapshot.equippedCosmeticId);
    setHairColorHex(initialSnapshot.hairColorHex);
    setEyeColorHex(initialSnapshot.eyeColorHex);
    setOutfitTintHex(initialSnapshot.outfitTintHex);
    patchCanonicalAvatarDraft({
      baseId: initialSnapshot.baseId,
      skinT: initialSnapshot.skinT,
      equippedCosmeticIds: initialSnapshot.equippedCosmeticId ? [initialSnapshot.equippedCosmeticId] : [],
      hairColorHex: initialSnapshot.hairColorHex,
      eyeColorHex: initialSnapshot.eyeColorHex,
      outfitTintHex: initialSnapshot.outfitTintHex,
    });
  }, [initialSnapshot]);

  const handleSkinChange = useCallback((t: number) => {
    setSkinT(t);
    persistFanSkinT(t);
    patchCanonicalAvatarDraft({ skinT: t });
  }, []);

  const handleSaveDraftOnly = useCallback(() => {
    patchCanonicalAvatarDraft({
      displayName: selectedBase.displayName,
      baseId,
      skinT,
      equippedCosmeticIds: equippedCosmeticId ? [equippedCosmeticId] : [],
    });
    persistCanonicalDraftIdentity(getCanonicalAvatarDraft());
    setDraftNote("saved");
    window.setTimeout(() => setDraftNote("idle"), 2000);
  }, [baseId, skinT, equippedCosmeticId, selectedBase.displayName]);

  const handleEquipAndSave = useCallback(() => {
    const ids = equippedCosmeticId ? [equippedCosmeticId] : [];
    // Local Fan World persists EQUIP-READY + free Foundry-mapped MANUFACTURED SKUs (live ACC selection).
    // Paid manufactured / locked stay preview-only. Server AvatarConfig POST remains deferred.
    const manufacturedPaidPreviewOnly = ids.filter((id) => {
      const item = getFanCosmetic(id);
      if (!item || wearableReadiness(item) !== "MANUFACTURED") return false;
      return item.rarity !== "free" && item.pointsCost !== 0;
    });
    const equippableIds = ids.filter((id) => {
      const item = getFanCosmetic(id);
      if (!item) return false;
      if (item.equipSlot === "emote") return true;
      const readiness = wearableReadiness(item);
      if (readiness === "EQUIP-READY") return true;
      if (readiness === "MANUFACTURED" && (item.rarity === "free" || item.pointsCost === 0)) {
        return true;
      }
      return false;
    });
    const split = splitWearablesForSave(equippableIds, []);
    patchCanonicalAvatarDraft({
      displayName: selectedBase.displayName,
      baseId,
      skinT,
      hairColorHex,
      eyeColorHex,
      outfitTintHex,
      equippedCosmeticIds: split.committable,
    });
    persistCanonicalDraftIdentity(getCanonicalAvatarDraft());
    const commit = commitCanonicalDraftToFanWorld();
    if (split.locked[0]) setLockedPurchaseId(split.locked[0]);
    else setLockedPurchaseId(null);
    const savedCosmeticId = split.committable[0] ?? null;
    if (!commit.ok) {
      setEquipSaveNote("failed");
      setEquipToast(false);
      setPreviewWearableNote(commit.reason || "Local Fan World commit failed — draft kept in studio.");
      window.setTimeout(() => setEquipSaveNote("idle"), 2800);
      return;
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("bb:loadout:changed", { detail: { baseId, skinT, cosmeticId: savedCosmeticId } }));
      window.dispatchEvent(new CustomEvent("tmi:avatar:equipped", { detail: { baseId, skinT, cosmeticId: savedCosmeticId } }));
    }
    // Local Fan World commit succeeded (draft + equipped look + events).
    // SAFETY: do not POST /api/avatar/config until an isolated test DB is confirmed —
    // report that honestly; never overwrite a successful local equip with "failed".
    setEquippedCosmeticId(savedCosmeticId);
    if (split.locked.length > 0 || manufacturedPaidPreviewOnly.length > 0) {
      setEquipSaveNote("locked");
      setEquipToast(false);
      setPreviewWearableNote(
        manufacturedPaidPreviewOnly.length > 0
          ? "Look saved locally; paid manufactured meshes stayed preview-only until ownership/cert."
          : "Look saved locally; locked SKUs stayed preview-only.",
      );
    } else {
      setEquipSaveNote("saved");
      setEquipToast(true);
      setPreviewWearableNote(
        "Equipped locally to Fan World. Server DB write deferred — isolated test database not confirmed.",
      );
    }
    window.setTimeout(() => {
      setEquipToast(false);
      setEquipSaveNote("idle");
    }, 2800);
  }, [baseId, skinT, equippedCosmeticId, selectedBase.displayName, hairColorHex, eyeColorHex, outfitTintHex]);

  // ── Global Avatar Identity & Body Diversity Handlers (Law Ratification) ───
  const handleSelectStockFace = useCallback((preset: StockFacePreset) => {
    const prior = readPersistedFaceIdentityProfile();
    const base = prior ?? {
      identityId: "preset_" + preset.id + "_" + Date.now().toString(36),
      userId: "fan_local",
      revision: 1,
      baseAvatarId: baseId,
      captureSource: "STOCK_PRESET" as const,
      shapeCoefficients: preset.shapeCoefficients,
      appearance: {
        skinHex: preset.defaultAppearance.skinHex,
        skinSubsurfaceHex: preset.defaultAppearance.skinHex,
        eyeColorHex: preset.defaultAppearance.eyeColorHex,
        browColorHex: preset.defaultAppearance.browColorHex,
        lipColorHex: preset.defaultAppearance.lipColorHex,
        likenessStrength: 0.75,
      },
      anchors: {
        leftEye: [-0.032, 1.12, 0.06] as [number, number, number],
        rightEye: [0.032, 1.12, 0.06] as [number, number, number],
        eyeCenter: [0, 1.12, 0.06] as [number, number, number],
        nose: [0, 1.05, 0.08] as [number, number, number],
        mouth: [0, 0.98, 0.07] as [number, number, number],
        chin: [0, 0.9, 0.05] as [number, number, number],
        headTop: [0, 1.35, 0] as [number, number, number],
        earL: [-0.08, 1.08, 0] as [number, number, number],
        earR: [0.08, 1.08, 0] as [number, number, number],
      },
      confidence: { eyes: 1, nose: 1, mouth: 1, jaw: 1, skin: 1, overall: 1 },
      approvedAt: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    persistFaceIdentityProfile({
      ...base,
      captureSource: "STOCK_PRESET",
      shapeCoefficients: { ...preset.shapeCoefficients },
      revision: (prior?.revision ?? 0) + 1,
      updatedAt: Date.now(),
    });
    patchCanonicalAvatarDraft({ skinT });
    setFaceSubMode("MANUAL"); // Law Section 3: Preset is only the start -> user can immediately edit features!
  }, [baseId, skinT]);

  const handleRandomizeFace = useCallback(() => {
    const randomShape = generateRandomFaceRecipe();
    const prior = readPersistedFaceIdentityProfile();
    const base = prior ?? {
      identityId: "random_face_" + Date.now().toString(36),
      userId: "fan_local",
      revision: 1,
      baseAvatarId: baseId,
      captureSource: "MANUAL_CREATION" as const,
      shapeCoefficients: randomShape,
      appearance: {
        skinHex: skin.hex,
        skinSubsurfaceHex: skin.hex,
        eyeColorHex: "#2C1810",
        browColorHex: "#1A120C",
        lipColorHex: "#8B4A4A",
        likenessStrength: 0.7,
      },
      anchors: {
        leftEye: [-0.032, 1.12, 0.06] as [number, number, number],
        rightEye: [0.032, 1.12, 0.06] as [number, number, number],
        eyeCenter: [0, 1.12, 0.06] as [number, number, number],
        nose: [0, 1.05, 0.08] as [number, number, number],
        mouth: [0, 0.98, 0.07] as [number, number, number],
        chin: [0, 0.9, 0.05] as [number, number, number],
        headTop: [0, 1.35, 0] as [number, number, number],
        earL: [-0.08, 1.08, 0] as [number, number, number],
        earR: [0.08, 1.08, 0] as [number, number, number],
      },
      confidence: { eyes: 1, nose: 1, mouth: 1, jaw: 1, skin: 1, overall: 1 },
      approvedAt: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    persistFaceIdentityProfile({
      ...base,
      shapeCoefficients: randomShape,
      revision: (prior?.revision ?? 0) + 1,
      updatedAt: Date.now(),
    });
    patchCanonicalAvatarDraft({ skinT });
  }, [baseId, skin.hex, skinT]);

  const handleSelectBodyPreset = useCallback((preset: BodyDiversityPreset) => {
    const clamped = clampBodyDiversityParameters(preset.parameters);
    setBodyDiversity(clamped);
    persistBodyDiversity(clamped);
    patchCanonicalAvatarDraft({ skinT });
  }, [skinT]);

  const handleSelectBobbleheadStature = useCallback((statureId: BobbleheadStatureId) => {
    const stature = getBobbleheadStaturePreset(statureId);
    const clamped = clampBodyDiversityParameters({
      ...bodyDiversity,
      heightScale: stature.heightScale,
      legToTorsoRatio: stature.legToTorsoRatio,
      armThickness: stature.armThickness,
      legThickness: stature.legThickness,
      chestFullness: stature.chestFullness,
      bodyMass: stature.bodyMass,
      neckProportions: stature.neckProportions,
      frameWidth: stature.frameWidth,
    });
    setBodyDiversity(clamped);
    persistBodyDiversity(clamped);
    try {
      sessionStorage.setItem("tmi_bobblehead_stature_v1", statureId);
    } catch {
      // Optional persistence.
    }
    patchCanonicalAvatarDraft({ skinT });
  }, [bodyDiversity, skinT]);

  const handleBodyDiversityChange = useCallback((key: keyof BodyDiversityParameters, value: number) => {
    setBodyDiversity((prev) => {
      const next = clampBodyDiversityParameters({ ...prev, [key]: value });
      persistBodyDiversity(next);
      return next;
    });
    patchCanonicalAvatarDraft({ skinT });
  }, [skinT]);

  const handleRandomizeBody = useCallback(() => {
    const randomBody = generateRandomBodyRecipe();
    setBodyDiversity(randomBody);
    persistBodyDiversity(randomBody);
    patchCanonicalAvatarDraft({ skinT });
  }, [skinT]);

  // ── Smart Automation AI Features ───────────────────────────────────────────
  const handleSmartRandomize = useCallback(() => {
    const randomBase = BOBBLEHEAD_BASES[Math.floor(Math.random() * BOBBLEHEAD_BASES.length)]!;
    const randomSkin = Math.random();
    setBaseId(randomBase.id);
    setSkinT(randomSkin);
    persistBobbleheadBaseId(randomBase.id);
    persistFanSkinT(randomSkin);
    patchCanonicalAvatarDraft({ baseId: randomBase.id, skinT: randomSkin });
  }, []);

  const handleSaveLook = useCallback(() => {
    const name = lookNameInput.trim() || `Look #${savedLooks.length + 1}`;
    const newLook: SavedLook = {
      id: `look-${Date.now()}`,
      name,
      baseId,
      skinT,
      equippedItemId: equippedCosmeticId ?? undefined,
      savedAt: Date.now(),
    };
    const updated = [newLook, ...savedLooks.slice(0, 9)];
    setSavedLooks(updated);
    storeSavedLooks(updated);
    setLookNameInput("");
  }, [lookNameInput, savedLooks, baseId, skinT, equippedCosmeticId]);

  const handleLoadLook = useCallback((look: SavedLook) => {
    const migrated = migrateAvatarLook(look);
    const nextBase = migrated?.baseId ?? look.baseId;
    const nextSkin = migrated?.skinT ?? look.skinT;
    const nextCosmetics =
      migrated?.equippedCosmeticIds ?? (look.equippedItemId ? [look.equippedItemId] : []);
    setBaseId(nextBase);
    setSkinT(nextSkin);
    setEquippedCosmeticId(nextCosmetics[0] ?? null);
    patchCanonicalAvatarDraft({
      baseId: nextBase,
      skinT: nextSkin,
      equippedCosmeticIds: nextCosmetics,
    });
  }, []);

  // ── Gender & Hair Filter Resolvers ──────────────────────────────────────────
  const visibleBases = useMemo(() => {
    if (baseGenderFilter === "all") return BOBBLEHEAD_BASES;
    return BOBBLEHEAD_BASES.filter((b) => b.gender === baseGenderFilter);
  }, [baseGenderFilter]);

  const visibleBodyPresets = useMemo(() => {
    if (bodyGenderFilter === "all") return GLOBAL_BODY_DIVERSITY_PRESETS;
    return GLOBAL_BODY_DIVERSITY_PRESETS.filter((p) => p.gender === bodyGenderFilter);
  }, [bodyGenderFilter]);

  // ── Category Cosmetic Resolvers ───────────────────────────────────────────
  // Dedupe by id: listEquippableAccessories already includes glasses/headphones;
  // listEquippableEmotes already includes dance+action — prior concat caused
  // React "two children with the same key" warnings (sunglasses, emote_dance, …).
  const categoryItems: FanCosmeticDef[] = useMemo(() => {
    const uniqueById = (items: FanCosmeticDef[]): FanCosmeticDef[] => {
      const seen = new Set<string>();
      const out: FanCosmeticDef[] = [];
      for (const item of items) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        out.push(item);
      }
      return out;
    };
    switch (selectedCategory) {
      case "HAIR":
        return listEquippableHair();
      case "OUTFITS":
        return uniqueById([...listFanCosmeticsByCategory("outfits"), ...listFanCosmeticsByCategory("clothing")]);
      case "TOPS":
        return uniqueById([...listFanCosmeticsByCategory("tops"), ...listFanCosmeticsByCategory("jackets")]);
      case "BOTTOMS":
        return listFanCosmeticsByCategory("bottoms");
      case "SHOES":
        return listFanCosmeticsByCategory("shoes");
      case "HATS":
        return uniqueById([
          ...listFanCosmeticsByCategory("hats"),
          ...listEquippableAccessories().filter((i) =>
            /hat|cap|beanie|helmet|crown|headwear|snapback/i.test(`${i.id} ${i.label} ${i.slot}`),
          ),
        ]);
      case "ACCESSORIES":
        return uniqueById(
          listEquippableAccessories().filter(
            (i) =>
              !(i.slot === "head" && /hat|cap|beanie|helmet|crown/i.test(i.id + i.label)) &&
              !/mask/i.test(i.id + i.label),
          ),
        );
      case "MASKS":
        return uniqueById(
          [...listEquippableAccessories(), ...listFanCosmeticsByCategory("outfits")].filter((i) =>
            /mask|masquerade|visor/i.test(i.id + i.label),
          ),
        );
      case "PROPS":
        return uniqueById([...listEquippableProps(), ...listEquippableInstruments()]);
      case "EMOTES":
        return uniqueById([...listDanceEmotes(), ...listActionEmotes(), ...listEquippableEmotes()]);
      default:
        return [];
    }
  }, [selectedCategory]);

  return (
    <RoleGate
      allow={["FAN", "USER", "ADMIN", "STAFF"]}
      fallback={
        <div
          style={{
            padding: 24,
            background: "rgba(5,5,16,0.9)",
            border: `1px solid ${accentColor}33`,
            borderRadius: 14,
            fontSize: 12,
            color: "rgba(255,255,255,0.6)",
            textAlign: "center",
          }}
        >
          Avatar creation and customization is Fan-exclusive. Performers operate with verified photo & live camera feeds.
        </div>
      }
    >
      <div
        data-testid="tmi-gamegrade-avatar-creation-center"
        data-save-authority="split-v1"
        data-scan-active={scanActive ? "true" : "false"}
        data-starting-base={startingBaseChosen ?? "required"}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          background: "linear-gradient(180deg, rgba(8,8,24,0.96) 0%, rgba(4,4,12,0.98) 100%)",
          border: `1px solid ${accentColor}44`,
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 24px 60px rgba(0,0,0,0.8)",
          color: "#fff",
          position: "relative",
        }}
      >
        {!startingBaseChosen ? (
          <div
            data-testid="avatar-starting-base-gate"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 40,
              background: "rgba(4,4,14,0.96)",
              borderRadius: 16,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              padding: 24,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.12em", color: "#00FFFF" }}>
              CHOOSE STARTING BASE
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", textAlign: "center", maxWidth: 420 }}>
              Pick Masculine, Feminine, or Neutral Foundry v3 base before customizing. Promoted GLBs are selectable for certification; meshReady stays locked until Creation Center + Hub lobby PASS.
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              {STARTING_BASE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  data-testid={`avatar-starting-base-${option.id}`}
                  data-base-mesh-ready={option.meshReady ? "1" : "0"}
                  data-base-selectable={option.selectable ? "1" : "0"}
                  disabled={!option.selectable}
                  onClick={() => handleChooseStartingBase(option.id)}
                  style={{
                    minWidth: 140,
                    padding: "16px 20px",
                    borderRadius: 12,
                    border: `1px solid ${option.selectable ? "#00FFFF" : "rgba(255,255,255,0.2)"}`,
                    background: option.selectable ? "rgba(0,255,255,0.12)" : "rgba(255,255,255,0.04)",
                    color: "#fff",
                    cursor: option.selectable ? "pointer" : "default",
                    opacity: option.selectable ? 1 : 0.7,
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 900 }}>{option.label}</div>
                  <div style={{ fontSize: 9, marginTop: 6, color: option.meshReady ? "#00FF88" : "#FFB080" }}>
                    {option.meshReady ? "MESH READY" : option.selectable ? "PROMOTED - CERT PENDING" : "NOT MANUFACTURED"}
                  </div>
                  <div style={{ fontSize: 8, marginTop: 4, color: "rgba(255,255,255,0.5)" }}>{option.note}</div>
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {/* Top Header & Fast Save */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            paddingBottom: 12,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.2em", color: "#00FFFF" }}>
                🎮 AVATAR CREATION CENTER
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  background: "rgba(0,255,136,0.15)",
                  color: "#00FF88",
                  padding: "2px 8px",
                  borderRadius: 6,
                  border: "1px solid rgba(0,255,136,0.3)",
                }}
              >
                LIVE GAME RUNTIME
              </span>
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
              Equipped avatar synchronizes across Fan Lobbies, Live Venues, Arena Crowd, and Quick Panels.
            </div>
          </div>

          {/* Quick Automation & Equip Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              data-testid="tmi-avatar-randomize"
              onClick={handleSmartRandomize}
              title="Smart Randomize within canonical traits"
              style={{
                fontSize: 9,
                fontWeight: 800,
                padding: "6px 12px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#FFD700",
                cursor: "pointer",
              }}
            >
              RANDOMIZE
            </button>
            <button
              type="button"
              data-testid="tmi-avatar-reset"
              onClick={handleCancelRollback}
              title="Restore the avatar that was open when this editor loaded"
              style={{
                fontSize: 9,
                fontWeight: 800,
                padding: "6px 12px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              RESET
            </button>
            <button
              type="button"
              data-testid="tmi-avatar-save-draft"
              data-draft-note={draftNote}
              onClick={handleSaveDraftOnly}
              title="Save the draft in this editor. Does not equip or publish."
              style={{
                fontSize: 9,
                fontWeight: 800,
                padding: "6px 12px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#00FFFF",
                cursor: "pointer",
              }}
            >
              {draftNote === "saved" ? "DRAFT SAVED" : "SAVE DRAFT"}
            </button>

            <button
              type="button"
              data-testid="tmi-avatar-equip-save-btn"
              data-equip-save={equipSaveNote}
              onClick={handleEquipAndSave}
              style={{
                fontSize: 10,
                fontWeight: 900,
                padding: "8px 18px",
                borderRadius: 8,
                background: equipToast ? "#00FF88" : "linear-gradient(135deg, #00FFFF, #AA2DFF)",
                color: "#050510",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 0 16px rgba(0,255,255,0.3)",
              }}
            >
              {equipToast || equipSaveNote === "saved"
                ? "✓ EQUIPPED LOCALLY"
                : equipSaveNote === "failed"
                  ? "SAVE FAILED — DRAFT KEPT"
                  : equipSaveNote === "locked"
                    ? "✓ LOOK SAVED (LOCKED SKUS SKIPPED)"
                    : "💾 EQUIP & SAVE"}
            </button>
          </div>
          {lockedPurchaseId ? (
            <div data-testid="avatar-locked-purchase" style={{ marginTop: 8, fontSize: 11, color: "#FFD700" }}>
              {getFanCosmetic(lockedPurchaseId)?.label ?? lockedPurchaseId} is locked
              {getFanCosmetic(lockedPurchaseId)?.pointsCost ? ` (${getFanCosmetic(lockedPurchaseId)?.pointsCost} pts)` : ""}.
              Skin and free items stayed saved in this editor.
              <button
                type="button"
                data-testid="avatar-locked-purchase-go"
                onClick={() => {
                  if (typeof window === "undefined") return;
                  window.sessionStorage.setItem("tmi_avatar_editor_return_v1", JSON.stringify({
                    baseId,
                    skinT,
                    equippedCosmeticId: lockedPurchaseId,
                    category: selectedCategory,
                  }));
                  window.location.assign(`${FAN_COSMETIC_STORE_HREF}?avatarReturn=1`);
                }}
                style={{ marginLeft: 8, fontWeight: 800, color: "#050510", background: "#FFD700", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}
              >
                Purchase
              </button>
            </div>
          ) : null}
        </div>

        {/* ── Main Workspace: 3D Canvas Viewport + Customizer Grid ────────── */}
        <style>{`
          .tmi-avatar-studio-grid {
            display: grid;
            grid-template-columns: 168px minmax(280px, 1.45fr) minmax(240px, 0.85fr);
            grid-template-areas: "cats stage inspector";
            gap: 12px;
            min-width: 0;
          }
          .tmi-avatar-studio-categories { grid-area: cats; display: flex; flex-direction: column; gap: 4px; }
          .tmi-avatar-studio-stage { grid-area: stage; min-width: 0; }
          .tmi-avatar-studio-inspector { grid-area: inspector; min-width: 0; overflow: auto; }
          @media (min-width: 700px) and (max-width: 1099px) {
            .tmi-avatar-studio-grid {
              grid-template-columns: minmax(0, 1.35fr) minmax(220px, 0.85fr);
              grid-template-areas: "cats cats" "stage inspector";
            }
            .tmi-avatar-studio-categories { flex-direction: row; overflow-x: auto; }
          }
          @media (max-width: 699px) {
            .tmi-avatar-studio-grid {
              grid-template-columns: minmax(0, 1fr);
              grid-template-areas: "stage" "cats" "inspector";
            }
            .tmi-avatar-studio-categories { flex-direction: row; overflow-x: auto; }
          }
        `}</style>
        <div className="tmi-avatar-studio-grid" data-studio-layout="three-column">
          <nav className="tmi-avatar-studio-categories" aria-label="Creation categories">
            {(
              [
                { id: "BASES", label: "Bases" },
                { id: "FACE", label: "Face" },
                { id: "FACE_SCAN", label: "Scan" },
                { id: "SKIN", label: "Skin" },
                { id: "HAIR", label: "Hair" },
                { id: "OUTFITS", label: "Outfits" },
                { id: "TOPS", label: "Tops" },
                { id: "BOTTOMS", label: "Bottoms" },
                { id: "SHOES", label: "Shoes" },
                { id: "HATS", label: "Hats" },
                { id: "ACCESSORIES", label: "Accessories" },
                { id: "MASKS", label: "Masks" },
                { id: "PROPS", label: "Props" },
                { id: "EMOTES", label: "Emotes" },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                type="button"
                data-testid={`avatar-cat-${cat.id}`}
                onClick={() => {
                  setSelectedCategory(cat.id as CreatorCategory);
                  setAngleOverride(null);
                  setShoesFocus(cat.id === "SHOES");
                  setSideView(false);
                }}
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textAlign: "left",
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: `1px solid ${selectedCategory === cat.id ? "#00FFFF" : "rgba(255,255,255,0.12)"}`,
                  background: selectedCategory === cat.id ? "rgba(0,255,255,0.16)" : "rgba(255,255,255,0.03)",
                  color: selectedCategory === cat.id ? "#00FFFF" : "rgba(255,255,255,0.72)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {cat.label}
              </button>
            ))}
            {/* Manufacturing lives in private Foundry — ACC only consumes published catalog slots. */}
            <RoleGate allow={["ADMIN", "STAFF"]}>
              <Link
                href="/admin/foundry"
                data-testid="avatar-cat-FOUNDRY-link"
                data-foundry-internal="1"
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textAlign: "left",
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,215,0,0.25)",
                  background: "rgba(255,215,0,0.04)",
                  color: "rgba(255,215,0,0.75)",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                Foundry · Private →
              </Link>
            </RoleGate>
          </nav>
          <div className="tmi-avatar-studio-stage" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              className="tmi-avatar-stage"
              data-live-preview-id="avatar-stage"
              data-live-preview-binding="DRAWER_LIVE_PREVIEW_BINDING_LAW_v1"
              style={{
                position: "relative",
                height: drawerPresentation === "fullscreen" ? "min(62dvh, 760px)" : drawerPresentation === "expanded" ? "min(48dvh, 560px)" : 320,
                borderRadius: 14,
                border: "1px solid rgba(0,255,255,0.35)",
                background: "#050510",
                overflow: "hidden",
                boxShadow: "inset 0 0 40px rgba(0,0,0,0.8)",
              }}
            >
              {/* ONE persistent Avatar — click/tap the MESH (raycast), never a poke button */}
              <div
                style={{ width: "100%", height: "100%" }}
                data-creation-center-camera={cameraPlan.label}
                data-lighting-bias={cameraPlan.lightingBias}
                data-avatar-poke-button="0"
                data-direct-touch="1"
                data-testid="mini-me-creation-preview"
                data-mini-me-head-scale={String(miniMePreview.headScale)}
                data-mini-me-layer-ok={miniMePreview.layerSeparationOk ? "1" : "0"}
                data-mini-me-live-asset-switches={miniMePreview.liveAssetSwitches ? "1" : "0"}
                data-mini-me-fake-morphs-forbidden={FAKE_MORPH_TARGETS_FORBIDDEN ? "1" : "0"}
                data-mini-me-modes={MINI_ME_CREATION_MODES.join(",")}
                data-mini-me-integration-glb={miniMePreview.integrationGlb ?? ""}
              >
                <LivingAvatarStage accent={accentColor}>
                  <AvatarViewer
                    {...(preview.rigProps ?? {})}
                    glbUrl={
                      // Urban Cap = dedicated certified GLB. All other free bases = Foundry v3 by gender.
                      // Do not let certified bobblehead_v0 overwrite a resolved v3 presentation mesh.
                      baseId === "bh-urban-cap-male"
                        ? "/models/avatars/bobblehead_urban_cap_v1.glb"
                        : resolveFoundryV3GlbUrl(selectedBase.gender) ||
                          preview.rigProps?.glbUrl
                    }
                    attachments={previewAttachments}
                    hairColor={hairColorHex}
                    fill
                    showroomMode
                    enableOrbit={true}
                    cameraFocus={cameraPlan.focus}
                    cameraSide={sideView}
                    activeClip={poseToClip(activePose)}
                    isPlaying={activePose !== "idle" || Boolean(livingReaction)}
                    expression={AVATAR_MOOD_SPECS[mood].foundryExpression}
                    mood={mood}
                    talking={miniMeTalking}
                    speechArkitWeights={miniMeSpeechWeights}
                    sweatFxPreference={sweatFxPreference}
                    enableDirectTouch
                    onDirectTouch={handleDirectAvatarTouch}
                  />
                </LivingAvatarStage>
              </div>

              <div style={{ marginTop: 8, marginBottom: 8 }}>
                <MiniMeCompanionSurface
                  ownerUserId="fan_local"
                  companionId={`mini:${baseId}`}
                  micSurface="AVATAR_CREATION_CENTER"
                  speechSurface="AVATAR_CREATION_CENTER"
                  onVocalPlayback={(ev) => {
                    setMiniMeTalking(ev.talking);
                    setMiniMeSpeechWeights(ev.speechArkitWeights);
                    if (ev.talking) {
                      setLivingReaction("giggle");
                      setActivePose("wave");
                    }
                  }}
                  onIdleAction={(kind) => {
                    if (kind && kind !== "SUBTLE_BREATHE" && kind !== "YIELD_OWNER_INPUT") {
                      setLivingReaction(kind.toLowerCase());
                      setActivePose(kind.includes("DANCE") ? "dance" : "wave");
                    }
                  }}
                  onRustPresentation={(sev, welcome) => {
                    setMiniMeRustNote(welcome ?? (sev ? `Rust: ${sev}` : null));
                    if (sev === "FUNNY_FORGETFUL" || sev === "NEEDS_REMINDER") {
                      setLivingReaction("confused");
                    } else if (sev === "SLIGHTLY_RUSTY") {
                      setLivingReaction("giggle");
                    }
                  }}
                />
                {miniMeRustNote ? (
                  <div data-testid="mini-me-creation-rust-note" style={{ marginTop: 6, fontSize: 10, color: "#FF2DAA", fontWeight: 700 }}>
                    {miniMeRustNote}
                  </div>
                ) : null}
              </div>
              
              <div data-mood-preview="1" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 9, fontWeight: 900, color: "#FFD700", letterSpacing: "0.08em", width: "100%" }}>
                  MY DIGITAL SELF — MOOD (same person)
                </span>
                {(Object.keys(AVATAR_MOOD_SPECS) as AvatarMoodId[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    data-testid={`avatar-mood-${m}`}
                    onClick={() => {
                      setMood(m);
                      const spec = applyAvatarMoodPresentation({ mood: m, persist: true });
                      patchCanonicalAvatarDraft({ previewAction: spec.previewAction });
                      setActivePose(m === "SILLY" ? "dance" : m === "HAPPY" ? "wave" : "idle");
                    }}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: "1px solid " + (mood === m ? "#FFD700" : "rgba(255,255,255,0.2)"),
                      background: mood === m ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.05)",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {AVATAR_MOOD_SPECS[m].label}
                  </button>
                ))}
              </div>

              {/* Studio floor / platform cue */}
              <div
                aria-hidden
                style={{
                  pointerEvents: "none",
                  position: "absolute",
                  left: "12%",
                  right: "12%",
                  bottom: 52,
                  height: 18,
                  borderRadius: "50%",
                  background: "radial-gradient(ellipse at center, rgba(0,255,255,0.22) 0%, transparent 70%)",
                  boxShadow: "0 0 24px rgba(170,45,255,0.25)",
                }}
              />

              {/* Viewport Overlay HUD */}
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  background: "rgba(0,0,0,0.65)",
                  padding: "4px 8px",
                  borderRadius: 6,
                  backdropFilter: "blur(4px)",
                }}
              >
                <span style={{ fontSize: 9, fontWeight: 900, color: "#fff" }}>
                  {selectedBase.displayName}
                </span>
                <span style={{ fontSize: 8, color: "#00FF88", fontWeight: 700 }}>
                  ARKit-52 · {selectedBase.previewHonestyLabel}
                </span>
                <span style={{ fontSize: 7, color: "#00FFFF", fontWeight: 700, letterSpacing: "0.06em" }}>
                  CAM / {cameraPlan.label.toUpperCase()}
                </span>
                {livingReaction && (
                  <span style={{ fontSize: 7, color: "#FFB8E6", fontWeight: 700 }}>
                    LIVE · {livingReaction}
                  </span>
                )}
              </div>

                            {/* Luminous Showcase Platform Grounding Disc */}
              <div
                style={{
                  position: "absolute",
                  bottom: 50,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 140,
                  height: 20,
                  borderRadius: "50%",
                  background: "radial-gradient(ellipse, rgba(0,255,255,0.3) 0%, rgba(170,45,255,0.12) 60%, transparent 80%)",
                  boxShadow: "0 0 20px rgba(0,255,255,0.35), inset 0 0 8px rgba(0,255,255,0.5)",
                  border: "1px solid rgba(0,255,255,0.35)",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />

              {/* 360 Showcase Camera Presets Bar */}
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  display: "flex",
                  gap: 3,
                  background: "rgba(0,0,0,0.75)",
                  padding: "4px 6px",
                  borderRadius: 8,
                  border: "1px solid rgba(0,255,255,0.25)",
                  backdropFilter: "blur(8px)",
                  zIndex: 10,
                }}
              >
                {[
                  { id: "face", label: "👁️ FACE", focus: "face", angle: "closeup" as CameraAngle, shoes: false, upper: false, side: false },
                  { id: "side", label: "👁 SIDE", focus: "face", angle: "side" as CameraAngle, shoes: false, upper: false, side: true },
                  { id: "upper", label: "👕 UPPER", focus: "upper", angle: "front" as CameraAngle, shoes: false, upper: true, side: false },
                  { id: "body", label: "🧍 FULL", focus: "body", angle: "fullbody" as CameraAngle, shoes: false, upper: false, side: false },
                  { id: "shoes", label: "👟 SHOES", focus: "feet", angle: "front" as CameraAngle, shoes: true, upper: false, side: false },
                  { id: "orbit", label: "🔄 360°", focus: "body", angle: "front" as CameraAngle, shoes: false, upper: false, side: false },
                ].map((preset) => {
                  const isActive =
                    preset.id === "shoes"
                      ? shoesFocus
                      : preset.id === "upper"
                        ? upperFocus
                        : preset.id === "side"
                          ? sideView
                          : preset.id === "face"
                            ? cameraPlan.focus === "face" && !sideView && !shoesFocus && !upperFocus
                            : preset.id === "body"
                              ? cameraPlan.focus === "body" && !shoesFocus && !upperFocus
                              : false;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      data-testid={`avatar-camera-${preset.id}`}
                      onClick={() => {
                        setShoesFocus(preset.shoes);
                        setUpperFocus(preset.upper);
                        setSideView(preset.side);
                        setCameraAngle(preset.angle);
                        setAngleOverride(preset.angle);
                      }}
                      style={{
                        fontSize: 8,
                        fontWeight: 900,
                        textTransform: "uppercase",
                        padding: "3px 6px",
                        borderRadius: 5,
                        border: `1px solid ${isActive ? "#00FFFF" : "rgba(255,255,255,0.12)"}`,
                        background: isActive ? "rgba(0,255,255,0.25)" : "rgba(255,255,255,0.05)",
                        color: isActive ? "#00FFFF" : "rgba(255,255,255,0.75)",
                        cursor: "pointer",
                      }}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Live Pose & Animation Testing Bar */}
              <div
                style={{
                  position: "absolute",
                  bottom: 10,
                  left: 10,
                  right: 10,
                  background: "rgba(0,0,0,0.75)",
                  padding: "6px 10px",
                  borderRadius: 8,
                  backdropFilter: "blur(6px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em" }}>
                  ANIMATION POSE:
                </span>
                <div style={{ display: "flex", gap: 4, overflowX: "auto" }}>
                  {(["idle", "walk", "sing", "run", "wave", "clap", "dance", "sit"] as AnimationPose[]).map((pose) => {
                    const action = poseToPreviewAction(pose);
                    const gate = gatePreviewAction(action, preview.viewport);
                    return (
                    <button
                      key={pose}
                      type="button"
                      data-testid={`avatar-pose-${pose}`}
                      disabled={!gate.allowed}
                      title={gate.allowed ? pose : gate.reason ?? "Not available on production rig"}
                      onClick={() => {
                        if (!gate.allowed) return;
                        setActivePose(pose);
                        patchCanonicalAvatarDraft({ previewAction: action });
                      }}
                      style={{
                        fontSize: 8,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        padding: "3px 8px",
                        borderRadius: 4,
                        border: `1px solid ${activePose === pose ? "#AA2DFF" : "rgba(255,255,255,0.12)"}`,
                        background: activePose === pose ? "rgba(170,45,255,0.3)" : "rgba(255,255,255,0.04)",
                        color: !gate.allowed
                          ? "rgba(255,255,255,0.28)"
                          : activePose === pose
                            ? "#FFB8E6"
                            : "rgba(255,255,255,0.7)",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        opacity: gate.allowed ? 1 : 0.55,
                      }}
                    >
                      {pose}
                    </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Saved Looks Quick Strip */}
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: 10,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: "#FFD700" }}>
                  ⭐ SAVED LOOKS & PRESETS
                </span>
                <div style={{ display: "flex", gap: 4 }}>
                  <input
                    type="text"
                    placeholder="Look Name..."
                    value={lookNameInput}
                    onChange={(e) => setLookNameInput(e.target.value)}
                    style={{
                      background: "rgba(0,0,0,0.5)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: 4,
                      fontSize: 8,
                      padding: "2px 6px",
                      color: "#fff",
                      width: 90,
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSaveLook}
                    style={{
                      fontSize: 8,
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: "#FFD700",
                      color: "#050510",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    + SAVE
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
                {savedLooks.length === 0 ? (
                  <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>
                    No saved looks yet. Name and save your favorite loadouts above.
                  </span>
                ) : (
                  savedLooks.map((look) => (
                    <button
                      key={look.id}
                      type="button"
                      onClick={() => handleLoadLook(look)}
                      style={{
                        fontSize: 8,
                        fontWeight: 800,
                        padding: "4px 8px",
                        borderRadius: 6,
                        background: "rgba(255,215,0,0.1)",
                        border: "1px solid rgba(255,215,0,0.3)",
                        color: "#FFD700",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {look.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="tmi-avatar-studio-inspector" style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Category Workspace Container */}
            <div
              style={{
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: 14,
                minHeight: 320,
              }}
            >
              {/* 1. BASES */}
              {selectedCategory === "BASES" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.1em" }}>
                    CHANGE STARTING BASE
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {STARTING_BASE_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        data-testid={`avatar-change-starting-base-${option.id}`}
                        data-base-mesh-ready={option.meshReady ? "1" : "0"}
                        disabled={!option.selectable}
                        onClick={() => handleChooseStartingBase(option.id)}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 8,
                          border: `1px solid ${startingBaseChosen === option.id ? "#00FFFF" : "rgba(255,255,255,0.15)"}`,
                          background: startingBaseChosen === option.id ? "rgba(0,255,255,0.14)" : "rgba(255,255,255,0.03)",
                          color: "#fff",
                          cursor: option.meshReady ? "pointer" : "default",
                          opacity: option.meshReady ? 1 : 0.65,
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 900 }}>{option.label}</div>
                        <div style={{ fontSize: 8, color: option.meshReady ? "#00FF88" : "#FFB080" }}>
                          {option.meshReady ? "MESH READY" : option.selectable ? "CERT PENDING" : "Not manufactured"}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.1em", marginTop: 4 }}>
                    AVAILABLE AVATAR BASES
                  </div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.55)", lineHeight: 1.35 }}>
                    A card is selectable only when a real mesh is bound. Concept names and female catalog refs stay unavailable until a female base GLB exists.
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(108px, 1fr))", gap: 6 }}>
                    {visibleBases.map((b) => {
                      const binding = resolveBobbleheadBaseRuntimeBinding(b);
                      const meshReady = binding.selectable;
                      const stateLabel = !meshReady
                        ? "Unavailable"
                        : baseId === b.id
                          ? "Selected"
                          : binding.stateLabel;
                      return (
                      <button
                        key={b.id}
                        type="button"
                        data-testid={`avatar-base-${b.id}`}
                        data-base-state={stateLabel.toLowerCase()}
                        data-base-gender={b.gender}
                        disabled={!meshReady}
                        onClick={() => {
                          if (!meshReady) return;
                          handleSelectBase(b);
                        }}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: 4,
                          padding: "8px 8px",
                          borderRadius: 8,
                          border: `1px solid ${baseId === b.id && meshReady ? "#00FFFF" : "rgba(255,255,255,0.1)"}`,
                          background: baseId === b.id && meshReady ? "rgba(0,255,255,0.15)" : "rgba(255,255,255,0.03)",
                          cursor: meshReady ? "pointer" : "default",
                          textAlign: "left",
                          opacity: meshReady ? 1 : 0.55,
                        }}
                      >
                        <span style={{ fontSize: 10, fontWeight: 900, color: "#fff" }}>
                          {b.displayName}
                        </span>
                        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.45)" }}>{b.gender}</span>
                        <span style={{ fontSize: 8, color: meshReady ? "#00FF88" : "#FFB080", fontWeight: 800 }}>
                          {stateLabel}
                        </span>
                      </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. FACE SCAN / AUTO CREATE */}
              {/* 1B. BODY DIVERSITY (Law Section 7–10) */}
              {selectedCategory === "BODY" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.1em" }}>
                        BOBBLEHEAD SILHOUETTE — CANONICAL 26-BONE RIG
                      </div>
                      <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                        Photoreal faces + stubby thick bodies (2.3–3.2 head-heights). Ref: BobbleHead Avatar extras 1.
                        Never normal-human stretch.
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        onClick={handleRandomizeBody}
                        style={{
                          fontSize: 8,
                          fontWeight: 800,
                          padding: "4px 8px",
                          borderRadius: 6,
                          background: "rgba(0,255,255,0.15)",
                          border: "1px solid #00FFFF",
                          color: "#00FFFF",
                          cursor: "pointer",
                        }}
                      >
                        🎲 RANDOMIZE BODY
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBodyDiversity(DEFAULT_BODY_DIVERSITY_PARAMETERS);
                          persistBodyDiversity(DEFAULT_BODY_DIVERSITY_PARAMETERS);
                          patchCanonicalAvatarDraft({ skinT });
                        }}
                        style={{
                          fontSize: 8,
                          fontWeight: 800,
                          padding: "4px 8px",
                          borderRadius: 6,
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          color: "#fff",
                          cursor: "pointer",
                        }}
                      >
                        RESET
                      </button>
                    </div>
                  </div>

                  {/* Stature presets — Extra Stubby / Classic / Tall (same skeleton) */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }} data-testid="bobblehead-stature-rail">
                    <div style={{ fontSize: 9, fontWeight: 800, color: "#00FF88", textTransform: "uppercase" }}>
                      Bobblehead Stature · One Skeleton · Three Heights
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 6 }}>
                      {BOBBLEHEAD_STATURE_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          data-bobblehead-stature={preset.id}
                          onClick={() => handleSelectBobbleheadStature(preset.id)}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            padding: 8,
                            borderRadius: 6,
                            border: "1px solid rgba(0,255,136,0.35)",
                            background: "rgba(0,255,136,0.07)",
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          <span style={{ fontSize: 9, fontWeight: 800, color: "#00FF88" }}>{preset.label}</span>
                          <span style={{ fontSize: 7, color: "rgba(255,255,255,0.55)", marginTop: 2, lineHeight: 1.25 }}>
                            {preset.targetHeadHeights.toFixed(2)} heads · {preset.description}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)" }}>
                      Default: {getBobbleheadStaturePreset(DEFAULT_BOBBLEHEAD_STATURE_ID).label}. Width/depth/thickness
                      sliders stay inside the stubby silhouette — never long limbs.
                    </div>
                  </div>

                  {/* Body Diversity Presets Rail */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                      <div style={{ fontSize: 9, fontWeight: 800, color: "#FFD700", textTransform: "uppercase" }}>
                        Body Presets ({visibleBodyPresets.length} of {GLOBAL_BODY_DIVERSITY_PRESETS.length})
                      </div>
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>GENDER:</span>
                        {[
                          { id: "all", label: `ALL (${GLOBAL_BODY_DIVERSITY_PRESETS.length})` },
                          { id: "female", label: `👩 GIRLS (${GLOBAL_BODY_DIVERSITY_PRESETS.filter(p => p.gender === "female").length})` },
                          { id: "male", label: `👨 BOYS (${GLOBAL_BODY_DIVERSITY_PRESETS.filter(p => p.gender === "male").length})` },
                        ].map((pill) => (
                          <button
                            key={pill.id}
                            type="button"
                            onClick={() => setBodyGenderFilter(pill.id as any)}
                            style={{
                              fontSize: 8,
                              fontWeight: 800,
                              padding: "3px 8px",
                              borderRadius: 4,
                              background: bodyGenderFilter === pill.id ? "#FFD700" : "rgba(255,255,255,0.06)",
                              color: bodyGenderFilter === pill.id ? "#050510" : "rgba(255,255,255,0.7)",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            {pill.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 6, maxHeight: 130, overflowY: "auto" }}>
                      {visibleBodyPresets.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectBodyPreset(p)}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            padding: 8,
                            borderRadius: 6,
                            border: "1px solid rgba(255,215,0,0.3)",
                            background: "rgba(255,215,0,0.06)",
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          <span style={{ fontSize: 9, fontWeight: 800, color: "#FFD700" }}>{p.label}</span>
                          <span style={{ fontSize: 7, color: "rgba(255,255,255,0.5)", marginTop: 2, lineHeight: 1.2 }}>
                            {p.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Continuous Sliders */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, maxHeight: 280, overflowY: "auto", paddingRight: 4 }}>
                    {(
                      [
                        ["heightScale", "Height (0.68× → 1.32×)", 0.68, 1.32, 0.02],
                        ["legToTorsoRatio", "Leg / Torso Ratio", -0.6, 0.6, 0.02],
                        ["frameWidth", "Frame Width (Narrow → Broad)", -0.85, 0.95, 0.02],
                        ["shoulderWidth", "Shoulder Breadth", -0.85, 0.95, 0.02],
                        ["bodyMass", "Body Mass (Slim → Heavy)", -0.85, 1.0, 0.02],
                        ["muscleMass", "Muscle Definition / Mass", -0.8, 0.95, 0.02],
                        ["bellyFullness", "Belly Fullness (Flat → Big Belly)", -0.8, 1.0, 0.02],
                        ["chestFullness", "Chest / Torso Depth", -0.8, 0.95, 0.02],
                        ["waistWidth", "Waist Width (Tapered → Thick)", -0.85, 0.95, 0.02],
                        ["hipWidth", "Hip Width (Narrow → Full)", -0.85, 0.95, 0.02],
                        ["armThickness", "Arm Thickness", -0.8, 0.95, 0.02],
                        ["legThickness", "Leg Thickness", -0.8, 0.95, 0.02],
                        ["neckProportions", "Neck (Slender → Stout)", -0.7, 0.85, 0.02],
                      ] as Array<[keyof BodyDiversityParameters, string, number, number, number]>
                    ).map(([key, label, min, max, step]) => (
                      <label key={key} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.7)" }}>
                          {label}: {Number(bodyDiversity[key] ?? 0).toFixed(2)}
                        </span>
                        <input
                          type="range"
                          min={min}
                          max={max}
                          step={step}
                          value={Number(bodyDiversity[key] ?? 0)}
                          onChange={(e) => handleBodyDiversityChange(key, Number(e.target.value))}
                          style={{ width: "100%", accentColor: "#00FFFF" }}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. FACE STUDIO (Law Sections 1–6, 12, 13) */}
              {selectedCategory === "FACE" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* Three Identity Starting Paths Banner (Law Section 1) */}
                  <div style={{ display: "flex", gap: 6, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 8 }}>
                    {[
                      { id: "PRESETS", label: "🎭 STOCK PRESETS", desc: "Start from global faces" },
                      { id: "MANUAL", label: "🛠️ BUILD MY FACE", desc: "Fine-tune all features" },
                      { id: "SCAN", label: "📸 OPTIONAL SCAN", desc: "Photo-assisted fit" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFaceSubMode(tab.id as any)}
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          padding: "6px 4px",
                          borderRadius: 6,
                          border: `1px solid ${faceSubMode === tab.id ? "#00FFFF" : "rgba(255,255,255,0.15)"}`,
                          background: faceSubMode === tab.id ? "rgba(0,255,255,0.15)" : "rgba(255,255,255,0.03)",
                          color: faceSubMode === tab.id ? "#00FFFF" : "rgba(255,255,255,0.7)",
                          cursor: "pointer",
                        }}
                      >
                        <span style={{ fontSize: 9, fontWeight: 900 }}>{tab.label}</span>
                        <span style={{ fontSize: 7, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{tab.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* SubMode A: Global Stock Face Library */}
                  {faceSubMode === "PRESETS" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span style={{ fontSize: 10, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.1em" }}>
                            GLOBAL STOCK FACE LIBRARY ({GLOBAL_STOCK_FACE_PRESETS.length} PRESETS)
                          </span>
                          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                            Law: Presets never lock features. Pick the closest starting face, then edit freely!
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            handleRandomizeFace();
                            setFaceSubMode("MANUAL");
                          }}
                          style={{
                            fontSize: 8,
                            fontWeight: 800,
                            padding: "4px 8px",
                            borderRadius: 6,
                            background: "rgba(0,255,255,0.15)",
                            border: "1px solid #00FFFF",
                            color: "#00FFFF",
                            cursor: "pointer",
                          }}
                        >
                          🎲 RANDOMIZE FACE
                        </button>
                      </div>

                      {/* Search & Filter Bars */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <input
                          type="text"
                          placeholder="Search morphology (oval, chiseled, full lips, broad, african, european, asian)..."
                          value={faceSearchTerm}
                          onChange={(e) => setFaceSearchTerm(e.target.value)}
                          style={{
                            width: "100%",
                            background: "rgba(0,0,0,0.5)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: 6,
                            padding: "4px 8px",
                            fontSize: 9,
                            color: "#fff",
                          }}
                        />
                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                          {/* Gender Filter */}
                          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>GENDER:</span>
                            {[
                              { id: "all", label: `ALL (${GLOBAL_STOCK_FACE_PRESETS.length})` },
                              { id: "female", label: `👩 GIRLS (${GLOBAL_STOCK_FACE_PRESETS.filter(f => f.gender === "female").length})` },
                              { id: "male", label: `👨 BOYS (${GLOBAL_STOCK_FACE_PRESETS.filter(f => f.gender === "male").length})` },
                            ].map((pill) => (
                              <button
                                key={pill.id}
                                type="button"
                                onClick={() => setFaceGenderFilter(pill.id as any)}
                                style={{
                                  fontSize: 8,
                                  fontWeight: 800,
                                  padding: "3px 8px",
                                  borderRadius: 4,
                                  background: faceGenderFilter === pill.id ? "#00FFFF" : "rgba(255,255,255,0.06)",
                                  color: faceGenderFilter === pill.id ? "#050510" : "rgba(255,255,255,0.7)",
                                  border: "none",
                                  cursor: "pointer",
                                }}
                              >
                                {pill.label}
                              </button>
                            ))}
                          </div>

                          {/* Age Filter */}
                          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>AGE:</span>
                            {[
                              { id: "all", label: "ALL AGES" },
                              { id: "youth", label: "🌟 YOUTH" },
                              { id: "adult", label: "👤 ADULT" },
                              { id: "mature", label: "👑 MATURE" },
                            ].map((pill) => (
                              <button
                                key={pill.id}
                                type="button"
                                onClick={() => setFaceAgeFilter(pill.id as any)}
                                style={{
                                  fontSize: 8,
                                  fontWeight: 800,
                                  padding: "3px 8px",
                                  borderRadius: 4,
                                  background: faceAgeFilter === pill.id ? "#FFD700" : "rgba(255,255,255,0.06)",
                                  color: faceAgeFilter === pill.id ? "#050510" : "rgba(255,255,255,0.7)",
                                  border: "none",
                                  cursor: "pointer",
                                }}
                              >
                                {pill.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Presets Grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8, maxHeight: drawerPresentation === "compact" ? 260 : "min(52dvh, 640px)", overflowY: "auto" }}>
                        {searchStockFaces(faceSearchTerm, undefined, faceGenderFilter, faceAgeFilter).map((p) => (
                          <div
                            key={p.id}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              padding: 8,
                              borderRadius: 8,
                              border: "1px solid rgba(0,255,255,0.25)",
                              background: "rgba(0,255,255,0.04)",
                              gap: 6,
                            }}
                          >
                            <div>
                              <div style={{ fontSize: 9, fontWeight: 900, color: "#fff" }}>{p.label}</div>
                              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.55)", marginTop: 2, lineHeight: 1.25 }}>
                                {p.description}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSelectStockFace(p)}
                              style={{
                                fontSize: 8,
                                fontWeight: 800,
                                padding: "4px 6px",
                                borderRadius: 4,
                                background: "#00FFFF",
                                color: "#050510",
                                border: "none",
                                cursor: "pointer",
                                width: "100%",
                              }}
                            >
                              CHOOSE & EDIT →
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SubMode B: Manual Face Customization */}
                  {faceSubMode === "MANUAL" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 10, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.1em" }}>
                          PARAMETRIC FEATURE CUSTOMIZATION
                        </span>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            type="button"
                            onClick={handleRandomizeFace}
                            style={{
                              fontSize: 8,
                              fontWeight: 800,
                              padding: "3px 8px",
                              borderRadius: 6,
                              background: "rgba(0,255,255,0.15)",
                              border: "1px solid #00FFFF",
                              color: "#00FFFF",
                              cursor: "pointer",
                            }}
                          >
                            🎲 RANDOMIZE
                          </button>
                          <button
                            type="button"
                            onClick={() => setFaceSubMode("PRESETS")}
                            style={{
                              fontSize: 8,
                              fontWeight: 800,
                              padding: "3px 8px",
                              borderRadius: 6,
                              background: "rgba(255,215,0,0.1)",
                              border: "1px solid #FFD700",
                              color: "#FFD700",
                              cursor: "pointer",
                            }}
                          >
                            ← PRESETS
                          </button>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8, maxHeight: 260, overflowY: "auto", paddingRight: 4 }}>
                        {(
                          [
                            // Eyes
                            ["eyeScale", "Eye Size", -0.45, 0.45],
                            ["eyeSpacing", "Eye Spacing", -0.55, 0.55],
                            ["eyeHeight", "Eye Height", -0.45, 0.45],
                            ["eyeTilt", "Eye Tilt / Angle", -0.4, 0.4],
                            ["eyeDepth", "Eye Depth (Orbit)", -0.5, 0.5],
                            ["eyelidOpenness", "Eyelid Openness", -0.6, 0.6],
                            // Nose
                            ["noseWidth", "Nose Width", -0.6, 0.6],
                            ["noseLength", "Nose Length", -0.55, 0.55],
                            ["noseBridgeWidth", "Nose Bridge Width", -0.55, 0.55],
                            ["noseBridgeHeight", "Nose Bridge Height", -0.55, 0.55],
                            ["noseTipSize", "Nose Tip Size", -0.55, 0.55],
                            ["noseProjection", "Nose Projection", -0.5, 0.5],
                            // Mouth & Lips
                            ["mouthWidth", "Mouth Width", -0.65, 0.65],
                            ["upperLipFullness", "Upper Lip (thin ↔ full)", -0.85, 0.95],
                            ["lowerLipFullness", "Lower Lip (thin ↔ big)", -0.85, 0.95],
                            ["upperLipShape", "Upper Lip Contour", -0.55, 0.55],
                            ["lipWidth", "Lip Profile Width", -0.65, 0.65],
                            // Jaw & Chin
                            ["jawWidth", "Jaw Width", -0.7, 0.7],
                            ["jawShape", "Jaw Angle / Shape", -0.75, 0.75],
                            ["chinWidth", "Chin Width", -0.6, 0.6],
                            ["chinLength", "Chin Length", -0.6, 0.6],
                            ["chinProjection", "Chin Projection", -0.55, 0.55],
                            // Cheeks & Forehead
                            ["cheekWidth", "Cheek Width", -0.65, 0.65],
                            ["cheekProjection", "Cheekbone Apex", -0.6, 0.6],
                            ["cheekFullness", "Cheek Fullness", -0.65, 0.65],
                            ["foreheadHeight", "Forehead Height", -0.5, 0.5],
                            ["facialFullness", "Facial Fullness", -0.7, 0.7],
                            // Ears
                            ["earSize", "Ear Size", -0.7, 0.85],
                            ["earProjection", "Ear Projection", -0.6, 0.75],
                          ] as Array<[keyof FaceIdentityShapeCoefficients, string, number, number]>
                        ).map(([key, label, min, max]) => {
                          const profile = readPersistedFaceIdentityProfile();
                          const val = profile?.shapeCoefficients?.[key] ?? 0;
                          return (
                            <label key={key} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.7)" }}>
                                {label}: {Number(val).toFixed(2)}
                              </span>
                              <input
                                type="range"
                                min={min}
                                max={max}
                                step={0.02}
                                value={Number(val)}
                                onChange={(e) => {
                                  const nextVal = Number(e.target.value);
                                  const prior = readPersistedFaceIdentityProfile();
                                  const shape = clampShapeCoefficients({
                                    ...(prior?.shapeCoefficients ?? {}),
                                    [key]: nextVal,
                                  });
                                  const base = prior ?? {
                                    identityId: "face_manual_" + Date.now().toString(36),
                                    userId: "fan_local",
                                    revision: 1,
                                    baseAvatarId: baseId,
                                    captureSource: "MANUAL_CREATION" as const,
                                    shapeCoefficients: shape,
                                    appearance: {
                                      skinHex: skin.hex,
                                      skinSubsurfaceHex: skin.hex,
                                      eyeColorHex: "#2C1810",
                                      browColorHex: "#1A120C",
                                      lipColorHex: "#8B4A4A",
                                      likenessStrength: 0.7,
                                    },
                                    anchors: {
                                      leftEye: [-0.032, 1.12, 0.06] as [number, number, number],
                                      rightEye: [0.032, 1.12, 0.06] as [number, number, number],
                                      eyeCenter: [0, 1.12, 0.06] as [number, number, number],
                                      nose: [0, 1.05, 0.08] as [number, number, number],
                                      mouth: [0, 0.98, 0.07] as [number, number, number],
                                      chin: [0, 0.9, 0.05] as [number, number, number],
                                      headTop: [0, 1.35, 0] as [number, number, number],
                                      earL: [-0.08, 1.08, 0] as [number, number, number],
                                      earR: [0.08, 1.08, 0] as [number, number, number],
                                    },
                                    confidence: { eyes: 0.8, nose: 0.8, mouth: 0.8, jaw: 0.8, skin: 0.8, overall: 0.8 },
                                    approvedAt: null,
                                    createdAt: Date.now(),
                                    updatedAt: Date.now(),
                                  };
                                  persistFaceIdentityProfile({
                                    ...base,
                                    shapeCoefficients: shape,
                                    revision: (prior?.revision ?? 0) + 1,
                                    updatedAt: Date.now(),
                                  });
                                  // Mini-Me contract path — id_* weights only; no fake morph invent.
                                  void buildMiniMePreview({
                                    shape,
                                    headToBodyScale: DEFAULT_MINI_ME_HEAD_SCALE,
                                  });
                                  setFaceIdentityTick((n) => n + 1);
                                  patchCanonicalAvatarDraft({ skinT });
                                }}
                                style={{ width: "100%", accentColor: "#00FFFF" }}
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* SubMode C: Optional Guided Face Scan */}
                  {faceSubMode === "SCAN" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ padding: 10, borderRadius: 8, background: "rgba(255,45,170,0.1)", border: "1px solid rgba(255,45,170,0.3)" }}>
                        <div style={{ fontSize: 9, fontWeight: 900, color: "#FF2DAA" }}>
                          FACE SCAN IS 100% OPTIONAL (LAW SECTION 5 & 6)
                        </div>
                        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.7)", marginTop: 2, lineHeight: 1.3 }}>
                          A member who never scans or uploads a photo can build an avatar using Stock Presets or Manual Controls. If you do use a photo fit, the result is NOT locked: you can edit every slider afterward.
                        </div>
                      </div>
                      <AvatarFaceScanPanel
                        scanActive={scanActive}
                        setScanActive={setScanActive}
                        onFitted={() => {
                          setCameraAngle("closeup");
                          const hydrated = typeof window !== "undefined"
                            ? readPersistedFanSkinT()
                            : skinT;
                          setSkinT(hydrated);
                          setFaceSubMode("MANUAL"); // Law 6: Generated face != locked face -> open sliders immediately!
                        }}
                        onApproved={() => {
                          handleEquipAndSave();
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Dedicated FACE_SCAN tab shortcut */}
              {selectedCategory === "FACE_SCAN" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ padding: 10, borderRadius: 8, background: "rgba(255,45,170,0.1)", border: "1px solid rgba(255,45,170,0.3)" }}>
                    <div style={{ fontSize: 9, fontWeight: 900, color: "#FF2DAA" }}>
                      OPTIONAL PHOTO-ASSISTED FIT → SAME CANONICAL RIG
                    </div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.7)", marginTop: 2, lineHeight: 1.3 }}>
                      Face scan is an option, not a requirement. After automatic fitting, all features remain editable in Face Studio.
                    </div>
                  </div>
                  <AvatarFaceScanPanel
                    scanActive={scanActive}
                    setScanActive={setScanActive}
                    onFitted={() => {
                      setCameraAngle("closeup");
                      const hydrated = typeof window !== "undefined"
                        ? readPersistedFanSkinT()
                        : skinT;
                      setSkinT(hydrated);
                      setSelectedCategory("FACE");
                      setFaceSubMode("MANUAL");
                    }}
                    onApproved={() => {
                      handleEquipAndSave();
                    }}
                  />
                </div>
              )}

              {/* 3. SKIN TONE CONTINUUM */}
              {selectedCategory === "SKIN" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.1em" }}>
                    SKIN TONE CONTINUUM
                  </div>
                  <div
                    style={{
                      height: 24,
                      borderRadius: 12,
                      background: `linear-gradient(90deg, ${FAN_SKIN_TONE_CONTINUUM.map((s) => s.hex).join(", ")})`,
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={skinT}
                    onChange={(e) => handleSkinChange(Number(e.target.value))}
                    style={{ width: "100%", accentColor: skin.hex, cursor: "pointer" }}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: skin.hex,
                        border: "2px solid #00FFFF",
                      }}
                    />
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>{skin.label}</div>
                      <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>{skin.hex}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                    {FAN_SKIN_TONE_CONTINUUM.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        title={s.label}
                        onClick={() => handleSkinChange(s.t)}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: s.hex,
                          border: Math.abs(skinT - s.t) < 0.05 ? "2px solid #00FFFF" : "1px solid rgba(255,255,255,0.2)",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      />
                    ))}
                  </div>
                  <div
                    data-testid="living-skin-sweat-fx"
                    style={{
                      marginTop: 10,
                      padding: 10,
                      borderRadius: 8,
                      background: "rgba(0,255,255,0.06)",
                      border: "1px solid rgba(0,255,255,0.22)",
                    }}
                  >
                    <div style={{ fontSize: 9, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.08em" }}>
                      LIVING SKIN · SWEAT FX
                    </div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.62)", marginTop: 4, lineHeight: 1.35 }}>
                      Natural skin finish is free for everyone. Sweat is a temporary dance/performance effect — not part of your saved skin tone. Play Dance to see gradual shine, then Idle to dry.
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                      {(["FULL", "REDUCED", "OFF"] as SweatFxPreference[]).map((pref) => (
                        <button
                          key={pref}
                          type="button"
                          data-testid={`sweat-fx-${pref.toLowerCase()}`}
                          onClick={() => {
                            setSweatFxPreference(pref);
                            if (typeof window !== "undefined") {
                              writeSweatFxPreference(pref, window.localStorage);
                            }
                          }}
                          style={{
                            fontSize: 8,
                            fontWeight: 800,
                            letterSpacing: "0.06em",
                            padding: "6px 10px",
                            borderRadius: 6,
                            cursor: "pointer",
                            border:
                              sweatFxPreference === pref
                                ? "1px solid #00FFFF"
                                : "1px solid rgba(255,255,255,0.2)",
                            background:
                              sweatFxPreference === pref
                                ? "rgba(0,255,255,0.18)"
                                : "rgba(0,0,0,0.35)",
                            color: "#fff",
                          }}
                        >
                          {pref}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. HAIR / WARDROBE (8) / EMOTES */}
              {(selectedCategory === "HAIR" ||
                selectedCategory === "OUTFITS" ||
                selectedCategory === "TOPS" ||
                selectedCategory === "BOTTOMS" ||
                selectedCategory === "SHOES" ||
                selectedCategory === "HATS" ||
                selectedCategory === "ACCESSORIES" ||
                selectedCategory === "MASKS" ||
                selectedCategory === "PROPS" ||
                selectedCategory === "EMOTES") && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(["OUTFITS", "TOPS", "BOTTOMS", "SHOES", "HATS", "ACCESSORIES", "MASKS", "PROPS"] as const).includes(
                    selectedCategory as "OUTFITS",
                  ) ? (
                    <AccFoundrySlotGrid
                      sectionId={selectedCategory as AccSectionId}
                      title={`${selectedCategory} · FOUNDRY 3D SLOTS`}
                      selectedAssetId={
                        selectedCategory === "SHOES" ? equippedShoesId : equippedCosmeticId
                      }
                      onSelectPlacement={(placement) => {
                        if (!placement.assetId) return;
                        if (selectedCategory === "SHOES") {
                          setEquippedShoesId(placement.assetId);
                          setShoesFocus(true);
                        }
                        setEquippedCosmeticId(placement.assetId);
                        patchCanonicalAvatarDraft({
                          equippedCosmeticIds: placement.assetId ? [placement.assetId] : [],
                        });
                      }}
                    />
                  ) : null}
                  {outfitShoePrompt ? (
                    <div
                      data-testid="outfit-shoes-coordination"
                      style={{
                        padding: 10,
                        borderRadius: 10,
                        border: "1px solid rgba(255,215,0,0.4)",
                        background: "rgba(255,215,0,0.06)",
                        fontSize: 10,
                        color: "rgba(255,255,255,0.75)",
                      }}
                    >
                      <div style={{ fontWeight: 900, color: "#FFD700", marginBottom: 6 }}>
                        OUTFIT INCLUDES FOOTWEAR
                      </div>
                      Equip matching shoes, keep your current Shoes selection, or open the Shoes section.
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                        <button
                          type="button"
                          style={{ fontSize: 9, fontWeight: 800, padding: "6px 8px", borderRadius: 6, border: "1px solid #00FFFF", background: "rgba(0,255,255,0.12)", color: "#00FFFF", cursor: "pointer" }}
                          onClick={() => {
                            const d = decideShoesForOutfit(outfitShoePrompt.outfitId, "EQUIP_MATCHING");
                            if (d.action === "EQUIP_MATCHING" && d.footwearAssetId) {
                              setEquippedShoesId(d.footwearAssetId);
                            }
                            setOutfitShoePrompt(null);
                          }}
                        >
                          Equip matching shoes
                        </button>
                        <button
                          type="button"
                          style={{ fontSize: 9, fontWeight: 800, padding: "6px 8px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.25)", background: "transparent", color: "#fff", cursor: "pointer" }}
                          onClick={() => {
                            decideShoesForOutfit(outfitShoePrompt.outfitId, "KEEP_CURRENT");
                            setOutfitShoePrompt(null);
                          }}
                        >
                          Keep current shoes
                        </button>
                        <button
                          type="button"
                          style={{ fontSize: 9, fontWeight: 800, padding: "6px 8px", borderRadius: 6, border: "1px solid #FFD700", background: "rgba(255,215,0,0.1)", color: "#FFD700", cursor: "pointer" }}
                          onClick={() => {
                            setOutfitShoePrompt(null);
                            setSelectedCategory("SHOES");
                            setShoesFocus(true);
                          }}
                        >
                          Choose in Shoes →
                        </button>
                      </div>
                    </div>
                  ) : null}
                  {(() => {
                    const usableItems = categoryItems.filter(isUsableInPublicEditor);
                    const marketplaceOnly = categoryItems.filter((item) => !isUsableInPublicEditor(item));
                    return (
                      <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.1em" }}>
                      {selectedCategory} · YOUR USABLE ITEMS ({usableItems.length})
                    </span>
                    <Link href="/store/fan#cosmetics-catalog" style={{ fontSize: 8, color: "#FFD700" }}>
                      Marketplace →
                    </Link>
                  </div>
                  <div data-testid="avatar-catalog-honesty" style={{ fontSize: 8, color: "rgba(255,255,255,0.62)", lineHeight: 1.35 }}>
                    Showing free / owned / equip-ready items only.
                    {marketplaceOnly.length > 0
                      ? ` ${marketplaceOnly.length} Marketplace discoverables stay in Store — not in this inventory.`
                      : null}
                  </div>
                  {previewWearableNote ? (
                    <div data-testid="avatar-manufactured-preview-note" style={{ fontSize: 8, color: "#FFD700", lineHeight: 1.35 }}>
                      {previewWearableNote}
                    </div>
                  ) : null}
                  {/* Contextual Material / Color Tint Palette */}
                  {selectedCategory === "HAIR" && (
                    <FullSpectrumColorPicker
                      label="HAIR COLOR"
                      accent="#00FFFF"
                      value={hairColorHex}
                      testIdPrefix="avatar-hair-color"
                      onChange={(hex) => {
                        setHairColorHex(hex);
                        patchCanonicalAvatarDraft({ hairColorHex: hex });
                      }}
                    />
                  )}

                  {selectedCategory === "OUTFITS" && (
                    <FullSpectrumColorPicker
                      label="APPAREL TINT · WHOLE CRAYON BOX"
                      accent="#FFD700"
                      value={outfitTintHex}
                      testIdPrefix="avatar-outfit-tint"
                      onChange={(hex) => {
                        setOutfitTintHex(hex);
                        patchCanonicalAvatarDraft({ outfitTintHex: hex });
                      }}
                    />
                  )}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                      gap: 8,
                      maxHeight: 280,
                      overflowY: "auto",
                    }}
                  >
                    {usableItems.map((item) => {
                      const readiness = wearableReadiness(item);
                      const canPreview =
                        selectedCategory === "EMOTES" || readiness === "EQUIP-READY" || readiness === "MANUFACTURED";
                      const canEquipReady = selectedCategory === "EMOTES" || readiness === "EQUIP-READY";
                      const isEquipped = canPreview && equippedCosmeticId === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          data-asset-readiness={readiness}
                          disabled={!canPreview}
                          onClick={() => {
                            if (!canPreview) return;
                            const next = isEquipped ? null : item.id;
                            setEquippedCosmeticId(next);
                            if (selectedCategory === "SHOES") {
                              setEquippedShoesId(next);
                              setShoesFocus(true);
                            }
                            if (selectedCategory === "OUTFITS" && next) {
                              const policy = resolveOutfitFootwearPolicy(next);
                              if (policy.includesFootwear) {
                                setOutfitShoePrompt({
                                  outfitId: next,
                                  matchedFootwearAssetId: policy.matchedFootwearAssetId,
                                });
                              } else {
                                setOutfitShoePrompt(null);
                              }
                            }
                            if (next && readiness === "MANUFACTURED") {
                              setPreviewWearableNote(
                                isIdentityPreservingOutfit(next)
                                  ? "Manufactured preview only — face, skin, and base stay. Not equip-ready until runtime fit cert."
                                  : "Manufactured mesh preview only — not equip-ready until runtime fit certification.",
                              );
                            } else {
                              setPreviewWearableNote(null);
                            }
                            if (canEquipReady || readiness === "MANUFACTURED") {
                              patchCanonicalAvatarDraft({
                                equippedCosmeticIds: next ? [next] : [],
                              });
                            }
                          }}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            padding: 8,
                            borderRadius: 8,
                            background: isEquipped ? "rgba(0,255,255,0.18)" : "rgba(255,255,255,0.03)",
                            border: `1px solid ${isEquipped ? "#00FFFF" : `${item.accent}33`}`,
                            cursor: canPreview ? "pointer" : "default",
                            opacity: canPreview ? 1 : 0.72,
                          }}
                        >
                          <div style={{ fontSize: 20 }}>{item.icon}</div>
                          <div style={{ fontSize: 9, fontWeight: 800, color: "#fff", marginTop: 4, textAlign: "center" }}>
                            {item.label}
                          </div>
                          <div style={{ fontSize: 8, color: item.accent, marginTop: 2, fontWeight: 700 }}>
                            {item.pointsCost === 0 ? "FREE" : `${item.pointsCost} pts`}
                          </div>
                          <div style={{ fontSize: 7, color: readiness === "EQUIP-READY" ? "#00FF88" : "#FF9900", marginTop: 2, fontWeight: 800 }}>
                            {readiness === "EQUIP-READY" ? "EQUIPPED SLOT" : readiness}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {marketplaceOnly.length > 0 ? (
                    <Link
                      href="/store/fan#cosmetics-catalog"
                      data-testid="avatar-marketplace-discover"
                      style={{
                        display: "block",
                        textAlign: "center",
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "1px dashed rgba(255,215,0,0.45)",
                        color: "#FFD700",
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                      }}
                    >
                      Discover {marketplaceOnly.length} more in Marketplace →
                    </Link>
                  ) : null}
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Manufacturing + blueprints live at /admin/foundry — not inside ACC. */}
            </div>
          </div>
        </div>
      </div>
    </RoleGate>
  );
}

export default AvatarCreationCenter;
