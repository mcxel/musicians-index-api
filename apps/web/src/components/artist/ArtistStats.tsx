import {
  formatAccountMetric,
  type AccountMetricState,
} from "@/lib/account/accountMetricPresentation";

interface ArtistStatsProps {
  followers: AccountMetricState;
  views: AccountMetricState;
  verified: boolean | null;
  genres: string[];
}

export default function ArtistStats({ followers, views, verified, genres }: ArtistStatsProps) {
  const stats = [
    { label: "Followers", value: formatAccountMetric(followers), color: "#00FFFF" },
    { label: "Total Views", value: formatAccountMetric(views), color: "#FF2DAA" },
    {
      label: "Status",
      value: verified == null ? "Not available" : verified ? "Verified" : "Standard",
      color: verified ? "#FFD700" : "rgba(255,255,255,0.4)",
    },
    {
      label: "Genres",
      value: genres.length > 0 ? genres.slice(0, 2).join(" / ") : "Not available",
      color: "#AA2DFF",
    },
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
