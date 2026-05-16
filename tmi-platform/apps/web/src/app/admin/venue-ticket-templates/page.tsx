import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin: Venue Ticket Templates | TMI" };

const TEMPLATES = [
  { id: "vtt1", venue: "World Stage", capacity: 5000, sections: ["FLOOR GA", "SECTION A", "SECTION B", "VIP FLOOR", "VIP BALCONY"], color: "#FF2DAA", lastUsed: "Apr 20, 2026" },
  { id: "vtt2", venue: "Cypher Arena", capacity: 800, sections: ["FLOOR GA", "CYPHER PIT", "BLEACHERS", "VIP RING"], color: "#AA2DFF", lastUsed: "Apr 25, 2026" },
  { id: "vtt3", venue: "Battle Ring", capacity: 400, sections: ["FRONT ROW", "BLEACHERS", "VIP CAGE"], color: "#FFD700", lastUsed: "Apr 22, 2026" },
  { id: "vtt4", venue: "Bar Stage", capacity: 200, sections: ["STANDING", "BAR SEATING", "BOOTH VIP"], color: "#00FF88", lastUsed: "Apr 18, 2026" },
  { id: "vtt5", venue: "Concert Hall 1", capacity: 1200, sections: ["FLOOR", "MEZZANINE", "BALCONY", "VIP BOX"], color: "#00FFFF", lastUsed: "Mar 30, 2026" },
];

export default function AdminVenueTicketTemplatesPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, color: "#FF2DAA", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 6 }}>ADMIN</div>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>Venue Ticket Templates</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Configure section layouts and capacity per venue. Used when generating event tickets.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16, marginBottom: 40 }}>
          {TEMPLATES.map(t => (
            <div key={t.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${t.color}20`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 9, color: t.color, fontWeight: 800, letterSpacing: "0.12em", marginBottom: 4 }}>{t.venue.toUpperCase()}</div>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>{t.capacity.toLocaleString()} cap</div>
                </div>
                <button style={{ padding: "5px 12px", fontSize: 8, fontWeight: 800, color: t.color, border: `1px solid ${t.color}40`, borderRadius: 6, background: "transparent", cursor: "pointer" }}>EDIT</button>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 8 }}>SECTIONS</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {t.sections.map(s => (
                    <span key={s} style={{ fontSize: 9, padding: "3px 8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, color: "rgba(255,255,255,0.6)" }}>{s}</span>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>Last used: {t.lastUsed}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button style={{ padding: "10px 20px", fontSize: 10, fontWeight: 800, color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, background: "transparent", cursor: "pointer" }}>+ NEW VENUE TEMPLATE</button>
        </div>
      </div>
    </main>
  );
}
