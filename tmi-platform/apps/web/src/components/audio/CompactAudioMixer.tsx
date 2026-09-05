"use client";

import React, { useState } from "react";
import { useCanonicalAudioMixerStore, type AudioBusId } from "@/lib/audio/CanonicalAudioBusDirector";

export default function CompactAudioMixer() {
  const [expanded, setExpanded] = useState(false);
  const buses = useCanonicalAudioMixerStore((s) => s.buses);
  const setBusVolume = useCanonicalAudioMixerStore((s) => s.setBusVolume);
  const toggleBusMute = useCanonicalAudioMixerStore((s) => s.toggleBusMute);

  const busList: { id: AudioBusId; label: string; accent: string; icon: string }[] = [
    { id: "VOICE", label: "VOICE", accent: "#00FF88", icon: "🎤" },
    { id: "SHARE", label: "SHARE", accent: "#AA2DFF", icon: "📡" },
    { id: "PROGRAM", label: "PROGRAM", accent: "#00FFFF", icon: "📻" },
  ];

  return (
    <div
      data-testid="tmi-compact-audio-mixer"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: "6px 10px",
        borderRadius: 8,
        background: "rgba(5,5,16,0.92)",
        border: "1px solid rgba(0,255,255,0.2)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.15em", color: "#00FFFF" }}>
            🎚️ MIX
          </span>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>
            INDEPENDENT LISTENER BUSES
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          style={{
            fontSize: 8,
            fontWeight: 800,
            color: "#00FFFF",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "2px 4px",
          }}
        >
          {expanded ? "COLLAPSE ▲" : "EXPAND ▼"}
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: expanded ? "1fr" : "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 8,
        }}
      >
        {busList.map((bus) => {
          const state = buses[bus.id];
          return (
            <div
              key={bus.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 6px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${state.muted ? "rgba(255,68,68,0.4)" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              <button
                type="button"
                onClick={() => toggleBusMute(bus.id)}
                title={`Mute/Unmute ${bus.label}`}
                style={{
                  background: state.muted ? "rgba(255,68,68,0.2)" : "transparent",
                  border: state.muted ? "1px solid #FF4444" : "1px solid rgba(255,255,255,0.2)",
                  color: state.muted ? "#FF6B6B" : bus.accent,
                  fontSize: 8,
                  fontWeight: 900,
                  padding: "2px 6px",
                  borderRadius: 4,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {state.muted ? "🔇 MUTE" : `🔊 ${bus.label}`}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={state.muted ? 0 : state.volume}
                onChange={(e) => setBusVolume(bus.id, Number(e.target.value))}
                aria-label={`${bus.label} volume`}
                style={{
                  flex: 1,
                  minWidth: 50,
                  height: 4,
                  accentColor: bus.accent,
                  cursor: "pointer",
                }}
              />
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.6)", minWidth: 24, textAlign: "right" }}>
                {state.muted ? "0%" : `${Math.round(state.volume * 100)}%`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
