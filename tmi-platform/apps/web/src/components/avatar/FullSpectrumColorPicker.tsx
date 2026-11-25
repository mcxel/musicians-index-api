"use client";

/**
 * FullSpectrumColorPicker — §11630–§11643
 * Crayon-box swatches + spectrum/custom + recent/saved.
 * Live preview: onChange fires immediately (no Save required).
 */

import { useMemo, useState, type CSSProperties } from "react";
import {
  COLOR_FAMILIES,
  CRAYON_BOX_SWATCHES,
  listRecentColors,
  listSavedColors,
  normalizeHexColor,
  pushRecentColor,
  toggleSavedColor,
  type ColorFamilyId,
} from "@/lib/avatars/FullSpectrumAvatarColorSystem";

export type FullSpectrumColorPickerProps = {
  value: string;
  onChange: (hex: string) => void;
  /** Accessibility label prefix */
  label?: string;
  accent?: string;
  compact?: boolean;
  testIdPrefix?: string;
};

export function FullSpectrumColorPicker({
  value,
  onChange,
  label = "COLOR",
  accent = "#FFD700",
  compact = false,
  testIdPrefix = "avatar-color",
}: FullSpectrumColorPickerProps) {
  const [family, setFamily] = useState<ColorFamilyId | "ALL">("ALL");
  const [recent, setRecent] = useState<string[]>(() => listRecentColors());
  const [saved, setSaved] = useState<string[]>(() => listSavedColors());
  const current = normalizeHexColor(value) ?? value;

  const swatches = useMemo(() => {
    if (family === "ALL") return CRAYON_BOX_SWATCHES;
    return CRAYON_BOX_SWATCHES.filter((s) => s.family === family);
  }, [family]);

  const apply = (hex: string) => {
    const n = normalizeHexColor(hex) ?? hex;
    onChange(n);
    setRecent(pushRecentColor(n));
  };

  const swatchSize = compact ? 22 : 28;

  return (
    <div
      data-full-spectrum-color-picker="1"
      data-crayon-count={CRAYON_BOX_SWATCHES.length}
      data-avatar-remount-on-color="0"
      style={{
        marginBottom: 10,
        padding: 8,
        borderRadius: 8,
        background: "rgba(0,0,0,0.45)",
        border: `1px solid ${accent}40`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
          gap: 8,
        }}
      >
        <span style={{ fontSize: 9, fontWeight: 900, color: accent, letterSpacing: "0.1em" }}>
          {label} · CRAYON BOX ({CRAYON_BOX_SWATCHES.length}) · FREE TINT
        </span>
        <div
          title={`Selected ${current}`}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: current,
            border: `2px solid ${accent}`,
            boxShadow: `0 0 12px ${accent}66`,
            flexShrink: 0,
          }}
          aria-label={`Current color ${current}`}
        />
      </div>

      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
        <button
          type="button"
          onClick={() => setFamily("ALL")}
          style={chipStyle(family === "ALL", accent)}
        >
          All
        </button>
        {COLOR_FAMILIES.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFamily(f)}
            style={chipStyle(family === f, accent)}
          >
            {f}
          </button>
        ))}
      </div>

      <div
        role="listbox"
        aria-label={`${label} quick colors`}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fill, minmax(${swatchSize}px, 1fr))`,
          gap: 6,
          maxHeight: compact ? 120 : 160,
          overflowY: "auto",
          marginBottom: 8,
        }}
      >
        {swatches.map((s) => {
          const selected = current.toUpperCase() === s.hex.toUpperCase();
          return (
            <button
              key={s.id}
              type="button"
              role="option"
              aria-selected={selected}
              data-testid={`${testIdPrefix}-${s.id}`}
              title={s.label}
              onClick={() => apply(s.hex)}
              style={{
                width: "100%",
                aspectRatio: "1",
                minHeight: swatchSize,
                borderRadius: 6,
                background: s.hex,
                border: selected ? `2px solid ${accent}` : "1px solid rgba(255,255,255,0.25)",
                cursor: "pointer",
                boxShadow: selected ? `0 0 10px ${accent}` : "none",
                position: "relative",
              }}
            >
              {selected ? (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 12,
                    color: "#fff",
                    textShadow: "0 0 4px #000",
                  }}
                >
                  ✓
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
        <label style={{ fontSize: 8, color: "#aaa", display: "flex", alignItems: "center", gap: 6 }}>
          SPECTRUM / CUSTOM
          <input
            type="color"
            data-testid={`${testIdPrefix}-spectrum`}
            value={normalizeHexColor(current) ?? "#888888"}
            onChange={(e) => apply(e.target.value)}
            title="Full spectrum custom color"
            style={{
              width: 36,
              height: 28,
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              background: "transparent",
            }}
          />
        </label>
        <button
          type="button"
          onClick={() => setSaved(toggleSavedColor(current))}
          style={{
            fontSize: 8,
            fontWeight: 800,
            padding: "4px 8px",
            borderRadius: 6,
            border: `1px solid ${accent}66`,
            background: "rgba(255,255,255,0.06)",
            color: accent,
            cursor: "pointer",
          }}
        >
          {saved.includes(current.toUpperCase()) ? "UNSAVE COLOR" : "SAVE COLOR"}
        </button>
      </div>

      {recent.length > 0 && (
        <RowColors
          title="RECENT"
          hexes={recent}
          current={current}
          accent={accent}
          onPick={apply}
          testIdPrefix={`${testIdPrefix}-recent`}
        />
      )}
      {saved.length > 0 && (
        <RowColors
          title="SAVED"
          hexes={saved}
          current={current}
          accent={accent}
          onPick={apply}
          testIdPrefix={`${testIdPrefix}-saved`}
        />
      )}
    </div>
  );
}

function RowColors(props: {
  title: string;
  hexes: string[];
  current: string;
  accent: string;
  onPick: (hex: string) => void;
  testIdPrefix: string;
}) {
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ fontSize: 8, color: "#888", fontWeight: 800, marginBottom: 4 }}>{props.title}</div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {props.hexes.map((hex, i) => (
          <button
            key={`${hex}-${i}`}
            type="button"
            data-testid={`${props.testIdPrefix}-${i}`}
            title={hex}
            onClick={() => props.onPick(hex)}
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              background: hex,
              border:
                props.current.toUpperCase() === hex.toUpperCase()
                  ? `2px solid ${props.accent}`
                  : "1px solid rgba(255,255,255,0.2)",
              cursor: "pointer",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function chipStyle(active: boolean, accent: string): CSSProperties {
  return {
    fontSize: 7,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    padding: "3px 6px",
    borderRadius: 999,
    border: active ? `1px solid ${accent}` : "1px solid rgba(255,255,255,0.15)",
    background: active ? `${accent}22` : "rgba(255,255,255,0.04)",
    color: active ? accent : "#bbb",
    cursor: "pointer",
  };
}
