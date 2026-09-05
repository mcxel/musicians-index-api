"use client";

/**
 * BobbleheadBasePicker — Fan-only base selection.
 * Each tile is a live AvatarRig (procedural 3D) styled from the scanned base —
 * NOT a CSS cutout / background image (Marcel lock).
 */

import dynamic from "next/dynamic";
import { listFanSelectableBases, type BobbleheadBase } from "@/lib/avatars/BobbleheadBaseRegistry";
import {
  BOBBLEHEAD_RUNTIME_LABEL,
  bobbleheadRuntimeToRigProps,
  persistBobbleheadBaseId,
  resolveBobbleheadRuntimeCharacter,
} from "@/lib/avatars/BobbleheadRuntimeCharacter";

const AvatarViewer = dynamic(
  () => import("@/components/3d/AvatarLobbyCanvas").then((m) => m.AvatarViewer),
  { ssr: false },
);

interface BobbleheadBasePickerProps {
  selectedBaseId?: string;
  onSelect: (base: BobbleheadBase) => void;
  accentColor?: string;
  compact?: boolean;
  maxItems?: number;
}

export function BobbleheadBasePicker({
  selectedBaseId,
  onSelect,
  accentColor = "#00E5FF",
  compact = false,
  maxItems,
}: BobbleheadBasePickerProps) {
  const bases = listFanSelectableBases().slice(0, maxItems ?? 99);

  return (
    <div>
      <div
        style={{
          fontSize: compact ? 8 : 9,
          letterSpacing: "0.25em",
          color: accentColor,
          fontWeight: 800,
          marginBottom: 8,
        }}
      >
        BOBBLEHEAD BASES · 3D WORLD
      </div>
      <div
        style={{
          fontSize: 8,
          color: "rgba(255,255,255,0.4)",
          marginBottom: 10,
          lineHeight: 1.4,
        }}
      >
        {BOBBLEHEAD_RUNTIME_LABEL}. Same AvatarRig that seats in Fan lobbies / venues.
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: compact
            ? "repeat(auto-fill, minmax(88px, 1fr))"
            : "repeat(auto-fill, minmax(120px, 1fr))",
          gap: compact ? 8 : 10,
        }}
      >
        {bases.map((base) => {
          const selected = base.id === selectedBaseId;
          const character = resolveBobbleheadRuntimeCharacter(base.id);
          const rig = bobbleheadRuntimeToRigProps(character);
          return (
            <button
              key={base.id}
              type="button"
              onClick={() => {
                persistBobbleheadBaseId(base.id);
                onSelect(base);
              }}
              title={`${base.displayName} · ${BOBBLEHEAD_RUNTIME_LABEL}`}
              style={{
                padding: 0,
                borderRadius: 10,
                border: `1px solid ${selected ? accentColor : "rgba(255,255,255,0.12)"}`,
                background: selected ? `${accentColor}18` : "rgba(255,255,255,0.03)",
                cursor: "pointer",
                overflow: "hidden",
                textAlign: "left",
                boxShadow: selected ? `0 0 12px ${accentColor}44` : "none",
              }}
            >
              <div
                style={{
                  height: compact ? 72 : 96,
                  background: "radial-gradient(ellipse at center, rgba(0,229,255,0.1), #050510)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AvatarViewer
                  {...rig}
                  size={compact ? 68 : 90}
                  enableOrbit={false}
                  isPlaying={selected}
                />
              </div>
              <div style={{ padding: compact ? "4px 6px 6px" : "6px 8px 8px" }}>
                <div
                  style={{
                    fontSize: compact ? 8 : 9,
                    fontWeight: 800,
                    color: "#fff",
                    lineHeight: 1.2,
                  }}
                >
                  {base.displayName}
                </div>
                {!compact && (
                  <div style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                    R3F · gen {base.evolutionGeneration}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default BobbleheadBasePicker;
