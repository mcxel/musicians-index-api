"use client";

import { useEffect, useMemo, useState } from "react";
import AvatarAccessoryGrid from "@/components/avatar/AvatarAccessoryGrid";
import AvatarActionRail from "@/components/avatar/AvatarActionRail";
import AvatarBackgroundSelector from "@/components/avatar/AvatarBackgroundSelector";
import AvatarEyeSelector from "@/components/avatar/AvatarEyeSelector";
import AvatarHairSelector from "@/components/avatar/AvatarHairSelector";
import AvatarLightingSelector from "@/components/avatar/AvatarLightingSelector";
import AvatarNFTGenerator from "@/components/avatar/AvatarNFTGenerator";
import AvatarOutfitRail from "@/components/avatar/AvatarOutfitRail";
import AvatarPreviewStage from "@/components/avatar/AvatarPreviewStage";
import AvatarPropRail from "@/components/avatar/AvatarPropRail";
import AvatarSaveRail from "@/components/avatar/AvatarSaveRail";
import AvatarSkinSelector from "@/components/avatar/AvatarSkinSelector";
import { buildAvatarNFTDraft, mintAvatarNFT, type AvatarMintResult } from "@/lib/avatar/avatarNFTEngine";
import {
  equipItem,
  getStarterInventory,
  syncInventoryToProfile,
  type AvatarInventoryItem,
} from "@/lib/avatar/avatarInventoryEngine";

const skinOptions = ["#f8d4c0", "#ddaa85", "#c0865e", "#8c5a3f", "#5b3827"];
const hairOptions = ["Fade", "Locs", "Braids", "Afro", "Bald"];
const eyeOptions = ["Neon Blue", "Emerald", "Amber", "Platinum"];
const accessories = ["Gold Chain", "Retro Glasses", "Face Stripe", "Ear Monitors"];
const outfits = ["Street Fit", "Arena Captain", "Studio Coder", "Royal Stage"];
const propsList = ["Neon Mic", "Laptop Rig", "Turntable", "Holo Flag"];
const backgrounds = ["Studio Alley", "Neon Skyline", "Arena Stage", "Cyber Lounge"];
const lightingPresets = ["Spotlight", "Aurora", "Sunset Wash", "Night Pulse"];

function randomOf<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export default function AvatarForgeShell() {
  const userId = "demo-user";
  const [profileName, setProfileName] = useState("MC Charlie");
  const [skin, setSkin] = useState(skinOptions[2]);
  const [hair, setHair] = useState(hairOptions[0]);
  const [eyes, setEyes] = useState(eyeOptions[0]);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>(["Gold Chain"]);
  const [outfit, setOutfit] = useState(outfits[0]);
  const [propName, setPropName] = useState(propsList[0]);
  const [background, setBackground] = useState(backgrounds[0]);
  const [lighting, setLighting] = useState(lightingPresets[0]);
  const [pose, setPose] = useState("Idle");
  const [inventory, setInventory] = useState<AvatarInventoryItem[]>(getStarterInventory());
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [mintResult, setMintResult] = useState<AvatarMintResult | null>(null);

  useEffect(() => {
    async function hydrateFromApi() {
      try {
        const response = await fetch(`/api/avatar/load?userId=${userId}`, { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json();
        const profile = payload?.AvatarProfile;
        const inventoryData = payload?.AvatarInventory?.items;
        if (profile?.displayName) setProfileName(profile.displayName);
        if (Array.isArray(inventoryData)) setInventory(inventoryData);
      } catch {
        // Keep local defaults when API load fails.
      }
    }
    void hydrateFromApi();
  }, []);

  const draft = useMemo(() => {
    const equipped = inventory.filter((item) => item.equipped);
    return buildAvatarNFTDraft(profileName, equipped);
  }, [inventory, profileName]);

  const toggleAccessory = (accessory: string) => {
    setSelectedAccessories((prev) =>
      prev.includes(accessory) ? prev.filter((item) => item !== accessory) : [...prev, accessory],
    );
  };

  const handleRandomize = () => {
    setSkin(randomOf(skinOptions));
    setHair(randomOf(hairOptions));
    setEyes(randomOf(eyeOptions));
    setOutfit(randomOf(outfits));
    setPropName(randomOf(propsList));
    setBackground(randomOf(backgrounds));
    setLighting(randomOf(lightingPresets));
    setPose(randomOf(["Idle", "Wave", "Mic Up", "Dance", "Champion"]));
  };

  const handleReset = () => {
    setSkin(skinOptions[2]);
    setHair(hairOptions[0]);
    setEyes(eyeOptions[0]);
    setSelectedAccessories(["Gold Chain"]);
    setOutfit(outfits[0]);
    setPropName(propsList[0]);
    setBackground(backgrounds[0]);
    setLighting(lightingPresets[0]);
    setPose("Idle");
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
        body: JSON.stringify({ userId, items: nextInventory }),
      });
      const saveResponse = await fetch("/api/avatar/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          profile: {
            displayName: profileName,
            skinTone: skin,
            hairStyle: hair,
            eyeStyle: eyes,
          },
          loadout: {
            outfit,
            prop: propName,
            background,
            lighting,
          },
        }),
      });
      if (saveResponse.ok) {
        const payload = await saveResponse.json();
        setSavedAt(payload?.AvatarProfile?.updatedAt ?? sync.syncedAt);
        return;
      }
    } catch {
      // Fall back to local sync timestamp.
    }
    setSavedAt(sync.syncedAt);
  };

  const handleMint = async () => {
    try {
      const response = await fetch("/api/avatar/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, displayName: profileName }),
      });
      if (response.ok) {
        const payload = await response.json();
        const record = payload?.record;
        if (record?.tokenId && record?.txHash) {
          setMintResult({
            tokenId: record.tokenId,
            txHash: record.txHash,
            status: "queued",
            createdAt: record.mintedAt,
          });
          return;
        }
      }
    } catch {
      // API mint unavailable, use local fallback.
    }
    const result = mintAvatarNFT(draft);
    setMintResult(result);
  };

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(165deg, #08040f, #1a1030 42%, #07050f)", padding: 20 }}>
      <header style={{ maxWidth: 1300, margin: "0 auto 16px", color: "#f3e9ff" }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: "#9f7dd6" }}>Phase C1</div>
        <h1 style={{ margin: "4px 0 0", fontSize: 30 }}>Avatar Forge Shell</h1>
      </header>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, maxWidth: 1300, margin: "0 auto" }}>
        <div style={{ display: "grid", gap: 12 }}>
          <AvatarPreviewStage
            profileName={profileName}
            skin={skin}
            hair={hair}
            eyes={eyes}
            outfit={outfit}
            propName={propName}
            background={background}
            lighting={lighting}
            pose={pose}
            accessories={selectedAccessories}
          />
          <AvatarActionRail pose={pose} onPoseChange={setPose} onRandomize={handleRandomize} onReset={handleReset} />
          <AvatarSaveRail profileName={profileName} onNameChange={setProfileName} onSave={handleSave} savedAt={savedAt} />
        </div>
        <aside style={{ display: "grid", gap: 10 }}>
          <AvatarSkinSelector skinOptions={skinOptions} selectedSkin={skin} onSelect={setSkin} />
          <AvatarHairSelector hairOptions={hairOptions} selectedHair={hair} onSelect={setHair} />
          <AvatarEyeSelector eyeOptions={eyeOptions} selectedEye={eyes} onSelect={setEyes} />
          <AvatarAccessoryGrid
            accessories={accessories}
            selectedAccessories={selectedAccessories}
            onToggle={toggleAccessory}
          />
          <AvatarOutfitRail outfits={outfits} selectedOutfit={outfit} onSelect={setOutfit} />
          <AvatarPropRail propsList={propsList} selectedProp={propName} onSelect={setPropName} />
          <AvatarBackgroundSelector
            backgrounds={backgrounds}
            selectedBackground={background}
            onSelect={setBackground}
          />
          <AvatarLightingSelector
            lightingPresets={lightingPresets}
            selectedLighting={lighting}
            onSelect={setLighting}
          />
          <AvatarNFTGenerator draft={draft} mintResult={mintResult} onMint={handleMint} />
        </aside>
      </div>
    </main>
  );
}
