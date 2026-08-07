"use client";

import AdminRolePreviewWindow from "@/components/admin/AdminRolePreviewWindow";

/** Rule 20: role destinations only — no fabricated platform-wide metrics. */
const ROLE_WINDOWS = [
  {
    role: "Fan",
    icon: "🎵",
    accent: "#00FFFF",
    bgGradient: "linear-gradient(160deg, rgba(0,255,255,0.06), rgba(8,8,18,0.95))",
    metrics: [
      { label: "Total Fans", value: "—" },
      { label: "Active Subs", value: "—" },
      { label: "Tips Sent", value: "—" },
      { label: "Contests", value: "—" },
      { label: "Avg Tickets", value: "—" },
      { label: "Lobbies Visited", value: "—" },
    ],
    statusLabel: "PREVIEW",
    statusActive: false,
    actionLabel: "Fan Dashboard",
    actionRoute: "/admin/users?role=fan",
  },
  {
    role: "Artist",
    icon: "🎤",
    accent: "#fcd34d",
    bgGradient: "linear-gradient(160deg, rgba(252,211,77,0.07), rgba(8,8,18,0.95))",
    metrics: [
      { label: "Total Artists", value: "—" },
      { label: "Monthly Rev", value: "—" },
      { label: "Active Events", value: "—" },
      { label: "Subscriptions", value: "—" },
      { label: "Billboard Ranked", value: "—" },
      { label: "Tips Received", value: "—" },
    ],
    statusLabel: "PREVIEW",
    statusActive: false,
    actionLabel: "Artist Analytics",
    actionRoute: "/admin/artist-analytics",
  },
  {
    role: "Performer",
    icon: "🎸",
    accent: "#FF2DAA",
    bgGradient: "linear-gradient(160deg, rgba(255,45,170,0.07), rgba(8,8,18,0.95))",
    metrics: [
      { label: "Total Performers", value: "—" },
      { label: "Stage Slots", value: "—" },
      { label: "Avg Set Pay", value: "—" },
      { label: "Active Bookings", value: "—" },
      { label: "Waitlisted", value: "—" },
      { label: "Revenue Share", value: "—" },
    ],
    statusLabel: "PREVIEW",
    statusActive: false,
    actionLabel: "Performer Ops",
    actionRoute: "/admin/performer-maintenance",
  },
  {
    role: "Venue",
    icon: "🏟",
    accent: "#c4b5fd",
    bgGradient: "linear-gradient(160deg, rgba(196,181,253,0.07), rgba(8,8,18,0.95))",
    metrics: [
      { label: "Active Venues", value: "—" },
      { label: "Events Live", value: "—" },
      { label: "Tickets Sold", value: "—" },
      { label: "Revenue Split", value: "—" },
      { label: "Capacity Fill", value: "—" },
      { label: "Hosts Active", value: "—" },
    ],
    statusLabel: "PREVIEW",
    statusActive: false,
    actionLabel: "Venue Rooms",
    actionRoute: "/admin/rooms",
  },
  {
    role: "Sponsor",
    icon: "🤝",
    accent: "#fb923c",
    bgGradient: "linear-gradient(160deg, rgba(251,146,60,0.07), rgba(8,8,18,0.95))",
    metrics: [
      { label: "Active Sponsors", value: "—" },
      { label: "Deals Live", value: "—" },
      { label: "Gifts Activated", value: "—" },
      { label: "Month Spend", value: "—" },
      { label: "Placement Reach", value: "—" },
      { label: "Conversion Rate", value: "—" },
    ],
    statusLabel: "PREVIEW",
    statusActive: false,
    actionLabel: "Sponsor Hub",
    actionRoute: "/admin/sponsors",
  },
  {
    role: "Advertiser",
    icon: "📢",
    accent: "#86efac",
    bgGradient: "linear-gradient(160deg, rgba(134,239,172,0.06), rgba(8,8,18,0.95))",
    metrics: [
      { label: "Advertisers", value: "—" },
      { label: "Campaigns Live", value: "—" },
      { label: "Impressions", value: "—" },
      { label: "Billing Active", value: "—" },
      { label: "CTR Avg", value: "—" },
      { label: "Placements", value: "—" },
    ],
    statusLabel: "PREVIEW",
    statusActive: false,
    actionLabel: "Advertiser Hub",
    actionRoute: "/admin/advertisers",
  },
];

export default function AdminRolePreviewGrid() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 15% 10%, rgba(0,255,255,0.08), transparent 40%), #03020b",
        color: "#e2e8f0",
        padding: "16px",
      }}
    >
      <header
        style={{
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(0,255,255,0.2)",
          paddingBottom: 12,
        }}
      >
        <div>
          <div style={{ color: "#00FFFF", fontSize: 12, fontWeight: 800, letterSpacing: "0.18em" }}>ROLE PREVIEW WINDOWS</div>
          <div style={{ color: "#475569", fontSize: 10, letterSpacing: "0.1em", marginTop: 2 }}>
            ADMINISTRATION · DESTINATION MAP · METRICS UNAVAILABLE
          </div>
        </div>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 14,
        }}
      >
        {ROLE_WINDOWS.map((w) => (
          <AdminRolePreviewWindow key={w.role} {...w} />
        ))}
      </div>
    </main>
  );
}
