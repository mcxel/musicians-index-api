"use client";

import { useState, useCallback } from "react";

interface AvatarState {
  skinToneHex: string;
  heightScale: number;
  bodyMassScale: number;
  ageTier: "ADULT" | "YOUTH_16";
  outfitId: string;
}

const SKIN_TONES = [
  { hex: "#FDDBB4", label: "Porcelain" },
  { hex: "#F1C27D", label: "Ivory" },
  { hex: "#E0AC69", label: "Sand" },
  { hex: "#C68642", label: "Caramel" },
  { hex: "#8D5524", label: "Bronze" },
  { hex: "#5C3317", label: "Espresso" },
  { hex: "#3B1F0A", label: "Ebony" },
  { hex: "#D4A574", label: "Warm Olive" },
];

const OUTFITS = [
  { id: "tmi_hoodie",    label: "TMI Studio Hoodie",  color: "#00FFFF" },
  { id: "cypher_jacket", label: "Cypher Glow Jacket", color: "#FF2DAA" },
  { id: "stage_vest",    label: "Stage Vest Dock",    color: "#FFD700" },
  { id: "streetwear",   label: "Street Drip",         color: "#AA2DFF" },
  { id: "jersey",       label: "Arena Jersey",        color: "#FF4444" },
  { id: "producer",     label: "Producer Puffer",     color: "#00FF88" },
];

function playSound(type: "swap" | "click" | "save"): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    if (type === "swap") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(587, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.08);
    } else if (type === "save") {
      osc.type = "square";
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1047, ctx.currentTime + 0.12);
    } else {
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
    }
    osc.start();
    osc.stop(ctx.currentTime + (type === "save" ? 0.15 : 0.06));
  } catch {
    // AudioContext requires user gesture — silent fallback
  }
}

export default function AvatarCreationStudio() {
  const [avatar, setAvatar] = useState<AvatarState>({
    skinToneHex: "#C68642",
    heightScale: 1.0,
    bodyMassScale: 1.0,
    ageTier: "ADULT",
    outfitId: "tmi_hoodie",
  });

  const activeOutfit = OUTFITS.find((o) => o.id === avatar.outfitId) ?? OUTFITS[0]!;

  const setSkin = useCallback((hex: string) => {
    setAvatar((p) => ({ ...p, skinToneHex: hex }));
    playSound("click");
  }, []);

  const setOutfit = useCallback((id: string) => {
    setAvatar((p) => ({ ...p, outfitId: id }));
    playSound("swap");
  }, []);

  return (
    <section
      style={{
        width: "100%",
        background: "linear-gradient(145deg, rgba(6,3,15,0.97), rgba(8,4,22,0.95))",
        border: "1px solid rgba(0,255,255,0.22)",
        borderRadius: 20,
        padding: "20px 18px",
        color: "#fff",
        fontFamily: "var(--font-tmi-rajdhani, 'Rajdhani', sans-serif)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 12, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.28em", color: "#00FFFF", textTransform: "uppercase", fontFamily: "var(--font-tmi-orbitron,'Orbitron',monospace)", marginBottom: 4 }}>
            TMI CHARACTER ENGINE
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            360° AVATAR CREATION CENTER
          </div>
        </div>
        <div style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.12em", background: "#FF2DAA", color: "#fff", borderRadius: 6, padding: "3px 8px", textTransform: "uppercase" }}>
          INCLUSIVE V1
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* LEFT: Avatar preview */}
        <div
          style={{
            aspectRatio: "1 / 1",
            background: "rgba(0,0,0,0.5)",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ fontSize: 7, fontFamily: "monospace", opacity: 0.3, position: "absolute", top: 8, left: 8 }}>360° MESH PREVIEW</div>

          {/* Simulated bobblehead */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transform: `scaleY(${avatar.heightScale}) scaleX(${avatar.bodyMassScale}) translateZ(0)`,
              transition: "transform 0.3s ease",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: avatar.skinToneHex,
                border: `3px solid ${activeOutfit.color}`,
                boxShadow: `0 0 18px ${activeOutfit.color}44`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                marginBottom: 6,
              }}
            >
              <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                <span>👁</span><span>👁</span>
              </div>
              <div style={{ width: 10, height: 3, background: "#000", borderRadius: 3 }} />
            </div>
            <div
              style={{
                width: 40,
                height: 50,
                borderRadius: "10px 10px 6px 6px",
                background: `linear-gradient(170deg, ${activeOutfit.color}88, ${activeOutfit.color}33)`,
                border: `1px solid ${activeOutfit.color}55`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 7,
                fontWeight: 800,
                color: "#fff",
                textTransform: "uppercase",
              }}
            >
              TMI
            </div>
            <div style={{ width: 44, height: 6, background: `${activeOutfit.color}22`, borderRadius: "50%", filter: "blur(4px)", marginTop: 4 }} />
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              fontSize: 7,
              fontWeight: 800,
              letterSpacing: "0.1em",
              background: avatar.ageTier === "YOUTH_16" ? "#AA2DFF" : "rgba(0,255,255,0.15)",
              border: `1px solid ${avatar.ageTier === "YOUTH_16" ? "#AA2DFF" : "rgba(0,255,255,0.35)"}`,
              borderRadius: 6,
              padding: "2px 6px",
              textTransform: "uppercase",
              color: "#fff",
            }}
          >
            {avatar.ageTier === "YOUTH_16" ? "16+ YOUTH" : "ADULT"}
          </div>
        </div>

        {/* RIGHT: Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Skin tone */}
          <div>
            <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.2em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", marginBottom: 6 }}>
              GLOBAL SKIN TONE
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {SKIN_TONES.map((t) => (
                <button
                  key={t.hex}
                  type="button"
                  title={t.label}
                  onClick={() => setSkin(t.hex)}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: t.hex,
                    border: avatar.skinToneHex === t.hex ? "2px solid #00FFFF" : "2px solid transparent",
                    cursor: "pointer",
                    outline: "none",
                    transform: avatar.skinToneHex === t.hex ? "scale(1.2)" : "scale(1)",
                    transition: "transform 0.15s ease",
                  }}
                  aria-label={`Skin tone: ${t.label}`}
                />
              ))}
            </div>
          </div>

          {/* Height */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, fontWeight: 800, letterSpacing: "0.16em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", marginBottom: 4 }}>
              <span>HEIGHT</span>
              <span style={{ color: "#00FFFF" }}>{Math.round(avatar.heightScale * 100)}%</span>
            </div>
            <input type="range" min="0.75" max="1.3" step="0.05" value={avatar.heightScale}
              onChange={(e) => setAvatar((p) => ({ ...p, heightScale: parseFloat(e.target.value) }))}
              style={{ width: "100%", accentColor: "#00FFFF" }} />
          </div>

          {/* Build */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, fontWeight: 800, letterSpacing: "0.16em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", marginBottom: 4 }}>
              <span>BUILD</span>
              <span style={{ color: "#FF2DAA" }}>{Math.round(avatar.bodyMassScale * 100)}%</span>
            </div>
            <input type="range" min="0.7" max="1.45" step="0.05" value={avatar.bodyMassScale}
              onChange={(e) => setAvatar((p) => ({ ...p, bodyMassScale: parseFloat(e.target.value) }))}
              style={{ width: "100%", accentColor: "#FF2DAA" }} />
          </div>

          {/* Age tier */}
          <div>
            <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.16em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", marginBottom: 6 }}>
              ACCOUNT TIER
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {(["ADULT", "YOUTH_16"] as const).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => { setAvatar((p) => ({ ...p, ageTier: tier })); playSound("click"); }}
                  style={{
                    flex: 1,
                    padding: "6px 4px",
                    borderRadius: 8,
                    border: `1px solid ${avatar.ageTier === tier ? (tier === "YOUTH_16" ? "#AA2DFF" : "#00FFFF") : "rgba(255,255,255,0.12)"}`,
                    background: avatar.ageTier === tier ? (tier === "YOUTH_16" ? "rgba(170,45,255,0.15)" : "rgba(0,255,255,0.1)") : "rgba(255,255,255,0.04)",
                    color: avatar.ageTier === tier ? "#fff" : "rgba(255,255,255,0.4)",
                    fontSize: 8,
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  {tier === "YOUTH_16" ? "16+ YOUTH" : "ADULT"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Outfit selector */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.2em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", marginBottom: 8 }}>
          OUTFIT SELECTION
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
          {OUTFITS.map((outfit) => (
            <button
              key={outfit.id}
              type="button"
              onClick={() => setOutfit(outfit.id)}
              style={{
                padding: "7px 6px",
                borderRadius: 8,
                border: `1px solid ${avatar.outfitId === outfit.id ? outfit.color : "rgba(255,255,255,0.1)"}`,
                background: avatar.outfitId === outfit.id ? `${outfit.color}18` : "rgba(255,255,255,0.03)",
                color: avatar.outfitId === outfit.id ? "#fff" : "rgba(255,255,255,0.45)",
                fontSize: 8,
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {outfit.label}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        type="button"
        onClick={() => playSound("save")}
        style={{
          width: "100%",
          marginTop: 16,
          padding: "12px",
          background: "#00FFFF",
          color: "#060410",
          borderRadius: 999,
          border: "none",
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          cursor: "pointer",
          fontFamily: "var(--font-tmi-orbitron,'Orbitron',monospace)",
        }}
      >
        SAVE AVATAR
      </button>
    </section>
  );
}
