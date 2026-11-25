"use client";

/**
 * Smallest useful lighting + effect controls. Shared config + format overrides.
 * Effects stay on the artwork — this panel never intercepts preview pointers.
 */

import type { CSSProperties } from "react";
import { YOPHO_MAGIC_EFFECTS } from "@/lib/yopho/YoPhoMagicEffects";
import type { YoPhoFormat } from "@/lib/yopho/YoPhoFormatAuthority";
import {
  YOPHO_LIGHTING_DIRECTIONS,
  patchVisualEffect,
  setFormatEffectOverride,
  setVisualLighting,
  toggleVisualEffect,
  type YoPhoLightingDirection,
  type YoPhoVisualState,
} from "@/lib/yopho/YoPhoVisualRuntime";

const GOLD = "#FFD700";
const CYAN = "#00FFFF";

export default function YoPhoEffectsPanel({
  visual,
  activeFormat,
  onChange,
}: {
  visual: YoPhoVisualState;
  activeFormat: YoPhoFormat;
  onChange: (next: YoPhoVisualState) => void;
}) {
  const selected = visual.effects.find((e) => e.enabled);

  return (
    <div
      data-testid="yopho-effects-panel"
      style={{ display: "flex", flexDirection: "column", gap: 10, fontFamily: "inherit" }}
    >
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: GOLD }}>
        LIGHTING
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {YOPHO_LIGHTING_DIRECTIONS.map((dir) => (
          <button
            key={dir}
            type="button"
            data-testid={`yopho-lighting-${dir}`}
            aria-pressed={visual.lighting.direction === dir}
            onClick={() => onChange(setVisualLighting(visual, { direction: dir }))}
            style={chip(visual.lighting.direction === dir, GOLD)}
          >
            {labelDir(dir)}
          </button>
        ))}
      </div>
      <Slider
        testId="yopho-lighting-intensity"
        label="Intensity"
        value={visual.lighting.intensity}
        onChange={(intensity) => onChange(setVisualLighting(visual, { intensity }))}
      />
      <Slider
        testId="yopho-lighting-warmth"
        label="Warmth"
        value={visual.lighting.warmth}
        onChange={(warmth) => onChange(setVisualLighting(visual, { warmth }))}
      />

      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: CYAN }}>
        EFFECTS · INSTANT PREVIEW
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {YOPHO_MAGIC_EFFECTS.map((fx) => {
          const on = visual.effects.some((e) => e.id === fx.id && e.enabled);
          return (
            <button
              key={fx.id}
              type="button"
              data-testid={`yopho-fx-${fx.id}`}
              aria-pressed={on}
              title={`${fx.slot} · ${fx.tagline}`}
              onClick={() => onChange(toggleVisualEffect(visual, fx.id))}
              style={chip(on, fx.accent)}
            >
              {on ? "✓ " : ""}
              {fx.label}
            </button>
          );
        })}
      </div>

      {selected ? (
        <div data-testid="yopho-fx-params" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>
            Editing {selected.id.replace("_", " ")} · {activeFormat === "TRADING_CARD" ? "5:7" : "1:1"} override available
          </div>
          <Slider
            testId="yopho-fx-intensity"
            label="FX intensity"
            value={selected.params.intensity}
            onChange={(intensity) => onChange(patchVisualEffect(visual, selected.id, { intensity }))}
          />
          <Slider
            testId="yopho-fx-speed"
            label="Speed"
            value={Math.round(selected.params.speed * 33)}
            onChange={(v) =>
              onChange(patchVisualEffect(visual, selected.id, { speed: Math.max(0.25, v / 33) }))
            }
          />
          <Slider
            testId="yopho-fx-density"
            label="Density"
            value={selected.params.density}
            onChange={(density) => onChange(patchVisualEffect(visual, selected.id, { density }))}
          />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(["down", "left", "right", "up"] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                data-testid={`yopho-fx-dir-${dir}`}
                onClick={() => onChange(patchVisualEffect(visual, selected.id, { direction: dir }))}
                style={chip(selected.params.direction === dir, CYAN)}
              >
                {dir}
              </button>
            ))}
          </div>
          <button
            type="button"
            data-testid="yopho-fx-format-override"
            onClick={() =>
              onChange(
                setFormatEffectOverride(visual, activeFormat, selected.id, {
                  enabled: true,
                  params: selected.params,
                }),
              )
            }
            style={chip(Boolean(visual.formatOverrides[activeFormat]?.effects?.[selected.id]), GOLD)}
          >
            Save as {activeFormat === "TRADING_CARD" ? "card" : "cover"} override
          </button>
        </div>
      ) : (
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
          Turn on rain, smoke, fog, glow, or particles — they play inside the preview, not over the controls.
        </div>
      )}
    </div>
  );
}

function labelDir(dir: YoPhoLightingDirection): string {
  if (dir === "top-left") return "Top left";
  if (dir === "top-right") return "Top right";
  if (dir === "bottom-up") return "Bottom up";
  return "Center";
}

function chip(on: boolean, color: string): CSSProperties {
  return {
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: "0.06em",
    color: on ? "#050510" : color,
    background: on ? color : `${color}14`,
    border: `1px solid ${color}66`,
    borderRadius: 999,
    padding: "6px 10px",
    cursor: "pointer",
    fontFamily: "inherit",
  };
}

function Slider({
  label,
  value,
  onChange,
  testId,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  testId: string;
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
      <span style={{ width: 72 }}>{label}</span>
      <input
        data-testid={testId}
        type="range"
        min={0}
        max={100}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ flex: 1 }}
      />
      <span style={{ width: 28, textAlign: "right" }}>{Math.round(value)}</span>
    </label>
  );
}
