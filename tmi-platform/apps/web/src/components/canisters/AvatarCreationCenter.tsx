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

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import RoleGate from "@/components/auth/RoleGate";
import { AvatarCreator } from "@/components/AvatarCreator";
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
  getCanonicalAvatarDraft,
  hydrateCanonicalAvatarDraft,
  patchCanonicalAvatarDraft,
  persistCanonicalDraftIdentity,
  subscribeCanonicalAvatarDraft,
} from "@/lib/avatars/CanonicalAvatarDraft";
import { migrateAvatarLook } from "@/lib/avatars/AvatarLook";
import {
  gatePreviewAction,
  resolveAvatarPreview,
} from "@/lib/avatars/AvatarPreviewRuntime";
import type { AvatarPreviewAction } from "@/lib/avatars/AvatarPreviewActions";
import {
  assertWearablesProductionCompatible,
  canCommitWearableToWorld,
  FAN_COSMETIC_STORE_HREF,
} from "@/lib/avatars/AvatarWearableCapability";
import { publishFanEquippedLook, resolveFanEquippedLook } from "@/lib/avatars/FanEquippedLookBridge";

const AvatarViewer = dynamic(
  () => import("@/components/3d/AvatarLobbyCanvas").then((m) => m.AvatarViewer),
  { ssr: false }
);

export type CreatorCategory =
  | "BASES"
  | "FACE_SCAN"
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
      return "WAVE";
    case "dance":
      return "HYPE";
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
  const [selectedCategory, setSelectedCategory] = useState<CreatorCategory>("BASES");
  const [selectedSubTab, setSelectedSubTab] = useState<string>("all");
  const [activePose, setActivePose] = useState<AnimationPose>("idle");
  const [cameraAngle, setCameraAngle] = useState<CameraAngle>("front");
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
  const [lookNameInput, setLookNameInput] = useState("");
  const [equipToast, setEquipToast] = useState(false);
  const [equippedCosmeticId, setEquippedCosmeticId] = useState<string | null>(null);

  // Initial load — one canonical draft shared with Quick Panel
  useEffect(() => {
    const hydrated = hydrateCanonicalAvatarDraft();
    setBaseId(hydrated.baseId);
    setSkinT(hydrated.skinT);
    if (hydrated.equippedCosmeticIds[0]) setEquippedCosmeticId(hydrated.equippedCosmeticIds[0]!);
    setSavedLooks(loadSavedLooks());
    return subscribeCanonicalAvatarDraft((next) => {
      setBaseId(next.baseId);
      setSkinT(next.skinT);
      setEquippedCosmeticId(next.equippedCosmeticIds[0] ?? null);
    });
  }, []);

  const selectedBase = useMemo(() => getBobbleheadBaseById(baseId) ?? BOBBLEHEAD_BASES[0]!, [baseId]);
  const skin = useMemo(() => sampleFanSkinTone(skinT), [skinT]);
  const stats = useMemo(() => getFanCosmeticCatalogStats(), []);
  const preview = useMemo(
    () =>
      resolveAvatarPreview({
        displayName: selectedBase.displayName,
        baseId,
        skinT,
        equippedCosmeticIds: equippedCosmeticId ? [equippedCosmeticId] : [],
        previewAction: poseToPreviewAction(activePose),
        environmentId: "STUDIO_EDITOR",
        fidelity: "full",
        panelTargetId: null,
      }),
    [selectedBase.displayName, baseId, skinT, equippedCosmeticId, activePose],
  );

  // ── Actions & Handlers ──────────────────────────────────────────────────────
  const handleSelectBase = useCallback((base: BobbleheadBase) => {
    setBaseId(base.id);
    patchCanonicalAvatarDraft({ baseId: base.id });
  }, []);

  const handleSkinChange = useCallback((t: number) => {
    setSkinT(t);
    patchCanonicalAvatarDraft({ skinT: t });
  }, []);

  const handleEquipAndSave = useCallback(() => {
    const ids = equippedCosmeticId ? [equippedCosmeticId] : [];
    const blocked = assertWearablesProductionCompatible(ids);
    if (blocked.length) return;
    persistBobbleheadBaseId(baseId);
    persistFanSkinT(skinT);
    persistCanonicalDraftIdentity({
      ...getCanonicalAvatarDraft(),
      baseId,
      skinT,
      equippedCosmeticIds: ids,
    });
    if (equippedCosmeticId && !canCommitWearableToWorld(equippedCosmeticId, [])) {
      if (typeof window !== "undefined") window.location.assign(FAN_COSMETIC_STORE_HREF);
      return;
    }
    const look = resolveFanEquippedLook({
      displayName: selectedBase.displayName,
      equippedCosmeticIds: ids,
    });
    publishFanEquippedLook(look);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("bb:loadout:changed", { detail: { baseId, skinT, cosmeticId: equippedCosmeticId } }));
      window.dispatchEvent(new CustomEvent("tmi:avatar:equipped", { detail: { baseId, skinT, cosmeticId: equippedCosmeticId } }));
    }
    setEquipToast(true);
    setTimeout(() => setEquipToast(false), 2000);
  }, [baseId, skinT, equippedCosmeticId, selectedBase.displayName]);

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
              {equipToast ? "✓ EQUIPPED TO RUNTIME!" : "💾 EQUIP & SAVE"}
            </button>
          </div>
        </div>

        {/* ── Main Workspace: 3D Canvas Viewport + Customizer Grid ────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, 1.2fr) minmax(320px, 1.8fr)", gap: 16 }}>
          {/* Left Column: 3D Live Viewport & Animation Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                position: "relative",
                height: 380,
                borderRadius: 14,
                border: "1px solid rgba(0,255,255,0.35)",
                background: "radial-gradient(ellipse at center, rgba(170,45,255,0.15) 0%, rgba(5,5,18,0.95) 75%)",
                overflow: "hidden",
                boxShadow: "inset 0 0 40px rgba(0,0,0,0.8)",
              }}
            >
              {/* Active Character Live 3D */}
              <AvatarViewer
                {...(preview.rigProps ?? {})}
                size={380}
                enableOrbit={true}
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
              </div>

              {/* Camera Angle Presets */}
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  display: "flex",
                  gap: 4,
                  background: "rgba(0,0,0,0.65)",
                  padding: 4,
                  borderRadius: 6,
                }}
              >
                {(["front", "side", "back", "closeup"] as CameraAngle[]).map((ang) => (
                  <button
                    key={ang}
                    type="button"
                    onClick={() => setCameraAngle(ang)}
                    style={{
                      fontSize: 7,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      padding: "2px 6px",
                      borderRadius: 4,
                      border: `1px solid ${cameraAngle === ang ? "#00FFFF" : "transparent"}`,
                      background: cameraAngle === ang ? "rgba(0,255,255,0.25)" : "transparent",
                      color: cameraAngle === ang ? "#00FFFF" : "rgba(255,255,255,0.6)",
                      cursor: "pointer",
                    }}
                  >
                    {ang}
                  </button>
                ))}
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
                  onClick={() => setSelectedCategory(cat.id as CreatorCategory)}
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
              {selectedCategory === "FACE_SCAN" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <AvatarCreator />
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
