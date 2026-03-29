// SponsorCard — Slice 2 placeholder
// Individual sponsor display card, non-obstructive, dark theme aligned
// Wired by Copilot in Slice 2 (AdRenderer/sponsors)

export interface SponsorCardProps {
  id: string;
  name: string;
  logoUrl?: string;
  tagline?: string;
  tier?: "local" | "regional" | "national" | "title";
  className?: string;
}

export default function SponsorCard({
  name,
  logoUrl,
  tagline,
  tier = "local",
  className,
}: SponsorCardProps) {
  return (
    <div
      className={className}
      style={{
        background: "rgba(255,107,53,0.06)",
        border: "1px solid rgba(255,107,53,0.15)",
        borderRadius: 6,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        minWidth: 0,
      }}
      data-sponsor-tier={tier}
      aria-label={`Sponsor: ${name}`}
    >
      {logoUrl && (
        <img
          src={logoUrl}
          alt={name}
          width={32}
          height={32}
          style={{ borderRadius: 4, objectFit: "contain", flexShrink: 0 }}
        />
      )}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "rgba(255,255,255,0.75)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </div>
        {tagline && (
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,107,53,0.6)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {tagline}
          </div>
        )}
      </div>
    </div>
  );
}
