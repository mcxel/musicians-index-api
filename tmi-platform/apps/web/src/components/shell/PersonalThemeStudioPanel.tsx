"use client";

/**
 * PersonalThemeStudioPanel — full UI color studio (workspace + independent buttons).
 * Extends ThemeEngine; does not remount media / WebRTC / 3D.
 */

import { useEffect, useState } from "react";
import { ThemeEngine, THEME_CATALOG } from "@/lib/design/ThemeEngine";
import type { ButtonColorStyle, ThemeSectionId } from "@/lib/design/PersonalUiThemeAuthority";

const BUTTON_STYLES: { id: ButtonColorStyle; label: string }[] = [
  { id: "tmi_multicolor", label: "TMI multicolor" },
  { id: "solid_black", label: "Solid black" },
  { id: "solid_white", label: "Solid white" },
  { id: "neutral_gray", label: "Neutral gray" },
  { id: "outlined", label: "Outlined / minimal" },
  { id: "custom_solid", label: "One custom button color" },
];

const SECTION_IDS: { id: ThemeSectionId; label: string }[] = [
  { id: "workspace", label: "Main workspace" },
  { id: "drawer", label: "WORK drawers" },
  { id: "monitor", label: "Media displays" },
  { id: "hud", label: "HUD overlays" },
  { id: "nav", label: "Command / nav" },
  { id: "messaging", label: "Messaging" },
  { id: "store", label: "Store" },
  { id: "avatar_center", label: "Avatar Center" },
];

const FREE_PRESETS = [
  "neon-royal",
  "pure-black",
  "pure-white",
  "monochrome",
  "midnight-noir",
  "custom-color",
  "electric-ocean",
  "inferno",
  "emerald-empire",
  "sunset-boulevard",
] as const;

export default function PersonalThemeStudioPanel() {
  const [prefs, setPrefs] = useState(() => ThemeEngine.getPersonalPrefs());
  const [activeId, setActiveId] = useState(() => ThemeEngine.getActiveId());
  const [sectionEdit, setSectionEdit] = useState<ThemeSectionId>("drawer");

  useEffect(() => {
    return ThemeEngine.subscribe(() => {
      setPrefs(ThemeEngine.getPersonalPrefs());
      setActiveId(ThemeEngine.getActiveId());
    });
  }, []);

  const patch = (partial: Parameters<typeof ThemeEngine.setPersonalPrefs>[0]) => {
    ThemeEngine.setPersonalPrefs(partial);
  };

  const section = prefs.sectionOverrides[sectionEdit] ?? {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, color: "var(--text-primary)" }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: "var(--tmi-accent)", marginBottom: 8 }}>
          OVERALL UI APPEARANCE
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {FREE_PRESETS.map((id) => {
            const t = THEME_CATALOG[id];
            if (!t) return null;
            const on = activeId === id;
            return (
              <button
                key={id}
                type="button"
                className="tmi-chrome-btn"
                data-tmi-chrome="btn"
                onClick={() => ThemeEngine.apply(id)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: "pointer",
                  outline: on ? "2px solid #fff" : undefined,
                  outlineOffset: 2,
                }}
                title={t.description}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      </div>

      {activeId === "custom-color" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <label style={{ fontSize: 10 }}>
            Workspace background
            <input
              type="color"
              value={prefs.customBgHex}
              onChange={(e) => patch({ customBgHex: e.target.value, catalogThemeId: "custom-color" })}
              style={{ display: "block", width: "100%", height: 36, marginTop: 4, cursor: "pointer" }}
            />
          </label>
          <label style={{ fontSize: 10 }}>
            Text
            <input
              type="color"
              value={prefs.customTextHex}
              onChange={(e) => patch({ customTextHex: e.target.value })}
              style={{ display: "block", width: "100%", height: 36, marginTop: 4, cursor: "pointer" }}
            />
          </label>
          <label style={{ fontSize: 10 }}>
            Accent
            <input
              type="color"
              value={prefs.customAccentHex}
              onChange={(e) => patch({ customAccentHex: e.target.value })}
              style={{ display: "block", width: "100%", height: 36, marginTop: 4, cursor: "pointer" }}
            />
          </label>
        </div>
      )}

      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: "var(--tmi-accent)", marginBottom: 8 }}>
          BUTTON COLOR STYLE — independent of background
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {BUTTON_STYLES.map((b) => (
            <label
              key={b.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 11,
                cursor: "pointer",
                padding: "6px 8px",
                borderRadius: 6,
                border: `1px solid ${prefs.buttonStyle === b.id ? "var(--tmi-accent)" : "var(--border-subtle)"}`,
                background: prefs.buttonStyle === b.id ? "rgba(255,255,255,0.06)" : "transparent",
              }}
            >
              <input
                type="radio"
                name="tmi-btn-style"
                checked={prefs.buttonStyle === b.id}
                onChange={() => patch({ buttonStyle: b.id })}
              />
              {b.label}
            </label>
          ))}
        </div>
        {prefs.buttonStyle === "custom_solid" && (
          <label style={{ fontSize: 10, display: "block", marginTop: 8 }}>
            Custom button color
            <input
              type="color"
              value={prefs.customButtonHex}
              onChange={(e) => patch({ customButtonHex: e.target.value, buttonStyle: "custom_solid" })}
              style={{ display: "block", width: "100%", height: 36, marginTop: 4, cursor: "pointer" }}
            />
          </label>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <button type="button" className="tmi-chrome-btn" data-tmi-chrome="btn" style={{ padding: "8px 14px", borderRadius: 8, fontSize: 10, fontWeight: 800 }}>
            Preview primary
          </button>
          <button type="button" className="tmi-chrome-btn" data-tmi-chrome="btn" style={{ padding: "8px 14px", borderRadius: 8, fontSize: 10, fontWeight: 800 }}>
            Preview secondary
          </button>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: "var(--tmi-accent)", marginBottom: 8 }}>
          APPLY MODE
        </div>
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 11, marginBottom: 6, cursor: "pointer" }}>
          <input
            type="radio"
            checked={prefs.applyToEverything}
            onChange={() => patch({ applyToEverything: true })}
          />
          Apply to everything (coordinated palette)
        </label>
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 11, cursor: "pointer" }}>
          <input
            type="radio"
            checked={!prefs.applyToEverything}
            onChange={() => patch({ applyToEverything: false })}
          />
          Customize each section
        </label>
      </div>

      {!prefs.applyToEverything && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 8 }}>SECTION OVERRIDES</div>
          <select
            value={sectionEdit}
            onChange={(e) => setSectionEdit(e.target.value as ThemeSectionId)}
            style={{ width: "100%", marginBottom: 8, padding: 8, background: "var(--bg-elevated)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", borderRadius: 6 }}
          >
            {SECTION_IDS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <label style={{ fontSize: 10 }}>
              Background
              <input
                type="color"
                value={section.bg || prefs.customBgHex}
                onChange={(e) =>
                  patch({
                    sectionOverrides: {
                      ...prefs.sectionOverrides,
                      [sectionEdit]: { ...section, bg: e.target.value },
                    },
                  })
                }
                style={{ display: "block", width: "100%", height: 32, marginTop: 4 }}
              />
            </label>
            <label style={{ fontSize: 10 }}>
              Accent
              <input
                type="color"
                value={section.accent || prefs.customAccentHex}
                onChange={(e) =>
                  patch({
                    sectionOverrides: {
                      ...prefs.sectionOverrides,
                      [sectionEdit]: { ...section, accent: e.target.value },
                    },
                  })
                }
                style={{ display: "block", width: "100%", height: 32, marginTop: 4 }}
              />
            </label>
          </div>
        </div>
      )}

      <div>
        <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 6 }}>HUD OVERLAY OPACITY</div>
        <input
          type="range"
          min={0.15}
          max={1}
          step={0.05}
          value={prefs.hudOpacity}
          onChange={(e) => patch({ hudOpacity: Number(e.target.value) })}
          style={{ width: "100%", accentColor: "var(--tmi-accent)" }}
        />
        <div style={{ fontSize: 9, opacity: 0.6 }}>{Math.round(prefs.hudOpacity * 100)}% — does not tint live video</div>
      </div>

      <button
        type="button"
        className="tmi-chrome-btn"
        data-tmi-chrome="btn"
        onClick={() => ThemeEngine.resetToTmiOriginal()}
        style={{ padding: "10px 12px", borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: "pointer" }}
      >
        Reset to TMI Original Multicolor
      </button>

      <div style={{ fontSize: 9, opacity: 0.55, lineHeight: 1.45 }}>
        Themes save on this device for your signed-in browser session. Cross-device account sync is not
        wired yet. Live video, avatar skins, and 3D venue meshes are never recolored.
      </div>
    </div>
  );
}
