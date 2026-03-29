// AdRenderer — Slice 2 placeholder
// Wired by Copilot in Slice 2 (AdRenderer/sponsors)
// Placement engine integration: NOT YET WIRED
// Zone-aware, tier-aware, non-obstructive ad rendering surface

export interface AdRendererProps {
  zone: string;
  tier?: "free" | "bronze" | "gold" | "platinum" | "diamond";
  className?: string;
}

export default function AdRenderer({ zone, tier = "free", className }: AdRendererProps) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,107,53,0.06)",
        border: "1px solid rgba(255,107,53,0.15)",
        borderRadius: 4,
        padding: "8px 12px",
        fontSize: 11,
        color: "rgba(255,255,255,0.3)",
        minHeight: 40,
        userSelect: "none",
      }}
      data-ad-zone={zone}
      data-ad-tier={tier}
      aria-hidden="true"
    >
      {/* Ad slot: {zone} */}
    </div>
  );
}
