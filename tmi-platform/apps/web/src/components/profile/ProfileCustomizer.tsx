"use client";

import { useState, useCallback } from "react";
import {
  PURCHASABLE_PACKS,
  FREE_STYLE_IDS,
  canUseStylePack,
  type AnimationIntensity,
  type ProfileLayout,
  type PublicProfileConfig,
  DEFAULT_PUBLIC_PROFILE_CONFIG,
} from "@/lib/profile/PublicProfileStyleEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProfileCustomizerProps {
  config: PublicProfileConfig;
  ownedPackIds: string[];
  accountTier: string;
  onSave: (next: PublicProfileConfig) => Promise<void>;
  onClose: () => void;
  /** Injected from useProfileConfig — drives button label and error display. */
  saveStatus?: "idle" | "saving" | "saved" | "error";
  saveError?: string | null;
}

type CTab = "LOOK" | "CONTENT" | "MOTION";

const CTABS: CTab[] = ["LOOK", "CONTENT", "MOTION"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACCENT_PRESETS = [
  "#00FFFF", "#FF2DAA", "#FFD700", "#AA2DFF",
  "#00FF88", "#FF6B00", "#0066FF", "#FF0040",
  "#FFFFFF", "#39FF14", "#FF69B4", "#1DE9B6",
];

function colorCircle(hex: string, active: boolean, onClick: () => void) {
  return (
    <button
      key={hex}
      type="button"
      onClick={onClick}
      title={hex}
      style={{
        width: 26,
        height: 26,
        borderRadius: "50%",
        background: hex,
        border: active ? "2px solid #fff" : "2px solid transparent",
        cursor: "pointer",
        outline: active ? "2px solid rgba(255,255,255,0.4)" : "none",
        outlineOffset: 2,
        transition: "outline 0.15s",
      }}
    />
  );
}

const INTENSITY_LABELS: Record<AnimationIntensity, string> = {
  OFF: "Off — static",
  LOW: "Low — subtle",
  NORMAL: "Normal",
  HIGH: "Full — immersive",
};

const LAYOUT_LABELS: Record<ProfileLayout, string> = {
  SINGLE_COL: "Single column",
  SIDEBAR_RIGHT: "Content + sidebar",
  MAGAZINE: "Magazine spread",
  FEATURE_HERO: "Feature hero",
};

const ALL_MODULES = [
  "ABOUT", "MEDIA", "FEATURED_TRACK", "PLAYLIST", "YOPHO",
  "SNIPS", "MEMORY", "LIVE_NOW", "UPCOMING", "MAGAZINE",
  "BOOKING", "MERCH", "ACHIEVEMENTS", "FOLLOWING", "SOCIAL_LINKS",
];

const sectionStyle: React.CSSProperties = {
  marginBottom: 28,
};

const labelStyle: React.CSSProperties = {
  fontSize: 8,
  fontWeight: 900,
  letterSpacing: "0.18em",
  color: "rgba(255,255,255,0.4)",
  marginBottom: 10,
  textTransform: "uppercase" as const,
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Owner-facing public page customizer panel.
 * Three tabs: LOOK (color, pack, layout, font), CONTENT (module order),
 * MOTION (animation intensity).
 *
 * Never reads from fake data. All entitlement decisions go through
 * PublicProfileStyleEngine.canUseStylePack().
 */
export default function ProfileCustomizer({
  config: initialConfig,
  ownedPackIds,
  accountTier,
  onSave,
  onClose,
  saveStatus = "idle",
  saveError = null,
}: ProfileCustomizerProps) {
  const [cfg, setCfg] = useState<PublicProfileConfig>({ ...DEFAULT_PUBLIC_PROFILE_CONFIG, ...initialConfig });
  const [activeTab, setActiveTab] = useState<CTab>("LOOK");
  // saving is derived from saveStatus so the parent hook is the single source of truth
  const saving = saveStatus === "saving";

  const patch = useCallback(<K extends keyof PublicProfileConfig>(key: K, value: PublicProfileConfig[K]) => {
    setCfg((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = async () => {
    await onSave(cfg);
  };

  const allOwned = [...FREE_STYLE_IDS, ...ownedPackIds];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5,3,16,0.88)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        backdropFilter: "blur(8px)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", color: "#fff" }}>
          CUSTOMIZE PUBLIC PAGE
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.1em",
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              background: saveStatus === "saved" ? "#00FF88" : saveStatus === "error" ? "#E63000" : cfg.accentColor,
              color: "#050510",
              cursor: saving ? "default" : "pointer",
              opacity: saving ? 0.7 : 1,
              transition: "background 0.2s",
            }}
          >
            {saveStatus === "saving" ? "SAVING…" : saveStatus === "saved" ? "✓ SAVED" : saveStatus === "error" ? "ERROR — RETRY" : "PUBLISH CHANGES"}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              fontSize: 9,
              fontWeight: 700,
              padding: "8px 14px",
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "transparent",
              color: "rgba(255,255,255,0.5)",
              cursor: "pointer",
            }}
          >
            CLOSE
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0, padding: "0 20px" }}>
        {CTABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            style={{
              padding: "12px 20px",
              background: "none",
              border: "none",
              borderBottom: activeTab === t ? `2px solid ${cfg.accentColor}` : "2px solid transparent",
              color: activeTab === t ? cfg.accentColor : "rgba(255,255,255,0.4)",
              fontSize: 9,
              fontWeight: 900,
              cursor: "pointer",
              letterSpacing: "0.12em",
              fontFamily: "inherit",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>

        {/* ── LOOK ─────────────────────────────────────────────────────────── */}
        {activeTab === "LOOK" && (
          <>
            {/* Accent color */}
            <div style={sectionStyle}>
              <div style={labelStyle}>ACCENT COLOR (FREE)</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {ACCENT_PRESETS.map((hex) =>
                  colorCircle(hex, cfg.accentColor === hex, () => patch("accentColor", hex))
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>CUSTOM</span>
                <input
                  type="color"
                  value={cfg.accentColor}
                  onChange={(e) => patch("accentColor", e.target.value)}
                  style={{ width: 32, height: 32, padding: 0, border: "none", background: "transparent", cursor: "pointer" }}
                />
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
                  {cfg.accentColor.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Layout */}
            <div style={sectionStyle}>
              <div style={labelStyle}>LAYOUT (FREE)</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {(Object.keys(LAYOUT_LABELS) as ProfileLayout[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => patch("layout", l)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: `1px solid ${cfg.layout === l ? cfg.accentColor + "88" : "rgba(255,255,255,0.08)"}`,
                      background: cfg.layout === l ? `${cfg.accentColor}12` : "rgba(255,255,255,0.02)",
                      color: cfg.layout === l ? cfg.accentColor : "rgba(255,255,255,0.55)",
                      fontSize: 9,
                      fontWeight: cfg.layout === l ? 900 : 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textAlign: "left",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {LAYOUT_LABELS[l]}
                    {cfg.layout === l && <span style={{ fontSize: 8 }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Style packs */}
            <div style={sectionStyle}>
              <div style={labelStyle}>STYLE PACKS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {PURCHASABLE_PACKS.map((pack) => {
                  const entitled = canUseStylePack(pack.id, allOwned, accountTier);
                  const active = cfg.activeStylePackId === pack.id;
                  return (
                    <div
                      key={pack.id}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 10,
                        border: `1px solid ${active ? cfg.accentColor + "66" : "rgba(255,255,255,0.07)"}`,
                        background: active ? `${cfg.accentColor}10` : "rgba(255,255,255,0.02)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        opacity: entitled ? 1 : 0.55,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: active ? cfg.accentColor : "#fff", marginBottom: 3 }}>
                          {pack.name}
                        </div>
                        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                          {pack.description}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        {entitled ? (
                          <button
                            type="button"
                            onClick={() => patch("activeStylePackId", pack.id)}
                            style={{
                              fontSize: 8,
                              fontWeight: 900,
                              letterSpacing: "0.1em",
                              padding: "5px 12px",
                              borderRadius: 5,
                              border: `1px solid ${cfg.accentColor}55`,
                              background: active ? cfg.accentColor : "transparent",
                              color: active ? "#050510" : cfg.accentColor,
                              cursor: "pointer",
                              fontFamily: "inherit",
                            }}
                          >
                            {active ? "ACTIVE" : "APPLY"}
                          </button>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                            <span style={{ fontSize: 8, fontWeight: 900, color: "#FFD700" }}>
                              {pack.priceCents != null
                                ? `$${(pack.priceCents / 100).toFixed(2)}`
                                : pack.coinCost != null
                                  ? `${pack.coinCost} pts`
                                  : pack.requiredTier?.toUpperCase()}
                            </span>
                            <span style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}>
                              {pack.priceCents != null ? "BUY" : pack.coinCost != null ? "SPEND POINTS" : "TIER UNLOCK"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── CONTENT ──────────────────────────────────────────────────────── */}
        {activeTab === "CONTENT" && (
          <div style={sectionStyle}>
            <div style={labelStyle}>VISIBLE MODULES (drag to reorder — coming soon)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {ALL_MODULES.map((mod) => {
                const on = cfg.visibleModules.includes(mod);
                return (
                  <div
                    key={mod}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: `1px solid ${on ? cfg.accentColor + "44" : "rgba(255,255,255,0.06)"}`,
                      background: on ? `${cfg.accentColor}08` : "transparent",
                    }}
                  >
                    <span style={{ fontSize: 9, fontWeight: 700, color: on ? "#fff" : "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>
                      {mod.replace(/_/g, " ")}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        patch(
                          "visibleModules",
                          on
                            ? cfg.visibleModules.filter((m) => m !== mod)
                            : [...cfg.visibleModules, mod],
                        )
                      }
                      style={{
                        fontSize: 8,
                        fontWeight: 900,
                        padding: "4px 10px",
                        borderRadius: 4,
                        border: `1px solid ${on ? cfg.accentColor + "55" : "rgba(255,255,255,0.12)"}`,
                        background: "transparent",
                        color: on ? cfg.accentColor : "rgba(255,255,255,0.35)",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {on ? "VISIBLE" : "HIDDEN"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── MOTION ───────────────────────────────────────────────────────── */}
        {activeTab === "MOTION" && (
          <div style={sectionStyle}>
            <div style={labelStyle}>ANIMATION INTENSITY</div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: 20 }}>
              Visitor-side "Reduce Effects" always overrides this setting.
              Reduced-motion system preference is always respected.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(["OFF", "LOW", "NORMAL", "HIGH"] as AnimationIntensity[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => patch("animationIntensity", lvl)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    borderRadius: 8,
                    border: `1px solid ${cfg.animationIntensity === lvl ? cfg.accentColor + "88" : "rgba(255,255,255,0.08)"}`,
                    background: cfg.animationIntensity === lvl ? `${cfg.accentColor}12` : "rgba(255,255,255,0.02)",
                    color: cfg.animationIntensity === lvl ? cfg.accentColor : "rgba(255,255,255,0.55)",
                    fontSize: 9,
                    fontWeight: cfg.animationIntensity === lvl ? 900 : 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    letterSpacing: "0.08em",
                  }}
                >
                  {INTENSITY_LABELS[lvl]}
                  {cfg.animationIntensity === lvl && <span style={{ fontSize: 8 }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
