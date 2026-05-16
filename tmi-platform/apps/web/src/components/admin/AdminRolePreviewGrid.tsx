"use client";

import AdminRolePreviewWindow from "@/components/admin/AdminRolePreviewWindow";

const ROLE_WINDOWS = [
  {
    role: "Fan",
    icon: "🎵",
    accent: "#00FFFF",
    bgGradient: "linear-gradient(160deg, rgba(0,255,255,0.06), rgba(8,8,18,0.95))",
    metrics: [
      { label: "Total Fans", value: "14,802" },
      { label: "Active Subs", value: "3,441" },
      { label: "Tips Sent", value: "$8.2K" },
      { label: "Contests", value: "226" },
      { label: "Avg Tickets", value: "2.1" },
      { label: "Lobbies Visited", value: "892" },
    ],
    statusLabel: "ACTIVE",
    statusActive: true,
    actionLabel: "Fan Dashboard",
    actionRoute: "/admin/users?role=fan",
  },
  {
    role: "Artist",
    icon: "🎤",
    accent: "#fcd34d",
    bgGradient: "linear-gradient(160deg, rgba(252,211,77,0.07), rgba(8,8,18,0.95))",
    metrics: [
      { label: "Total Artists", value: "847" },
      { label: "Monthly Rev", value: "$182K" },
      { label: "Active Events", value: "23" },
      { label: "Subscriptions", value: "5,610" },
      { label: "Billboard Ranked", value: "412" },
      { label: "Tips Received", value: "$44K" },
    ],
    statusLabel: "ACTIVE",
    statusActive: true,
    actionLabel: "Artist Analytics",
    actionRoute: "/admin/artist-analytics",
  },
  {
    role: "Performer",
    icon: "🎸",
    accent: "#FF2DAA",
    bgGradient: "linear-gradient(160deg, rgba(255,45,170,0.07), rgba(8,8,18,0.95))",
    metrics: [
      { label: "Total Performers", value: "234" },
      { label: "Stage Slots", value: "89" },
      { label: "Avg Set Pay", value: "$420" },
      { label: "Active Bookings", value: "41" },
      { label: "Waitlisted", value: "17" },
      { label: "Revenue Share", value: "$38K" },
    ],
    statusLabel: "ACTIVE",
    statusActive: true,
    actionLabel: "Performer Ops",
    actionRoute: "/admin/performer-maintenance",
  },
  {
    role: "Venue",
    icon: "🏟",
    accent: "#c4b5fd",
    bgGradient: "linear-gradient(160deg, rgba(196,181,253,0.07), rgba(8,8,18,0.95))",
    metrics: [
      { label: "Active Venues", value: "56" },
      { label: "Events Live", value: "12" },
      { label: "Tickets Sold", value: "7,840" },
      { label: "Revenue Split", value: "$91K" },
      { label: "Capacity Fill", value: "74%" },
      { label: "Hosts Active", value: "38" },
    ],
    statusLabel: "ACTIVE",
    statusActive: true,
    actionLabel: "Venue Rooms",
    actionRoute: "/admin/rooms",
  },
  {
    role: "Sponsor",
    icon: "🤝",
    accent: "#fb923c",
    bgGradient: "linear-gradient(160deg, rgba(251,146,60,0.07), rgba(8,8,18,0.95))",
    metrics: [
      { label: "Active Sponsors", value: "38" },
      { label: "Deals Live", value: "114" },
      { label: "Gifts Activated", value: "892" },
      { label: "Month Spend", value: "$44K" },
      { label: "Placement Reach", value: "2.1M" },
      { label: "Conversion Rate", value: "6.8%" },
    ],
    statusLabel: "ACTIVE",
    statusActive: true,
    actionLabel: "Sponsor Hub",
    actionRoute: "/admin/sponsors",
  },
  {
    role: "Advertiser",
    icon: "📢",
    accent: "#86efac",
    bgGradient: "linear-gradient(160deg, rgba(134,239,172,0.06), rgba(8,8,18,0.95))",
    metrics: [
      { label: "Advertisers", value: "29" },
      { label: "Campaigns Live", value: "67" },
      { label: "Impressions", value: "8.4M" },
      { label: "Billing Active", value: "$22K" },
      { label: "CTR Avg", value: "4.2%" },
      { label: "Placements", value: "203" },
    ],
    statusLabel: "ACTIVE",
    statusActive: true,
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
            ADMINISTRATION · PLATFORM SNAPSHOT · ALL ROLES
          </div>
        </div>
        <div style={{ color: "#64748b", fontSize: 10, letterSpacing: "0.08em" }}>
          {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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
