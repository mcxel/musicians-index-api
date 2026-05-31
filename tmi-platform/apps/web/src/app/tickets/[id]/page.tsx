"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const EVENTS: Record<string, {
  id: string; name: string; venue: string; date: string; time: string;
  description: string; color: string; icon: string;
  tickets: { tier: string; price: number; available: number; perks: string[] }[];
}> = {
  "e1": {
    id: "e1", name: "TMI Season Opener", venue: "Digital Main Stage", date: "Jun 7, 2026",
    time: "8:00 PM ET", color: "#FFD700", icon: "👑",
    description: "The official kickoff of TMI Season 2. Live performances, crown ceremonies, and exclusive artist moments.",
    tickets: [
      { tier: "VIP", price: 150, available: 12, perks: ["Front row access", "Meet & greet", "Backstage pass", "Merch bundle"] },
      { tier: "Premium", price: 75, available: 48, perks: ["Reserved seating", "Digital download", "Early entry"] },
      { tier: "General", price: 35, available: 220, perks: ["Full show access", "Digital receipt"] },
    ],
  },
  "e2": {
    id: "e2", name: "Dirty Dozens — Episode 6", venue: "Battle Arena", date: "Jun 14, 2026",
    time: "9:00 PM ET", color: "#FF2DAA", icon: "⚔️",
    description: "12 artists. 12 rounds. One crown. The most intense battle format on TMI.",
    tickets: [
      { tier: "VIP", price: 120, available: 8, perks: ["Ringside seat", "Vote in real-time", "Post-show debrief access"] },
      { tier: "General", price: 25, available: 400, perks: ["Full event access"] },
    ],
  },
  "e3": {
    id: "e3", name: "Monday Night Cypher", venue: "Lounge Stage", date: "Jun 9, 2026",
    time: "10:00 PM ET", color: "#00FFFF", icon: "🎙️",
    description: "Open mic energy meets structured competition. Every Monday — new artists, new bars.",
    tickets: [
      { tier: "General", price: 15, available: 180, perks: ["Full show access", "Participation voting"] },
    ],
  },
  "e4": {
    id: "e4", name: "TMI Producer Showcase", venue: "Beat Lab Hall", date: "Jun 21, 2026",
    time: "7:00 PM ET", color: "#AA2DFF", icon: "🎹",
    description: "Beat battles, producer panels, and live instrumental production from the top beat-makers on TMI.",
    tickets: [
      { tier: "VIP", price: 200, available: 20, perks: ["Producer session access", "Beat pack download", "1-on-1 Q&A slot"] },
      { tier: "Premium", price: 90, available: 60, perks: ["Reserved seating", "Beat pack download"] },
      { tier: "General", price: 40, available: 300, perks: ["Full show access"] },
    ],
  },
  "e5": {
    id: "e5", name: "NFT Artist Drop Night", venue: "NFT Gallery", date: "Jun 28, 2026",
    time: "8:00 PM ET", color: "#00FF88", icon: "◈",
    description: "First-edition artist NFT drops, live minting on stage, and exclusive collector previews.",
    tickets: [
      { tier: "Collector VIP", price: 350, available: 5, perks: ["First-mint rights", "1-of-1 NFT included", "Artist session"] },
      { tier: "General", price: 50, available: 150, perks: ["Gallery access", "Drop announcements"] },
    ],
  },
};

const C = {
  bg: "#07071a",
  panel: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  text: "#e2e8f0",
  muted: "rgba(255,255,255,0.45)",
};

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const router = useRouter();
  const event = EVENTS[id as string];
  const [selected, setSelected] = useState<typeof event.tickets[0] | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!event) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: C.text }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎟️</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Event not found</div>
          <Link href="/tickets" style={{ color: "#00FFFF", fontSize: 13, marginTop: 12, display: "block" }}>← Back to Tickets</Link>
        </div>
      </div>
    );
  }

  const total = selected ? selected.price * qty : 0;

  async function handleCheckout() {
    if (!selected || loading) return;
    setLoading(true);
    try {
      const seats = Array.from({ length: qty }, (_, i) => ({
        id: `${event.id}-${selected.tier}-${Date.now()}-${i}`,
        tier: selected.tier.toLowerCase().replace(/\s+/g, "-"),
        price: selected.price,
      }));
      const res = await fetch("/api/tickets/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seats,
          successUrl: `${window.location.origin}/payment-success?type=ticket&session_id={CHECKOUT_SESSION_ID}`,
        }),
      });
      const data = await res.json() as { url?: string };
      if (data.url) router.push(data.url);
    } catch {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: C.text }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px" }}>
        <Link href="/tickets" style={{ color: C.muted, fontSize: 12, textDecoration: "none", letterSpacing: "0.1em", fontWeight: 700 }}>
          ← BACK TO EVENTS
        </Link>

        <div style={{ marginTop: 24, padding: 28, borderRadius: 16, background: C.panel, border: `1px solid ${event.color}30` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 48 }}>{event.icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: event.color }}>{event.name}</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{event.venue} · {event.date} · {event.time}</div>
            </div>
          </div>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, margin: "0 0 24px" }}>{event.description}</p>

          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", color: C.muted, marginBottom: 12 }}>SELECT TICKET TIER</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {event.tickets.map((t) => (
              <button
                key={t.tier}
                onClick={() => setSelected(t)}
                style={{
                  background: selected?.tier === t.tier ? `${event.color}18` : C.panel,
                  border: `1px solid ${selected?.tier === t.tier ? event.color : C.border}`,
                  borderRadius: 12, padding: "14px 18px", cursor: "pointer", textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: selected?.tier === t.tier ? event.color : C.text }}>{t.tier}</span>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>{t.perks.join(" · ")}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: event.color }}>${t.price}</div>
                    <div style={{ fontSize: 9, color: C.muted }}>{t.available} left</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selected && (
            <div style={{ marginTop: 20, padding: "16px 18px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>QUANTITY</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 28, height: 28, borderRadius: 6, background: C.panel, border: `1px solid ${C.border}`, color: C.text, cursor: "pointer", fontSize: 16 }}>−</button>
                  <span style={{ fontSize: 16, fontWeight: 900, minWidth: 24, textAlign: "center" }}>{qty}</span>
                  <button onClick={() => setQty(Math.min(selected.available, qty + 1))} style={{ width: 28, height: 28, borderRadius: 6, background: C.panel, border: `1px solid ${C.border}`, color: C.text, cursor: "pointer", fontSize: 16 }}>+</button>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.muted, marginBottom: 16 }}>
                <span>{qty}× {selected.tier} @ ${selected.price}</span>
                <span style={{ color: C.text, fontWeight: 800 }}>Total: ${total.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={loading}
                style={{
                  width: "100%", padding: "14px 0", borderRadius: 10, fontSize: 13, fontWeight: 900,
                  letterSpacing: "0.1em", cursor: loading ? "default" : "pointer",
                  background: loading ? "rgba(255,255,255,0.05)" : `linear-gradient(135deg, ${event.color}CC, ${event.color}88)`,
                  border: "none", color: loading ? C.muted : "#000",
                  transition: "all 0.15s",
                }}
              >
                {loading ? "REDIRECTING TO CHECKOUT…" : `BUY TICKETS — $${total.toFixed(2)}`}
              </button>
            </div>
          )}
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <Link href="/tickets/print" style={{ flex: 1, padding: "11px 0", textAlign: "center", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontSize: 10, fontWeight: 800, textDecoration: "none", letterSpacing: "0.08em" }}>
            🖨️ PRINT MY TICKETS
          </Link>
          <Link href="/tickets" style={{ flex: 1, padding: "11px 0", textAlign: "center", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontSize: 10, fontWeight: 800, textDecoration: "none", letterSpacing: "0.08em" }}>
            ALL EVENTS →
          </Link>
        </div>
      </div>
    </div>
  );
}
