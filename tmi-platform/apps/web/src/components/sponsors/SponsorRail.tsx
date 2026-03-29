// SponsorRail — Slice 2 placeholder
// Horizontal sponsor strip for page rails (non-obstructive, side placement)
// Wired by Copilot in Slice 2 (AdRenderer/sponsors)
// Placement law: never blocks core content, never overlaps controls

export interface SponsorRailProps {
  sponsors?: Array<{ id: string; name: string; logoUrl?: string }>;
  zone?: string;
  className?: string;
}

export default function SponsorRail({ sponsors = [], zone = "rail", className }: SponsorRailProps) {
  if (sponsors.length === 0) return null;

  return (
    <aside
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "8px 0",
      }}
      data-sponsor-zone={zone}
      aria-label="Sponsors"
    >
      {sponsors.map((s) => (
        <div
          key={s.id}
          style={{
            background: "rgba(255,107,53,0.07)",
            border: "1px solid rgba(255,107,53,0.18)",
            borderRadius: 4,
            padding: "6px 10px",
            fontSize: 11,
            color: "rgba(255,255,255,0.45)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {s.name}
        </div>
      ))}
    </aside>
  );
}
