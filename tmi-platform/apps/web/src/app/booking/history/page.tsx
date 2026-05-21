import Link from "next/link";

const HISTORY = [
  { id: "BK-201", artist: "Nova Cipher",  event: "Crown Night Vol. 3",     date: "Apr 12, 2026", status: "Completed", revenue: "$2,500", accent: "#22c55e" },
  { id: "BK-202", artist: "Ari Volt",     event: "Underground Sessions",   date: "Apr 8, 2026",  status: "Completed", revenue: "$1,400", accent: "#22c55e" },
  { id: "BK-203", artist: "FlowState.J",  event: "BeatLab Friday Vol. 10", date: "Mar 28, 2026", status: "Completed", revenue: "$950",   accent: "#22c55e" },
  { id: "BK-204", artist: "Yung Mako",    event: "Freestyle Underground",  date: "Mar 14, 2026", status: "Cancelled", revenue: "$0",     accent: "#ef4444" },
];

export default function BookingHistoryPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <div style={{ padding: "32px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Link href="/booking" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← BOOKING</Link>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#00FFFF", textTransform: "uppercase", marginBottom: 8, marginTop: 10 }}>BOOKING HISTORY</div>
          <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 8px" }}>Past Bookings</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>Complete history of all artist bookings and performance records.</p>
        </div>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
          {HISTORY.map((item) => (
            <div key={item.id} style={{
              background: "rgba(255,255,255,0.03)", border: `1px solid ${item.accent}28`,
              borderRadius: 12, padding: "16px 20px",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
            }}>
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", color: item.accent, background: `${item.accent}18`, border: `1px solid ${item.accent}30`, borderRadius: 4, padding: "2px 8px" }}>{item.status.toUpperCase()}</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{item.id}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{item.artist} — {item.event}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{item.date}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: item.status === "Completed" ? "#22c55e" : "#ef4444" }}>{item.revenue}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/booking" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "#00FFFF", color: "#060410", textDecoration: "none" }}>All Bookings →</Link>
          <Link href="/booking/calendar" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Calendar</Link>
        </div>
      </div>
    </main>
  );
}
