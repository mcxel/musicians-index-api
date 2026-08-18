"use client";

import React, { useState } from "react";
import {
  MEDIA_PLAYER_CHASSIS_REGISTRY,
  canEquipChassis,
  type MediaPlayerChassisId,
  type MediaPlayerChassis,
} from "@/lib/artifacts/PlaylistArtifactEngine";

// Accent colours the user can apply on top of any chassis
const ACCENT_PRESETS = [
  { label: "Cyan", value: "#00FFFF" },
  { label: "Fuchsia", value: "#FF2DAA" },
  { label: "Gold", value: "#FFD700" },
  { label: "Purple", value: "#AA2DFF" },
  { label: "White", value: "#FFFFFF" },
  { label: "Mint", value: "#00FF88" },
  { label: "Ember", value: "#FF6600" },
  { label: "Sky", value: "#4FC3F7" },
];

export interface PlaylistCardSkinSelection {
  chassisId: MediaPlayerChassisId;
  accentOverride: string | null;
}

interface Props {
  /** Current user's TMI tier (for unlock gating) */
  accountTier: string;
  /** Chassis IDs the user has already purchased/earned */
  ownedChassisIds?: MediaPlayerChassisId[];
  current: PlaylistCardSkinSelection;
  onChange: (next: PlaylistCardSkinSelection) => void;
  /** Whether to show a compact grid (card embed) vs full drawer */
  compact?: boolean;
}

const CYAN = "#00FFFF";
const GOLD = "#FFD700";

const ALL_IDS = Object.keys(MEDIA_PLAYER_CHASSIS_REGISTRY) as MediaPlayerChassisId[];

export default function PlaylistCardSkinSelector({
  accountTier,
  ownedChassisIds = [],
  current,
  onChange,
  compact = false,
}: Props) {
  const [hovered, setHovered] = useState<MediaPlayerChassisId | null>(null);
  const tier = accountTier as Parameters<typeof canEquipChassis>[1];

  const isUnlocked = (id: MediaPlayerChassisId) =>
    canEquipChassis(id, tier, ownedChassisIds);

  const activeChassis: MediaPlayerChassis = MEDIA_PLAYER_CHASSIS_REGISTRY[current.chassisId];
  const activeAccent = current.accentOverride ?? activeChassis?.accent ?? CYAN;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: compact ? 10 : 16,
        padding: compact ? 8 : 16,
        background: "#0a0614",
        borderRadius: 12,
        border: `1px solid ${activeAccent}44`,
      }}
    >
      {/* Chassis grid */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 1 }}>
          Player Style
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${compact ? 4 : 5}, 1fr)`,
            gap: 6,
          }}
        >
          {ALL_IDS.map((id) => {
            const ch = MEDIA_PLAYER_CHASSIS_REGISTRY[id];
            const unlocked = isUnlocked(id);
            const selected = current.chassisId === id;
            const isHov = hovered === id;

            return (
              <button
                key={id}
                title={unlocked ? ch.label : `${ch.label} — ${ch.unlockMethod === "tier" ? ch.tierRequired + " tier" : "purchase to unlock"}`}
                aria-label={ch.label}
                aria-pressed={selected}
                disabled={!unlocked}
                onClick={() => unlocked && onChange({ ...current, chassisId: id })}
                onMouseEnter={() => setHovered(id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: "relative",
                  padding: "8px 4px",
                  borderRadius: 8,
                  border: selected
                    ? `2px solid ${activeAccent}`
                    : isHov && unlocked
                    ? `2px solid ${ch.accent}88`
                    : "2px solid transparent",
                  background: selected
                    ? `${ch.theme}cc`
                    : "rgba(255,255,255,0.04)",
                  cursor: unlocked ? "pointer" : "not-allowed",
                  opacity: unlocked ? 1 : 0.38,
                  textAlign: "center",
                  transition: "border-color 0.15s, background 0.15s",
                  minWidth: 0,
                }}
              >
                <div style={{ fontSize: 18, lineHeight: 1 }}>{ch.icon}</div>
                <div
                  style={{
                    fontSize: 8,
                    color: selected ? activeAccent : "rgba(255,255,255,0.55)",
                    fontWeight: 700,
                    marginTop: 3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ch.label}
                </div>
                {!unlocked && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                    }}
                  >
                    🔒
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent colour strip */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 1 }}>
          Accent Colour
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {/* "Use chassis default" option */}
          <button
            aria-label="Use chassis default colour"
            onClick={() => onChange({ ...current, accentOverride: null })}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: current.accentOverride === null ? `2px solid ${GOLD}` : "2px solid rgba(255,255,255,0.2)",
              background: activeChassis?.accent ?? CYAN,
              cursor: "pointer",
              position: "relative",
            }}
            title="Chassis default"
          >
            <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>✦</span>
          </button>

          {ACCENT_PRESETS.map((p) => (
            <button
              key={p.value}
              aria-label={`Set accent ${p.label}`}
              onClick={() => onChange({ ...current, accentOverride: p.value })}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: current.accentOverride === p.value ? `2px solid #fff` : "2px solid rgba(255,255,255,0.15)",
                background: p.value,
                cursor: "pointer",
              }}
              title={p.label}
            />
          ))}
        </div>
      </div>

      {/* Live preview strip */}
      <div
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          background: activeChassis?.theme ?? "#0a0614",
          border: `1px solid ${activeAccent}55`,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 22 }}>{activeChassis?.icon ?? "▶"}</span>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: activeAccent }}>
            {activeChassis?.label ?? "Standard"}
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>
            Live preview — this is how your card's player looks
          </div>
        </div>
        {/* Minimal EQ bars preview using accent colour */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 2, alignItems: "flex-end", height: 18 }}>
          {[0.4, 0.8, 0.6, 1, 0.7, 0.5, 0.9].map((h, i) => (
            <div
              key={i}
              style={{
                width: 3,
                height: `${Math.round(h * 18)}px`,
                background: activeAccent,
                borderRadius: 2,
                opacity: 0.75,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
