import AdminShell from "@/components/admin/AdminShell";
import AdminCommandRail from "@/components/admin/AdminCommandRail";
import AdminRevenueRail from "@/components/admin/AdminRevenueRail";
import AdminAccountLinkRail from "@/components/admin/AdminAccountLinkRail";

const sections = [
  "Venue Deck",
  "Booking Board",
  "Artist Routing",
  "Ticket Monitor",
  "Venue Contracts",
  "Calendar Engine",
  "Show Queue",
  "Tour Grid",
];

export default function JustinAdminHubPage() {
  return (
    <AdminShell
      hubId="justin"
      hubTitle="Justin Hub"
      hubSubtitle="Operations"
      backHref="/admin"
    >
      <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 280px) minmax(0, 1fr)", gap: 12 }}>
        <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
          <AdminCommandRail hubRole="justin" />
          <AdminRevenueRail />
          <AdminAccountLinkRail />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 10 }}>
          {sections.map((label) => (
            <section key={label} style={{ border: "1px solid rgba(251,191,36,0.24)", borderRadius: 10, background: "rgba(32,15,8,0.5)", padding: 11 }}>
              <p style={{ margin: 0, color: "#fde68a", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 800 }}>{label}</p>
            </section>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
