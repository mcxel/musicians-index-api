import Link from "next/link";

const EVENTS = [
  { date: "May 21, 2026", day: "Wed", title: "Cypher Arena Open",       type: "Show",    href: "/shows/cypher-arena-open",   accent: "#AA2DFF" },
  { date: "May 23, 2026", day: "Fri", title: "BeatLab Friday",          type: "Session", href: "/shows/beatlab-friday",       accent: "#FF2DAA" },
  { date: "May 25, 2026", day: "Sun", title: "TMI Season 2 Finals",     type: "Show",    href: "/shows/season-2-finals",      accent: "#FFD700" },
  { date: "May 26, 2026", day: "Mon", title: "Monday Night Stage",      type: "Show",    href: "/shows/monday-night-stage",   accent: "#00FFFF" },
  { date: "May 28, 2026", day: "Wed", title: "Nova Cipher LIVE",        type: "Concert", href: "/shows/nova-cipher-live",     accent: "#22c55e" },
  { date: "Jun 1,  2026", day: "Mon", title: "Season 3 Launch Party",   type: "Event",   href: "/shows/season-3-launch",      accent: "#f59e0b" },
];

export default function BookingCalendarPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>

      <div style={{ padding: "32px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Link href="/booking" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← BOOKING</Link>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#00FFFF", textTransform: "uppercase", marginBottom: 8, marginTop: 10 }}>BOOKING CALENDAR</div>
          <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 8px" }}>Upcoming Events</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0 }}>Browse, book, and manage show appearances.</p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
          {EVENTS.map((event) => (
            <Link key={event.title} href={event.href} style={{ textDecoration: "none" }}>
              <div style={{
                background: "rgba(255,255,255,0.03)", border: `1px solid ${event.accent}30`,
                borderRadius: 12, padding: "16px 20px",
                display: "flex", alignItems: "center", gap: 16,
              }}>
                <div style={{
                  width: 54, height: 54, borderRadius: 10, background: `${event.accent}14`,
                  border: `1px solid ${event.accent}30`, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: event.accent, letterSpacing: "0.1em" }}>{event.day.toUpperCase()}</div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#fff" }}>{event.date.split(",")[0]?.split(" ")[1]}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{event.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{event.date} · {event.type}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: event.accent, flexShrink: 0 }}>Book →</span>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/booking" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "#00FFFF", color: "#060410", textDecoration: "none" }}>
            All Bookings →
          </Link>
          <Link href="/shows" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
            Browse Shows
          </Link>
        </div>
      </div>
    </main>
  );
}
