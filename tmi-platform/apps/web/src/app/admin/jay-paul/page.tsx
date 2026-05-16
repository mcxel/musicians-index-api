import AdminShell from "@/components/admin/AdminShell";
import AdminCommandRail from "@/components/admin/AdminCommandRail";
import AdminAnalyticsRail from "@/components/admin/AdminAnalyticsRail";
import AdminLiveFeedGrid from "@/components/admin/AdminLiveFeedGrid";

const sections = [
  "Magazine Deck",
  "Editorial Feed",
  "Artist Ranking",
  "Feature Queue",
  "Beat Pipeline",
  "Review Queue",
  "News Control",
  "Billboard Analytics",
];

export default function JayPaulAdminHubPage() {
  return (
    <AdminShell
      hubId="jay-paul"
      hubTitle="Jay Paul Hub"
      hubSubtitle="Editorial + Music"
      backHref="/admin"
    >
      <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 280px) minmax(0, 1fr)", gap: 12 }}>
        <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
          <AdminCommandRail hubRole="jay" />
          <AdminAnalyticsRail defaultTab="magazine" />
          <AdminLiveFeedGrid />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 10 }}>
          {sections.map((label) => (
            <section key={label} style={{ border: "1px solid rgba(168,85,247,0.24)", borderRadius: 10, background: "rgba(22,8,40,0.52)", padding: 11 }}>
              <p style={{ margin: 0, color: "#ddd6fe", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 800 }}>{label}</p>
            </section>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

