"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Rule 20: No fake events. Events are fetched from the DB — created by Venues/Promoters.
// Rule 17: Ticket sales belong to Venues and Promoters only.

interface TicketTypeRow {
  id: string;
  name: string;
  priceCents: number;
  quantity: number;
}

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  venueName: string | null;
  venueCity: string | null;
  venueState: string | null;
  ticketTypes: TicketTypeRow[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", timeZoneName: "short",
  });
}

function BuyModal({ event, onClose }: { event: EventRow; onClose: () => void }) {
  const router = useRouter();
  const [selected, setSelected] = useState<TicketTypeRow | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCents = selected ? selected.priceCents * qty : 0;

  async function handleCheckout() {
    if (!selected || loading) return;
    setLoading(true);
    setError(null);
    try {
      const eventSlug = event.title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-") || event.id;
      const venueSlug = (event.venueName ?? "tmi-platform").toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-") || "tmi-platform";
      const tier = selected.name.toUpperCase().replace(/\s+/g, "_");
      const res = await fetch("/api/tickets/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug,
          venueSlug,
          tier,
          quantity: qty,
          faceValue: selected.priceCents / 100,
          successUrl: `${window.location.origin}/tickets?status=success&event=${encodeURIComponent(event.title)}`,
          cancelUrl: `${window.location.origin}/tickets?status=cancelled`,
        }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Unable to start checkout. Please try again.");
        setLoading(false);
        return;
      }
      if (data.url) { router.push(data.url); return; }
      setError("Checkout URL was not returned. Please try again.");
      setLoading(false);
    } catch {
      setError("Network error while starting checkout. Please retry.");
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#0a0a1a", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 20, padding: "28px 24px", maxWidth: 440, width: "100%" }}>
        <div style={{ fontSize: 9, color: "#00FFFF", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 6 }}>SELECT TICKETS</div>
        <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>{event.title}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{formatDate(event.startsAt)}</div>
        {(event.venueName || event.venueCity) && (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>
            {[event.venueName, event.venueCity, event.venueState].filter(Boolean).join(", ")}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {event.ticketTypes.map((t) => (
            <button key={t.id} onClick={() => { setSelected(t); setQty(1); }}
              style={{ padding: "12px 16px", background: selected?.id === t.id ? "rgba(0,255,255,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${selected?.id === t.id ? "rgba(0,255,255,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: 10, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: selected?.id === t.id ? "#00FFFF" : "#fff" }}>{t.name}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{t.quantity} available</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#00FFFF" }}>{t.priceCents === 0 ? "FREE" : `$${(t.priceCents / 100).toFixed(0)}`}</div>
            </button>
          ))}
        </div>
        {selected && selected.priceCents > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Qty:</span>
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>−</button>
            <span style={{ fontSize: 16, fontWeight: 900, minWidth: 20, textAlign: "center" }}>{qty}</span>
            <button onClick={() => setQty((q) => Math.min(selected.quantity, q + 1))} style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>+</button>
            <span style={{ fontSize: 14, fontWeight: 900, color: "#00FFFF", marginLeft: "auto" }}>${(totalCents / 100).toFixed(2)} total</span>
          </div>
        )}
        <button onClick={handleCheckout} disabled={!selected || loading}
          style={{ width: "100%", padding: "13px", background: !selected || loading ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#00FFFF,#00E5FF)", color: !selected ? "rgba(255,255,255,0.3)" : "#050510", fontWeight: 800, fontSize: 13, borderRadius: 10, border: "none", cursor: !selected || loading ? "not-allowed" : "pointer", letterSpacing: "0.06em" }}>
          {loading ? "Redirecting to checkout…" : selected ? `Checkout → ${selected.priceCents === 0 ? "FREE" : `$${(totalCents / 100).toFixed(2)}`}` : "Select a ticket tier"}
        </button>
        {error && (
          <div style={{ marginTop: 10, fontSize: 11, color: "#FF6B6B", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.24)", borderRadius: 8, padding: "8px 10px" }}>
            {error}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function TicketsPage() {
  const [events, setEvents] = useState<EventRow[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [openEvent, setOpenEvent] = useState<EventRow | null>(null);
  const searchParams = useSearchParams();
  const status = searchParams?.get("status") ?? null;

  useEffect(() => {
    fetch("/api/events/list")
      .then((r) => r.json())
      .then((d: { events?: EventRow[] }) => setEvents(d.events ?? []))
      .catch(() => { setFetchError("Unable to load events. Please refresh."); setEvents([]); });
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80, fontFamily: "'Inter',sans-serif" }}>
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "18px 28px", display: "flex", gap: 12, alignItems: "center" }}>
        <Link href="/hub/fan" style={{ fontSize: 11, color: "rgba(0,255,255,0.7)", textDecoration: "none" }}>← Dashboard</Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Event Tickets</span>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: "#00FFFF", letterSpacing: "0.3em", marginBottom: 8 }}>TICKETS</div>
          <h1 style={{ fontSize: "clamp(22px,4vw,34px)", fontWeight: 900, margin: 0 }}>Upcoming Events</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Buy tickets for live shows, battles, and special events.</p>
          {status === "cancelled" && (
            <div style={{ marginTop: 10, fontSize: 11, color: "#FFD700", background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.24)", borderRadius: 8, padding: "8px 10px", display: "inline-block" }}>
              Checkout was cancelled. Your tickets were not purchased.
            </div>
          )}
          {status === "success" && (
            <div style={{ marginTop: 10, fontSize: 11, color: "#00FF88", background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.24)", borderRadius: 8, padding: "8px 10px", display: "inline-block" }}>
              Purchase complete. Your tickets are ready in My Tickets.
            </div>
          )}
        </div>

        {events === null && !fetchError && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.35)", fontSize: 13 }}>Loading upcoming events…</div>
        )}
        {fetchError && (
          <div style={{ padding: "20px 24px", background: "rgba(255,107,107,0.06)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: 12, fontSize: 13, color: "rgba(255,107,107,0.8)" }}>{fetchError}</div>
        )}
        {events !== null && events.length === 0 && !fetchError && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>🎟️</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>No upcoming events yet</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", maxWidth: 380, margin: "0 auto 24px" }}>Events are scheduled by venues and promoters. Check back soon or browse live rooms happening right now.</div>
            <Link href="/live/lobby" style={{ padding: "12px 24px", background: "rgba(0,255,255,0.08)", border: "1px solid rgba(0,255,255,0.25)", borderRadius: 8, color: "#00FFFF", fontSize: 12, fontWeight: 800, textDecoration: "none", letterSpacing: "0.1em" }}>BROWSE LIVE ROOMS →</Link>
          </div>
        )}
        {events !== null && events.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {events.map((event, i) => (
              <motion.div key={event.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,255,255,0.12)", borderRadius: 16, padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 4 }}>{event.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>{formatDate(event.startsAt)}</div>
                  {(event.venueName || event.venueCity) && (
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>{[event.venueName, event.venueCity, event.venueState].filter(Boolean).join(", ")}</div>
                  )}
                  {event.ticketTypes.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {event.ticketTypes.map((t) => (
                        <span key={t.id} style={{ fontSize: 9, padding: "2px 8px", background: "rgba(0,255,255,0.04)", border: "1px solid rgba(0,255,255,0.15)", borderRadius: 4, color: "rgba(0,255,255,0.7)", fontWeight: 700 }}>
                          {t.name} {t.priceCents === 0 ? "FREE" : `$${(t.priceCents / 100).toFixed(0)}`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {event.ticketTypes.length > 0 ? (
                  <button onClick={() => setOpenEvent(event)}
                    style={{ padding: "11px 22px", background: "linear-gradient(135deg,#00FFFF,#00E5FF)", color: "#050510", fontWeight: 800, fontSize: 11, borderRadius: 9, border: "none", cursor: "pointer", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                    BUY TICKETS →
                  </button>
                ) : (
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>Tickets not available</span>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/tickets/history" style={{ padding: "10px 18px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, textDecoration: "none", background: "rgba(255,255,255,0.03)" }}>My Tickets</Link>
        </div>
      </div>

      <AnimatePresence>
        {openEvent && <BuyModal event={openEvent} onClose={() => setOpenEvent(null)} />}
      </AnimatePresence>
    </main>
  );
}
