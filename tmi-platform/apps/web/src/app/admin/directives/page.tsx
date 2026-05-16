import Link from "next/link";

const DIRECTIVE_HUBS = [
  {
    href: "/admin/directives/daily",
    label: "Daily Directive Board",
    description: "Today's task board for all bots and roles. Resets at midnight.",
    color: "#00FFFF",
  },
  {
    href: "/admin/directives/monthly",
    label: "Monthly Campaign Board",
    description: "Monthly growth campaigns, revenue targets, and content goals.",
    color: "#FFD700",
  },
  {
    href: "/admin/directives/yearly",
    label: "Yearly OKR Board",
    description: "Annual objectives, key results, and platform vision pillars.",
    color: "#AA2DFF",
  },
];

const AVATAR_HUBS = [
  {
    href: "/admin/avatar-motion",
    label: "Avatar Motion Directives",
    description: "Daily motion assignments for all avatar instances.",
    color: "#FF2DAA",
  },
  {
    href: "/admin/avatar-expressions",
    label: "Avatar Expression Directives",
    description: "Daily facial expression and emote assignments.",
    color: "#00FF88",
  },
  {
    href: "/admin/avatar-lipsync",
    label: "Avatar Lip Sync Directives",
    description: "Phoneme sequencing and lip sync mode for all avatars.",
    color: "#FFD700",
  },
];

export default function DirectivesHubPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "30px 20px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <Link href="/admin" style={{ color: "#00FFFF", textDecoration: "none", fontSize: 12 }}>← Admin</Link>
        <h1 style={{ fontSize: 34, margin: "14px 0 4px", fontWeight: 700 }}>Directive Observatory</h1>
        <p style={{ color: "rgba(255,255,255,0.55)", marginBottom: 36 }}>
          Platform automation targets, bot assignments, and avatar behavior directives.
        </p>

        <h2 style={{ fontSize: 16, color: "#00FFFF", textTransform: "uppercase", letterSpacing: 2, marginBottom: 14 }}>
          Platform Directives
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14, marginBottom: 36 }}>
          {DIRECTIVE_HUBS.map(hub => (
            <Link
              key={hub.href}
              href={hub.href}
              style={{ textDecoration: "none", border: `1px solid ${hub.color}44`, borderRadius: 12, padding: "18px 20px", background: "rgba(255,255,255,0.03)", display: "block" }}
            >
              <div style={{ fontSize: 11, color: hub.color, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Observatory</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 6 }}>{hub.label}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{hub.description}</div>
            </Link>
          ))}
        </div>

        <h2 style={{ fontSize: 16, color: "#FF2DAA", textTransform: "uppercase", letterSpacing: 2, marginBottom: 14 }}>
          Avatar Directives
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {AVATAR_HUBS.map(hub => (
            <Link
              key={hub.href}
              href={hub.href}
              style={{ textDecoration: "none", border: `1px solid ${hub.color}44`, borderRadius: 12, padding: "18px 20px", background: "rgba(255,255,255,0.03)", display: "block" }}
            >
              <div style={{ fontSize: 11, color: hub.color, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Avatar</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 6 }}>{hub.label}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{hub.description}</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
