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
 *    - OUTFITS & APPAREL (Tops, Bottoms, Shoes, Full Fits)
 *    - ACCESSORIES & JEWELRY (Glasses, Hats, Headphones, Props, Band Instruments)
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
import Link from "next/link";
import { AvatarViewer } from "@/components/3d/AvatarLobbyCanvas";
import RoleGate from "@/components/auth/RoleGate";
import AvatarFaceScanPanel from "@/components/avatar/AvatarFaceScanPanel";
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
  listEquippableHair,
  listEquippableInstruments,
  listEquippableProps,
  listFanCosmeticsByCategory,
  persistFanSkinT,
  readPersistedFanSkinT,
  sampleFanSkinTone,
  type FanCosmeticDef,
} from "@/lib/avatars/FanCosmeticCatalog";
import {
  AVATAR_GLB_REGISTRY,
} from "@/lib/avatars/AvatarGlbRegistry";
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
  assertWearablesProductionCompatible,
  canCommitWearableToWorld,
  FAN_COSMETIC_STORE_HREF,
} from "@/lib/avatars/AvatarWearableCapability";

export type CreatorCategory =
  | "BASES"
  | "BODY"
  | "FACE_SCAN"
  | "FACE"
  | "SKIN"
  | "HAIR"
  | "OUTFITS"
  | "ACCESSORIES"
  | "EMOTES"
  | "SAVED_LOOKS"
  | "FOUNDRY";

export type AnimationPose = "idle" | "walk" | "run" | "wave" | "clap" | "dance" | "sit";
export type CameraAngle = "front" | "side" | "back" | "closeup" | "fullbody";

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
  // ── Canonical State ────────────────────────────────────────────────────────
  const [baseId, setBaseId] = useState(() => readPersistedBobbleheadBaseId() || BOBBLEHEAD_DEFAULT_BASE_ID);
  const [skinT, setSkinT] = useState(() => readPersistedFanSkinT());
  const [scanActive, setScanActive] = useState(false);
  const [mood, setMood] = useState<AvatarMoodId>(() =>
    typeof window !== "undefined" ? readPersistedAvatarMood() : "REGULAR",
  );
  const [selectedCategory, setSelectedCategory] = useState<CreatorCategory>("BASES");
  const [selectedSubTab, setSelectedSubTab] = useState<string>("all");
  const [faceSubMode, setFaceSubMode] = useState<"PRESETS" | "MANUAL" | "SCAN">("PRESETS");
  const [faceMorphFilter, setFaceMorphFilter] = useState<string>("all");
  const [faceSearchTerm, setFaceSearchTerm] = useState<string>("");
  const [bodyDiversity, setBodyDiversity] = useState<BodyDiversityParameters>(() => readPersistedBodyDiversity());
  const [baseGenderFilter, setBaseGenderFilter] = useState<"all" | "female" | "male">("all");
  const [bodyGenderFilter, setBodyGenderFilter] = useState<"all" | "female" | "male">("all");
  const [faceGenderFilter, setFaceGenderFilter] = useState<"all" | "female" | "male">("all");
  const [faceAgeFilter, setFaceAgeFilter] = useState<"all" | "youth" | "adult" | "mature">("all");
  const [hairStyleFilter, setHairStyleFilter] = useState<"all" | "textured" | "straight" | "specialty">("all");
  const [activePose, setActivePose] = useState<AnimationPose>("idle");
  const [cameraAngle, setCameraAngle] = useState<CameraAngle>("front");
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
  const [lookNameInput, setLookNameInput] = useState("");
  const [equipToast, setEquipToast] = useState(false);
  const [equipSaveNote, setEquipSaveNote] = useState<"idle" | "saved" | "failed">("idle");
  const [equippedCosmeticId, setEquippedCosmeticId] = useState<string | null>(null);
  const [livingReaction, setLivingReaction] = useState<string | null>(null);
  const reactionGen = useRef(0);
  const [angleOverride, setAngleOverride] = useState<CameraAngle | null>(null);
  const [shoesFocus, setShoesFocus] = useState(false);
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
    let cancelled = false;
    void hydrateAvatarDraftFromServerIfLocalMissing().then((applied) => {
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

  const cameraPlan: CreationCenterCameraPlan = useMemo(() => {
    if (shoesFocus && selectedCategory === "OUTFITS") return resolveShoesCamera();
    return resolveCreationCenterCamera(selectedCategory, angleOverride ?? cameraAngle);
  }, [selectedCategory, angleOverride, cameraAngle, shoesFocus]);

  useEffect(() => {
    setCameraAngle(cameraPlan.angle);
  }, [selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAvatarPoke = useCallback(() => {
    const result = avatarBehavioralDirector.poke("torso");
    if (!result.motion || result.recoveryMs <= 0) return;
    const gen = ++reactionGen.current;
    setLivingReaction(result.reaction);
    setActivePose("wave");
    patchCanonicalAvatarDraft({ previewAction: result.motion });
    window.setTimeout(() => {
      if (reactionGen.current !== gen) return;
      setActivePose("idle");
      setLivingReaction(null);
      patchCanonicalAvatarDraft({ previewAction: "IDLE" });
    }, result.recoveryMs);
  }, []);

  // ── Actions & Handlers ──────────────────────────────────────────────────────
  const handleSelectBase = useCallback((base: BobbleheadBase) => {
    setBaseId(base.id);
    patchCanonicalAvatarDraft({ baseId: base.id });
  }, []);

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
    patchCanonicalAvatarDraft({ skinT: t });
  }, []);

  const handleEquipAndSave = useCallback(() => {
    const ids = equippedCosmeticId ? [equippedCosmeticId] : [];
    const blocked = assertWearablesProductionCompatible(ids);
    if (blocked.length) return;
    patchCanonicalAvatarDraft({
      displayName: selectedBase.displayName,
      baseId,
      skinT,
      equippedCosmeticIds: ids,
    });
    if (equippedCosmeticId && !canCommitWearableToWorld(equippedCosmeticId, [])) {
      if (typeof window !== "undefined") window.location.assign(FAN_COSMETIC_STORE_HREF);
      return;
    }
    const commit = commitCanonicalDraftToFanWorld();
    if (!commit.ok) {
      if (commit.storeHref && typeof window !== "undefined") {
        window.location.assign(commit.storeHref);
      }
      return;
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("bb:loadout:changed", { detail: { baseId, skinT, cosmeticId: equippedCosmeticId } }));
      window.dispatchEvent(new CustomEvent("tmi:avatar:equipped", { detail: { baseId, skinT, cosmeticId: equippedCosmeticId } }));
    }
    void persistCanonicalDraftToAvatarConfig().then((server) => {
      if (server.ok) {
        setEquipSaveNote("saved");
        setEquipToast(true);
      } else {
        setEquipSaveNote("failed");
        setEquipToast(false);
      }
      window.setTimeout(() => {
        setEquipToast(false);
        setEquipSaveNote("idle");
      }, 2500);
    });
  }, [baseId, skinT, equippedCosmeticId, selectedBase.displayName]);

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
    patchCanonicalAvatarDraft({ baseId: randomBase.id, skinT: randomSkin });
  }, []);

  const handleAutoFitOutfit = useCallback(() => {
    const coolItems = listEquippableAccessories();
    if (coolItems.length > 0) {
      const pick = coolItems[Math.floor(Math.random() * coolItems.length)]!;
      setEquippedCosmeticId(pick.id);
      patchCanonicalAvatarDraft({ equippedCosmeticIds: [pick.id] });
    }
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
  const categoryItems: FanCosmeticDef[] = useMemo(() => {
    switch (selectedCategory) {
      case "HAIR":
        return listEquippableHair();
      case "OUTFITS":
        return [
          ...listFanCosmeticsByCategory("tops"),
          ...listFanCosmeticsByCategory("bottoms"),
          ...listFanCosmeticsByCategory("clothing"),
          ...listFanCosmeticsByCategory("jackets"),
          ...listFanCosmeticsByCategory("shoes"),
          ...listFanCosmeticsByCategory("outfits"),
        ];
      case "ACCESSORIES":
        return [
          ...listEquippableAccessories(),
          ...listFanCosmeticsByCategory("glasses"),
          ...listFanCosmeticsByCategory("headphones"),
          ...listEquippableProps(),
          ...listEquippableInstruments(),
        ];
      case "EMOTES":
        return [
          ...listDanceEmotes(),
          ...listActionEmotes(),
          ...listEquippableEmotes(),
        ];
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
        data-scan-active={scanActive ? "true" : "false"}
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
        }}
      >
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
              🎲 RANDOMIZE
            </button>

            <button
              type="button"
              onClick={handleAutoFitOutfit}
              title="Auto Match Best Accessories"
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
              ✨ AUTO FIT
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
              {equipToast ? "✓ EQUIPPED TO RUNTIME!" : equipSaveNote === "failed" ? "SAVE FAILED — DRAFT KEPT" : "💾 EQUIP & SAVE"}
            </button>
          </div>
        </div>

        {/* ── Main Workspace: 3D Canvas Viewport + Customizer Grid ────────── */}
        <style>{`
          .tmi-avatar-studio-grid { display: grid; grid-template-columns: minmax(300px, 1.2fr) minmax(320px, 1.8fr); gap: 16px; min-width: 0; }
          @media (max-width: 900px) {
            .tmi-avatar-studio-grid { grid-template-columns: minmax(0, 1fr); }
          }
        `}</style>
        <div className="tmi-avatar-studio-grid">
          {/* Left Column: 3D Live Viewport & Animation Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              className="tmi-avatar-stage"
              style={{
                position: "relative",
                height: 240,
                borderRadius: 14,
                border: "1px solid rgba(0,255,255,0.35)",
                background: "radial-gradient(ellipse at center, rgba(170,45,255,0.15) 0%, rgba(5,5,18,0.95) 75%)",
                overflow: "hidden",
                boxShadow: "inset 0 0 40px rgba(0,0,0,0.8)",
              }}
            >
              {/* ONE persistent Avatar — category travel moves camera only */}
              <div
                role="button"
                tabIndex={0}
                aria-label="Interact with avatar"
                onClick={handleAvatarPoke}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleAvatarPoke();
                  }
                }}
                style={{ width: "100%", height: "100%", cursor: "pointer" }}
                data-creation-center-camera={cameraPlan.label}
                data-lighting-bias={cameraPlan.lightingBias}
              >
                <AvatarViewer
                  {...(preview.rigProps ?? {})}
                  fill
                  enableOrbit={true}
                  cameraFocus={cameraPlan.focus}
                  isPlaying={activePose !== "idle" || Boolean(livingReaction)}
                  expression={AVATAR_MOOD_SPECS[mood].foundryExpression}
                  mood={mood}
                />
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
                  { id: "face", label: "👁️ FACE", focus: "face", angle: "closeup" as CameraAngle, shoes: false, upper: false },
                  { id: "upper", label: "👕 UPPER", focus: "upper", angle: "front" as CameraAngle, shoes: false, upper: true },
                  { id: "body", label: "🧍 FULL", focus: "body", angle: "fullbody" as CameraAngle, shoes: false, upper: false },
                  { id: "shoes", label: "👟 SHOES", focus: "feet", angle: "front" as CameraAngle, shoes: true, upper: false },
                  { id: "orbit", label: "🔄 360°", focus: "body", angle: "front" as CameraAngle, shoes: false, upper: false },
                ].map((preset) => {
                  const isActive =
                    preset.id === "shoes"
                      ? shoesFocus
                      : preset.id === "upper"
                        ? upperFocus
                        : preset.id === "face"
                          ? cameraPlan.focus === "face" && !shoesFocus && !upperFocus
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
                  {(["idle", "walk", "run", "wave", "clap", "dance", "sit"] as AnimationPose[]).map((pose) => {
                    const action = poseToPreviewAction(pose);
                    const gate = gatePreviewAction(action, preview.viewport);
                    return (
                    <button
                      key={pose}
                      type="button"
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

          {/* Right Column: Customization Suites & Tabs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Category Tab Bar */}
            <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 4 }}>
              {[
                { id: "BASES", label: "👤 BASES" },
                { id: "FACE_SCAN", label: "📷 FACE SCAN" },
                { id: "FACE", label: "🙂 FACE" },
                { id: "SKIN", label: "🎨 SKIN" },
                { id: "HAIR", label: "✂️ HAIR" },
                { id: "OUTFITS", label: "👕 FITS" },
                { id: "ACCESSORIES", label: "🕶️ GEAR" },
                { id: "EMOTES", label: "💃 EMOTES" },
                { id: "FOUNDRY", label: "🏭 FOUNDRY" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  data-testid={`avatar-cat-${cat.id}`}
                  onClick={() => {
                    setSelectedCategory(cat.id as CreatorCategory);
                    setAngleOverride(null);
                    setShoesFocus(false);
                  }}
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: `1px solid ${selectedCategory === cat.id ? "#00FFFF" : "rgba(255,255,255,0.12)"}`,
                    background: selectedCategory === cat.id ? "rgba(0,255,255,0.2)" : "rgba(255,255,255,0.03)",
                    color: selectedCategory === cat.id ? "#00FFFF" : "rgba(255,255,255,0.6)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

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
                    CANONICAL BOBBLEHEAD BASES
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
                    {BOBBLEHEAD_BASES.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleSelectBase(b)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          padding: 10,
                          borderRadius: 8,
                          border: `1px solid ${baseId === b.id ? "#00FFFF" : "rgba(255,255,255,0.1)"}`,
                          background: baseId === b.id ? "rgba(0,255,255,0.15)" : "rgba(255,255,255,0.03)",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <span style={{ fontSize: 10, fontWeight: 900, color: "#fff" }}>
                          {b.displayName}
                        </span>
                        <span style={{ fontSize: 8, color: "#00FF88", marginTop: 2 }}>
                          {b.build} · {b.previewHonestyLabel}
                        </span>
                      </button>
                    ))}
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
                        GLOBAL BODY DIVERSITY — CANONICAL 26-BONE RIG
                      </div>
                      <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                        TMI Law: Height matters proportionally. Real human diversity across frames, muscles & bellies.
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
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8, maxHeight: 260, overflowY: "auto" }}>
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
                </div>
              )}

              {/* 4. HAIR / OUTFITS / ACCESSORIES / EMOTES */}
              {(selectedCategory === "HAIR" ||
                selectedCategory === "OUTFITS" ||
                selectedCategory === "ACCESSORIES" ||
                selectedCategory === "EMOTES") && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.1em" }}>
                      {selectedCategory} CATALOG ({categoryItems.length} SKUs)
                    </span>
                    <Link href="/store/fan#cosmetics-catalog" style={{ fontSize: 8, color: "#FFD700" }}>
                      Fan Store Catalog →
                    </Link>
                  </div>
                  {/* Contextual Material / Color Tint Palette */}
                  {selectedCategory === "HAIR" && (
                    <div style={{ marginBottom: 10, padding: 8, borderRadius: 8, background: "rgba(0,0,0,0.45)", border: "1px solid rgba(0,255,255,0.25)" }}>
                      <div style={{ fontSize: 9, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.1em", marginBottom: 6 }}>
                        HAIR COLOR / MATERIAL TINT (INDEPENDENT)
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                        {[
                          { id: "black", hex: "#111111", label: "Jet Black" },
                          { id: "espresso", hex: "#3A2312", label: "Dark Espresso" },
                          { id: "chestnut", hex: "#6A4020", label: "Warm Chestnut" },
                          { id: "blonde", hex: "#B8860B", label: "Honey Blonde" },
                          { id: "copper", hex: "#8B2500", label: "Copper Rust" },
                          { id: "platinum", hex: "#E8E8E8", label: "Platinum Silver" },
                          { id: "cyan", hex: "#00FFFF", label: "Neon Cyan" },
                          { id: "fuchsia", hex: "#FF2DAA", label: "Electric Fuchsia" },
                        ].map((hc) => (
                          <button
                            key={hc.id}
                            type="button"
                            data-testid={`avatar-hair-color-${hc.id}`}
                            title={hc.label}
                            onClick={() => {
                              setHairColorHex(hc.hex);
                              patchCanonicalAvatarDraft({ hairColorHex: hc.hex });
                            }}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              background: hc.hex,
                              border: hairColorHex === hc.hex ? "2px solid #00FFFF" : "1px solid rgba(255,255,255,0.25)",
                              cursor: "pointer",
                              boxShadow: hairColorHex === hc.hex ? "0 0 10px #00FFFF" : "none",
                            }}
                          />
                        ))}
                        <input
                          type="color"
                          value={hairColorHex}
                          onChange={(e) => {
                            setHairColorHex(e.target.value);
                            patchCanonicalAvatarDraft({ hairColorHex: e.target.value });
                          }}
                          title="Custom hair color"
                          style={{ width: 24, height: 24, borderRadius: "50%", border: "none", cursor: "pointer", background: "transparent" }}
                        />
                      </div>
                    </div>
                  )}

                  {selectedCategory === "OUTFITS" && (
                    <div style={{ marginBottom: 10, padding: 8, borderRadius: 8, background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,215,0,0.25)" }}>
                      <div style={{ fontSize: 9, fontWeight: 900, color: "#FFD700", letterSpacing: "0.1em", marginBottom: 6 }}>
                        APPAREL COLOR ACCENT / TINT
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                        {[
                          { id: "obsidian", hex: "#111827", label: "Obsidian" },
                          { id: "navy", hex: "#0a192f", label: "Midnight Navy" },
                          { id: "purple", hex: "#2a0845", label: "Royal Purple" },
                          { id: "magenta", hex: "#3b1443", label: "Deep Magenta" },
                          { id: "crimson", hex: "#8B0000", label: "Crimson Red" },
                          { id: "emerald", hex: "#004d40", label: "Deep Emerald" },
                          { id: "gold", hex: "#FFD700", label: "Stage Gold" },
                          { id: "silver", hex: "#E5E7EB", label: "Pure Silver" },
                        ].map((ot) => (
                          <button
                            key={ot.id}
                            type="button"
                            data-testid={`avatar-outfit-tint-${ot.id}`}
                            title={ot.label}
                            onClick={() => {
                              setOutfitTintHex(ot.hex);
                              patchCanonicalAvatarDraft({ outfitTintHex: ot.hex });
                            }}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              background: ot.hex,
                              border: outfitTintHex === ot.hex ? "2px solid #FFD700" : "1px solid rgba(255,255,255,0.25)",
                              cursor: "pointer",
                              boxShadow: outfitTintHex === ot.hex ? "0 0 10px #FFD700" : "none",
                            }}
                          />
                        ))}
                        <input
                          type="color"
                          value={outfitTintHex}
                          onChange={(e) => {
                            setOutfitTintHex(e.target.value);
                            patchCanonicalAvatarDraft({ outfitTintHex: e.target.value });
                          }}
                          title="Custom outfit color"
                          style={{ width: 24, height: 24, borderRadius: "50%", border: "none", cursor: "pointer", background: "transparent" }}
                        />
                      </div>
                    </div>
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
                    {categoryItems.map((item) => {
                      const isEquipped = equippedCosmeticId === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            const next = isEquipped ? null : item.id;
                            setEquippedCosmeticId(next);
                            patchCanonicalAvatarDraft({
                              equippedCosmeticIds: next ? [next] : [],
                            });
                          }}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            padding: 8,
                            borderRadius: 8,
                            background: isEquipped ? "rgba(0,255,255,0.18)" : "rgba(255,255,255,0.03)",
                            border: `1px solid ${isEquipped ? "#00FFFF" : `${item.accent}33`}`,
                            cursor: "pointer",
                          }}
                        >
                          <div style={{ fontSize: 20 }}>{item.icon}</div>
                          <div style={{ fontSize: 9, fontWeight: 800, color: "#fff", marginTop: 4, textAlign: "center" }}>
                            {item.label}
                          </div>
                          <div style={{ fontSize: 8, color: item.accent, marginTop: 2, fontWeight: 700 }}>
                            {item.pointsCost === 0 ? "FREE" : `${item.pointsCost} pts`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. FOUNDRY & MANUFACTURING ASSETS */}
              {selectedCategory === "FOUNDRY" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.1em" }}>
                    MANUFACTURING & FOUNDRY ASSET REGISTRY
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 6 }}>
                    {AVATAR_GLB_REGISTRY.map((slot) => (
                      <div
                        key={slot.id}
                        style={{
                          background: "rgba(0,0,0,0.5)",
                          border: `1px solid ${slot.certified ? "#00FF8844" : "rgba(255,255,255,0.1)"}`,
                          borderRadius: 6,
                          padding: 8,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 9, fontWeight: 800, color: "#fff" }}>{slot.id}</span>
                          <span style={{ fontSize: 7, fontWeight: 900, color: slot.certified ? "#00FF88" : "#FF9900" }}>
                            {slot.certified ? "CERTIFIED" : "FOUNDRY"}
                          </span>
                        </div>
                        <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{slot.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </RoleGate>
  );
}

export default AvatarCreationCenter;
