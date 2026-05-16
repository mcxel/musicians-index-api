"use client";

import type { SponsorSlot, SponsorSlotState } from "@/lib/environments/SponsorPlacementEngine";

type SponsorSlotWallProps = {
  slots: SponsorSlot[];
};

const STATE_STYLE: Record<SponsorSlotState, React.CSSProperties> = {
  "active-sponsor":           { background: "rgba(255,215,0,0.15)",    border: "1px solid rgba(255,215,0,0.6)",   color: "#FFD700" },
  "house-ad":                 { background: "rgba(0,255,255,0.08)",    border: "1px solid rgba(0,255,255,0.3)",   color: "#00FFFF" },
  "sponsor-placeholder":      { background: "rgba(170,45,255,0.08)",   border: "1px solid rgba(170,45,255,0.3)",  color: "#C4B5FD" },
  "available-for-purchase":   { background: "rgba(255,255,255,0.04)",  border: "1px dashed rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.4)" },
  "locked-pending-approval":  { background: "rgba(255,68,68,0.07)",    border: "1px solid rgba(255,68,68,0.3)",   color: "#FCA5A5" },
};

function SlotBadge({ slot }: { slot: SponsorSlot }) {
  const style = STATE_STYLE[slot.state] ?? STATE_STYLE["house-ad"];
  const text = slot.sponsorName ?? slot.fallbackText;

  return (
    <div
      title={`${slot.label} — ${slot.state}`}
      style={{
        position: "absolute",
        left: `${slot.x * 100}%`,
        top: `${slot.y * 100}%`,
        width: `${slot.width * 100}%`,
        height: `${slot.height * 100}%`,
        ...style,
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 8,
        fontWeight: 800,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "2px 4px",
        overflow: "hidden",
        whiteSpace: "nowrap",
        zIndex: 3,
        pointerEvents: "none",
      }}
    >
      {text}
    </div>
  );
}

export function SponsorSlotWall({ slots }: SponsorSlotWallProps) {
  return (
    <div
      aria-hidden
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3 }}
    >
      {slots.map((slot) => (
        <SlotBadge key={slot.slotId} slot={slot} />
      ))}
    </div>
  );
}
