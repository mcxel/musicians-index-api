import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Manage Events | TMI Ticketing" };

const MY_EVENTS = [
  { id: "e1", title: "Fifth Ward Live", date: "2026-05-03", tickets: 240, sold: 187, price: 12, color: "#FF2DAA" },
  { id: "e2", title: "Diaspora Session", date: "2026-05-10", tickets: 180, sold: 64, price: 9, color: "#00FF88" },
];

export default function TicketingManagePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <Link href="/ticketing" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← TICKETING
        </Link>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900 }}>Manage Events</h1>
          <Link href="/ticketing/create" style={{ padding: "8px 18px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "linear-gradient(135deg,#00FFFF,#00AABB)", borderRadius: 8, textDecoration: "none" }}>
            + CREATE EVENT
          </Link>
        </div>

        {MY_EVENTS.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <p style={{ color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>No events yet.</p>
            <Link href="/ticketing/create" style={{ padding: "10px 22px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "linear-gradient(135deg,#00FFFF,#00AABB)", borderRadius: 8, textDecoration: "none" }}>
              CREATE YOUR FIRST EVENT
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {MY_EVENTS.map(event => {
              const pct = Math.round((event.sold / event.tickets) * 100);
              const revenue = event.sold * event.price;
              return (
                <div key={event.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${event.color}18`, borderRadius: 14, padding: "22px 26px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                    <div>
                      <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{event.title}</h2>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{event.date} · ${event.price}/ticket</div>
                    </div>
                    <div style={{ display: "flex", gap: 20 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 18, fontWeight: 900 }}>{event.sold}/{event.tickets}</div>
                        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>SOLD</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#FFD700" }}>${revenue}</div>
                        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>REVENUE</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginBottom: 6 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: event.color, borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>{pct}% sold</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <Link href={`/concerts/${event.id}`} style={{ padding: "7px 16px", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: event.color, border: `1px solid ${event.color}40`, borderRadius: 6, textDecoration: "none" }}>
                      VIEW
                    </Link>
                    <button style={{ padding: "7px 16px", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, cursor: "pointer" }}>
                      EDIT
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
