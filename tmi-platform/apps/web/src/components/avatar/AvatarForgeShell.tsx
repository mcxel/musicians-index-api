"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

// 12 globally inclusive skin tones — light → olive → tan → brown → dark brown → deep
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
const backgrounds = ["Studio Alley", "Neon Skyline", "Arena Stage", "Cyber Lounge"];
const lightingPresets = ["Spotlight", "Aurora", "Sunset Wash", "Night Pulse"];

function randomOf<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export default function AvatarForgeShell() {
  const userId = "demo-user";
  const [profileName, setProfileName] = useState("MC Charlie");
  const [skin, setSkin] = useState(skinOptions[4]);
  const [hair, setHair] = useState(hairOptions[0]);
  const [eyes, setEyes] = useState(eyeOptions[0]);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>(["Gold Chain"]);
  const [outfit, setOutfit] = useState(outfits[0]);
  const [propName, setPropName] = useState(propsList[0]);
  const [background, setBackground] = useState(backgrounds[0]);
  const [lighting, setLighting] = useState(lightingPresets[0]);
  const [pose, setPose] = useState("Idle");
  const [bodyHeight, setBodyHeight] = useState(50); // 0-100
  const [bodyMass, setBodyMass] = useState(50);     // 0-100
  const [inventory, setInventory] = useState<AvatarInventoryItem[]>(getStarterInventory());
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [mintResult, setMintResult] = useState<AvatarMintResult | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Web Audio UI chime — quick pluck on any selection change
  const playChime = useCallback((freq = 880) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch {
      // Audio blocked by browser policy — silently skip
    }
  }, []);

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
    setBodyHeight(Math.floor(Math.random() * 100));
    setBodyMass(Math.floor(Math.random() * 100));
    playChime(660);
  };

  const handleReset = () => {
    setSkin(skinOptions[4]);
    setHair(hairOptions[0]);
    setEyes(eyeOptions[0]);
    setSelectedAccessories(["Gold Chain"]);
    setOutfit(outfits[0]);
    setPropName(propsList[0]);
    setBackground(backgrounds[0]);
    setLighting(lightingPresets[0]);
    setPose("Idle");
    setBodyHeight(50);
    setBodyMass(50);
    playChime(440);
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
        const ts = payload?.AvatarProfile?.updatedAt ?? sync.syncedAt;
        setSavedAt(ts);
        const snapshot = { displayName: profileName, skin, hair, outfit, bodyHeight, bodyMass };
        localStorage.setItem('tmi_avatar_snapshot', JSON.stringify(snapshot));
        window.dispatchEvent(new CustomEvent('tmi:avatar-changed', { detail: snapshot }));
        return;
      }
    } catch {
      // Fall back to local sync timestamp.
    }
    setSavedAt(sync.syncedAt);
    // Broadcast snapshot so AvatarMiniPreview updates everywhere
    try {
      const snapshot = { displayName: profileName, skin, hair, outfit, bodyHeight, bodyMass };
      localStorage.setItem('tmi_avatar_snapshot', JSON.stringify(snapshot));
      window.dispatchEvent(new CustomEvent('tmi:avatar-changed', { detail: snapshot }));
    } catch { /* localStorage unavailable */ }
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
        <div style={{ fontSize: 11, letterSpacing: 2, color: "#9f7dd6" }}>Avatar Creation Center</div>
        <h1 style={{ margin: "4px 0 0", fontSize: 30 }}>Avatar Forge</h1>
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
            bodyHeight={bodyHeight}
            bodyMass={bodyMass}
          />
          <AvatarActionRail pose={pose} onPoseChange={(p) => { setPose(p); playChime(880); }} onRandomize={handleRandomize} onReset={handleReset} />
          <AvatarSaveRail profileName={profileName} onNameChange={setProfileName} onSave={handleSave} savedAt={savedAt} />
        </div>
        <aside style={{ display: "grid", gap: 10 }}>
          <AvatarSkinSelector skinOptions={skinOptions} selectedSkin={skin} onSelect={(s) => { setSkin(s); playChime(1046); }} />

          {/* Body Shape Controls */}
          <section style={{ background: "#120a1f", border: "1px solid #3f1f62", borderRadius: 14, padding: 16 }}>
            <h3 style={{ color: "#e6d4ff", fontSize: 13, letterSpacing: 1, marginTop: 0, marginBottom: 12 }}>Body Shape</h3>
            <div style={{ display: "grid", gap: 14 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#cab4eb" }}>
                  <span>HEIGHT</span>
                  <span style={{ color: "#6ff2ff" }}>{bodyHeight < 33 ? "Short" : bodyHeight < 66 ? "Average" : "Tall"}</span>
                </div>
                <input
                  type="range" min={0} max={100} value={bodyHeight}
                  onChange={(e) => { setBodyHeight(Number(e.target.value)); playChime(700 + Number(e.target.value) * 3); }}
                  style={{ width: "100%", accentColor: "#6ff2ff" }}
                />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#cab4eb" }}>
                  <span>BUILD</span>
                  <span style={{ color: "#ff9de2" }}>{bodyMass < 25 ? "Slim" : bodyMass < 50 ? "Athletic" : bodyMass < 75 ? "Average" : "Solid"}</span>
                </div>
                <input
                  type="range" min={0} max={100} value={bodyMass}
                  onChange={(e) => { setBodyMass(Number(e.target.value)); playChime(500 + Number(e.target.value) * 2); }}
                  style={{ width: "100%", accentColor: "#ff9de2" }}
                />
              </label>
            </div>
          </section>

          <AvatarHairSelector hairOptions={hairOptions} selectedHair={hair} onSelect={(h) => { setHair(h); playChime(990); }} />
          <AvatarEyeSelector eyeOptions={eyeOptions} selectedEye={eyes} onSelect={(e) => { setEyes(e); playChime(1100); }} />
          <AvatarAccessoryGrid
            accessories={accessories}
            selectedAccessories={selectedAccessories}
            onToggle={(a) => { toggleAccessory(a); playChime(770); }}
          />
          <AvatarOutfitRail outfits={outfits} selectedOutfit={outfit} onSelect={(o) => { setOutfit(o); playChime(830); }} />
          <AvatarPropRail propsList={propsList} selectedProp={propName} onSelect={(p) => { setPropName(p); playChime(920); }} />
          <AvatarBackgroundSelector
            backgrounds={backgrounds}
            selectedBackground={background}
            onSelect={(b) => { setBackground(b); playChime(660); }}
          />
          <AvatarLightingSelector
            lightingPresets={lightingPresets}
            selectedLighting={lighting}
            onSelect={(l) => { setLighting(l); playChime(740); }}
          />
          <AvatarNFTGenerator draft={draft} mintResult={mintResult} onMint={handleMint} />
        </aside>
      </div>
    </main>
  );
}
