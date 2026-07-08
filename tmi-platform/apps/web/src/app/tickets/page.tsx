"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const EVENTS = [
  { id: "e1", name: "TMI Season Opener", venue: "Digital Main Stage", date: "Jun 7, 2026", time: "8:00 PM ET", tickets: [{ tier: "VIP", price: 150, available: 12 }, { tier: "Premium", price: 75, available: 48 }, { tier: "General", price: 35, available: 220 }], color: "#FFD700", icon: "👑", status: "ON SALE" },
  { id: "e2", name: "Dirty Dozens — Episode 6", venue: "Battle Arena", date: "Jun 14, 2026", time: "9:00 PM ET", tickets: [{ tier: "VIP", price: 120, available: 8 }, { tier: "General", price: 25, available: 400 }], color: "#FF2DAA", icon: "⚔️", status: "ON SALE" },
  { id: "e3", name: "Monday Night Cypher", venue: "Lounge Stage", date: "Jun 9, 2026", time: "10:00 PM ET", tickets: [{ tier: "General", price: 15, available: 180 }], color: "#00FFFF", icon: "🎙️", status: "ON SALE" },
  { id: "e4", name: "TMI Producer Showcase", venue: "Beat Lab Hall", date: "Jun 21, 2026", time: "7:00 PM ET", tickets: [{ tier: "VIP", price: 200, available: 20 }, { tier: "Premium", price: 90, available: 60 }, { tier: "General", price: 40, available: 300 }], color: "#AA2DFF", icon: "🎹", status: "ON SALE" },
  { id: "e5", name: "NFT Artist Drop Night", venue: "NFT Gallery", date: "Jun 28, 2026", time: "8:00 PM ET", tickets: [{ tier: "Collector VIP", price: 350, available: 5 }, { tier: "General", price: 50, available: 150 }], color: "#00FF88", icon: "◈", status: "SELLING FAST" },
];

type TicketTier = { tier: string; price: number; available: number };

function BuyModal({ event, onClose }: { event: typeof EVENTS[0]; onClose: () => void }) {
  const router = useRouter();
  const [selected, setSelected] = useState<TicketTier | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  const total = selected ? selected.price * qty : 0;

  async function handleCheckout() {
    if (!selected || loading) return;
    setLoading(true);
    try {
      const seats = Array.from({ length: qty }, (_, i) => ({
        id: `${event.id}-${selected.tier}-${i + 1}`,
        tier: selected.tier.toLowerCase().replace(' ', '-'),
        price: selected.price,
      }));
      const res = await fetch('/api/tickets/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seats, successUrl: `${window.location.origin}/payment-success?type=ticket&session_id={CHECKOUT_SESSION_ID}` }),
      });
      const data = await res.json() as { url?: string };
      if (data.url) router.push(data.url);
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#0a0a1a", border: `1px solid ${event.color}30`, borderRadius: 20, padding: "28px 24px", maxWidth: 420, width: "100%" }}>
        <div style={{ fontSize: 9, color: event.color, fontWeight: 800, letterSpacing: "0.2em", marginBottom: 6 }}>SELECT TICKETS</div>
        <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>{event.name}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>{event.date} · {event.time} · {event.venue}</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {event.tickets.map((t) => (
            <button key={t.tier} onClick={() => setSelected(t)}
              style={{ padding: "12px 16px", background: selected?.tier === t.tier ? `${event.color}18` : "rgba(255,255,255,0.03)", border: `1px solid ${selected?.tier === t.tier ? event.color + "60" : "rgba(255,255,255,0.08)"}`, borderRadius: 10, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: selected?.tier === t.tier ? event.color : "#fff" }}>{t.tier}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{t.available} remaining</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: event.color }}>${t.price}</div>
            </button>
          ))}
        </div>

        {selected && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Qty:</span>
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>−</button>
            <span style={{ fontSize: 16, fontWeight: 900, minWidth: 20, textAlign: "center" }}>{qty}</span>
            <button onClick={() => setQty((q) => Math.min(selected.available, q + 1))} style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>+</button>
            <span style={{ fontSize: 14, fontWeight: 900, color: event.color, marginLeft: "auto" }}>${total.toFixed(0)} total</span>
          </div>
        )}

        <button onClick={handleCheckout} disabled={!selected || loading}
          style={{ width: "100%", padding: "13px", background: !selected || loading ? "rgba(255,255,255,0.1)" : `linear-gradient(135deg,${event.color},${event.color}cc)`, color: !selected ? "rgba(255,255,255,0.3)" : "#050510", fontWeight: 800, fontSize: 13, borderRadius: 10, border: "none", cursor: !selected || loading ? "not-allowed" : "pointer", letterSpacing: "0.06em" }}>
          {loading ? "Redirecting to Stripe..." : selected ? `Checkout — $${total.toFixed(0)} →` : "Select a ticket tier"}
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function TicketsPage() {
  const [openEvent, setOpenEvent] = useState<typeof EVENTS[0] | null>(null);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80, fontFamily: "'Inter',sans-serif" }}>
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "18px 28px", display: "flex", gap: 12, alignItems: "center" }}>
        <Link href="/dashboard/fan" style={{ fontSize: 11, color: "rgba(0,255,255,0.7)", textDecoration: "none" }}>← Dashboard</Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Event Tickets</span>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: "#00FFFF", letterSpacing: "0.3em", marginBottom: 8 }}>TICKETS</div>
          <h1 style={{ fontSize: "clamp(22px,4vw,34px)", fontWeight: 900, margin: 0 }}>Upcoming Events</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Buy tickets for live shows, battles, and special events.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {EVENTS.map((event, i) => (
            <motion.div key={event.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${event.color}15`, borderRadius: 16, padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ fontSize: 36 }}>{event.icon}</div>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 900 }}>{event.name}</span>
                    <span style={{ fontSize: 8, fontWeight: 800, padding: "2px 7px", borderRadius: 4, background: `${event.color}18`, color: event.color, border: `1px solid ${event.color}40` }}>{event.status}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{event.date} · {event.time}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{event.venue}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    {event.tickets.map((t) => (
                      <span key={t.tier} style={{ fontSize: 9, padding: "2px 8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
                        {t.tier} ${t.price}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => setOpenEvent(event)}
                style={{ padding: "11px 22px", background: `linear-gradient(135deg,${event.color},${event.color}cc)`, color: "#050510", fontWeight: 800, fontSize: 11, borderRadius: 9, border: "none", cursor: "pointer", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                BUY TICKETS →
              </button>
            </motion.div>
          ))}
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/seating" style={{ padding: "10px 18px", border: "1px solid rgba(0,255,255,0.25)", borderRadius: 8, color: "#00FFFF", fontSize: 12, fontWeight: 700, textDecoration: "none", background: "rgba(0,255,255,0.06)" }}>Seat Selector</Link>
          <Link href="/tickets/history" style={{ padding: "10px 18px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, textDecoration: "none", background: "rgba(255,255,255,0.03)" }}>My Tickets</Link>
        </div>
      </div>

      {openEvent && <BuyModal event={openEvent} onClose={() => setOpenEvent(null)} />}
    </main>
  );
}
