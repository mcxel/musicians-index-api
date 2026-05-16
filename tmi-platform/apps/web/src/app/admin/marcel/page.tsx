import AdminShell from "@/components/admin/AdminShell";
import AdminCommandRail from "@/components/admin/AdminCommandRail";
import AdminSentinelRail from "@/components/admin/AdminSentinelRail";
import AdminAnalyticsRail from "@/components/admin/AdminAnalyticsRail";
import AdminRevenueRail from "@/components/admin/AdminRevenueRail";
import AdminLiveFeedGrid from "@/components/admin/AdminLiveFeedGrid";
import AdminAccountLinkRail from "@/components/admin/AdminAccountLinkRail";
import ProfitCommandCenter from "@/components/admin/profit/ProfitCommandCenter";

const marcelPanels = [
  "Financial Threat Level",
  "Leak Detection",
  "Profit Stability Meter",
  "Auto Correction Log",
  "Revenue Heatmap",
  "Profit Opportunity Feed",
];

export default function MarcelAdminHubPage() {
  return (
    <AdminShell
      hubId="marcel"
      hubTitle="Marcel Hub"
      hubSubtitle="Owner / Master Admin"
      backHref="/admin"
    >
      <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 280px) minmax(0, 1fr)", gap: 12 }}>
        <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
          <AdminCommandRail hubRole="marcel-root" />
          <AdminSentinelRail />
          <AdminAnalyticsRail />
          <AdminRevenueRail />
          <AdminLiveFeedGrid />
          <AdminAccountLinkRail />
        </div>

        <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 10 }}>
            {marcelPanels.map((label) => (
              <section key={label} style={{ border: "1px solid rgba(251,191,36,0.24)", borderRadius: 10, background: "rgba(20,8,35,0.55)", padding: 10 }}>
                <p style={{ margin: 0, color: "#fde68a", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 800 }}>{label}</p>
              </section>
            ))}
          </div>

          <ProfitCommandCenter title="MC Michael Charlie Financial Correction Intelligence" />
        </div>
      </div>
    </AdminShell>
  );
}
