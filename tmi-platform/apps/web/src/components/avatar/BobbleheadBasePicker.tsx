"use client";

/**
 * BobbleheadBasePicker — Fan-only base selection grid.
 * Shows 2D concept previews with honest "3D runtime pending" label (Rules 18/20).
 */

import {
  listFanSelectableBases,
  type BobbleheadBase,
} from "@/lib/avatars/BobbleheadBaseRegistry";

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
        BOBBLEHEAD BASES
      </div>
      <div
        style={{
          fontSize: 8,
          color: "rgba(255,255,255,0.4)",
          marginBottom: 10,
          lineHeight: 1.4,
        }}
      >
        Base preview — 3D runtime pending. Fan-only. Concept looks, not rigged GLBs.
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: compact
            ? "repeat(auto-fill, minmax(72px, 1fr))"
            : "repeat(auto-fill, minmax(100px, 1fr))",
          gap: compact ? 8 : 10,
        }}
      >
        {bases.map((base) => {
          const selected = base.id === selectedBaseId;
          return (
            <button
              key={base.id}
              type="button"
              onClick={() => onSelect(base)}
              title={`${base.displayName} · ${base.previewHonestyLabel}`}
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
                  aspectRatio: "1",
                  background: "#0a0614",
                  backgroundImage: `url(${base.previewImageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
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
                    {base.unlock === "free" ? "FREE" : base.unlock.toUpperCase()} · gen {base.evolutionGeneration}
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
