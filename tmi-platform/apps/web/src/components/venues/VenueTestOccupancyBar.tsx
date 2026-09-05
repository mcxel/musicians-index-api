"use client";

/**
 * TEST occupancy controller — explicitly labeled, never published as real viewers.
 */

import {
  TEST_OCCUPANCY_LABELS,
  type TestOccupancyLevel,
} from "@/lib/venues/VenuePreviewCertification";

const LEVELS: TestOccupancyLevel[] = [
  "EMPTY",
  "LIGHT",
  "MEDIUM",
  "BUSY",
  "NEAR_CAPACITY",
  "FULL",
];

const GOLD = "#FFD700";
const CYAN = "#00FFFF";

export interface VenueTestOccupancyBarProps {
  level: TestOccupancyLevel;
  onChange: (level: TestOccupancyLevel) => void;
  label: string;
  capacity: number;
}

export default function VenueTestOccupancyBar({
  level,
  onChange,
  label,
  capacity,
}: VenueTestOccupancyBarProps) {
  return (
    <div
      data-venue-test-occupancy="true"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "10px 12px",
        background: "rgba(5,5,16,0.92)",
        border: `1px solid ${GOLD}55`,
        borderRadius: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: GOLD }}>
          TEST OCCUPANCY
        </span>
        <span style={{ fontSize: 10, fontWeight: 800, color: CYAN, fontFamily: "monospace" }}>
          {label}
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {LEVELS.map((l) => {
          const active = l === level;
          return (
            <button
              key={l}
              type="button"
              onClick={() => onChange(l)}
              style={{
                padding: "5px 8px",
                fontSize: 8,
                fontWeight: 800,
                letterSpacing: "0.06em",
                cursor: "pointer",
                borderRadius: 6,
                border: active ? `1px solid ${GOLD}` : "1px solid rgba(255,255,255,0.15)",
                background: active ? "rgba(255,215,0,0.18)" : "rgba(255,255,255,0.04)",
                color: active ? GOLD : "rgba(255,255,255,0.65)",
              }}
            >
              {TEST_OCCUPANCY_LABELS[l]}
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: "0.04em" }}>
        Synthetic TEST fill only · capacity {capacity.toLocaleString()} · never counted as fans
      </div>
    </div>
  );
}
