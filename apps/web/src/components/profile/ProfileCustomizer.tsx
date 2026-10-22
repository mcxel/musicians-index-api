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
  profileName?: string;
  profileSlug?: string;
  profileRole?: string;
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
  const [showChangeLayout, setShowChangeLayout] = useState(false);
  const [showColorPresets, setShowColorPresets] = useState(false);
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
            {/* Accent color - compact swatch with picker */}
            <div style={sectionStyle}>
              <div style={labelStyle}>ACCENT COLOR</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      background: cfg.accentColor,
                      border: "2px solid rgba(255,255,255,0.3)",
                      boxShadow: `0 0 8px ${cfg.accentColor}66`,
                    }}
                  />
                  <input
                    type="color"
                    data-testid="compact-accent-color-picker"
                    aria-label="Accent Color"
                    value={cfg.accentColor}
                    onChange={(e) => patch("accentColor", e.target.value)}
                    style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
                  />
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", fontFamily: "monospace" }}>
                    {cfg.accentColor.toUpperCase()}
                  </span>
                </label>
                <button
                  type="button"
                  data-testid="toggle-color-presets"
                  onClick={() => setShowColorPresets((p) => !p)}
                  style={{
                    fontSize: 8,
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: 4,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "transparent",
                    color: "rgba(255,255,255,0.6)",
                    cursor: "pointer",
                  }}
                >
                  {showColorPresets ? "CLOSE" : "PRESETS"}
                </button>
              </div>
              {showColorPresets ? (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                  {ACCENT_PRESETS.map((hex) =>
                    colorCircle(hex, cfg.accentColor === hex, () => {
                      patch("accentColor", hex);
                      setShowColorPresets(false);
                    })
                  )}
                </div>
              ) : null}
            </div>

            {/* Layout */}
            {/* Layout - compact after selection with CHANGE LAYOUT toggle */}
            <div style={sectionStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={labelStyle}>LAYOUT</div>
                <button
                  type="button"
                  data-testid="toggle-change-layout"
                  onClick={() => setShowChangeLayout((open) => !open)}
                  style={{
                    fontSize: 8,
                    fontWeight: 900,
                    letterSpacing: "0.1em",
                    padding: "4px 10px",
                    borderRadius: 4,
                    border: `1px solid ${showChangeLayout ? cfg.accentColor : "rgba(255,255,255,0.2)"}`, background: showChangeLayout ? `${cfg.accentColor}22` : "transparent",
                    color: showChangeLayout ? cfg.accentColor : "rgba(255,255,255,0.7)",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {showChangeLayout ? "DONE" : "CHANGE LAYOUT"}
                </button>
              </div>

              {!showChangeLayout ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: `1px solid ${cfg.accentColor}55`,
                    background: `${cfg.accentColor}0f`,
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                >
                  <span>{LAYOUT_LABELS[cfg.layout] ?? cfg.layout}</span>
                  <span style={{ fontSize: 8, color: cfg.accentColor, fontWeight: 900 }}>CURRENT</span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {(Object.keys(LAYOUT_LABELS) as ProfileLayout[]).map((l) => (
                    <button
                      key={l}
                      type="button"
                      data-testid={`layout-option-${l.toLowerCase()}`}
                      onClick={() => {
                        patch("layout", l);
                        setShowChangeLayout(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: `1px solid ${cfg.layout === l ? cfg.accentColor + "88" : "rgba(255,255,255,0.08)"}`, background: cfg.layout === l ? `${cfg.accentColor}12` : "rgba(255,255,255,0.02)",
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
              )}
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
            <div style={labelStyle}>SECTION LIBRARY (+ ADD / REMOVE FROM PAGE)</div>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>
              Add or remove structured modules from your Page. Adding mounts the section immediately on your canvas.
            </p>
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
                      border: `1px solid ${on ? cfg.accentColor + "55" : "rgba(255,255,255,0.08)"}`, background: on ? `${cfg.accentColor}0c` : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <span style={{ fontSize: 10, fontWeight: 800, color: on ? "#fff" : "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>
                      {mod.replace(/_/g, " ")}
                    </span>
                    {on ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          data-testid={`module-on-page-${mod.toLowerCase()}`}
                          style={{
                            fontSize: 8,
                            fontWeight: 900,
                            padding: "3px 8px",
                            borderRadius: 4,
                            background: `${cfg.accentColor}25`,
                            color: cfg.accentColor,
                            letterSpacing: "0.06em",
                            border: `1px solid ${cfg.accentColor}55`,
                          }}
                        >
                          ✓ ON PAGE
                        </span>
                        <button
                          type="button"
                          data-testid={`module-remove-${mod.toLowerCase()}`}
                          onClick={() => patch("visibleModules", cfg.visibleModules.filter((m) => m !== mod))}
                          style={{
                            fontSize: 8,
                            fontWeight: 800,
                            padding: "5px 10px",
                            borderRadius: 5,
                            border: "1px solid rgba(255,100,100,0.35)",
                            background: "rgba(255,50,50,0.08)",
                            color: "#FF8888",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            letterSpacing: "0.06em",
                          }}
                        >
                          REMOVE FROM PAGE
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        data-testid={`module-add-${mod.toLowerCase()}`}
                        onClick={() => patch("visibleModules", [...cfg.visibleModules, mod])}
                        style={{
                          fontSize: 9,
                          fontWeight: 900,
                          padding: "6px 14px",
                          borderRadius: 6,
                          border: `1px solid ${cfg.accentColor}`,
                          background: `${cfg.accentColor}22`,
                          color: cfg.accentColor,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          letterSpacing: "0.08em",
                        }}
                      >
                        + ADD TO PAGE
                      </button>
                    )}
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
