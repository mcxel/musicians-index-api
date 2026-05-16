"use client";

import React from "react";
import type {
  ChatWidgetCompactMode,
  ChatWidgetFocusMode,
  ChatWidgetMinimizeStyle,
  ChatWidgetOpacity,
  ChatWidgetPreference,
} from "@/lib/chat/ChatWidgetPreferenceEngine";
import type { DockZone } from "@/lib/chat/ChatWidgetDockingEngine";

export type ChatWidgetSettingsMenuProps = {
  preference: ChatWidgetPreference;
  onOpacityChange: (opacity: ChatWidgetOpacity) => void;
  onCompactModeChange: (mode: ChatWidgetCompactMode) => void;
  onFocusModeChange: (mode: ChatWidgetFocusMode) => void;
  onMinimizeStyleChange: (styleMode: ChatWidgetMinimizeStyle) => void;
  onDockZoneChange: (zone: DockZone) => void;
  onPinUser: (userId?: string) => void;
  onHideModeChange: (mode: "15s" | "performance" | "round" | "manual") => void;
};

const OPACITY_STEPS: ChatWidgetOpacity[] = [1, 0.75, 0.5, 0.25];
const FOCUS_OPTIONS: ChatWidgetFocusMode[] = ["all", "host-only", "performer-only", "judges-only", "crowd-only"];
const ZONES: DockZone[] = ["top-left", "top-right", "bottom-left", "bottom-right", "freeform"];

export function ChatWidgetSettingsMenu({
  preference,
  onOpacityChange,
  onCompactModeChange,
  onFocusModeChange,
  onMinimizeStyleChange,
  onDockZoneChange,
  onPinUser,
  onHideModeChange,
}: ChatWidgetSettingsMenuProps) {
  return (
    <div
      style={{
        width: 260,
        border: "1px solid rgba(148,163,184,0.35)",
        borderRadius: 10,
        background: "rgba(2,6,23,0.96)",
        padding: 10,
        color: "#cbd5e1",
        display: "grid",
        gap: 10,
      }}
      role="dialog"
      aria-label="Chat widget settings"
    >
      <Section title="Opacity">
        <div style={{ display: "flex", gap: 6 }}>
          {OPACITY_STEPS.map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => onOpacityChange(step)}
              style={chipStyle(preference.opacity === step)}
            >
              {Math.round(step * 100)}%
            </button>
          ))}
        </div>
      </Section>

      <Section title="Compact Mode">
        <div style={{ display: "flex", gap: 6 }}>
          <button type="button" onClick={() => onCompactModeChange("full-bubble")} style={chipStyle(preference.compactMode === "full-bubble")}>
            Full Bubble
          </button>
          <button type="button" onClick={() => onCompactModeChange("tiny-ticker")} style={chipStyle(preference.compactMode === "tiny-ticker")}>
            Tiny Ticker
          </button>
        </div>
      </Section>

      <Section title="Focus Mode">
        <select
          value={preference.focusMode}
          onChange={(event) => onFocusModeChange(event.target.value as ChatWidgetFocusMode)}
          style={selectStyle}
        >
          {FOCUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Section>

      <Section title="Minimize">
        <div style={{ display: "flex", gap: 6 }}>
          <button type="button" onClick={() => onMinimizeStyleChange("pill")} style={chipStyle(preference.minimizeStyle === "pill")}>
            Pill
          </button>
          <button type="button" onClick={() => onMinimizeStyleChange("icon")} style={chipStyle(preference.minimizeStyle === "icon")}>
            Icon
          </button>
          <button type="button" onClick={() => onMinimizeStyleChange("tab")} style={chipStyle(preference.minimizeStyle === "tab")}>
            Tab
          </button>
        </div>
      </Section>

      <Section title="Dock Zone">
        <select
          value={preference.dock.zone}
          onChange={(event) => onDockZoneChange(event.target.value as DockZone)}
          style={selectStyle}
        >
          {ZONES.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
      </Section>

      <Section title="Hide">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <button type="button" onClick={() => onHideModeChange("15s")} style={chipStyle(false)}>
            15s
          </button>
          <button type="button" onClick={() => onHideModeChange("performance")} style={chipStyle(false)}>
            Performance
          </button>
          <button type="button" onClick={() => onHideModeChange("round")} style={chipStyle(false)}>
            Round
          </button>
          <button type="button" onClick={() => onHideModeChange("manual")} style={chipStyle(false)}>
            Manual
          </button>
        </div>
      </Section>

      <Section title="Pin User">
        <div style={{ display: "flex", gap: 6 }}>
          <input
            placeholder="user-id"
            defaultValue={preference.pinnedUserId ?? ""}
            onBlur={(event) => onPinUser(event.currentTarget.value.trim() || undefined)}
            style={{
              flex: 1,
              borderRadius: 6,
              border: "1px solid rgba(148,163,184,0.35)",
              background: "rgba(15,23,42,0.8)",
              color: "#f1f5f9",
              padding: "6px 8px",
              fontSize: 12,
            }}
          />
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</div>
      {children}
    </div>
  );
}

function chipStyle(active: boolean): React.CSSProperties {
  return {
    borderRadius: 6,
    border: active ? "1px solid rgba(56,189,248,0.65)" : "1px solid rgba(100,116,139,0.35)",
    background: active ? "rgba(14,116,144,0.35)" : "rgba(30,41,59,0.45)",
    color: active ? "#67e8f9" : "#cbd5e1",
    padding: "5px 8px",
    fontSize: 11,
    cursor: "pointer",
  };
}

const selectStyle: React.CSSProperties = {
  borderRadius: 6,
  border: "1px solid rgba(148,163,184,0.35)",
  background: "rgba(15,23,42,0.8)",
  color: "#f1f5f9",
  padding: "6px 8px",
  fontSize: 12,
};
