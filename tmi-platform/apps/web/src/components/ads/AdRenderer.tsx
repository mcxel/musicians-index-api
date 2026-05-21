// AdRenderer — launch-safe wired fallback
// Non-obstructive sponsored surface used when placement engine is unavailable.

export interface AdRendererProps {
  zone: string;
  tier?: "free" | "bronze" | "gold" | "platinum" | "diamond";
  className?: string;
}

const TIER_LABEL: Record<NonNullable<AdRendererProps["tier"]>, string> = {
  free: "Community Slot",
  bronze: "Bronze Sponsor",
  gold: "Gold Sponsor",
  platinum: "Platinum Sponsor",
  diamond: "Diamond Sponsor",
};

export default function AdRenderer({ zone, tier = "free", className }: AdRendererProps) {
  const tierLabel = TIER_LABEL[tier];

  return (
    <section
      className={className}
      style={{
        display: "grid",
        gap: 6,
        alignItems: "center",
        background: "linear-gradient(135deg, rgba(255,107,53,0.12), rgba(8,8,18,0.78))",
        border: "1px solid rgba(255,107,53,0.25)",
        borderRadius: 8,
        padding: "10px 12px",
        minHeight: 56,
      }}
      data-ad-zone={zone}
      data-ad-tier={tier}
      aria-label={`Sponsored placement for ${zone}`}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.72)",
        }}
      >
        Sponsored
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.92)", fontWeight: 700 }}>
          {tierLabel}
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.62)" }}>
          Zone: {zone}
        </div>
      </div>
    </section>
  );
}
