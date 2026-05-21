import Link from "next/link";

const SEED_ROOMS = [
  { id: "rm-1", name: "Cypher Arena", status: "live", attendees: 342, logo: "Prime Wave Media", route: "/rooms/cypher-arena" },
  { id: "rm-2", name: "Late Night Frequencies", status: "scheduled", attendees: 0, logo: "Prime Wave Media", route: "/rooms/late-night-freq" },
  { id: "rm-3", name: "BeatLab Session 14", status: "ended", attendees: 218, logo: "Prime Wave Media", route: "/rooms/beatlab-14" },
];

const STATUS_COLOR: Record<string, string> = { live: "#22c55e", scheduled: "#FFD700", ended: "#6b7280" };

export default function SponsorRoomsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/hub/sponsor" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Sponsor Hub</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#FFD700", fontWeight: 800, marginBottom: 4 }}>SPONSORED ROOMS</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 8px" }}>Rooms & Shows</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "0 0 28px" }}>Your brand presence across every live room and event.</p>
        <div style={{ display: "grid", gap: 12 }}>
          {SEED_ROOMS.map((room) => (
            <div key={room.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,215,0,0.12)", borderRadius: 12, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: STATUS_COLOR[room.status], textTransform: "uppercase", background: `${STATUS_COLOR[room.status]}18`, padding: "3px 8px", borderRadius: 4 }}>{room.status}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{room.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Sponsored by: {room.logo} · {room.attendees > 0 ? `${room.attendees.toLocaleString()} attendees` : "Upcoming"}</div>
              </div>
              <Link href={room.route} style={{ padding: "9px 18px", borderRadius: 8, background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.25)", color: "#FFD700", fontWeight: 700, fontSize: 11, textDecoration: "none", whiteSpace: "nowrap" }}>View Room →</Link>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/rooms" style={{ padding: "11px 22px", borderRadius: 8, background: "#FFD700", color: "#05060c", fontWeight: 800, fontSize: 12, textDecoration: "none" }}>Browse All Rooms →</Link>
          <Link href="/sponsor/campaigns" style={{ padding: "11px 22px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>Manage Campaigns</Link>
        </div>
      </div>
    </main>
  );
}