"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AvatarCameraFocus } from "@/components/3d/AvatarLobbyCanvas";
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
  hydrateCanonicalAvatarDraft,
  patchCanonicalAvatarDraft,
} from "@/lib/avatars/CanonicalAvatarDraft";

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
    hydrateCanonicalAvatarDraft();

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
  }, []);

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

  const cameraFocus = CATEGORIES.find((c) => c.id === category)?.focus ?? "body";

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
      <div className="tmi-avatar-studio" data-embedded={embedded ? "true" : "false"}>
        <style>{STUDIO_CSS}</style>
        <header className="tmi-avatar-studio-head">
          <div>
            <div className="tmi-avatar-studio-kicker">AVATAR FIRST · 3D RUNTIME v0</div>
            <h1>Avatar Studio</h1>
          </div>
          <div className="tmi-avatar-studio-head-actions">
            <button type="button" className="tmi-avatar-studio-chip" onClick={() => setPose(pose === "Dance" ? "Idle" : "Dance")}>
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
            <AvatarForgePreview3D
              hero
              cameraFocus={cameraFocus}
              profileName={profileName}
              skin={skin}
              hair={hair}
              eyes={eyes}
              outfit={outfit}
              propName={propName}
              background="Studio Alley"
              lighting="Spotlight"
              pose={pose}
              accessories={selectedAccessories}
              bodyHeight={bodyHeight}
              bodyMass={bodyMass}
              equippedCosmeticIds={equippedCosmeticIds}
              portraitUrl={portraitUrl ?? undefined}
            />
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
