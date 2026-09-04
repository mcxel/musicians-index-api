"use client";

import { useState } from "react";
import { EraPresetId, ERA_PRESETS } from "@/lib/effects/TmiFilterEngine";
import { BackgroundMode, LiveEffectState } from "@/lib/effects/LiveEffectRuntime";

interface LiveFxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeState: LiveEffectState;
  onSelectPreset: (presetId: EraPresetId) => void;
  onSelectBgMode: (mode: BackgroundMode, stageSlug?: string) => void;
  onSendReaction?: () => void;
}

export default function LiveFxDrawer({
  isOpen,
  onClose,
  activeState,
  onSelectPreset,
  onSelectBgMode,
  onSendReaction,
}: LiveFxDrawerProps) {
  const [activeTab, setActiveTab] = useState<"ERA" | "STAGE" | "HEAT">("ERA");

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 72,
        left: "50%",
        transform: "translateX(-50%)",
        width: "92%",
        maxWidth: 460,
        zIndex: 90,
        background: "rgba(10, 10, 24, 0.94)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(0, 255, 255, 0.25)",
        borderRadius: 16,
        padding: "16px 18px",
        boxShadow: "0 16px 40px rgba(0,0,0,0.7)",
        color: "#FFFFFF",
      }}
    >
      {/* Header & Close */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14 }}>✨</span>
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.15em", color: "#00FFFF" }}>
            LIVE SCENE EFFECTS & STAGE
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.6)",
            fontSize: 16,
            cursor: "pointer",
            padding: "2px 6px",
          }}
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, background: "rgba(255,255,255,0.05)", padding: 4, borderRadius: 8 }}>
        {(["ERA", "STAGE", "HEAT"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: "6px 0",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.1em",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              background: activeTab === tab ? "#00FFFF" : "transparent",
              color: activeTab === tab ? "#050510" : "rgba(255,255,255,0.7)",
              transition: "all 0.2s ease",
            }}
          >
            {tab === "ERA" ? "FILTERS" : tab === "STAGE" ? "GREEN SCREEN" : "HEAT 🔥"}
          </button>
        ))}
      </div>

      {/* Tab Content: Filters */}
      {activeTab === "ERA" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {Object.values(ERA_PRESETS).map((preset) => {
            const isSelected = activeState.preset.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset.id)}
                style={{
                  padding: "10px 8px",
                  borderRadius: 10,
                  border: isSelected ? "1.5px solid #00FFFF" : "1px solid rgba(255,255,255,0.12)",
                  background: isSelected ? "rgba(0,255,255,0.15)" : "rgba(255,255,255,0.04)",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 9, fontWeight: 900, color: isSelected ? "#00FFFF" : "#FF2DAA", marginBottom: 2 }}>
                  {preset.eraLabel}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700 }}>{preset.name}</div>
              </button>
            );
          })}
        </div>
      )}

      {/* Tab Content: Stage Green Screen */}
      {activeTab === "STAGE" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>
            AI Real-Time Background Removal (No Physical Screen Required):
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
            {[
              { mode: "MY_ROOM", label: "Camera Room" },
              { mode: "BLUR", label: "Soft Blur" },
              { mode: "STAGE_3D", label: "3D Venue Stage" },
              { mode: "ERA_WORLD", label: "Era World" },
            ].map(({ mode, label }) => {
              const isSelected = activeState.backgroundMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => onSelectBgMode(mode as BackgroundMode)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: isSelected ? "1.5px solid #00FF88" : "1px solid rgba(255,255,255,0.12)",
                    background: isSelected ? "rgba(0,255,136,0.15)" : "rgba(255,255,255,0.04)",
                    color: "#FFFFFF",
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content: Heat Momentum */}
      {activeTab === "HEAT" && (
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>
            AUDIENCE MOMENTUM & HEAT SCORE:
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: activeState.heatState.particleColor || "#FFD700",
              marginBottom: 10,
            }}
          >
            {activeState.heatState.label} ({activeState.heatState.score} PTS)
          </div>
          {onSendReaction && (
            <button
              onClick={onSendReaction}
              style={{
                padding: "8px 20px",
                fontSize: 11,
                fontWeight: 900,
                color: "#050510",
                background: "linear-gradient(135deg, #FF8C00, #FF2DAA)",
                border: "none",
                borderRadius: 20,
                cursor: "pointer",
              }}
            >
              🔥 BOOST HEAT (+5 PTS)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
