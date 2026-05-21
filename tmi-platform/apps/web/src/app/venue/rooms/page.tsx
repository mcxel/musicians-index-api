import Link from "next/link";

export default function VenueRoomsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/hub/venue" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Venue Hub</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#22c55e", fontWeight: 800, marginBottom: 4 }}>LIVE ROOMS</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 24px" }}>Room Management</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Create Live Room",   desc: "Start a new live session in your venue",    href: "/rooms/create",   color: "#22c55e" },
            { label: "Active Rooms",       desc: "Manage currently running rooms",             href: "/rooms",          color: "#00FFFF" },
            { label: "Room Schedule",      desc: "Plan upcoming shows and events",             href: "/venue/bookings", color: "#FFD700" },
            { label: "Room Analytics",     desc: "Audience and engagement metrics per room",   href: "/venue/analytics",color: "#AA2DFF" },
          ].map((item) => (
            <Link key={item.label} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${item.color}22`, borderRadius: 12, padding: "18px 16px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: item.color, marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{item.desc}</div>
                <div style={{ fontSize: 11, color: item.color, marginTop: 12 }}>Open →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
