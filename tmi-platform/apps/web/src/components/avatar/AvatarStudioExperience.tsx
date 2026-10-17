"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AvatarCameraFocus } from "@/components/3d/AvatarLobbyCanvas";
import type { PhonemeGroup } from "@/lib/avatar/AvatarLipSyncDirectiveEngine";
import { SPEAKING_HOLD_MS, SPEAKING_THRESHOLD } from "@/lib/audio/TMIAudioSafetyMixer";
import { SoundSystemEngine } from "@/lib/sound/SoundSystemEngine";
import { SOUND_THEMES, type SoundThemeId } from "@/lib/sound/SoundThemeRegistry";
import { soundSettingsStore, useSoundSettingsStore } from "@/lib/sound/SoundSettingsStore";
import { resolveAvatarVoicePreview } from "@/lib/avatars/AvatarVoicePreview";
import RoleGate from "@/components/auth/RoleGate";
import AvatarAccessoryGrid from "@/components/avatar/AvatarAccessoryGrid";
import AvatarEyeSelector from "@/components/avatar/AvatarEyeSelector";
import AvatarForgePreview3D from "@/components/avatar/AvatarForgePreview3D";
import AvatarHairSelector from "@/components/avatar/AvatarHairSelector";
import AvatarOutfitRail from "@/components/avatar/AvatarOutfitRail";
import AvatarSaveRail from "@/components/avatar/AvatarSaveRail";
import AvatarSkinSelector from "@/components/avatar/AvatarSkinSelector";
import {
  equipItem,
  getStarterInventory,
  syncInventoryToProfile,
  type AvatarInventoryItem,
} from "@/lib/avatar/avatarInventoryEngine";
import {
  FAN_COSMETIC_CATALOG,
  FORGE_OUTFIT_TO_SKU,
  FORGE_PROP_TO_SKU,
  listFanCosmeticsBySlot,
} from "@/lib/avatars/FanCosmeticCatalog";
import { CanonicalAvatarProfile } from "@/lib/avatars/CanonicalAvatarRegistry";
import {
  commitCanonicalDraftToFanWorld,
  getCanonicalAvatarDraft,
  hydrateCanonicalAvatarDraft,
  patchCanonicalAvatarDraft,
  subscribeCanonicalAvatarDraft,
} from "@/lib/avatars/CanonicalAvatarDraft";
import {
  AVATAR_PREVIEW_RUNTIME_OWNER,
  createAvatarLookFromDraft,
  publishAvatarPreviewCertProbe,
  resolveAvatarPreview,
} from "@/lib/avatars/AvatarPreviewRuntime";
import AvatarPreviewParityControls from "@/components/avatars/AvatarPreviewParityControls";
import CanonicalQuickPanelContent from "@/components/workspace/universal/CanonicalQuickPanelContent";
import { canCommitWearableToWorld, resolveWearableCapability } from "@/lib/avatars/AvatarWearableCapability";
import type { CanonicalAvatarDraftState } from "@/lib/avatars/AvatarPreviewRuntime";
import { avatarBehavioralDirector } from "@/lib/avatars/AvatarBehavioralDirector";

export interface AvatarStudioExperienceProps {
  onSaveProfile?: (profile: CanonicalAvatarProfile) => void;
  onClose?: () => void;
  embedded?: boolean;
}

type StudioCategory =
  | "scan"
  | "body"
  | "skin"
  | "hair"
  | "face"
  | "proportions"
  | "outfit"
  | "shoes"
  | "accessories"
  | "save";

const CATEGORIES: { id: StudioCategory; label: string; icon: string; focus: AvatarCameraFocus }[] = [
  { id: "scan", label: "Face Scan", icon: "📷", focus: "face" },
  { id: "body", label: "Body", icon: "🧍", focus: "body" },
  { id: "skin", label: "Skin", icon: "🎨", focus: "body" },
  { id: "hair", label: "Hair", icon: "💇", focus: "face" },
  { id: "face", label: "Face", icon: "🙂", focus: "face" },
  { id: "proportions", label: "Proportions", icon: "📐", focus: "body" },
  { id: "outfit", label: "Starter Packs", icon: "👕", focus: "body" },
  { id: "shoes", label: "Shoes", icon: "👟", focus: "feet" },
  { id: "accessories", label: "Accessories", icon: "💎", focus: "body" },
  { id: "save", label: "Save", icon: "💾", focus: "body" },
];

const skinOptions = [
  "#fde9d9", "#f5cdb0", "#e8b48a", "#d4956a",
  "#c07848", "#a05e34", "#7a4028", "#5e2d18",
  "#f5c9a0", "#d4a574", "#b8896a", "#3d1c0e",
];
const hairOptions = ["Fade", "Locs", "Braids", "Afro", "Bald"];
const eyeOptions = ["Neon Blue", "Emerald", "Amber", "Platinum"];
const accessories = ["Gold Chain", "Retro Glasses", "Face Stripe", "Ear Monitors"];
const outfits = ["Street Fit", "Arena Captain", "Studio Coder", "Royal Stage"];
const propsList = ["Neon Mic", "Laptop Rig", "Turntable", "Holo Flag"];

const FACE_SCAN_LS = "tmi_avatar_face_scan";
const SNAPSHOT_LS = "tmi_avatar_snapshot";

type StarterPack = { id: string; label: string; skuIds: string[] };

const STARTER_PACKS: StarterPack[] = [
  { id: "street", label: "Street Fit", skuIds: ["street_fit"] },
  { id: "arena", label: "Arena Captain", skuIds: ["arena_captain"] },
  { id: "royal", label: "Royal Stage", skuIds: ["royal_stage"] },
  { id: "jester", label: "Jester Costume", skuIds: ["jester_costume", "jester_hat"] },
  { id: "cyber", label: "Cyber Jacket", skuIds: ["cyber-jacket-neon"] },
];

const FAN_FALLBACK = (
  <main style={{ minHeight: "40vh", padding: 32, color: "#ccc" }}>
    <p style={{ fontWeight: 800, color: "#FF2DAA" }}>Fan-only avatar ownership</p>
    <p style={{ fontSize: 13 }}>Avatar Studio is for Fan accounts. Performers use real photo and live camera identity (Rule 26).</p>
  </main>
);

export default function AvatarStudioExperience({ onClose, embedded = false }: AvatarStudioExperienceProps) {
  const [category, setCategory] = useState<StudioCategory>("scan");

  useEffect(() => {
    avatarBehavioralDirector.setContext("CREATION_CENTER");
  }, []);
  const [profileName, setProfileName] = useState("");
  const [skin, setSkin] = useState(skinOptions[4]);
  const [hair, setHair] = useState(hairOptions[0]);
  const [eyes, setEyes] = useState(eyeOptions[0]);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>(["Gold Chain"]);
  const [outfit, setOutfit] = useState(outfits[0]);
  const [propName, setPropName] = useState(propsList[0]);
  const [pose, setPose] = useState("Idle");
  const [bodyHeight, setBodyHeight] = useState(50);
  const [bodyMass, setBodyMass] = useState(50);
  const [inventory, setInventory] = useState<AvatarInventoryItem[]>(() => getStarterInventory());
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
  const [scanNote, setScanNote] = useState("");
  const [activePackId, setActivePackId] = useState<string | null>("street");
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [draft, setDraft] = useState<CanonicalAvatarDraftState>(() => getCanonicalAvatarDraft());
  const [showQuickParity, setShowQuickParity] = useState(false);
  const [lockedPreviewNote, setLockedPreviewNote] = useState<string | null>(null);
  const [savedLookNote, setSavedLookNote] = useState<string | null>(null);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const [microphoneStarting, setMicrophoneStarting] = useState(false);
  const [microphoneError, setMicrophoneError] = useState("");
  const [microphoneLevel, setMicrophoneLevel] = useState(0);
  const [voiceTalking, setVoiceTalking] = useState(false);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const microphoneMonitorRef = useRef<ReturnType<typeof SoundSystemEngine.monitorMicrophone>>(null);
  const lastVoiceActivityAtRef = useRef(0);
  const avatarSoundTheme = useSoundSettingsStore((state) => state.activeTheme);

  const stopMicrophonePreview = useCallback(() => {
    microphoneMonitorRef.current?.disconnect();
    microphoneMonitorRef.current = null;
    microphoneStreamRef.current?.getTracks().forEach((track) => track.stop());
    microphoneStreamRef.current = null;
    setMicrophoneEnabled(false);
    setMicrophoneLevel(0);
    setVoiceTalking(false);
  }, []);

  const startMicrophonePreview = useCallback(async () => {
    if (microphoneStarting || microphoneEnabled) return;
    setMicrophoneStarting(true);
    setMicrophoneError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Microphone access is unavailable in this browser.");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: false,
      });
      const monitor = SoundSystemEngine.monitorMicrophone(stream);
      if (!monitor) {
        stream.getTracks().forEach((track) => track.stop());
        throw new Error("Audio analysis is unavailable in this browser.");
      }
      microphoneStreamRef.current = stream;
      microphoneMonitorRef.current = monitor;
      setMicrophoneEnabled(true);
    } catch (error) {
      setMicrophoneError(error instanceof Error ? error.message : "Microphone permission was not granted.");
      stopMicrophonePreview();
    } finally {
      setMicrophoneStarting(false);
    }
  }, [microphoneEnabled, microphoneStarting, stopMicrophonePreview]);

  useEffect(() => () => {
    microphoneMonitorRef.current?.disconnect();
    microphoneStreamRef.current?.getTracks().forEach((track) => track.stop());
    microphoneMonitorRef.current = null;
    microphoneStreamRef.current = null;
  }, []);

  useEffect(() => {
    if (!microphoneEnabled) return;
    let timer: number | undefined;
    const sampleMicrophone = () => {
      const level = microphoneMonitorRef.current?.readLevel() ?? 0;
      const now = Date.now();
      if (level >= SPEAKING_THRESHOLD) lastVoiceActivityAtRef.current = now;
      setMicrophoneLevel(level);
      setVoiceTalking(now - lastVoiceActivityAtRef.current <= SPEAKING_HOLD_MS);
      timer = window.setTimeout(sampleMicrophone, 80);
    };
    sampleMicrophone();
    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [microphoneEnabled]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(FACE_SCAN_LS);
      if (stored) setPortraitUrl(stored);
      const snapRaw = window.localStorage.getItem(SNAPSHOT_LS);
      if (snapRaw) {
        const snap = JSON.parse(snapRaw) as {
          displayName?: string; skin?: string; hair?: string; outfit?: string;
          bodyHeight?: number; bodyMass?: number;
        };
        if (snap.displayName) setProfileName(snap.displayName);
        if (snap.skin) setSkin(snap.skin);
        if (snap.hair) setHair(snap.hair);
        if (snap.outfit) setOutfit(snap.outfit);
        if (typeof snap.bodyHeight === "number") setBodyHeight(snap.bodyHeight);
        if (typeof snap.bodyMass === "number") setBodyMass(snap.bodyMass);
      }
    } catch {
      /* localStorage unavailable */
    }
    const hydrated = hydrateCanonicalAvatarDraft();
    setDraft(hydrated);
    const unsub = subscribeCanonicalAvatarDraft(setDraft);

    async function hydrate() {
      try {
        const [loadRes, cfgRes] = await Promise.all([
          fetch("/api/avatar/load", { credentials: "include", cache: "no-store" }),
          fetch("/api/avatar/config", { credentials: "include", cache: "no-store" }),
        ]);
        if (loadRes.ok) {
          const payload = await loadRes.json();
          const profile = payload?.AvatarProfile;
          const inventoryData = payload?.AvatarInventory?.items;
          if (profile?.displayName) setProfileName(profile.displayName);
          if (profile?.skinTone) setSkin(profile.skinTone);
          if (profile?.hairStyle) setHair(profile.hairStyle);
          if (profile?.eyeStyle) setEyes(profile.eyeStyle);
          if (Array.isArray(inventoryData) && inventoryData.length) setInventory(inventoryData);
        }
        if (cfgRes.ok) {
          const cfgPayload = await cfgRes.json() as { config?: { faceScanUrl?: string | null; previewImageUrl?: string | null } | null };
          const url = cfgPayload.config?.faceScanUrl || cfgPayload.config?.previewImageUrl;
          if (url) setPortraitUrl(url);
        }
      } catch {
        /* keep local defaults */
      }
    }
    void hydrate();
    return unsub;
  }, []);

  const preview = useMemo(() => resolveAvatarPreview(draft), [draft]);

  useEffect(() => {
    publishAvatarPreviewCertProbe("full-studio", preview);
  }, [preview]);

  // Sync UI pose chips with canonical draft motion (one action set).
  useEffect(() => {
    const action = draft.previewAction;
    if (action === "DANCE" || action === "DANCE_RANGE_TEST") setPose("Dance");
    else if (action === "SIT" || action === "DEEP_SIT") setPose("Sit");
    else setPose("Idle");
  }, [draft.previewAction]);

  const ownedIds = useMemo(
    () => new Set(inventory.filter((i) => i.owned !== false).map((i) => i.itemId)),
    [inventory],
  );

  const availablePacks = useMemo(
    () => STARTER_PACKS.filter((pack) => pack.skuIds.every((id) => {
      const def = FAN_COSMETIC_CATALOG.find((c) => c.id === id);
      return ownedIds.has(id) || def?.pointsCost === 0;
    })),
    [ownedIds],
  );

  const ownedShoes = useMemo(
    () => listFanCosmeticsBySlot("feet").filter((c) => ownedIds.has(c.id) || c.pointsCost === 0),
    [ownedIds],
  );

  const equippedCosmeticIds = useMemo(() => {
    const ids = inventory
      .filter((item) => item.equipped && item.owned !== false)
      .map((item) => item.itemId)
      .filter((id) => FAN_COSMETIC_CATALOG.some((c) => c.id === id));
    const pack = STARTER_PACKS.find((p) => p.id === activePackId);
    if (pack) {
      for (const sku of pack.skuIds) {
        if (!ids.includes(sku)) ids.push(sku);
      }
    }
    return ids;
  }, [inventory, activePackId]);

  // Keep Canonical Draft in lockstep with Full Studio so Quick Avatar sees the same look/motion.
  useEffect(() => {
    patchCanonicalAvatarDraft({
      displayName: profileName,
      equippedCosmeticIds,
    });
  }, [profileName, equippedCosmeticIds]);

  const previewLockedItem = useCallback(() => {
    const cap = resolveWearableCapability("gold_chain");
    if (!cap?.previewable) {
      setLockedPreviewNote("gold_chain not previewable");
      return;
    }
    // Preview without ownership — do not commit to world.
    patchCanonicalAvatarDraft({
      equippedCosmeticIds: [...new Set([...equippedCosmeticIds, "gold_chain"])],
    });
    const canOwn = canCommitWearableToWorld("gold_chain", ownedIds);
    setLockedPreviewNote(
      canOwn
        ? "gold_chain owned — equip allowed"
        : "LOCKED PREVIEW · gold_chain not owned · save blocked",
    );
  }, [equippedCosmeticIds, ownedIds]);

  const equipOwnedStreetFit = useCallback(() => {
    const next = equipItem(inventory, "street_fit");
    setInventory(next);
    setActivePackId("street");
    patchCanonicalAvatarDraft({ equippedCosmeticIds: ["street_fit"] });
    setLockedPreviewNote("OWNED EQUIP · street_fit");
  }, [inventory]);

  const saveLookContinuity = useCallback(() => {
    try {
      const look = createAvatarLookFromDraft(getCanonicalAvatarDraft(), "Phase2 Cert Look");
      window.localStorage.setItem(
        "tmi_avatar_phase2_saved_look",
        JSON.stringify(look),
      );
      setSavedLookNote(
        `Saved Look ${look.lookId} · cert=${look.certificationSnapshot.wearableCert}`,
      );
    } catch (err) {
      setSavedLookNote(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const cameraFocus = CATEGORIES.find((c) => c.id === category)?.focus ?? "body";
  const voicePreview = resolveAvatarVoicePreview(microphoneLevel, voiceTalking);

  const persistPortrait = useCallback(async (dataUrl: string) => {
    setPortraitUrl(dataUrl);
    try { window.localStorage.setItem(FACE_SCAN_LS, dataUrl); } catch { /* skip */ }
    try {
      await fetch("/api/avatar/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          faceScanUrl: dataUrl,
          previewImageUrl: dataUrl,
          isComplete: false,
        }),
      });
    } catch {
      /* local snapshot still holds */
    }
    setScanNote("Photo stored on your avatar record. Likeness mapping to a rigged 3D mesh is not certified.");
    setCategory("body");
  }, []);

  const toggleAccessory = (accessory: string) => {
    setSelectedAccessories((prev) =>
      prev.includes(accessory) ? prev.filter((item) => item !== accessory) : [...prev, accessory],
    );
  };

  const applyPack = (pack: StarterPack) => {
    setActivePackId(pack.id);
    const outfitLabel = Object.entries(FORGE_OUTFIT_TO_SKU).find(([, sku]) => pack.skuIds.includes(sku))?.[0];
    if (outfitLabel) setOutfit(outfitLabel);
    setInventory((prev) => {
      let next = prev;
      for (const sku of pack.skuIds) {
        next = equipItem(next, sku);
      }
      return next;
    });
  };

  const handleSave = async () => {
    let nextInventory = inventory;
    const neonMic = inventory.find((item) => item.name === "Neon Mic Skin");
    if (neonMic && propName === "Neon Mic") {
      nextInventory = equipItem(inventory, neonMic.id ?? neonMic.itemId ?? "");
      setInventory(nextInventory);
    }
    const sync = syncInventoryToProfile(nextInventory);
    try {
      await fetch("/api/avatar/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items: nextInventory }),
      });
      const saveResponse = await fetch("/api/avatar/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          profile: {
            displayName: profileName,
            skinTone: skin,
            hairStyle: hair,
            eyeStyle: eyes,
          },
          loadout: {
            outfit: FORGE_OUTFIT_TO_SKU[outfit] ?? outfit,
            prop: FORGE_PROP_TO_SKU[propName] ?? propName,
          },
        }),
      });
      if (saveResponse.ok) {
        const payload = await saveResponse.json();
        const ts = payload?.AvatarProfile?.updatedAt ?? sync.syncedAt;
        setSavedAt(ts);
      } else {
        setSavedAt(sync.syncedAt);
      }
    } catch {
      setSavedAt(sync.syncedAt);
    }
    patchCanonicalAvatarDraft({
      displayName: profileName,
      equippedCosmeticIds,
    });
    const commit = commitCanonicalDraftToFanWorld({
      ownedCosmeticIds: [...ownedIds],
      skinTone: skin,
      hairStyle: hair,
      outfitLabel: outfit,
      bodyHeight,
      bodyMass,
    });
    if (!commit.ok && commit.storeHref && typeof window !== "undefined") {
      window.location.assign(commit.storeHref);
    }
  };

  const panel = renderCategoryPanel({
    category,
    profileName, setProfileName,
    skin, setSkin,
    hair, setHair,
    eyes, setEyes,
    selectedAccessories, toggleAccessory,
    outfit, setOutfit,
    bodyHeight, setBodyHeight,
    bodyMass, setBodyMass,
    portraitUrl,
    scanNote,
    persistPortrait,
    availablePacks,
    activePackId,
    applyPack,
    ownedShoes,
    inventory,
    setInventory,
    onSave: handleSave,
    savedAt,
    pose,
    setPose,
  });

  return (
    <RoleGate allow={["FAN"]} fallback={FAN_FALLBACK}>
      <div
        className="tmi-avatar-studio"
        data-embedded={embedded ? "true" : "false"}
        data-testid="avatar-full-studio"
        data-avatar-preview-surface="full-studio"
        data-avatar-runtime-owner={AVATAR_PREVIEW_RUNTIME_OWNER}
        data-draft-id={draft.draftId}
        data-environment-id={draft.environmentId}
        data-panel-target={draft.panelTargetId ?? ""}
        data-preview-action={draft.previewAction}
        data-fidelity={preview.fidelity}
        data-occupancy-allowed={preview.environment.avatarOccupancyAllowed ? "true" : "false"}
        data-lighting-only={preview.environment.lightingOnly ? "true" : "false"}
        data-group-cam-editor-only={preview.presentation?.editorMannequinsOnly ? "true" : "false"}
      >
        <style>{STUDIO_CSS}</style>
        <header className="tmi-avatar-studio-head">
          <div>
            <div className="tmi-avatar-studio-kicker">AVATAR FIRST · 3D RUNTIME v0 · SHARED DRAFT</div>
            <h1>Avatar Studio</h1>
          </div>
          <div className="tmi-avatar-studio-head-actions">
            <button
              type="button"
              className="tmi-avatar-studio-chip"
              data-testid="avatar-studio-toggle-quick"
              onClick={() => setShowQuickParity((v) => !v)}
            >
              {showQuickParity ? "Hide Quick" : "Quick Avatar"}
            </button>
            <button
              type="button"
              className="tmi-avatar-studio-chip"
              onClick={() => {
                const next = pose === "Dance" ? "Idle" : "Dance";
                setPose(next);
                patchCanonicalAvatarDraft({ previewAction: next === "Dance" ? "DANCE" : "IDLE" });
              }}
            >
              {pose === "Dance" ? "Idle" : "Dance"}
            </button>
            {onClose ? (
              <button type="button" className="tmi-avatar-studio-chip" onClick={onClose}>Close</button>
            ) : null}
          </div>
        </header>

        <div className="tmi-avatar-studio-layout">
          <nav className="tmi-avatar-studio-rail" aria-label="Avatar categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={category === cat.id ? "is-active" : ""}
                onClick={() => { setCategory(cat.id); setDrawerOpen(true); }}
              >
                <span aria-hidden="true">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </nav>

          <div className="tmi-avatar-studio-stage">
            <div
              data-testid="avatar-audio-motion-controls"
              data-avatar-sound-theme={avatarSoundTheme}
              data-avatar-voice-active={voiceTalking ? "true" : "false"}
              style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}
            >
              <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#bde7ff", fontSize: 11 }}>
                Avatar sound pack
                <select
                  aria-label="Avatar sound pack"
                  value={avatarSoundTheme}
                  onChange={(event) => soundSettingsStore.setTheme(event.target.value as SoundThemeId)}
                  style={{ maxWidth: 180, padding: "7px 9px", color: "#fff", background: "#151022", border: "1px solid #63428f", borderRadius: 6 }}
                >
                  {Object.values(SOUND_THEMES).map((theme) => (
                    <option key={theme.id} value={theme.id}>{theme.icon} {theme.name}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="tmi-avatar-studio-chip"
                data-testid="avatar-preview-sound-pack"
                onClick={() => SoundSystemEngine.play("broadcast_start", avatarSoundTheme)}
              >
                Preview sound
              </button>
              <button
                type="button"
                className="tmi-avatar-studio-chip"
                data-testid="avatar-preview-microphone-toggle"
                aria-pressed={microphoneEnabled}
                disabled={microphoneStarting}
                onClick={() => microphoneEnabled ? stopMicrophonePreview() : void startMicrophonePreview()}
              >
                {microphoneStarting ? "Starting mic…" : microphoneEnabled ? "Turn mic off" : "Enable mic lip sync"}
              </button>
              {microphoneEnabled ? (
                <span data-testid="avatar-microphone-level" aria-live="polite" style={{ color: voiceTalking ? "#00FF88" : "#9aa0aa", fontSize: 10 }}>
                  {voiceTalking ? "Voice active" : "Mic on · listening locally"}
                </span>
              ) : null}
              {microphoneError ? <span role="status" style={{ color: "#ff8aa8", fontSize: 10 }}>{microphoneError}</span> : null}
            </div>
            <AvatarForgePreview3D
              hero
              cameraFocus={cameraFocus}
              profileName={profileName}
              skin={skin}
              hair={hair}
              eyes={eyes}
              outfit={outfit}
              propName={propName}
              background={draft.environmentId}
              lighting={draft.panelTargetId ?? "Spotlight"}
              pose={pose}
              accessories={selectedAccessories}
              bodyHeight={bodyHeight}
              bodyMass={bodyMass}
              equippedCosmeticIds={equippedCosmeticIds}
              portraitUrl={portraitUrl ?? undefined}
              talking={voicePreview.talking}
              phoneme={voicePreview.phoneme}
            />
            <div
              style={{
                marginTop: 10,
                padding: 12,
                borderRadius: 10,
                border: "1px solid rgba(0,229,255,0.25)",
                background: "rgba(5,5,16,0.85)",
              }}
            >
              <AvatarPreviewParityControls
                environmentId={draft.environmentId}
                panelTargetId={draft.panelTargetId}
                previewAction={draft.previewAction}
                viewport={preview.viewport}
                density="full"
              />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                <button
                  type="button"
                  data-testid="avatar-preview-locked-item"
                  className="tmi-avatar-studio-chip"
                  onClick={previewLockedItem}
                >
                  Preview locked
                </button>
                <button
                  type="button"
                  data-testid="avatar-equip-owned-item"
                  className="tmi-avatar-studio-chip"
                  onClick={equipOwnedStreetFit}
                >
                  Equip owned
                </button>
                <button
                  type="button"
                  data-testid="avatar-save-look"
                  className="tmi-avatar-studio-chip"
                  onClick={saveLookContinuity}
                >
                  Save Look
                </button>
                <button
                  type="button"
                  data-testid="avatar-reduced-motion"
                  className="tmi-avatar-studio-chip"
                  onClick={() =>
                    patchCanonicalAvatarDraft({
                      fidelity: draft.fidelity === "reduced" ? "full" : "reduced",
                    })
                  }
                >
                  Fidelity: {draft.fidelity}
                </button>
              </div>
              {lockedPreviewNote ? (
                <div data-testid="avatar-locked-item-note" style={{ fontSize: 10, color: "#FFD700", marginTop: 8 }}>
                  {lockedPreviewNote}
                </div>
              ) : null}
              {savedLookNote ? (
                <div data-testid="avatar-saved-look-note" style={{ fontSize: 10, color: "#00E5FF", marginTop: 6 }}>
                  {savedLookNote}
                </div>
              ) : null}
              <div
                data-testid="avatar-draft-id-label"
                style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 8 }}
              >
                draftId={draft.draftId}
              </div>
            </div>
            {showQuickParity ? (
              <div
                data-testid="avatar-quick-parity-embed"
                style={{
                  marginTop: 12,
                  border: "1px solid rgba(255,45,170,0.35)",
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "rgba(8,6,18,0.95)",
                }}
              >
                <CanonicalQuickPanelContent
                  workspaceId="inventory"
                  userId="studio-parity-fan"
                  displayName={profileName || "Fan avatar"}
                  role="fan"
                  accentColor="#FF2DAA"
                  onClose={() => setShowQuickParity(false)}
                  embedded
                />
              </div>
            ) : null}
          </div>

          <aside className={`tmi-avatar-studio-panel${drawerOpen ? " is-open" : ""}`}>
            <button
              type="button"
              className="tmi-avatar-studio-drawer-toggle"
              onClick={() => setDrawerOpen((v) => !v)}
            >
              {drawerOpen ? "Hide options" : CATEGORIES.find((c) => c.id === category)?.label ?? "Options"}
            </button>
            {drawerOpen ? panel : null}
          </aside>
        </div>
      </div>
    </RoleGate>
  );
}

function renderCategoryPanel(p: {
  category: StudioCategory;
  profileName: string;
  setProfileName: (v: string) => void;
  skin: string;
  setSkin: (v: string) => void;
  hair: string;
  setHair: (v: string) => void;
  eyes: string;
  setEyes: (v: string) => void;
  selectedAccessories: string[];
  toggleAccessory: (v: string) => void;
  outfit: string;
  setOutfit: (v: string) => void;
  bodyHeight: number;
  setBodyHeight: (v: number) => void;
  bodyMass: number;
  setBodyMass: (v: number) => void;
  portraitUrl: string | null;
  scanNote: string;
  persistPortrait: (dataUrl: string) => Promise<void>;
  availablePacks: StarterPack[];
  activePackId: string | null;
  applyPack: (pack: StarterPack) => void;
  ownedShoes: ReturnType<typeof listFanCosmeticsBySlot>;
  inventory: AvatarInventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<AvatarInventoryItem[]>>;
  onSave: () => void;
  savedAt: string | null;
  pose: string;
  setPose: (v: string) => void;
}) {
  switch (p.category) {
    case "scan":
      return <FaceScanStep portraitUrl={p.portraitUrl} note={p.scanNote} onCapture={p.persistPortrait} />;
    case "body":
      return (
        <IdentityBlock title="Body" hint="Identity — not a clothing pack. Scales the capsule rig.">
          <RangeRow label="HEIGHT" value={p.bodyHeight} hint={p.bodyHeight < 33 ? "Short" : p.bodyHeight < 66 ? "Average" : "Tall"} accent="#6ff2ff" onChange={p.setBodyHeight} />
          <RangeRow label="BUILD" value={p.bodyMass} hint={p.bodyMass < 25 ? "Slim" : p.bodyMass < 50 ? "Athletic" : p.bodyMass < 75 ? "Average" : "Solid"} accent="#ff9de2" onChange={p.setBodyMass} />
        </IdentityBlock>
      );
    case "skin":
      return (
        <IdentityBlock title="Skin" hint="Identity tone on the capsule body.">
          <AvatarSkinSelector skinOptions={skinOptions} selectedSkin={p.skin} onSelect={p.setSkin} />
        </IdentityBlock>
      );
    case "hair":
      return (
        <IdentityBlock title="Hair" hint="Identity hair tint on the capsule head — not a groomed mesh.">
          <AvatarHairSelector hairOptions={hairOptions} selectedHair={p.hair} onSelect={p.setHair} />
        </IdentityBlock>
      );
    case "face":
      return (
        <IdentityBlock title="Face refine" hint="Visor / eye color on the capsule. No facial landmark morphs exist yet.">
          <AvatarEyeSelector eyeOptions={eyeOptions} selectedEye={p.eyes} onSelect={p.setEyes} />
          {p.portraitUrl ? (
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 12 }}>
              Face plate uses your stored photo. It is a 2D overlay on the head sphere, not a photoreal 3D clone.
            </p>
          ) : (
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 12 }}>
              Capture a face photo in Face Scan to overlay it on this runtime.
            </p>
          )}
        </IdentityBlock>
      );
    case "proportions":
      return (
        <IdentityBlock title="Proportions" hint="Bobble-adjacent capsule scale. Head is already oversized vs body.">
          <RangeRow label="HEIGHT" value={p.bodyHeight} hint={`${p.bodyHeight}`} accent="#6ff2ff" onChange={p.setBodyHeight} />
          <RangeRow label="MASS" value={p.bodyMass} hint={`${p.bodyMass}`} accent="#ff9de2" onChange={p.setBodyMass} />
        </IdentityBlock>
      );
    case "outfit":
      return (
        <div>
          <h3 className="tmi-avatar-studio-panel-title">Starter packs</h3>
          <p className="tmi-avatar-studio-hint">Clothing / style shortcuts from your inventory. These are not identity settings.</p>
          {p.availablePacks.length === 0 ? (
            <p className="tmi-avatar-studio-hint">No owned clothing packs yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {p.availablePacks.map((pack) => (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => p.applyPack(pack)}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: 10,
                    cursor: "pointer",
                    border: p.activePackId === pack.id ? "1px solid #FFD700" : "1px solid #4c2d70",
                    background: p.activePackId === pack.id ? "#3a2a08" : "#1a1029",
                    color: "#f3e9ff",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {pack.label}
                </button>
              ))}
            </div>
          )}
          <AvatarOutfitRail
            outfits={outfits}
            selectedOutfit={p.outfit}
            onSelect={(o) => {
              p.setOutfit(o);
              const sku = FORGE_OUTFIT_TO_SKU[o];
              const pack = sku ? STARTER_PACKS.find((x) => x.skuIds.includes(sku)) : undefined;
              if (pack) p.applyPack(pack);
            }}
          />
        </div>
      );
    case "shoes":
      return (
        <div>
          <h3 className="tmi-avatar-studio-panel-title">Shoes</h3>
          <p className="tmi-avatar-studio-hint">Foot-socket items you already own. Empty if none are in inventory.</p>
          {p.ownedShoes.length === 0 ? (
            <p className="tmi-avatar-studio-hint">No owned footwear SKUs.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {p.ownedShoes.map((shoe) => {
                const on = p.inventory.some((i) => i.itemId === shoe.id && i.equipped);
                return (
                  <button
                    key={shoe.id}
                    type="button"
                    onClick={() => p.setInventory((prev) => equipItem(prev, shoe.id))}
                    style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      borderRadius: 10,
                      cursor: "pointer",
                      border: on ? "1px solid #FFD700" : "1px solid #4c2d70",
                      background: on ? "#3a2a08" : "#1a1029",
                      color: "#f3e9ff",
                      fontSize: 12,
                    }}
                  >
                    {shoe.icon} {shoe.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
    case "accessories":
      return (
        <div>
          <h3 className="tmi-avatar-studio-panel-title">Accessories</h3>
          <p className="tmi-avatar-studio-hint">Hats, glasses, chains mapped to existing socket SKUs.</p>
          <AvatarAccessoryGrid
            accessories={accessories}
            selectedAccessories={p.selectedAccessories}
            onToggle={p.toggleAccessory}
          />
        </div>
      );
    case "save":
      return (
        <div>
          <h3 className="tmi-avatar-studio-panel-title">Save</h3>
          <p className="tmi-avatar-studio-hint">Handle is identity. Loadout save writes skin/hair/eyes + equipped inventory.</p>
          <AvatarSaveRail profileName={p.profileName} onNameChange={p.setProfileName} onSave={p.onSave} savedAt={p.savedAt} />
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {["Idle", "Sit", "Dance"].map((poseName) => (
              <button
                key={poseName}
                type="button"
                onClick={() => p.setPose(poseName)}
                style={{
                  borderRadius: 16,
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 700,
                  border: p.pose === poseName ? "1px solid #7dffde" : "1px solid #4c2d70",
                  background: p.pose === poseName ? "#194635" : "#1a1029",
                  color: "#d8f7ef",
                }}
              >
                {poseName}
              </button>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}

function IdentityBlock({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="tmi-avatar-studio-panel-title">{title}</h3>
      <p className="tmi-avatar-studio-hint">{hint}</p>
      {children}
    </div>
  );
}

function RangeRow({ label, value, hint, accent, onChange }: { label: string; value: number; hint: string; accent: string; onChange: (n: number) => void }) {
  return (
    <label style={{ display: "grid", gap: 6, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#cab4eb" }}>
        <span>{label}</span>
        <span style={{ color: accent }}>{hint}</span>
      </div>
      <input type="range" min={0} max={100} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: "100%", accentColor: accent }} />
    </label>
  );
}

function FaceScanStep({
  portraitUrl,
  note,
  onCapture,
}: {
  portraitUrl: string | null;
  note: string;
  onCapture: (dataUrl: string) => Promise<void>;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [camError, setCamError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return () => { stream?.getTracks().forEach((t) => t.stop()); };
  }, [stream]);

  const startCamera = async () => {
    setCamError("");
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setStream(media);
      window.setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = media;
      }, 0);
    } catch {
      setCamError("Camera unavailable. Upload a photo instead.");
    }
  };

  const snap = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setBusy(true);
    await onCapture(canvas.toDataURL("image/jpeg", 0.85));
    setBusy(false);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") {
        setBusy(true);
        await onCapture(result);
        setBusy(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <h3 className="tmi-avatar-studio-panel-title">Face Scan</h3>
      <p className="tmi-avatar-studio-hint">
        Capture or upload a face photo. It is stored on your avatar record, then this same capsule preview loads — not a generated 3D clone.
      </p>
      {portraitUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={portraitUrl} alt="Stored face photo" style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 12, marginBottom: 10 }} />
      ) : null}
      {stream ? (
        <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", borderRadius: 12, transform: "scaleX(-1)", marginBottom: 10 }} />
      ) : null}
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {!stream ? (
          <button type="button" onClick={() => void startCamera()} className="tmi-avatar-studio-primary">Open camera</button>
        ) : (
          <button type="button" onClick={() => void snap()} disabled={busy} className="tmi-avatar-studio-primary">
            {busy ? "Saving photo…" : "Capture photo"}
          </button>
        )}
        <button type="button" onClick={() => fileRef.current?.click()} className="tmi-avatar-studio-chip" style={{ width: "100%" }}>
          Upload photo
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={onFile} />
      </div>
      {camError ? <p style={{ color: "#ff8aa8", fontSize: 11, marginTop: 8 }}>{camError}</p> : null}
      {note ? <p className="tmi-avatar-studio-hint" style={{ marginTop: 10 }}>{note}</p> : null}
    </div>
  );
}

const STUDIO_CSS = `
.tmi-avatar-studio {
  --cyan: #00FFFF;
  --fuchsia: #FF2DAA;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(165deg, #08040f, #1a1030 42%, #07050f);
  color: #f3e9ff;
}
.tmi-avatar-studio[data-embedded="true"] { min-height: 560px; height: 100%; }
.tmi-avatar-studio-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 14px 16px 8px;
  gap: 12px;
}
.tmi-avatar-studio-kicker {
  font-size: 10px;
  letter-spacing: 0.16em;
  color: #00FFFF99;
  font-weight: 800;
}
.tmi-avatar-studio-head h1 { margin: 4px 0 0; font-size: 22px; }
.tmi-avatar-studio-head-actions { display: flex; gap: 8px; }
.tmi-avatar-studio-layout {
  flex: 1;
  display: grid;
  grid-template-columns: 148px minmax(0, 1fr) 300px;
  min-height: 0;
  gap: 0;
}
.tmi-avatar-studio-rail {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  overflow-y: auto;
  border-right: 1px solid rgba(0,255,255,0.12);
}
.tmi-avatar-studio-rail button {
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  background: transparent;
  color: rgba(255,255,255,0.65);
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
}
.tmi-avatar-studio-rail button.is-active {
  color: #050510;
  background: linear-gradient(90deg, #00FFFF, #AA2DFF);
  border-color: #00FFFF;
}
.tmi-avatar-studio-stage {
  min-height: 420px;
  border-left: 1px solid rgba(170,45,255,0.12);
  border-right: 1px solid rgba(170,45,255,0.12);
}
.tmi-avatar-studio-panel {
  padding: 12px 14px 20px;
  overflow-y: auto;
  background: rgba(5,5,16,0.72);
}
.tmi-avatar-studio-panel-title {
  margin: 0 0 6px;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #e6d4ff;
}
.tmi-avatar-studio-hint { font-size: 11px; color: rgba(255,255,255,0.48); line-height: 1.45; margin: 0 0 12px; }
.tmi-avatar-studio-primary {
  width: 100%;
  border: none;
  border-radius: 10px;
  padding: 11px 12px;
  font-weight: 800;
  cursor: pointer;
  background: #00FFFF;
  color: #050510;
}
.tmi-avatar-studio-chip {
  border-radius: 10px;
  border: 1px solid rgba(0,255,255,0.35);
  background: rgba(0,255,255,0.08);
  color: #c8ffff;
  font-size: 11px;
  font-weight: 700;
  padding: 8px 10px;
  cursor: pointer;
}
.tmi-avatar-studio-drawer-toggle { display: none; }
@media (max-width: 860px) {
  .tmi-avatar-studio-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(52vh, 1fr) auto;
  }
  .tmi-avatar-studio-rail {
    flex-direction: row;
    overflow-x: auto;
    border-right: none;
    border-bottom: 1px solid rgba(0,255,255,0.12);
  }
  .tmi-avatar-studio-rail button { flex: 0 0 auto; white-space: nowrap; }
  .tmi-avatar-studio-stage { min-height: 52vh; order: 0; }
  .tmi-avatar-studio-panel {
    position: sticky;
    bottom: 0;
    max-height: 38vh;
    border-top: 1px solid rgba(170,45,255,0.25);
  }
  .tmi-avatar-studio-drawer-toggle {
    display: block;
    width: 100%;
    margin-bottom: 10px;
    border-radius: 10px;
    border: 1px solid rgba(255,45,170,0.4);
    background: rgba(255,45,170,0.12);
    color: #ffb3e0;
    font-size: 11px;
    font-weight: 800;
    padding: 8px;
    cursor: pointer;
  }
}
`;
