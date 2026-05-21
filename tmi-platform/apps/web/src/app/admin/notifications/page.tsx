import Link from "next/link";

const SEED_NOTIFS = [
  { id: "n1", channel: "Email",    template: "Welcome — New User",          sent: 142, opens: 87,  status: "Active" },
  { id: "n2", channel: "Email",    template: "Invite Accepted",             sent: 31,  opens: 28,  status: "Active" },
  { id: "n3", channel: "Email",    template: "Tip Received",                sent: 94,  opens: 91,  status: "Active" },
  { id: "n4", channel: "Email",    template: "Subscription Confirmed",      sent: 67,  opens: 60,  status: "Active" },
  { id: "n5", channel: "In-App",   template: "New Follower",                sent: 312, opens: 310, status: "Active" },
  { id: "n6", channel: "In-App",   template: "Contest Entry Received",      sent: 88,  opens: 82,  status: "Active" },
  { id: "n7", channel: "Email",    template: "Password Reset",              sent: 14,  opens: 13,  status: "Active" },
  { id: "n8", channel: "In-App",   template: "Show Starting — 15 min",      sent: 201, opens: 198, status: "Active" },
];

const CHANNEL_COLORS: Record<string, string> = { Email: "#00FFFF", "In-App": "#FF2DAA" };

export default function AdminNotificationsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10">
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#ff6b35", textTransform: "uppercase", marginBottom: 4 }}>ADMIN</div>
        <h1 className="text-3xl font-bold text-[#ff6b35]">Notifications</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
          {SEED_NOTIFS.length} templates · {SEED_NOTIFS.reduce((a, n) => a + n.sent, 0).toLocaleString()} total sent
        </p>
      </div>

      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 80px 80px 80px", padding: "10px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
          <span>TEMPLATE</span><span>CHANNEL</span><span>SENT</span><span>OPENS</span><span>OPEN %</span>
        </div>
        {SEED_NOTIFS.map((n, i) => (
          <div key={n.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 80px 80px 80px", padding: "13px 18px", borderBottom: i < SEED_NOTIFS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{n.template}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: CHANNEL_COLORS[n.channel] ?? "#fff" }}>{n.channel}</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{n.sent.toLocaleString()}</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{n.opens.toLocaleString()}</span>
            <span style={{ fontSize: 13, color: "#00FFAA", fontWeight: 700 }}>{Math.round((n.opens / n.sent) * 100)}%</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <Link href="/admin" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Admin</Link>
        <Link href="/admin/users" style={{ fontSize: 12, color: "#ff6b35", textDecoration: "none" }}>Users →</Link>
      </div>
    </main>
  );
}
