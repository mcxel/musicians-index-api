"use client";

/**
 * AudioDeck — Volume slider + full EQ panel for Playlist Artifacts.
 * Includes: Master Volume, Bass, Mid, Treble, Balance.
 * Mini mode: just volume bar on the hull.
 * Expanded mode: full EQ + visualizer switch.
 */

import { useCallback, type ChangeEvent } from "react";

export interface EQState {
  bass:    number;   // -12 to +12
  mid:     number;
  treble:  number;
  balance: number;   // -1 to +1
  volume:  number;   // 0 to 1
}

interface AudioDeckProps {
  eq:       EQState;
  onChange: (eq: EQState) => void;
  accent?:  string;
  compact?: boolean;  // hull-only mini volume
}

// ─── Single slider row ────────────────────────────────────────────────────────
function EQSlider({
  label, value, min, max, step = 0.01, unit = "", accent,
  onChange, formatValue,
}: {
  label:       string;
  value:       number;
  min:         number;
  max:         number;
  step?:       number;
  unit?:       string;
  accent:      string;
  onChange:    (v: number) => void;
  formatValue?: (v: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const display = formatValue ? formatValue(value) : `${value >= 0 && unit === "dB" ? "+" : ""}${value.toFixed(unit === "dB" ? 1 : 0)}${unit}`;

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {label}
        </span>
        <span style={{ fontSize: 9, fontWeight: 700, color: accent, fontVariantNumeric: "tabular-nums", minWidth: 36, textAlign: "right" }}>
          {display}
        </span>
      </div>
      <div style={{ position: "relative", height: 18, display: "flex", alignItems: "center" }}>
        {/* Track */}
        <div style={{ position: "absolute", left: 0, right: 0, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }} />
        {/* Fill */}
        <div style={{
          position: "absolute", left: 0, width: `${pct}%`,
          height: 4, background: `linear-gradient(90deg, ${accent}66, ${accent})`,
          borderRadius: 2, transition: "width 0.05s",
        }} />
        {/* Thumb */}
        <div style={{
          position: "absolute",
          left: `calc(${pct}% - 7px)`,
          width: 14, height: 14,
          background: "#fff",
          borderRadius: "50%",
          boxShadow: `0 0 6px ${accent}88, 0 0 0 2px ${accent}`,
          transition: "left 0.05s",
          pointerEvents: "none",
        }} />
        {/* Invisible range input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(parseFloat(e.target.value))}
          style={{
            position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%",
            margin: 0, padding: 0, height: "100%",
          }}
        />
      </div>
    </div>
  );
}

// ─── Mini volume (hull) ───────────────────────────────────────────────────────
export function MiniVolume({ volume, onChange, accent = "#FFD700" }: {
  volume: number; onChange: (v: number) => void; accent?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 0" }}>
      <span style={{ fontSize: 10, opacity: 0.5 }}>🔈</span>
      <div style={{ flex: 1, position: "relative", height: 14, display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 2 }} />
        <div style={{ position: "absolute", left: 0, width: `${volume * 100}%`, height: 3, background: accent, borderRadius: 2 }} />
        <div style={{
          position: "absolute", left: `calc(${volume * 100}% - 5px)`,
          width: 10, height: 10, borderRadius: "50%",
          background: "#fff", boxShadow: `0 0 5px ${accent}`,
          pointerEvents: "none",
        }} />
        <input type="range" min={0} max={1} step={0.01} value={volume}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(parseFloat(e.target.value))}
          style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", margin: 0, padding: 0 }}
        />
      </div>
      <span style={{ fontSize: 10, opacity: 0.5 }}>🔊</span>
    </div>
  );
}

// ─── Full AudioDeck ───────────────────────────────────────────────────────────
export default function AudioDeck({ eq, onChange, accent = "#FFD700", compact = false }: AudioDeckProps) {
  const set = useCallback(<K extends keyof EQState>(key: K, value: EQState[K]) => {
    onChange({ ...eq, [key]: value });
  }, [eq, onChange]);

  if (compact) {
    return (
      <MiniVolume
        volume={eq.volume}
        onChange={(v) => set("volume", v)}
        accent={accent}
      />
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#fff" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.18em", fontWeight: 900, color: accent, marginBottom: 12 }}>
        AUDIO DECK
      </div>

      <EQSlider
        label="Volume" value={eq.volume} min={0} max={1} step={0.01} accent={accent}
        onChange={(v) => set("volume", v)}
        formatValue={(v) => `${Math.round(v * 100)}%`}
      />
      <EQSlider
        label="Bass" value={eq.bass} min={-12} max={12} step={0.5} unit="dB" accent={accent}
        onChange={(v) => set("bass", v)}
      />
      <EQSlider
        label="Mid" value={eq.mid} min={-12} max={12} step={0.5} unit="dB" accent={accent}
        onChange={(v) => set("mid", v)}
      />
      <EQSlider
        label="Treble" value={eq.treble} min={-12} max={12} step={0.5} unit="dB" accent={accent}
        onChange={(v) => set("treble", v)}
      />
      <EQSlider
        label="Balance" value={eq.balance} min={-1} max={1} step={0.01} accent={accent}
        onChange={(v) => set("balance", v)}
        formatValue={(v) => {
          if (Math.abs(v) < 0.05) return "C";
          return v < 0 ? `L ${Math.round(Math.abs(v) * 100)}` : `R ${Math.round(v * 100)}`;
        }}
      />

      {/* Reset */}
      <button
        type="button"
        onClick={() => onChange({ bass: 0, mid: 0, treble: 0, balance: 0, volume: eq.volume })}
        style={{
          marginTop: 4, padding: "5px 12px", background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6,
          cursor: "pointer", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)",
          letterSpacing: "0.06em",
        }}
      >
        RESET EQ
      </button>
    </div>
  );
}
