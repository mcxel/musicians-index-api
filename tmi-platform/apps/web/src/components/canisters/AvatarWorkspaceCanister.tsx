"use client";

import { useEffect, useState, useCallback, type CSSProperties } from "react";
import RoleGate from "@/components/auth/RoleGate";
import BobbleheadBasePicker from "@/components/avatar/BobbleheadBasePicker";
import {
  BOBBLEHEAD_DEFAULT_BASE_ID,
  getAccessoriesForBase,
  getBobbleheadBaseById,
} from "@/lib/avatars/BobbleheadBaseRegistry";
import {
  bobbleheadRuntimeToRigProps,
  persistBobbleheadBaseId,
  resolveBobbleheadRuntimeCharacter,
} from "@/lib/avatars/BobbleheadRuntimeCharacter";
import {
  FAN_SKIN_TONE_CONTINUUM,
  persistFanSkinT,
  readPersistedFanSkinT,
  sampleFanSkinTone,
} from "@/lib/avatars/FanCosmeticCatalog";
import dynamic from "next/dynamic";

const AvatarViewer = dynamic(
  () => import("@/components/3d/AvatarLobbyCanvas").then((m) => m.AvatarViewer),
  { ssr: false },
);

export interface AvatarBobbleheadConfig {
  skinTone: string;
  hairColor: string;
  outfitColor: string;
  accessory: string;
  headSize?: number;
  /** Fan bobblehead base id from BobbleheadBaseRegistry */
  baseId?: string;
}

interface SavedConfig {
  id: string;
  isComplete: boolean;
  previewImageUrl?: string;
  updatedAt: string;
  bobbleheadConfig?: AvatarBobbleheadConfig;
}

/** Prefer global continuum; keep legacy ids for saved configs. */
const SKIN_TONES = FAN_SKIN_TONE_CONTINUUM.map((s) => ({
  id: s.id,
  label: s.label,
  hex: s.hex,
  t: s.t,
}));
const HAIR_COLORS = [
  { id: "black",    hex: "#111111" },
  { id: "brown",    hex: "#6B3A2A" },
  { id: "blonde",   hex: "#D4A843" },
  { id: "red",      hex: "#A83216" },
  { id: "silver",   hex: "#B0B0C0" },
  { id: "cyan",     hex: "#00FFFF" },
  { id: "fuchsia",  hex: "#FF2DAA" },
  { id: "gold",     hex: "#FFD700" },
];
const OUTFIT_COLORS = [
  { id: "black",    hex: "#111111" },
  { id: "navy",     hex: "#0A0A40" },
  { id: "purple",   hex: "#AA2DFF" },
  { id: "cyan",     hex: "#00FFFF" },
  { id: "fuchsia",  hex: "#FF2DAA" },
  { id: "gold",     hex: "#FFD700" },
  { id: "white",    hex: "#F0F0F0" },
  { id: "red",      hex: "#CC2222" },
];
const ACCESSORIES = [
  { id: "none",         label: "None",      emoji: "" },
  { id: "chain",        label: "Chain",     emoji: "⛓️" },
  { id: "glasses",      label: "Glasses",   emoji: "🕶️" },
  { id: "crown",        label: "Crown",     emoji: "👑" },
  { id: "headphones",   label: "Headphones",emoji: "🎧" },
  { id: "cap",          label: "Cap",       emoji: "🧢" },
  { id: "mic",          label: "Mic",       emoji: "🎤" },
  { id: "fire",         label: "On Fire",   emoji: "🔥" },
];

function AvatarPreview({ config, size = 96 }: { config: AvatarBobbleheadConfig; size?: number }) {
  const skin = SKIN_TONES.find(s => s.id === config.skinTone)?.hex ?? "#C68642";
  const hair = HAIR_COLORS.find(h => h.id === config.hairColor)?.hex ?? "#111111";
  const outfit = OUTFIT_COLORS.find(o => o.id === config.outfitColor)?.hex ?? "#AA2DFF";
  const acc = ACCESSORIES.find(a => a.id === config.accessory)?.emoji ?? "";
  const head = Math.round(size * 1.0);
  const body = Math.round(size * 0.55);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      {/* Head */}
      <div style={{ position: "relative", width: head, height: head, borderRadius: "50%", background: skin, boxShadow: `0 0 18px ${hair}55`, overflow: "hidden", flexShrink: 0 }}>
        {/* Hair */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "38%", background: hair, borderRadius: "50% 50% 0 0" }} />
        {/* Eyes */}
        <div style={{ position: "absolute", top: "44%", left: "24%", width: "14%", height: "10%", background: "#222", borderRadius: "50%" }} />
        <div style={{ position: "absolute", top: "44%", right: "24%", width: "14%", height: "10%", background: "#222", borderRadius: "50%" }} />
        {/* Smile */}
        <div style={{ position: "absolute", bottom: "22%", left: "32%", right: "32%", height: "8%", borderBottom: `2px solid rgba(0,0,0,0.3)`, borderRadius: "0 0 50% 50%" }} />
        {/* Accessory */}
        {acc && <div style={{ position: "absolute", top: "2%", left: 0, right: 0, textAlign: "center", fontSize: Math.round(size * 0.22) }}>{acc}</div>}
      </div>
      {/* Body (outfit color block) */}
      <div style={{ width: body, height: Math.round(size * 0.3), background: outfit, borderRadius: "8px 8px 0 0", opacity: 0.85 }} />
    </div>
  );
}

export function AvatarWorkspaceCanister({ accentColor = "#AA2DFF" }: { accentColor?: string }) {
  const [config, setConfig] = useState<AvatarBobbleheadConfig>({
    skinTone: "medium",
    hairColor: "black",
    outfitColor: "purple",
    accessory: "none",
    baseId: BOBBLEHEAD_DEFAULT_BASE_ID,
  });
  const [saved, setSaved] = useState<SavedConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const baseId = config.baseId ?? BOBBLEHEAD_DEFAULT_BASE_ID;
  const selectedBase = getBobbleheadBaseById(baseId);
  const fitAccessories = getAccessoriesForBase(baseId);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/avatar/config", { credentials: "include" });
      if (res.ok) {
        const { config: cfg } = await res.json() as { config: SavedConfig & { bobbleheadConfig?: AvatarBobbleheadConfig } | null };
        if (cfg) {
          setSaved(cfg);
          if (cfg.bobbleheadConfig) {
            setConfig({
              ...cfg.bobbleheadConfig,
              baseId: cfg.bobbleheadConfig.baseId ?? BOBBLEHEAD_DEFAULT_BASE_ID,
            });
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      const previewFromBase = selectedBase?.previewImageUrl;
      const res = await fetch("/api/avatar/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          bobbleheadConfig: config,
          isComplete: true,
          previewImageUrl:
            previewFromBase ??
            `/api/avatar/preview?skin=${config.skinTone}&hair=${config.hairColor}&outfit=${config.outfitColor}&acc=${config.accessory}`,
        }),
      });
      if (res.ok) {
        const { config: cfg } = await res.json() as { config: SavedConfig };
        setSaved(cfg);
        setMsg("Avatar saved!");
      } else {
        setMsg("Save failed — try again.");
      }
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 3000);
    }
  }

  function set(k: keyof AvatarBobbleheadConfig, v: string) {
    setConfig((prev) => ({ ...prev, [k]: v }));
  }

  const swatch = (hex: string, selected: boolean, onClick: () => void) => (
    <button key={hex} onClick={onClick} title={hex}
      style={{ width: 28, height: 28, borderRadius: "50%", background: hex, border: selected ? `3px solid ${accentColor}` : "2px solid rgba(255,255,255,0.15)", cursor: "pointer", boxShadow: selected ? `0 0 8px ${hex}` : "none", flexShrink: 0 }}
    />
  );

  const label: CSSProperties = { fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 8, marginTop: 14 };
  const row: CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" };

  return (
    <RoleGate
      allow={["FAN", "USER", "ADMIN", "STAFF"]}
      fallback={
        <div style={{ padding: 18, borderRadius: 16, border: `1px solid ${accentColor}22`, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
          Avatar workspace is Fan-only (Rule 26).
        </div>
      }
    >
    <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${accentColor}22`, borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${accentColor}18`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: accentColor, fontWeight: 800 }}>MY AVATAR</div>
        {saved?.isComplete && <div style={{ fontSize: 9, color: "#00FF88", fontWeight: 700 }}>✓ SAVED</div>}
      </div>

      {loading ? (
        <div style={{ padding: 32, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Loading avatar…</div>
      ) : (
        <div style={{ padding: "16px 18px 24px" }}>
          <BobbleheadBasePicker
            selectedBaseId={baseId}
            onSelect={(b) => {
              persistBobbleheadBaseId(b.id);
              set("baseId", b.id);
            }}
            accentColor={accentColor}
            compact
          />

          <div style={{ display: "flex", gap: 24, marginTop: 16, flexWrap: "wrap" }}>
          {/* Preview column — spatial AvatarRig, not cutout image */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, flexShrink: 0 }}>
            {(() => {
              const character = resolveBobbleheadRuntimeCharacter(baseId);
              const skinHex = SKIN_TONES.find((s) => s.id === config.skinTone)?.hex;
              const hairHex = HAIR_COLORS.find((h) => h.id === config.hairColor)?.hex;
              const outfitHex = OUTFIT_COLORS.find((o) => o.id === config.outfitColor)?.hex;
              const rig = bobbleheadRuntimeToRigProps(character);
              return (
                <AvatarViewer
                  {...rig}
                  color={skinHex ?? rig.color}
                  hairColor={hairHex ?? rig.hairColor}
                  outfitTint={outfitHex ?? rig.outfitTint}
                  size={120}
                  enableOrbit
                  isPlaying={false}
                />
              );
            })()}
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", textAlign: "center", letterSpacing: "0.1em" }}>
              3D WORLD CITIZEN · PROCEDURAL RIG
            </div>
            {selectedBase && (
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.25)", textAlign: "center", maxWidth: 140 }}>
                Concept ref catalog only — not pasted as avatar
              </div>
            )}
            {saved?.isComplete && (
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
                Last saved<br />{new Date(saved.updatedAt).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Builder column */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={label}>SKIN TONE · GLOBAL CONTINUUM</div>
            <div
              style={{
                height: 14,
                borderRadius: 7,
                marginBottom: 8,
                background: `linear-gradient(90deg, ${FAN_SKIN_TONE_CONTINUUM.map((s) => s.hex).join(", ")})`,
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              defaultValue={readPersistedFanSkinT()}
              onChange={(e) => {
                const t = Number(e.target.value);
                persistFanSkinT(t);
                const sampled = sampleFanSkinTone(t);
                const nearest = SKIN_TONES.reduce((best, s) =>
                  Math.abs(s.t - t) < Math.abs(best.t - t) ? s : best,
                );
                set("skinTone", nearest.id);
                void sampled;
              }}
              aria-label="Skin tone continuum"
              style={{ width: "100%", accentColor: "#C68642", marginBottom: 8 }}
            />
            <div style={row}>
              {SKIN_TONES.map(s => swatch(s.hex, config.skinTone === s.id, () => {
                set("skinTone", s.id);
                persistFanSkinT(s.t);
              }))}
            </div>

            <div style={label}>HAIR COLOR</div>
            <div style={row}>
              {HAIR_COLORS.map(h => swatch(h.hex, config.hairColor === h.id, () => set("hairColor", h.id)))}
            </div>

            <div style={label}>OUTFIT</div>
            <div style={row}>
              {OUTFIT_COLORS.map(o => swatch(o.hex, config.outfitColor === o.id, () => set("outfitColor", o.id)))}
            </div>

            <div style={label}>ACCESSORY</div>
            <div style={{ ...row, gap: 6 }}>
              {ACCESSORIES.map(a => (
                <button key={a.id} onClick={() => set("accessory", a.id)}
                  style={{ padding: "4px 10px", borderRadius: 8, border: `1px solid ${config.accessory === a.id ? accentColor : "rgba(255,255,255,0.1)"}`, background: config.accessory === a.id ? `${accentColor}18` : "transparent", color: "#fff", fontSize: 12, cursor: "pointer" }}>
                  {a.emoji || <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>None</span>}
                </button>
              ))}
            </div>

            {fitAccessories.length > 0 && (
              <>
                <div style={label}>BASE FIT ACCESSORIES</div>
                <div style={{ ...row, gap: 6 }}>
                  {fitAccessories.map((a) => (
                    <span
                      key={a.id}
                      title={a.description}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.12)",
                        fontSize: 10,
                        color: "rgba(255,255,255,0.75)",
                      }}
                    >
                      {a.icon} {a.label}
                      {a.cosmeticSkuId ? ` → ${a.cosmeticSkuId}` : ""}
                    </span>
                  ))}
                </div>
              </>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 18, alignItems: "center" }}>
              <button onClick={() => void save()} disabled={saving}
                style={{ padding: "10px 22px", borderRadius: 9, border: "none", background: accentColor, color: "#000", fontSize: 10, fontWeight: 900, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, letterSpacing: "0.1em" }}>
                {saving ? "SAVING…" : "SAVE AVATAR"}
              </button>
              {msg && <span style={{ fontSize: 11, color: msg.includes("saved") ? "#00FF88" : "#FF4444" }}>{msg}</span>}
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
    </RoleGate>
  );
}

export { AvatarPreview };
