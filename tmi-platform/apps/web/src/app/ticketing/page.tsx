"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TicketWalletPanel } from "@/components/tickets/TicketWalletPanel";

interface Ticket {
  ticketId: string;
  venueSlug: string;
  eventSlug: string;
  tier: string;
  faceValue: number;
  status: string;
  issuedAt: number;
  eventBranding?: string;
}

interface LiveEvent {
  slug: string;
  title: string;
  artist: string;
  venue: string;
  date: string;
  time: string;
  type: "ticketed" | "free";
  price?: number;
  tier?: string;
  available: number;
  genre: string;
  color: string;
}

const LIVE_EVENTS: LiveEvent[] = [
  { slug: "concert-1", title: "Neon Vibe Live", artist: "Various Artists", venue: "Main Stage", date: "Tonight", time: "9:00 PM", type: "ticketed", price: 9, tier: "STANDARD", available: 42, genre: "EDM", color: "#FF2DAA" },
  { slug: "zuri", title: "Zuri Bloom — Afrobeats Set", artist: "Zuri Bloom", venue: "Side Stage", date: "Tonight", time: "8:00 PM", type: "ticketed", price: 12, tier: "STANDARD", available: 18, genre: "Afrobeats", color: "#FFD700" },
  { slug: "wavetek", title: "Fifth Ward Live", artist: "Wavetek", venue: "Concert Hall", date: "Tonight", time: "10:30 PM", type: "ticketed", price: 9, tier: "STANDARD", available: 31, genre: "Hip-Hop", color: "#AA2DFF" },
  { slug: "cypher", title: "Monday Night Cypher", artist: "Open Cypher", venue: "Cypher Room", date: "Tonight", time: "8:30 PM", type: "free", available: 999, genre: "Hip-Hop", color: "#00FFFF" },
  { slug: "battles", title: "Crown Battle Night", artist: "Bracket TBD", venue: "Battle Zone", date: "Tomorrow", time: "7:00 PM", type: "free", available: 999, genre: "Battle Rap", color: "#00FF88" },
];

export default function TicketingPage() {
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tickets/mine", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setMyTickets(Array.isArray(d?.tickets) ? d.tickets : []))
      .catch(() => setMyTickets([]))
      .finally(() => setLoading(false));
  }, []);

  async function buyTicket(event: LiveEvent) {
    if (!event.price || purchasing) return;
    setPurchasing(event.slug);
    setPurchaseStatus((p) => ({ ...p, [event.slug]: "Processing…" }));

    const res = await fetch("/api/tickets/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        venueSlug: event.venue.toLowerCase().replace(/\s+/g, "-"),
        eventSlug: event.slug,
        tier: event.tier ?? "STANDARD",
        faceValue: event.price,
        eventBranding: event.title,
      }),
    });

    const data = await res.json();
    if (res.ok && data.ok) {
      setPurchaseStatus((p) => ({ ...p, [event.slug]: "✓ Ticket issued!" }));
      setMyTickets((t) => [...t, data.ticket]);
    } else {
      setPurchaseStatus((p) => ({ ...p, [event.slug]: data.error ?? "Purchase failed" }));
    }
    setPurchasing(null);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#070512", color: "#fff", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "20px 24px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#00FFFF", fontWeight: 800, marginBottom: 4 }}>TMI PLATFORM</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>TICKETING</h1>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 20px", display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>

        {/* Events */}
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>UPCOMING EVENTS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {LIVE_EVENTS.map((ev) => {
              const status = purchaseStatus[ev.slug];
              const isPurchased = myTickets.some((t) => t.eventSlug === ev.slug);
              return (
                <div key={ev.slug} style={{ border: `1px solid ${ev.color}25`, borderRadius: 12, overflow: "hidden", background: `${ev.color}05` }}>
                  <div style={{ padding: "14px 16px", borderBottom: `1px solid ${ev.color}12`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 8, fontWeight: 800, color: ev.color, border: `1px solid ${ev.color}50`, borderRadius: 3, padding: "2px 7px", letterSpacing: "0.12em" }}>{ev.genre}</span>
                      {ev.type === "free" && <span style={{ fontSize: 8, fontWeight: 800, color: "#00FF88", border: "1px solid #00FF8840", borderRadius: 3, padding: "2px 7px" }}>FREE</span>}
                    </div>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{ev.date} · {ev.time}</span>
                  </div>
                  <div style={{ padding: "14px 16px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 3 }}>{ev.title}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{ev.artist} · {ev.venue}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{ev.available} {ev.type === "free" ? "seats" : "tickets left"}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                      {ev.type === "ticketed" && <div style={{ fontSize: 18, fontWeight: 900, color: ev.color }}>${ev.price}</div>}
                      {isPurchased ? (
                        <span style={{ fontSize: 9, fontWeight: 800, color: "#00FF88", border: "1px solid #00FF8840", borderRadius: 5, padding: "6px 12px" }}>✓ TICKET HELD</span>
                      ) : ev.type === "free" ? (
                        <Link href={`/live/${ev.slug}`} style={{ fontSize: 10, fontWeight: 900, color: "#050510", background: ev.color, borderRadius: 6, padding: "8px 14px", textDecoration: "none" }}>
                          JOIN FREE →
                        </Link>
                      ) : (
                        <button onClick={() => buyTicket(ev)} disabled={!!purchasing}
                          style={{ fontSize: 10, fontWeight: 900, color: "#050510", background: ev.color, border: "none", borderRadius: 6, padding: "8px 14px", cursor: purchasing ? "default" : "pointer", opacity: purchasing ? 0.6 : 1 }}>
                          {purchasing === ev.slug ? "…" : "BUY TICKET →"}
                        </button>
                      )}
                      {status && <div style={{ fontSize: 9, color: status.startsWith("✓") ? "#00FF88" : "#FFD700", maxWidth: 120, textAlign: "right" }}>{status}</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* My Tickets */}
        <div>
          <div style={{ marginBottom: 10 }}>
            <TicketWalletPanel tickets={[]} onTransfer={() => {}} onRefund={() => {}} />
          </div>
          <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)" }}>MY TICKETS</span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{myTickets.length}</span>
            </div>
            <div style={{ padding: "10px" }}>
              {loading && <div style={{ textAlign: "center", padding: "20px", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Loading…</div>}
              {!loading && myTickets.length === 0 && (
                <div style={{ textAlign: "center", padding: "24px 16px" }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>🎫</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>No tickets yet. Purchase an event ticket to see it here.</div>
                </div>
              )}
              {myTickets.map((t) => (
                <div key={t.ticketId} style={{ padding: "10px", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, marginBottom: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", marginBottom: 3 }}>{t.eventBranding ?? t.eventSlug}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>{t.tier} · ${(t.faceValue / 100).toFixed(2)}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#00FF88", border: "1px solid #00FF8830", borderRadius: 3, padding: "2px 6px" }}>VALID</span>
                    <Link href={`/live/${t.eventSlug}`} style={{ fontSize: 8, fontWeight: 700, color: "#00FFFF", textDecoration: "none" }}>ENTER →</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 10, padding: "12px 14px", border: "1px solid rgba(0,255,255,0.15)", borderRadius: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: "#00FFFF", letterSpacing: "0.15em", marginBottom: 6 }}>TICKET SCANNER</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: 10 }}>Venue staff can scan tickets at the door.</div>
            <Link href="/tickets/scanner" style={{ fontSize: 9, fontWeight: 800, color: "#00FFFF", border: "1px solid #00FFFF30", borderRadius: 5, padding: "6px 12px", textDecoration: "none" }}>
              OPEN SCANNER →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
