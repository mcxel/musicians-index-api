"use client";

import type { RoomTheme } from "@/lib/environments/RoomThemeRotationEngine";

type ThemeVariantPreviewProps = {
  themes: RoomTheme[];
  activeKey: string;
  onSelect?: (key: string) => void;
};

export function ThemeVariantPreview({ themes, activeKey, onSelect }: ThemeVariantPreviewProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        padding: "8px 0",
      }}
    >
      {themes.map((theme) => {
        const isActive = theme.key === activeKey;
        return (
          <button
            key={theme.key}
            type="button"
            onClick={() => onSelect?.(theme.key)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              background: "transparent",
              border: isActive
                ? `2px solid ${theme.palette.primary}`
                : "2px solid rgba(255,255,255,0.15)",
              borderRadius: 10,
              padding: "6px 10px",
              cursor: "pointer",
              transition: "border-color 0.2s",
            }}
          >
            {/* Palette swatch */}
            <div style={{ display: "flex", gap: 3 }}>
              {[theme.palette.primary, theme.palette.secondary, theme.palette.accent].map((color) => (
                <div
                  key={color}
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: color,
                    boxShadow: isActive ? `0 0 6px ${color}99` : "none",
                  }}
                />
              ))}
            </div>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: isActive ? theme.palette.primary : "rgba(255,255,255,0.5)",
                textTransform: "uppercase",
              }}
            >
              {theme.label}
            </span>
            {theme.confettiEnabled && (
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>✦ confetti</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
