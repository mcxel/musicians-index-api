interface ArtistStatsProps {
  followers: number;
  views: number;
  verified: boolean;
  genres: string[];
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function ArtistStats({ followers, views, verified, genres }: ArtistStatsProps) {
  const stats = [
    { label: "Followers", value: fmt(followers), color: "#00FFFF" },
    { label: "Total Views", value: fmt(views), color: "#FF2DAA" },
    { label: "Status", value: verified ? "Verified" : "Standard", color: verified ? "#FFD700" : "rgba(255,255,255,0.4)" },
    { label: "Genres", value: genres.length > 0 ? genres.slice(0, 2).join(" / ") : "—", color: "#AA2DFF" },
  ];
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
      gap: 12, marginBottom: 20,
    }}>
      {stats.map((s) => (
        <div key={s.label} style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 10, padding: "16px 20px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: s.color, marginBottom: 6 }}>{s.value}</div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}
