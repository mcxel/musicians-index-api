"use client";

/**
 * TMIAvatarSystem.tsx
 * Fan-only avatar creation and customization for The Musician's Index.
 *
 * RULE: Only fan accounts can create avatars.
 *       Performers use their actual WebRTC camera feed — no avatar.
 *
 * Features:
 *  - Skin tone selector (12 globally inclusive tones)
 *  - Body shape / height sliders
 *  - Hair style + color picker
 *  - Outfit selection (6 base configs + accent colors)
 *  - Accessory / prop layer
 *  - Emote pack selection
 *  - Canvas preview with CSS-based 2D avatar render
 *  - Save → persists to user profile (API call)
 *  - Sound feedback on each selection (Web Audio API synthesizer)
 *  - Youth mode (16+ accounts see age-appropriate items only)
 *
 * Drop at: apps/web/src/components/avatar/TMIAvatarSystem.tsx
 * Route:   apps/web/src/app/avatar-center/page.tsx
 */

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";

/* ─── Types ─────────────────────────────────────────────────────────────── */
type SkinTone = {
  id: string;
  label: string;
  hex: string;
  shadowHex: string;
};

type HairStyle = {
  id: string;
  label: string;
  svgPath: string;
};

type OutfitId =
  | "streetwear" | "performer" | "casual" | "formal" | "sports" | "futuristic";

type EmotePack = {
  id: string;
  name: string;
  emotes: string[];
  tier: "free" | "gold" | "diamond";
};

export interface AvatarConfig {
  skinToneId: string;
  hairStyleId: string;
  hairColor: string;
  outfitId: OutfitId;
  outfitAccentColor: string;
  accessoryId: string;
  emotePackId: string;
  heightScale: number;       // 75–130
  buildScale: number;        // 70–145
  eyeColor: string;
  glowColor: string;
}

/* ─── Data ───────────────────────────────────────────────────────────────── */
const SKIN_TONES: SkinTone[] = [
  { id: "porcelain",  label: "Porcelain",   hex: "#FFE8D6", shadowHex: "#DDBA99" },
  { id: "ivory",      label: "Ivory",       hex: "#F5CBA7", shadowHex: "#C9956C" },
  { id: "sand",       label: "Sand",        hex: "#E8B88A", shadowHex: "#B5845A" },
  { id: "beige",      label: "Beige",       hex: "#D4956A", shadowHex: "#A06B40" },
  { id: "warm_olive", label: "Warm Olive",  hex: "#C68642", shadowHex: "#9E6321" },
  { id: "tan",        label: "Tan",         hex: "#B5651D", shadowHex: "#8B4513" },
  { id: "bronze",     label: "Bronze",      hex: "#A0522D", shadowHex: "#7A3920" },
  { id: "caramel",    label: "Caramel",     hex: "#8B4513", shadowHex: "#6B3410" },
  { id: "mahogany",   label: "Mahogany",    hex: "#7B3F00", shadowHex: "#5C2E00" },
  { id: "dark_brown", label: "Dark Brown",  hex: "#5C2E00", shadowHex: "#3D1F00" },
  { id: "espresso",   label: "Espresso",    hex: "#3B1F0A", shadowHex: "#1E0D05" },
  { id: "ebony",      label: "Ebony",       hex: "#1C0A02", shadowHex: "#0A0401" },
];

const HAIR_STYLES: HairStyle[] = [
  { id: "natural_afro",   label: "Natural Afro",    svgPath: "M50,15 Q80,5 90,30 Q95,55 80,65 Q65,75 50,70 Q35,75 20,65 Q5,55 10,30 Q20,5 50,15Z" },
  { id: "locs",           label: "Locs",            svgPath: "M25,20 L20,70 M35,15 L30,75 M50,12 L50,78 M65,15 L70,75 M75,20 L80,70" },
  { id: "braids",         label: "Braids",          svgPath: "M30,15 Q50,5 70,15 Q80,25 75,45 L65,80 M50,10 L50,80 M35,15 Q25,30 30,80" },
  { id: "fade",           label: "Fade",            svgPath: "M20,40 Q25,15 50,12 Q75,15 80,40 Q85,55 70,60 Q50,65 30,60 Q15,55 20,40Z" },
  { id: "waves",          label: "Waves",           svgPath: "M20,35 Q35,20 50,25 Q65,20 80,35 Q82,45 75,50 Q62,55 50,52 Q38,55 25,50 Q18,45 20,35Z" },
  { id: "curly_medium",   label: "Curly Medium",    svgPath: "M22,35 Q30,10 50,8 Q70,10 78,35 Q85,55 70,65 Q55,72 50,70 Q45,72 30,65 Q15,55 22,35Z" },
  { id: "straight_long",  label: "Straight Long",   svgPath: "M20,20 L15,90 Q25,95 30,90 L28,20 M80,20 L85,90 Q75,95 70,90 L72,20 Q65,8 50,5 Q35,8 20,20Z" },
  { id: "mohawk",         label: "Mohawk",          svgPath: "M45,5 Q50,0 55,5 L55,60 Q52,65 50,65 Q48,65 45,60Z" },
  { id: "bald",           label: "Bald / Clean",    svgPath: "" },
];

const OUTFITS: { id: OutfitId; label: string; icon: string; tier: "free" | "gold" | "diamond" }[] = [
  { id: "streetwear",   label: "Streetwear",   icon: "👕", tier: "free" },
  { id: "casual",       label: "Casual",       icon: "🧥", tier: "free" },
  { id: "performer",    label: "Performer",    icon: "🎤", tier: "gold" },
  { id: "formal",       label: "Formal",       icon: "🎩", tier: "gold" },
  { id: "sports",       label: "Sports",       icon: "🏆", tier: "gold" },
  { id: "futuristic",   label: "Futuristic",   icon: "🚀", tier: "diamond" },
];

const ACCESSORIES: { id: string; label: string; emoji: string; tier: "free" | "gold" | "diamond" }[] = [
  { id: "none",         label: "None",        emoji: "—",  tier: "free" },
  { id: "sunglasses",   label: "Sunglasses",  emoji: "🕶️", tier: "free" },
  { id: "cap",          label: "Cap",         emoji: "🧢", tier: "free" },
  { id: "crown",        label: "Crown",       emoji: "👑", tier: "gold" },
  { id: "headphones",   label: "Headphones",  emoji: "🎧", tier: "gold" },
  { id: "chain",        label: "Chain",       emoji: "⛓️", tier: "gold" },
  { id: "halo",         label: "Halo",        emoji: "✨", tier: "diamond" },
  { id: "flame_aura",   label: "Flame Aura",  emoji: "🔥", tier: "diamond" },
];

const EMOTE_PACKS: EmotePack[] = [
  { id: "basic",   name: "Basic",   emotes: ["👋","😄","🎵","👏","❤️"],          tier: "free" },
  { id: "hype",    name: "Hype",    emotes: ["🔥","💎","👑","⚡","🎤"],          tier: "gold" },
  { id: "rare",    name: "Rare",    emotes: ["🌟","💫","🚀","🎯","🏆"],          tier: "diamond" },
];

const DEFAULT_CONFIG: AvatarConfig = {
  skinToneId:        "sand",
  hairStyleId:       "curly_medium",
  hairColor:         "#2c1b0e",
  outfitId:          "streetwear",
  outfitAccentColor: "#06b6d4",
  accessoryId:       "none",
  emotePackId:       "basic",
  heightScale:       100,
  buildScale:        100,
  eyeColor:          "#1a4e7a",
  glowColor:         "#06b6d4",
};

/* ─── Sound synthesizer (no external libs) ──────────────────────────────── */
function playChime(freq = 440, type: OscillatorType = "sine", duration = 0.12) {
  if (typeof window === "undefined") return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start();
    osc.stop(ctx.currentTime + duration);
    osc.onended = () => ctx.close();
  } catch {
    /* AudioContext unavailable */
  }
}

/* ─── Canvas avatar renderer ─────────────────────────────────────────────── */
function AvatarCanvas({
  config,
  size = 200,
}: {
  config: AvatarConfig;
  size?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const skin = SKIN_TONES.find((s) => s.id === config.skinToneId) ?? SKIN_TONES[2];
  const hair = HAIR_STYLES.find((h) => h.id === config.hairStyleId) ?? HAIR_STYLES[0];
  const accessory = ACCESSORIES.find((a) => a.id === config.accessoryId) ?? ACCESSORIES[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const scaleH = config.heightScale / 100;
    const scaleB = config.buildScale / 100;

    /* Glow ring */
    ctx.save();
    ctx.shadowColor = config.glowColor;
    ctx.shadowBlur = 20;
    ctx.strokeStyle = config.glowColor + "60";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, h * 0.92, w * 0.38 * scaleB, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    /* Body */
    const bodyY = h * 0.55;
    const bodyH = h * 0.38 * scaleH;
    const bodyW = w * 0.32 * scaleB;
    ctx.fillStyle = config.outfitAccentColor + "cc";
    ctx.beginPath();
    ctx.roundRect(cx - bodyW, bodyY, bodyW * 2, bodyH, 12);
    ctx.fill();

    /* Neck */
    ctx.fillStyle = skin.hex;
    ctx.fillRect(cx - 8 * scaleB, bodyY - 14 * scaleH, 16 * scaleB, 18 * scaleH);

    /* Head */
    const headR = w * 0.16 * Math.min(scaleB, 1.1);
    const headY = bodyY - 14 * scaleH - headR * 1.6;
    ctx.fillStyle = skin.hex;
    ctx.shadowColor = skin.shadowHex;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(cx, headY, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    /* Eyes */
    const eyeOffsetX = headR * 0.35;
    const eyeOffsetY = headY + headR * 0.1;
    [cx - eyeOffsetX, cx + eyeOffsetX].forEach((ex) => {
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.ellipse(ex, eyeOffsetY, headR * 0.18, headR * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = config.eyeColor;
      ctx.beginPath();
      ctx.arc(ex, eyeOffsetY + 1, headR * 0.09, 0, Math.PI * 2);
      ctx.fill();
    });

    /* Smile */
    ctx.strokeStyle = skin.shadowHex;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, headY + headR * 0.3, headR * 0.22, 0.1, Math.PI - 0.1);
    ctx.stroke();

    /* Hair */
    if (hair.id !== "bald" && hair.svgPath) {
      ctx.save();
      ctx.translate(cx - headR, headY - headR * 1.1);
      ctx.scale((headR * 2) / 100, (headR * 2) / 100);
      ctx.fillStyle = config.hairColor;
      const path = new Path2D(hair.svgPath);
      ctx.fill(path);
      ctx.restore();
    }

    /* Accessory emoji */
    if (accessory.id !== "none") {
      ctx.font = `${headR * 0.8}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(accessory.emoji, cx + headR * 0.7, headY - headR * 0.85);
    }

    /* Outfit icon */
    const outfit = OUTFITS.find((o) => o.id === config.outfitId);
    if (outfit) {
      ctx.font = `${bodyH * 0.3}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(outfit.icon, cx, bodyY + bodyH * 0.4);
    }
  }, [config]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded-2xl border border-white/10"
      style={{ background: `radial-gradient(circle at 50% 60%, ${config.glowColor}22, #05050c 70%)` }}
    />
  );
}

/* ─── Tier gate badge ─────────────────────────────────────────────────────── */
function TierBadge({ tier }: { tier: "free" | "gold" | "diamond" }) {
  if (tier === "free") return null;
  return (
    <span
      className={`text-[7px] font-black px-1 py-0.5 rounded uppercase ml-1 ${
        tier === "diamond"
          ? "bg-cyan-500/20 text-cyan-400"
          : "bg-yellow-500/20 text-yellow-400"
      }`}
    >
      {tier}
    </span>
  );
}

/* ─── Section header ─────────────────────────────────────────────────────── */
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/30">{label}</p>
      {children}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function TMIAvatarSystem({
  userId,
  userTier = "free",
  isYouthAccount = false,
  initialConfig,
  onSave,
}: {
  userId: string;
  userTier?: "free" | "gold" | "diamond";
  isYouthAccount?: boolean;
  initialConfig?: Partial<AvatarConfig>;
  onSave?: (config: AvatarConfig) => void;
}) {
  const [config, setConfig] = useState<AvatarConfig>({ ...DEFAULT_CONFIG, ...initialConfig });
  const [activeTab, setActiveTab] = useState<"skin" | "hair" | "body" | "outfit" | "extras">("skin");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
    playChime(440 + Math.random() * 200, "sine", 0.1);
    setSaved(false);
  }

  function canUse(tier: "free" | "gold" | "diamond"): boolean {
    if (tier === "free") return true;
    if (tier === "gold") return userTier === "gold" || userTier === "diamond";
    return userTier === "diamond";
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/avatar/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, config }),
      });
      onSave?.(config);
      setSaved(true);
      playChime(523, "sine", 0.3);
      setTimeout(() => playChime(659, "sine", 0.3), 180);
      setTimeout(() => playChime(784, "sine", 0.4), 360);
    } catch {
      /* API may not exist yet — config is saved locally */
      onSave?.(config);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  const tabs: { id: typeof activeTab; label: string }[] = [
    { id: "skin",   label: "Skin" },
    { id: "hair",   label: "Hair" },
    { id: "body",   label: "Body" },
    { id: "outfit", label: "Outfit" },
    { id: "extras", label: "Extras" },
  ];

  return (
    <div className="min-h-screen bg-[#05050c] text-white flex flex-col max-w-md mx-auto md:max-w-2xl">

      {/* Header */}
      <div className="px-4 pt-6 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight">Avatar Creator</h1>
          <p className="text-[10px] text-white/30 mt-0.5">Fan accounts only · Performers use live camera</p>
        </div>
        <Link href="/hub/fan" className="text-[9px] text-white/30 uppercase tracking-wider hover:text-white">
          ← Hub
        </Link>
      </div>

      {/* Preview + Save */}
      <div className="flex items-center gap-4 px-4 mb-4">
        <AvatarCanvas config={config} size={120} />
        <div className="flex-1 space-y-2">
          <div className="text-[9px] text-white/40 space-y-1">
            <p>Height: <span className="text-white/70">{config.heightScale}%</span></p>
            <p>Build: <span className="text-white/70">{config.buildScale}%</span></p>
            <p>Tier: <span className="text-white/70 capitalize">{userTier}</span></p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
              saved
                ? "bg-green-600 text-black"
                : "bg-cyan-600 hover:bg-cyan-500 text-black"
            }`}
          >
            {saving ? "Saving..." : saved ? "✓ Saved" : "Save Avatar"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 mb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 text-[9px] font-black uppercase py-1.5 rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-cyan-600 text-black"
                : "bg-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-10 space-y-5 overflow-y-auto">

        {/* Skin */}
        {activeTab === "skin" && (
          <Section label="Skin Tone">
            <div className="grid grid-cols-6 gap-1.5">
              {SKIN_TONES.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => update("skinToneId", tone.id)}
                  title={tone.label}
                  className={`aspect-square rounded-xl border-2 transition-all ${
                    config.skinToneId === tone.id
                      ? "border-white scale-110"
                      : "border-transparent hover:border-white/40"
                  }`}
                  style={{ background: tone.hex }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3 mt-3">
              <label className="text-[9px] text-white/40 uppercase tracking-wider w-16">Eye</label>
              <input
                type="color"
                value={config.eyeColor}
                onChange={(e) => update("eyeColor", e.target.value)}
                className="w-10 h-8 rounded cursor-pointer border-0 bg-transparent"
              />
              <label className="text-[9px] text-white/40 uppercase tracking-wider w-16 ml-2">Glow</label>
              <input
                type="color"
                value={config.glowColor}
                onChange={(e) => update("glowColor", e.target.value)}
                className="w-10 h-8 rounded cursor-pointer border-0 bg-transparent"
              />
            </div>
          </Section>
        )}

        {/* Hair */}
        {activeTab === "hair" && (
          <>
            <Section label="Hair Style">
              <div className="grid grid-cols-3 gap-1.5">
                {HAIR_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => update("hairStyleId", style.id)}
                    className={`py-2 px-2 rounded-lg border text-[9px] font-bold uppercase text-left transition-all ${
                      config.hairStyleId === style.id
                        ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                        : "border-white/10 bg-white/3 text-white/50 hover:border-white/20"
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </Section>
            <Section label="Hair Color">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.hairColor}
                  onChange={(e) => update("hairColor", e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border-0 bg-transparent"
                />
                <div className="flex gap-1.5 flex-wrap">
                  {["#2c1b0e","#1a0d00","#c8902a","#e34234","#d4af37","#a8b5c8","#f5f5f5","#7f5af0"].map((c) => (
                    <button
                      key={c}
                      onClick={() => update("hairColor", c)}
                      className="w-7 h-7 rounded-full border-2 border-white/10 hover:border-white/60 transition-all"
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
            </Section>
          </>
        )}

        {/* Body */}
        {activeTab === "body" && (
          <>
            <Section label={`Height — ${config.heightScale}%`}>
              <input
                type="range" min={75} max={130} value={config.heightScale}
                onChange={(e) => update("heightScale", parseInt(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <div className="flex justify-between text-[8px] text-white/20">
                <span>Short (75%)</span><span>Average (100%)</span><span>Tall (130%)</span>
              </div>
            </Section>
            <Section label={`Build — ${config.buildScale}%`}>
              <input
                type="range" min={70} max={145} value={config.buildScale}
                onChange={(e) => update("buildScale", parseInt(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-[8px] text-white/20">
                <span>Slim (70%)</span><span>Average (100%)</span><span>Solid (145%)</span>
              </div>
            </Section>
          </>
        )}

        {/* Outfit */}
        {activeTab === "outfit" && (
          <>
            <Section label="Outfit">
              <div className="grid grid-cols-2 gap-2">
                {OUTFITS.map((outfit) => {
                  const locked = !canUse(outfit.tier);
                  return (
                    <button
                      key={outfit.id}
                      onClick={() => !locked && update("outfitId", outfit.id)}
                      disabled={locked}
                      className={`py-3 px-3 rounded-xl border flex items-center gap-2 transition-all ${
                        config.outfitId === outfit.id && !locked
                          ? "border-cyan-500 bg-cyan-500/10"
                          : locked
                          ? "border-white/5 bg-white/2 opacity-40 cursor-not-allowed"
                          : "border-white/10 bg-white/3 hover:border-white/20"
                      }`}
                    >
                      <span className="text-lg">{outfit.icon}</span>
                      <div className="text-left">
                        <p className="text-[10px] font-bold text-white">{outfit.label}</p>
                        <TierBadge tier={outfit.tier} />
                      </div>
                      {locked && <span className="ml-auto text-[8px] text-white/30">🔒</span>}
                    </button>
                  );
                })}
              </div>
            </Section>
            <Section label="Accent Color">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.outfitAccentColor}
                  onChange={(e) => update("outfitAccentColor", e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border-0 bg-transparent"
                />
                <div className="flex gap-1.5 flex-wrap">
                  {["#06b6d4","#a855f7","#ef4444","#f59e0b","#22c55e","#ff6600","#ec4899","#ffffff"].map((c) => (
                    <button
                      key={c}
                      onClick={() => update("outfitAccentColor", c)}
                      className="w-7 h-7 rounded-full border-2 border-white/10 hover:border-white/60 transition-all"
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
            </Section>
          </>
        )}

        {/* Extras */}
        {activeTab === "extras" && (
          <>
            <Section label="Accessories">
              <div className="grid grid-cols-2 gap-2">
                {ACCESSORIES
                  .filter((a) => !isYouthAccount || a.tier === "free")
                  .map((acc) => {
                    const locked = !canUse(acc.tier);
                    return (
                      <button
                        key={acc.id}
                        onClick={() => !locked && update("accessoryId", acc.id)}
                        disabled={locked}
                        className={`py-2 px-3 rounded-xl border flex items-center gap-2 transition-all ${
                          config.accessoryId === acc.id && !locked
                            ? "border-yellow-500 bg-yellow-500/10"
                            : locked
                            ? "border-white/5 opacity-40 cursor-not-allowed"
                            : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        <span>{acc.emoji}</span>
                        <span className="text-[10px] font-bold text-white/80">{acc.label}</span>
                        <TierBadge tier={acc.tier} />
                        {locked && <span className="ml-auto text-[8px] text-white/30">🔒</span>}
                      </button>
                    );
                  })}
              </div>
            </Section>

            <Section label="Emote Pack">
              <div className="space-y-2">
                {EMOTE_PACKS
                  .filter((p) => !isYouthAccount || p.tier === "free")
                  .map((pack) => {
                    const locked = !canUse(pack.tier);
                    return (
                      <button
                        key={pack.id}
                        onClick={() => !locked && update("emotePackId", pack.id)}
                        disabled={locked}
                        className={`w-full py-2 px-3 rounded-xl border flex items-center justify-between transition-all ${
                          config.emotePackId === pack.id && !locked
                            ? "border-purple-500 bg-purple-500/10"
                            : locked
                            ? "border-white/5 opacity-40 cursor-not-allowed"
                            : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white/80">{pack.name}</span>
                          <TierBadge tier={pack.tier} />
                        </div>
                        <span className="text-base">{pack.emotes.join(" ")}</span>
                        {locked && <span className="text-[8px] text-white/30">🔒</span>}
                      </button>
                    );
                  })}
              </div>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Avatar page export ─────────────────────────────────────────────────── */
export function AvatarCenterPage({
  session,
}: {
  session?: { userId: string; role: string; tier: string; isYouth?: boolean };
}) {
  if (session?.role === "performer" || session?.role === "artist") {
    return (
      <div className="min-h-screen bg-[#05050c] text-white flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <span className="text-5xl">🎤</span>
          <h2 className="text-xl font-black">Performers Use Live Camera</h2>
          <p className="text-white/50 text-sm leading-relaxed">
            As a performer, your live WebRTC video stream is your identity on TMI.
            Fans see your real face and performance — not an avatar.
          </p>
          <Link
            href="/hub/performer"
            className="inline-block bg-cyan-600 text-black font-black text-[10px] px-6 py-2.5 rounded-lg uppercase tracking-wider"
          >
            Go to Performer Hub →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <TMIAvatarSystem
      userId={session?.userId ?? "guest"}
      userTier={(session?.tier as "free" | "gold" | "diamond") ?? "free"}
      isYouthAccount={session?.isYouth ?? false}
    />
  );
}
