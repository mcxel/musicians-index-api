"use client";

import { useEffect, useState, useCallback } from "react";

export interface AvatarBobbleheadConfig {
  skinTone: string;
  hairColor: string;
  outfitColor: string;
  accessory: string;
  headSize?: number;
}

interface SavedConfig {
  id: string;
  isComplete: boolean;
  previewImageUrl?: string;
  updatedAt: string;
  bobbleheadConfig?: AvatarBobbleheadConfig;
}

const SKIN_TONES = [
  { id: "ivory",    label: "Ivory",     hex: "#FDDBB4" },
  { id: "light",    label: "Light",     hex: "#F0C895" },
  { id: "medium",   label: "Medium",    hex: "#C68642" },
  { id: "tan",      label: "Tan",       hex: "#A0613A" },
  { id: "brown",    label: "Brown",     hex: "#7C4019" },
  { id: "dark",     label: "Dark",      hex: "#4A2010" },
];
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
    skinTone: "medium", hairColor: "black", outfitColor: "purple", accessory: "none",
  });
  const [saved, setSaved] = useState<SavedConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/avatar/config", { credentials: "include" });
      if (res.ok) {
        const { config: cfg } = await res.json() as { config: SavedConfig & { bobbleheadConfig?: AvatarBobbleheadConfig } | null };
        if (cfg) {
          setSaved(cfg);
          if (cfg.bobbleheadConfig) setConfig(cfg.bobbleheadConfig);
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
      const res = await fetch("/api/avatar/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          bobbleheadConfig: config,
          isComplete: true,
          previewImageUrl: `/api/avatar/preview?skin=${config.skinTone}&hair=${config.hairColor}&outfit=${config.outfitColor}&acc=${config.accessory}`,
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
    setConfig(prev => ({ ...prev, [k]: v }));
  }

  const swatch = (hex: string, selected: boolean, onClick: () => void) => (
    <button key={hex} onClick={onClick} title={hex}
      style={{ width: 28, height: 28, borderRadius: "50%", background: hex, border: selected ? `3px solid ${accentColor}` : "2px solid rgba(255,255,255,0.15)", cursor: "pointer", boxShadow: selected ? `0 0 8px ${hex}` : "none", flexShrink: 0 }}
    />
  );

  const label: React.CSSProperties = { fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 8, marginTop: 14 };
  const row: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" };

  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${accentColor}22`, borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${accentColor}18`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: accentColor, fontWeight: 800 }}>MY AVATAR</div>
        {saved?.isComplete && <div style={{ fontSize: 9, color: "#00FF88", fontWeight: 700 }}>✓ SAVED</div>}
      </div>

      {loading ? (
        <div style={{ padding: 32, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Loading avatar…</div>
      ) : (
        <div style={{ display: "flex", gap: 24, padding: "20px 20px 24px", flexWrap: "wrap" }}>
          {/* Preview column */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <AvatarPreview config={config} size={96} />
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", textAlign: "center", letterSpacing: "0.1em" }}>PREVIEW</div>
            {saved?.isComplete && (
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
                Last saved<br />{new Date(saved.updatedAt).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Builder column */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={label}>SKIN TONE</div>
            <div style={row}>
              {SKIN_TONES.map(s => swatch(s.hex, config.skinTone === s.id, () => set("skinTone", s.id)))}
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

            <div style={{ display: "flex", gap: 10, marginTop: 18, alignItems: "center" }}>
              <button onClick={() => void save()} disabled={saving}
                style={{ padding: "10px 22px", borderRadius: 9, border: "none", background: accentColor, color: "#000", fontSize: 10, fontWeight: 900, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, letterSpacing: "0.1em" }}>
                {saving ? "SAVING…" : "SAVE AVATAR"}
              </button>
              {msg && <span style={{ fontSize: 11, color: msg.includes("saved") ? "#00FF88" : "#FF4444" }}>{msg}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { AvatarPreview };
