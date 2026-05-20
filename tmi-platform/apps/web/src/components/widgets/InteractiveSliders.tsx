"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";

export interface SliderConfig {
  id: string;
  label: string;
  value: number;
  min?: number;
  max?: number;
  color?: string;
  icon?: string;
  onChange?: (val: number) => void;
}

export interface InteractiveSlidersProps {
  sliders?: SliderConfig[];
  orientation?: "horizontal" | "vertical";
  onSliderChange?: (id: string, value: number) => void;
}

const DEFAULT_SLIDERS: SliderConfig[] = [
  { id: "volume",  label: "Volume",  value: 75, color: "#00FFFF", icon: "🔊" },
  { id: "bass",    label: "Bass",    value: 60, color: "#FF2DAA", icon: "🎚" },
  { id: "treble",  label: "Treble",  value: 50, color: "#FFD700", icon: "🎛" },
  { id: "crowd",   label: "Crowd",   value: 40, color: "#00FF88", icon: "👥" },
];

export default function InteractiveSliders({
  sliders = DEFAULT_SLIDERS,
  orientation = "horizontal",
  onSliderChange,
}: InteractiveSlidersProps) {
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(sliders.map(s => [s.id, s.value]))
  );

  const handleChange = useCallback((id: string, raw: string) => {
    const v = Number(raw);
    setValues(prev => ({ ...prev, [id]: v }));
    onSliderChange?.(id, v);
  }, [onSliderChange]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: orientation === "vertical" ? "column" : "row",
        gap: orientation === "vertical" ? 12 : 16,
        alignItems: orientation === "vertical" ? "stretch" : "center",
        flexWrap: "wrap",
      }}
    >
      {sliders.map(slider => {
        const val = values[slider.id] ?? slider.value;
        const pct = ((val - (slider.min ?? 0)) / ((slider.max ?? 100) - (slider.min ?? 0))) * 100;
        const color = slider.color ?? "#00FFFF";

        return (
          <div key={slider.id} style={{ display: "flex", flexDirection: "column", gap: 6, flex: orientation === "horizontal" ? "1 1 120px" : undefined }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                {slider.icon && <span style={{ fontSize: 12 }}>{slider.icon}</span>}
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.55)" }}>
                  {slider.label.toUpperCase()}
                </span>
              </div>
              <motion.span
                key={val}
                initial={{ opacity: 0.5, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ fontSize: 10, fontWeight: 800, color }}
              >
                {val}
              </motion.span>
            </div>

            {/* Track */}
            <div style={{ position: "relative", height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <motion.div
                style={{
                  position: "absolute", left: 0, top: 0, height: "100%",
                  background: `linear-gradient(90deg, ${color}80, ${color})`,
                  borderRadius: 3,
                }}
                animate={{ width: `${pct}%` }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            </div>

            <input
              type="range"
              min={slider.min ?? 0}
              max={slider.max ?? 100}
              value={val}
              onChange={e => handleChange(slider.id, e.target.value)}
              style={{
                width: "100%",
                appearance: "none",
                height: 4,
                background: "transparent",
                cursor: "pointer",
                marginTop: -14,
                opacity: 0,
                position: "relative",
                zIndex: 2,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
